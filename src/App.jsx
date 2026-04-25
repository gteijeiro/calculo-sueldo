import React, { useState, useRef, useEffect } from 'react';
import { calcular } from './logic/calcular.js';
import { ajustarPorVacaciones } from './logic/vacaciones.js';
import PisoTable from './components/PisoTable.jsx';
import DatosForm from './components/DatosForm.jsx';
import SueldoForm from './components/SueldoForm.jsx';
import VacacionesForm from './components/VacacionesForm.jsx';
import DedForm from './components/DedForm.jsx';
import ReciboDeSueldo from './components/Resultados/ReciboDeSueldo.jsx';
import ReciboVacaciones from './components/Resultados/ReciboVacaciones.jsx';
import DetalleMensual from './components/Resultados/DetalleMensual.jsx';
import PasoAPaso from './components/Resultados/PasoAPaso.jsx';
import EscalaAlicuotas from './components/Resultados/EscalaAlicuotas.jsx';
import ResumenFinal from './components/Resultados/ResumenFinal.jsx';

const emptyDed = () => ({ alq: 0, prep: 0, dom: 0, segv: 0, segr: 0, hip: 0, otros40: 0, otros100: 0 });

const CONFIG_DEFAULT = {
  pJubilacion: 11, pObraSocial: 3, pPAMI: 3,
  conyuge: 0, hijos: 0, hijosInc: 0,
  convenio: 'general',
};

const SUELDO_DEFAULT = {
  fijo: true,
  base: 0,
  porMes: Array(12).fill(0),
};

const VAC_DEFAULT = {
  tiene: false,
  fechaInicio: '2026-01-01',
  cantDias: 14,
  cobradoPorAdelantado: true,
  divisorSueldo: 30,
};

const MES_HOY = 3; // Abril 2026 (0-indexed)

