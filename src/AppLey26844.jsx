import React, { useState, useRef } from 'react';
import { ajustarPorVacaciones } from './logic/vacaciones.js';
import { MESES } from './constants/arca2026.js';
import { getLey26844 } from './components/DatosFormDom.jsx';
import DatosFormDom from './components/DatosFormDom.jsx';
import SueldoForm from './components/SueldoForm.jsx';
import VacacionesForm from './components/VacacionesForm.jsx';
import ConceptosForm from './components/ConceptosForm.jsx';
import ReciboDeSueldoDom from './components/Resultados/ReciboDeSueldoDom.jsx';
import ResumenFinalDom from './components/Resultados/ResumenFinalDom.jsx';

// ── Conceptos keys para Ley 26.844 ──────────────────────────────────────────
const KEYS_REM    = ['he50','he100','antiguedad','presentismo','otrosRem'];
const KEYS_NO_REM = ['viaticos','snrParitaria','alojamiento','alimentacion','otrosNoRem'];

// ── SAC auto-cálculo (misma lógica que LCT, Art.33 Ley 26.844) ──────────────
function autoSAC(sueldos, vacs) {
  const sacs = Array(12).fill(0);
  // H1 (jun)
  let mejorH1 = 0;
  for (let m = 0; m < 6; m++) {
    mejorH1 = Math.max(mejorH1, sueldos[m] + vacs[m]);
    sacs[m] = mejorH1 / 12;
  }
  // H2 (dic)
  let mejorH2 = 0;
  for (let m = 6; m < 12; m++) {
    mejorH2 = Math.max(mejorH2, sueldos[m] + vacs[m]);
    sacs[m] = mejorH2 / 12;
  }
  return { sacs, sacJunio: mejorH1 / 2, sacDic: mejorH2 / 2 };
}

// ── Cálculo principal Ley 26.844 ─────────────────────────────────────────────
function calcularDom({ sueldos, vacs, extrasRem, extrasNoRem, pJubilacion, pObraSocial, pPAMI }) {
  const d26 = getLey26844();
  const contribEmpDef = d26?.contribuciones_empleador ?? [];
  const pAp  = (pJubilacion + pObraSocial + pPAMI) / 100;
  const pEmp = contribEmpDef.reduce((s, c) => s + c.pct / 100, 0);

  const { sacs } = autoSAC(sueldos, vacs);

  const detalleM = MESES.map((mes, i) => {
    const extraRem   = extrasRem[i]   || 0;
    const extraNoRem = extrasNoRem[i] || 0;
    const sac        = sacs[i]        || 0;
    const vac        = vacs[i]        || 0;
    const sueldo     = sueldos[i]     || 0;

    // Bruto remunerativo (genera aportes)
    const brutoRem = sueldo + extraRem + vac + sac;
    const aporte   = brutoRem * pAp;
    const neto     = brutoRem - aporte + extraNoRem;
    const costoEmp = brutoRem * pEmp;

    return {
      mes, sueldo, extraRem, extraNoRem, vac, sac,
      brutoRem, aporte, neto, costoEmp,
      costoTotal: brutoRem + costoEmp,
      pJub: sueldo > 0 || extraRem > 0 ? (sueldo + extraRem + vac + sac) * pJubilacion / 100 : 0,
      pOS:  sueldo > 0 || extraRem > 0 ? (sueldo + extraRem + vac + sac) * pObraSocial / 100 : 0,
      pPAMI_m: sueldo > 0 || extraRem > 0 ? (sueldo + extraRem + vac + sac) * pPAMI / 100 : 0,
    };
  });

  const activos = detalleM.filter(d => d.sueldo > 0 || d.extraRem > 0);
  return {
    detalleM,
    totalBruto:    activos.reduce((s, d) => s + d.brutoRem, 0),
    totalAporte:   activos.reduce((s, d) => s + d.aporte, 0),
    totalNeto:     activos.reduce((s, d) => s + d.neto, 0),
    totalCostoEmp: activos.reduce((s, d) => s + d.costoEmp, 0),
    totalCosto:    activos.reduce((s, d) => s + d.costoTotal, 0),
    totalSalAn:    activos.reduce((s, d) => s + d.sueldo, 0),
    totalSacAn:    activos.reduce((s, d) => s + d.sac, 0),
    totalVacAn:    activos.reduce((s, d) => s + d.vac, 0),
    totalExtrasRem:activos.reduce((s, d) => s + d.extraRem, 0),
    pAp, pEmp, contribEmpDef,
    sacs,
  };
}