export default function App() {
  const [config, setConfig]         = useState(CONFIG_DEFAULT);
  const [theme, setTheme]           = useState(() => localStorage.getItem('theme') || 'auto');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'auto' && prefersDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [theme]);

  // Also react to system changes when theme === 'auto'
  useEffect(() => {
    if (theme !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = e => {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);
  const [sueldoConfig, setSueldo]   = useState(SUELDO_DEFAULT);
  const [vacConfig, setVac]         = useState(VAC_DEFAULT);
  const [dedData, setDedData]       = useState(() => Array.from({ length: 12 }, emptyDed));
  const [hastaHoy, setHastaHoy]       = useState(true);
  const [resultado, setResultado]     = useState(null);
  const [error, setError]             = useState(null);
  const [debug, setDebug]             = useState(false);
  const [exclusions, setExclusions]   = useState(() => Array(12).fill(null).map(() => ({})));
  const [globalExcl, setGlobalExcl]   = useState({});
  const [rawVacPorMes, setRawVacPorMes] = useState(null);
  const resultadoRef                  = useRef(null);
  const datosFormRef                  = useRef(null);

  const runCalculo = (excl, gExcl) => {
    setError(null);

    const sueldosBase = sueldoConfig.fijo
      ? Array(12).fill(sueldoConfig.base)
      : sueldoConfig.porMes;

    const { sueldos: sueldosAjustados, vacImpPorMes, diasPorMes } =
      ajustarPorVacaciones(sueldosBase, vacConfig);

    setRawVacPorMes(vacImpPorMes);

    let mesData = dedData.map((d, i) => {
      const ex = excl[i] || {};
      return {
        s:          sueldosAjustados[i],
        sac:        0,
        vacImporte: ex.vac     ? 0 : vacImpPorMes[i],
        diasVac:    ex.vac     ? 0 : diasPorMes[i],
        alq:        ex.alq     ? 0 : (d.alq     || 0),
        prep:       ex.prep    ? 0 : (d.prep    || 0),
        dom:        ex.dom     ? 0 : (d.dom     || 0),
        segv:       ex.segv    ? 0 : (d.segv    || 0),
        segr:       ex.segr    ? 0 : (d.segr    || 0),
        hip:        ex.hip     ? 0 : (d.hip     || 0),
        otros40:    ex.otros40  ? 0 : (d.otros40  || 0),
        otros100:   ex.otros100 ? 0 : (d.otros100 || 0),
      };
    });

    if (hastaHoy) {
      mesData = mesData.map((m, i) =>
        i > MES_HOY
          ? { s: 0, sac: 0, vacImporte: 0, diasVac: 0, alq: 0, prep: 0, dom: 0, segv: 0, segr: 0, hip: 0, otros: 0 }
          : m
      );
    }

    const res = calcular(config, mesData, gExcl);
    if (!res) {
      setError('Ingresá al menos el sueldo mensual.');
      return;
    }
    setResultado(res);
  };

  const handleCalcular = () => {
    runCalculo(exclusions, globalExcl);
    setTimeout(() => {
      resultadoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const toggleExclusion = (mesIdx, key) => {
    const newExcl = exclusions.map((e, i) =>
      i === mesIdx ? { ...e, [key]: !e[key] } : e
    );
    setExclusions(newExcl);
    runCalculo(newExcl, globalExcl);
  };

  const toggleGlobal = (key) => {
    const newGExcl = { ...globalExcl, [key]: !globalExcl[key] };
    setGlobalExcl(newGExcl);
    runCalculo(exclusions, newGExcl);
  };

  const sueldoBase = sueldoConfig.fijo ? sueldoConfig.base : Math.max(...sueldoConfig.porMes);

  const cycleTheme = () => {
    setTheme(t => t === 'auto' ? 'light' : t === 'light' ? 'dark' : 'auto');
  };
  const themeLabel = theme === 'auto' ? '💻 Auto' : theme === 'light' ? '☀️ Claro' : '🌙 Oscuro';

  return (
    <>
      <div className="header">
        <div className="header-actions">
          <button className={`theme-btn${theme !== 'auto' ? ' active' : ''}`} onClick={cycleTheme}>
            {themeLabel}
          </button>
        </div>
        <h1>Liquidación de Sueldos</h1>
        <p>Relación de dependencia · Período Fiscal 2026 · Valores oficiales ARCA</p>
      </div>

      <div className="container">
        <PisoTable onLoadConfig={({ pisoMensual, ...configPartial }) => {
          setConfig(c => ({ ...c, ...configPartial }));
          if (pisoMensual) setSueldo(s => ({ ...s, fijo: true, base: Math.round(pisoMensual) }));
          setTimeout(() => datosFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
        }} />

        <div className="alert alert-info">
          <strong>Cómo usar:</strong> Completá los datos abajo. El cálculo usa el{' '}
          <strong>método acumulado (RG 4003/2017)</strong>: la retención de cada mes = impuesto
          sobre GNSI acumulada hasta ese mes − impuesto ya retenido en meses anteriores.
        </div>

        {/* PASO 1: Datos personales y aportes */}
        <div ref={datosFormRef}>
          <DatosForm
            config={config}
            onChange={setConfig}
            onLoadSueldo={s => setSueldo(prev => ({ ...prev, ...s }))}
          />
        </div>

        {/* PASO 2: Sueldo */}
        <SueldoForm sueldoConfig={sueldoConfig} onChange={setSueldo} />

        {/* PASO 3: Vacaciones */}
        <VacacionesForm vacConfig={vacConfig} sueldoBase={sueldoBase} onChange={setVac} />

        {/* PASO 4: Deducciones adicionales (colapsable) */}
        <DedForm onChange={setDedData} />

        <label style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontSize: '0.88rem', fontWeight: 600, color: 'var(--gray-800)',
          cursor: 'pointer', marginBottom: '1rem',
        }}>
          <input
            type="checkbox"
            checked={hastaHoy}
            onChange={e => setHastaHoy(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          Calcular solo hasta abril 2026 (mes actual)
          <span className="hint" style={{ display: 'inline', marginLeft: '0.3rem' }}>
            (desmarcar para proyectar todo el año)
          </span>
        </label>

        {error && (
          <div className="alert alert-warn" style={{ marginBottom: '1rem' }}>{error}</div>
        )}

        <button className="btn-calc" onClick={handleCalcular}>Calcular →</button>

        {resultado && (
          <div ref={resultadoRef} style={{ marginTop: '1.5rem' }}>
            {/* Recibos */}
            <ReciboDeSueldo resultado={resultado} vacConfig={vacConfig} convenio={config.convenio || 'general'} />
            <ReciboVacaciones resultado={resultado} vacConfig={vacConfig} />

            {/* Ganancias */}
            <DetalleMensual resultado={resultado} />
            <PasoAPaso
              resultado={resultado}
              exclusions={exclusions}
              onToggle={toggleExclusion}
              globalExcl={globalExcl}
              onToggleGlobal={toggleGlobal}
              rawDedData={dedData}
              rawVacPorMes={rawVacPorMes}
            />
            <EscalaAlicuotas resultado={resultado} />
            <ResumenFinal resultado={resultado} hastaHoy={hastaHoy} />

            <div className="alert alert-warn">
              <strong>Nota:</strong> Cálculo por método de acumulación RG 4003/2017.
              Valores oficiales ARCA H1 2026 — se actualizan en H2 con IPC enero–junio 2026.
              Resultado <strong>orientativo</strong> — no reemplaza liquidación del empleador ni asesoría contable.
            </div>

            {/* Debug */}
            <div style={{ marginTop: '1rem' }}>
              <button
                onClick={() => setDebug(d => !d)}
                style={{
                  background: debug ? '#2d3748' : '#edf2f7',
                  color: debug ? '#f7fafc' : '#4a5568',
                  border: '1px solid #cbd5e0',
                  borderRadius: '6px',
                  padding: '0.3rem 0.8rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                }}
              >
                {debug ? '▲ Ocultar debug' : '▼ Mostrar debug (resultado crudo)'}
              </button>
              {debug && (
                <pre style={{
                  marginTop: '0.5rem',
                  background: '#1a202c',
                  color: '#9ae6b4',
                  borderRadius: '8px',
                  padding: '1rem',
                  fontSize: '0.72rem',
                  overflowX: 'auto',
                  maxHeight: '600px',
                  overflowY: 'auto',
                  lineHeight: 1.5,
                }}>
                  {JSON.stringify(resultado, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