// ── Defaults ─────────────────────────────────────────────────────────────────
const CONFIG_DEFAULT = { pJubilacion: 11, pObraSocial: 3, pPAMI: 3, modalidad: 'con_retiro', categoria: 'A' };
const SUELDO_DEFAULT = { fijo: true, base: 0, porMes: Array(12).fill(0) };
const VAC_DEFAULT    = { tiene: false, fechaInicio: '2026-01-01', cantDias: 14, cobradoPorAdelantado: true, divisorSueldo: 30 };

const emptyConceptos = () => ({
  he50: 0, he100: 0, antiguedad: 0, presentismo: 0, otrosRem: 0,
  viaticos: 0, snrParitaria: 0, alojamiento: 0, alimentacion: 0, otrosNoRem: 0,
});

export default function AppLey26844({ showJsonMap }) {
  const [config, setConfig]           = useState(CONFIG_DEFAULT);
  const [sueldoConfig, setSueldo]     = useState(SUELDO_DEFAULT);
  const [vacConfig, setVac]           = useState(VAC_DEFAULT);
  const [conceptosData, setConceptos] = useState(() => Array.from({ length: 12 }, emptyConceptos));
  const [resultado, setResultado]     = useState(null);
  const [error, setError]             = useState(null);
  const resultadoRef                  = useRef(null);

  const d26 = getLey26844();

  const handleCalcular = () => {
    setError(null);
    const sueldosBase = sueldoConfig.fijo ? Array(12).fill(sueldoConfig.base) : sueldoConfig.porMes;
    if (sueldosBase.every(s => !s)) { setError('Ingresá al menos el sueldo mensual.'); return; }

    const { sueldos, vacImpPorMes } = ajustarPorVacaciones(sueldosBase, vacConfig);

    const extrasRem   = conceptosData.map(m => KEYS_REM.reduce((s, k) => s + (m[k] || 0), 0));
    const extrasNoRem = conceptosData.map(m => KEYS_NO_REM.reduce((s, k) => s + (m[k] || 0), 0));

    const res = calcularDom({
      sueldos, vacs: vacImpPorMes, extrasRem, extrasNoRem,
      pJubilacion: config.pJubilacion, pObraSocial: config.pObraSocial, pPAMI: config.pPAMI,
    });

    setResultado({ ...res, conceptosData, vacConfig, config });
    setTimeout(() => resultadoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const sueldoBase = sueldoConfig.fijo ? sueldoConfig.base : Math.max(...sueldoConfig.porMes);

  return (
    <div className="container">
      <div className="alert alert-info">
        <strong>Ley 26.844</strong> — Régimen Especial de Contrato de Trabajo para el Personal de Casas Particulares.
        Calculá el recibo de sueldo, aportes del trabajador y costo total del empleador.
      </div>

      <DatosFormDom config={config} onChange={setConfig} showJsonMap={showJsonMap} />
      <SueldoForm sueldoConfig={sueldoConfig} onChange={setSueldo} showJsonMap={showJsonMap} />
      <VacacionesForm vacConfig={vacConfig} sueldoBase={sueldoBase} onChange={setVac} showJsonMap={showJsonMap} />
      <ConceptosForm
        conceptosData={conceptosData}
        onChange={setConceptos}
        conceptosDef={{
          rem:   d26?.conceptos_remunerativos,
          noRem: d26?.conceptos_no_remunerativos,
        }}
      />

      {error && <div className="alert alert-warn" style={{ marginBottom: '1rem' }}>{error}</div>}
      <button className="btn-calc" onClick={handleCalcular}>Calcular →</button>

      {resultado && (
        <div ref={resultadoRef} style={{ marginTop: '1.5rem' }}>
          <ReciboDeSueldoDom resultado={resultado} />
          <ResumenFinalDom   resultado={resultado} />
          <div className="alert alert-warn">
            <strong>Nota:</strong> Pisos salariales orientativos — verificar con la última paritaria UATRE/SUTEP vigente.
            Contribuciones empleador referenciales — verificar tabla AFIP vigente.
            Resultado <strong>orientativo</strong> — no reemplaza liquidación profesional.
          </div>
        </div>
      )}
    </div>
  );
}
