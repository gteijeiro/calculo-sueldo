import React, { useState } from 'react';
import { fmt } from '../../utils/format.js';
import { getDetalleConfig } from '../../constants/argentina.js';
import JsonMapBadge from '../JsonMapBadge.jsx';

export default function PasoAPaso({ resultado, exclusions, onToggle, globalExcl = {}, onToggleGlobal, rawDedData, rawVacPorMes, showJsonMap = false }) {
  const {
    detalleM,
    pAp,
    dedPers,
    sacAutoCalc, sacUsados,
    config: { pJubilacion, pObraSocial, pPAMI, conyuge, hijos, hijosInc },
  } = resultado;

  const [mesActivo, setMesActivo] = useState(null);

  const d    = mesActivo !== null ? detalleM[mesActivo] : null;
  const prev = mesActivo > 0      ? detalleM[mesActivo - 1] : null;
  const frac = mesActivo !== null ? (mesActivo + 1) / 12 : 0;
  const pApPct = Math.round(pAp * 100);

  // Config desde argentina.json
  const detalleCfg  = getDetalleConfig();
  const columnasDef = detalleCfg?.columnas_tabla ?? [];
  const seccionesDef= detalleCfg?.secciones_detalle ?? [];
  const seccion = id => seccionesDef.find(s => s.id === id) ?? {};
  const fila = (secId, filaId) => seccion(secId)?.filas?.find(f => f.id === filaId) ?? {};
  const Badge = (secId, filaId) => {
    if (!showJsonMap) return null;
    const f = fila(secId, filaId);
    return (
      <JsonMapBadge
        visible={true}
        path={`detalle_base_calculo.secciones_detalle.${secId}.filas.${filaId}`}
        variable={f.variable}
        ley={f.ley}
        formulaId={f.formulaId}
        formulaExpresion={f.formula?.expresion}
      />
    );
  };

  // Exclusiones del mes activo
  const ex   = mesActivo !== null ? (exclusions?.[mesActivo]  || {}) : {};
  const rawD = mesActivo !== null ? (rawDedData?.[mesActivo]  || {}) : {};
  const rawVac = mesActivo !== null ? (rawVacPorMes?.[mesActivo] || 0) : 0;

  // Mostrar fila si tiene valor calculado O si está excluida pero tiene valor original
  const showItem = (key, hasCalcValue, rawVal) => hasCalcValue || (ex[key] && (rawVal || 0) > 0);

  // Checkbox genérico — funciona para items per-mes y globales
  const ItemLabel = ({ excluded, onChange, children }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', userSelect: 'none' }}>
      <input
        type="checkbox"
        checked={!excluded}
        onChange={onChange}
        style={{ cursor: 'pointer', flexShrink: 0, width: '14px', height: '14px' }}
      />
      <span style={{
        textDecoration: excluded ? 'line-through' : 'none',
        color: excluded ? 'var(--gray-400)' : 'inherit',
      }}>
        {children}
      </span>
    </label>
  );

  // Shorthands
  const chkMes    = (key, label) => <ItemLabel excluded={!!ex[key]}          onChange={() => onToggle?.(mesActivo, key)}>{label}</ItemLabel>;
  const chkGlobal = (key, label) => <ItemLabel excluded={!!globalExcl[key]}  onChange={() => onToggleGlobal?.(key)}>{label}</ItemLabel>;

  // td con valor + tooltip CSS al hover
  const V = (value, tip) => (
    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
      {tip
        ? <span data-tip={tip}>{fmt(value)}</span>
        : fmt(value)}
    </td>
  );

  const brutoAcumTip = () => {
    if (!prev) return '';
    const slc = detalleM.slice(0, mesActivo);
    if (mesActivo <= 4)
      return slc.map(m => `${m.mes}: ${fmt(m.ingreso)}`).join(' + ') + ` = ${fmt(prev.brutoAcum)}`;
    return `Σ ${mesActivo} meses (${detalleM[0].mes}–${prev.mes}) = ${fmt(prev.brutoAcum)}`;
  };

  return (
    <div className="card">
      <div className="card-title">📊 Detalle — base de cálculo mes a mes</div>

      {(sacAutoCalc.junio || sacAutoCalc.diciembre) && (
        <div style={{ fontSize: '0.78rem', color: 'var(--orange-dark)', background: 'var(--orange-light)',
          borderRadius: '6px', padding: '0.5rem 0.8rem', marginBottom: '0.8rem' }}>
          <strong>SAC auto-calculado:</strong>
          {sacAutoCalc.junio    && ` Junio ${fmt(sacUsados[5])}`}
          {sacAutoCalc.diciembre && ` · Diciembre ${fmt(sacUsados[11])}`}
          {' '}(mejor sueldo del semestre ÷ 2)
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.2rem' }}>
        {detalleM.map((m, i) => (
          <button key={m.mes}
            onClick={() => setMesActivo(mesActivo === i ? null : i)}
            style={{
              padding: '0.3rem 0.7rem', borderRadius: '6px', border: '1.5px solid',
              fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
              background: mesActivo === i ? 'var(--blue)' : 'var(--blue-light)',
              color:      mesActivo === i ? 'white'       : 'var(--blue-dark)',
              borderColor:mesActivo === i ? 'var(--blue)'  : '#90cdf4',
            }}
          >{m.mes}</button>
        ))}
      </div>

      {/* Tabla resumen */}
      <div style={{ overflowX: 'auto' }}>
        <table className="det-table" style={{ minWidth: '820px' }}>
          <thead>
            <tr>
              {columnasDef.length > 0
                ? columnasDef.filter(c => c.visible).map(col => (
                    <th key={col.id}>
                      {col.label}
                      {col.subtitulo && <><br/><span style={{fontWeight:400,fontSize:'0.65rem'}}>{col.subtitulo}</span></>}
                    </th>
                  ))
                : <>
                    <th>Mes</th>
                    <th>Bruto acum.</th>
                    <th>GN acum.<br/><span style={{fontWeight:400,fontSize:'0.65rem'}}>(−aportes)</span></th>
                    <th>Ded. personales<br/><span style={{fontWeight:400,fontSize:'0.65rem'}}>(Art.30 acum.)</span></th>
                    <th>Ded. adicionales<br/><span style={{fontWeight:400,fontSize:'0.65rem'}}>(Art.85 acum.)</span></th>
                    <th>Total deduc.<br/><span style={{fontWeight:400,fontSize:'0.65rem'}}>(acum.)</span></th>
                    <th>GNSI acum.</th>
                    <th>Imp. acum.</th>
                    <th>Retención mes</th>
                  </>
              }
            </tr>
          </thead>
          <tbody>
            {detalleM.map((m, i) => {
              const isActive = mesActivo === i;
              return (
                <tr key={m.mes}
                  style={{ background: isActive ? 'var(--blue-light)' : 'var(--bg-card)', cursor: 'pointer' }}
                  onClick={() => setMesActivo(mesActivo === i ? null : i)}>
                  <td style={{ fontWeight: isActive ? 800 : 700 }}>{m.mes}{isActive ? ' ◀' : ''}</td>
                  <td><span data-tip={`Suma sueldos+SAC+vac hasta ${m.mes}: ${fmt(m.brutoAcum)}`}>{fmt(m.brutoAcum)}</span></td>
                  <td><span data-tip={`${fmt(m.brutoAcum)} × (1 − ${pApPct}%) = ${fmt(m.gNetaAcum)}`}>{fmt(m.gNetaAcum)}</span></td>
                  <td style={{ color: 'var(--red-dark)' }}>
                    <span data-tip={`MNI+Esp+Cargas · ${i+1}/12 = ${fmt(m.dPersAcum)}`}>{fmt(-m.dPersAcum)}</span>
                  </td>
                  <td style={{ color: 'var(--red-dark)' }}>
                    {m.dedArt85Acum > 0
                      ? <span data-tip={`Art.85 acumulado: ${fmt(m.dedArt85Acum)}`}>{fmt(-m.dedArt85Acum)}</span>
                      : '—'}
                  </td>
                  <td style={{ color: 'var(--red-dark)', fontWeight: 700 }}>
                    <span data-tip={`Ded.pers. ${fmt(m.dPersAcum)} + Esp.Ap.2 ${fmt(m.dedEspAp2Acum)} + Art.85 ${fmt(m.dedArt85Acum)} = ${fmt(m.dedTotalAcum)}`}>{fmt(-m.dedTotalAcum)}</span>
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    <span data-tip={`${fmt(m.gNetaAcum)} − ${fmt(m.dedTotalAcum)} = ${fmt(m.gnsiAcum)}`}
                      style={{ color: m.gnsiAcum > 0 ? undefined : 'var(--green-dark)' }}>
                      {m.gnsiAcum > 0 ? fmt(m.gnsiAcum) : '$0'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--red-dark)' }}>
                    <span data-tip={`Escala Art.94 sobre GNSI ${fmt(m.gnsiAcum)}`}>{fmt(m.impAcum)}</span>
                  </td>
                  <td style={{
                      fontWeight: 700,
                      color: m.retencion > 0.5 ? 'var(--red-dark)' : m.retencion < -0.5 ? 'var(--green-dark)' : 'var(--gray-400)',
                    }}>
                    <span data-tip={`Imp.acum. ${fmt(m.impAcum)} − imp.mes ant. ${fmt(m.impAcum - m.retencion)} = ${fmt(m.retencion)}`}>
                      {Math.abs(m.retencion) < 0.5 ? '—' : (m.retencion > 0 ? '−' : '+') + ' ' + fmt(Math.abs(m.retencion))}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detalle del mes */}
      {d && (
        <div style={{ marginTop: '1.2rem', background: 'var(--bg-card-alt)', border: '2px solid var(--blue)',
          borderRadius: '8px', padding: '1.2rem' }}>
          <div style={{ fontWeight: 700, color: 'var(--blue)', marginBottom: '0.3rem', fontSize: '0.95rem' }}>
            {(detalleCfg?.titulo_detalle || 'Liquidación Ganancias 4ª — {mes}').replace('{mes}', d.mes)}
          </div>
          <div style={{ fontSize: '0.71rem', color: 'var(--gray-400)', marginBottom: '0.8rem' }}>
            Pasar el cursor sobre un valor para ver la fórmula.
          </div>

          <table className="calc-table">
            <tbody>

              {/* ── ACUMULADO MES ANTERIOR ── */}
              {prev && (<>
                <tr className="sec"><td colSpan={2}>{(seccion('acumulado_anterior').label || 'Acumulado hasta {mes_anterior}').replace('{mes_anterior}', prev.mes)}</td></tr>
                <tr className="pos">
                  <td>{fila('acumulado_anterior','sueldo_bruto_acum').label || 'Sueldo bruto acumulado'}{Badge('acumulado_anterior','sueldo_bruto_acum')}</td>
                  {V(prev.sueldoAcum, `Sueldos acumulados Ene–${prev.mes}: ${fmt(prev.sueldoAcum)}`)}
                </tr>
                {prev.sacAcum > 0 && (
                  <tr className="pos">
                    <td>{fila('acumulado_anterior','sac_acum').label || 'SAC acumulado'}{Badge('acumulado_anterior','sac_acum')}</td>
                    {V(prev.sacAcum, `SAC acumulado hasta ${prev.mes}: ${fmt(prev.sacAcum)}`)}
                  </tr>
                )}
                {prev.vacAcum > 0 && (
                  <tr className="pos">
                    <td>{fila('acumulado_anterior','vac_acum').label || 'Hab. vacacionales acumulados'}{Badge('acumulado_anterior','vac_acum')}</td>
                    {V(prev.vacAcum, `Hab. vac. acumulados hasta ${prev.mes}: ${fmt(prev.vacAcum)}`)}
                  </tr>
                )}
                <tr className="sub pos">
                  <td>{fila('acumulado_anterior','bruto_acum').label || 'Remuneración bruta acumulada'}{Badge('acumulado_anterior','bruto_acum')}</td>
                  {V(prev.brutoAcum, brutoAcumTip())}
                </tr>
                <tr className="neg">
                  <td>{fila('acumulado_anterior','aportes_acum').label || 'Deducciones acumuladas (aportes)'}{Badge('acumulado_anterior','aportes_acum')}</td>
                  {V(-(prev.brutoAcum - prev.gNetaAcum),
                     `${fmt(prev.brutoAcum)} × ${pApPct}% (${pJubilacion}+${pObraSocial}+${pPAMI}) = ${fmt(prev.brutoAcum * pAp)}`)}
                </tr>
                <tr className="sub pos">
                  <td>{fila('acumulado_anterior','gn_acum').label || 'Ganancia neta acumulada'}{Badge('acumulado_anterior','gn_acum')}</td>
                  {V(prev.gNetaAcum,
                     `${fmt(prev.brutoAcum)} × (1 − ${pApPct}%) = ${fmt(prev.gNetaAcum)}`)}
                </tr>
              </>)}

              {/* ── REMUNERACIÓN DEL PERÍODO ── */}
              <tr className="sec"><td colSpan={2}>{(seccion('remuneracion_periodo').label || 'Remuneración del período — {mes}').replace('{mes}', d.mes)}</td></tr>
              <tr className="pos">
                <td>{fila('remuneracion_periodo','sueldo').label || 'Sueldo / Remuneración bruta'}{Badge('remuneracion_periodo','sueldo')}</td>
                {V(d.sueldo, `Dato ingresado: ${fmt(d.sueldo)}`)}
              </tr>
              {showItem('vac', d.vac > 0, rawVac) && (
                <tr className="pos" style={{ opacity: ex.vac ? 0.55 : 1 }}>
                  <td>{chkMes('vac', fila('remuneracion_periodo','vac').label || 'Haberes vacacionales')}{Badge('remuneracion_periodo','vac')}</td>
                  {V(ex.vac ? 0 : d.vac,
                    ex.vac ? 'Excluido del cálculo'
                           : `Sueldo base ÷ 25 × días de vacaciones = ${fmt(d.vac)}`)}
                </tr>
              )}
              {d.sac > 0 && (
                <tr className="pos">
                  <td>
                    SAC {mesActivo === 5 ? '1er semestre' : '2do semestre'}
                    {Badge('remuneracion_periodo','sac')}
                    {sacAutoCalc && ((mesActivo === 5 && sacAutoCalc.junio) || (mesActivo === 11 && sacAutoCalc.diciembre))
                      ? ' (auto-calculado)' : ''}
                  </td>
                  {V(d.sac,
                    sacAutoCalc && ((mesActivo === 5 && sacAutoCalc.junio) || (mesActivo === 11 && sacAutoCalc.diciembre))
                      ? `Mejor sueldo del semestre ÷ 2 = ${fmt(d.sac)}`
                      : `Dato ingresado: ${fmt(d.sac)}`)}
                </tr>
              )}
              <tr className="sub pos">
                <td><strong>{fila('remuneracion_periodo','total_haberes').label || 'Total haberes del mes'}</strong>{Badge('remuneracion_periodo','total_haberes')}</td>
                {V(d.ingreso,
                   [fmt(d.sueldo),
                    d.vac > 0 && `hab.vac ${fmt(d.vac)}`,
                    d.sac > 0 && `SAC ${fmt(d.sac)}`]
                     .filter(Boolean).join(' + ') + ` = ${fmt(d.ingreso)}`)}
              </tr>

              {/* ── DEDUCCIONES DEL SUELDO ── */}
              <tr className="sec"><td colSpan={2}>{seccion('aportes_previsionales').label || 'Deducciones del sueldo — aportes previsionales'}</td></tr>
              <tr className="neg" style={{ opacity: globalExcl.jubilacion ? 0.55 : 1 }}>
                <td>{chkGlobal('jubilacion', `${fila('aportes_previsionales','jubilacion').label || 'Jubilación SIPA'} (${pJubilacion}%)`)}{Badge('aportes_previsionales','jubilacion')}</td>
                {V(-d.aporte * (globalExcl.jubilacion ? 0 : pJubilacion) / (pApPct || 1),
                  globalExcl.jubilacion ? 'Excluido del cálculo'
                  : `${fmt(d.ingreso)} × ${pJubilacion}% = ${fmt(d.ingreso * pJubilacion / 100)}`)}
              </tr>
              <tr className="neg" style={{ opacity: globalExcl.pami ? 0.55 : 1 }}>
                <td>{chkGlobal('pami', `${fila('aportes_previsionales','pami').label || 'Ley 19032 — PAMI'} (${pPAMI}%)`)}{Badge('aportes_previsionales','pami')}</td>
                {V(-d.aporte * (globalExcl.pami ? 0 : pPAMI) / (pApPct || 1),
                  globalExcl.pami ? 'Excluido del cálculo'
                  : `${fmt(d.ingreso)} × ${pPAMI}% = ${fmt(d.ingreso * pPAMI / 100)}`)}
              </tr>
              <tr className="neg" style={{ opacity: globalExcl.obraSocial ? 0.55 : 1 }}>
                <td>{chkGlobal('obraSocial', `${fila('aportes_previsionales','obra_social').label || 'Obra social'} (${pObraSocial}%)`)}{Badge('aportes_previsionales','obra_social')}</td>
                {V(-d.aporte * (globalExcl.obraSocial ? 0 : pObraSocial) / (pApPct || 1),
                  globalExcl.obraSocial ? 'Excluido del cálculo'
                  : `${fmt(d.ingreso)} × ${pObraSocial}% = ${fmt(d.ingreso * pObraSocial / 100)}`)}
              </tr>
              <tr className="sub neg">
                <td>{fila('aportes_previsionales','total_aportes').label || 'Total aportes del mes'}{Badge('aportes_previsionales','total_aportes')}</td>
                {V(-d.aporte, `${fmt(d.ingreso)} × ${pApPct}% (${pJubilacion}+${pObraSocial}+${pPAMI}) = ${fmt(d.aporte)}`)}
              </tr>

              {/* ── DEDUCCIONES GENERALES ART. 85 ── */}
              {(d.dedArt85Acum > 0
                || ['alq','prep','dom','segv','segr','hip','otros40','otros100'].some(k => ex[k] && rawD[k] > 0)
              ) && (<>
                <tr className="sec"><td colSpan={2}>{seccion('art85').label || 'Deducciones generales — Art. 85 (acumuladas)'}</td></tr>
                {showItem('alq', d.alqAcum > 0, rawD.alq) && (
                  <tr className="neg" style={{ opacity: ex.alq ? 0.55 : 1 }}>
                    <td>{chkMes('alq', fila('art85','alq').label || 'Alquiler (40%) acumulado')}{Badge('art85','alq')}</td>
                    {V(ex.alq ? 0 : -d.alqAcum,
                      ex.alq ? 'Excluido del cálculo'
                             : `+${fmt(d.alqMes)} en ${d.mes} → acumulado: ${fmt(d.alqAcum)}`)}
                  </tr>
                )}
                {showItem('prep', d.prepAcum > 0, rawD.prep) && (
                  <tr className="neg" style={{ opacity: ex.prep ? 0.55 : 1 }}>
                    <td>{chkMes('prep', fila('art85','prep').label || 'Prepaga acumulada')}{Badge('art85','prep')}</td>
                    {V(ex.prep ? 0 : -d.prepAcum,
                      ex.prep ? 'Excluido del cálculo'
                              : `+${fmt(d.prepMes)} en ${d.mes} → acumulado: ${fmt(d.prepAcum)}`)}
                  </tr>
                )}
                {showItem('dom', d.domAcum > 0, rawD.dom) && (
                  <tr className="neg" style={{ opacity: ex.dom ? 0.55 : 1 }}>
                    <td>{chkMes('dom', fila('art85','dom').label || 'Personal doméstico acumulado')}{Badge('art85','dom')}</td>
                    {V(ex.dom ? 0 : -d.domAcum,
                      ex.dom ? 'Excluido del cálculo'
                             : `+${fmt(d.domMes)} en ${d.mes} → acumulado: ${fmt(d.domAcum)}`)}
                  </tr>
                )}
                {showItem('segv', d.segVAcum > 0, rawD.segv) && (
                  <tr className="neg" style={{ opacity: ex.segv ? 0.55 : 1 }}>
                    <td>{chkMes('segv', fila('art85','segv').label || 'Seg. de vida acumulado')}{Badge('art85','segv')}</td>
                    {V(ex.segv ? 0 : -d.segVAcum,
                      ex.segv ? 'Excluido del cálculo'
                              : `+${fmt(d.segVMes)} en ${d.mes} → acumulado: ${fmt(d.segVAcum)}`)}
                  </tr>
                )}
                {showItem('segr', d.segRAcum > 0, rawD.segr) && (
                  <tr className="neg" style={{ opacity: ex.segr ? 0.55 : 1 }}>
                    <td>{chkMes('segr', fila('art85','segr').label || 'Seg. de retiro acumulado')}{Badge('art85','segr')}</td>
                    {V(ex.segr ? 0 : -d.segRAcum,
                      ex.segr ? 'Excluido del cálculo'
                              : `+${fmt(d.segRMes)} en ${d.mes} → acumulado: ${fmt(d.segRAcum)}`)}
                  </tr>
                )}
                {showItem('hip', d.hipAcum > 0, rawD.hip) && (
                  <tr className="neg" style={{ opacity: ex.hip ? 0.55 : 1 }}>
                    <td>{chkMes('hip', fila('art85','hip').label || 'Crédito hipotecario acumulado')}{Badge('art85','hip')}</td>
                    {V(ex.hip ? 0 : -d.hipAcum,
                      ex.hip ? 'Excluido del cálculo'
                             : `+${fmt(d.hipMes)} en ${d.mes} → acumulado: ${fmt(d.hipAcum)}`)}
                  </tr>
                )}
                {showItem('otros40', (d.otros40Acum || 0) > 0, rawD.otros40) && (
                  <tr className="neg" style={{ opacity: ex.otros40 ? 0.55 : 1 }}>
                    <td>{chkMes('otros40', fila('art85','otros40').label || 'Otros (40%) acumulado — hon. médicos, educ. hijos')}{Badge('art85','otros40')}</td>
                    {V(ex.otros40 ? 0 : -(d.otros40Acum || 0),
                      ex.otros40 ? 'Excluido del cálculo'
                                 : `+${fmt(d.otros40BrutoMes)} × 40% = ${fmt(d.otros40Mes)} en ${d.mes} → acumulado: ${fmt(d.otros40Acum)}`)}
                  </tr>
                )}
                {showItem('otros100', (d.otros100Acum || 0) > 0, rawD.otros100) && (
                  <tr className="neg" style={{ opacity: ex.otros100 ? 0.55 : 1 }}>
                    <td>{chkMes('otros100', fila('art85','otros100').label || 'Otros (100%) acumulado — indumentaria, col. prof., donaciones')}{Badge('art85','otros100')}</td>
                    {V(ex.otros100 ? 0 : -(d.otros100Acum || 0),
                      ex.otros100 ? 'Excluido del cálculo'
                                  : `+${fmt(d.otros100BrutoMes)} × 100% = ${fmt(d.otros100Mes)} en ${d.mes} → acumulado: ${fmt(d.otros100Acum)}`)}
                  </tr>
                )}
                <tr className="sub neg">
                  <td>{fila('art85','subtotal_art85').label || 'Subtotal Art. 85 acumulado'}{Badge('art85','subtotal_art85')}</td>
                  {V(-d.dedArt85Acum, `Suma ded. Art.85 acumuladas: ${fmt(d.dedArt85Acum)}`)}
                </tr>
              </>)}

              {/* ── CARGAS DE FAMILIA ── */}
              {(conyuge > 0 || hijos > 0 || hijosInc > 0) && (<>
                <tr className="sec">
                  <td colSpan={2}>{(seccion('cargas_familia').label || 'Cargas de familia — Art. 30 b) — {fraccion}/12').replace('{fraccion}', mesActivo + 1)}</td>
                </tr>
                {conyuge > 0 && (
                  <tr className="neg" style={{ opacity: globalExcl.conyuge ? 0.55 : 1 }}>
                    <td>{chkGlobal('conyuge', fila('cargas_familia','conyuge').label || 'Cónyuge')}{Badge('cargas_familia','conyuge')}</td>
                    {V(globalExcl.conyuge ? 0 : -dedPers.conyuge * frac,
                       globalExcl.conyuge ? 'Excluido del cálculo'
                       : `Anual: ${fmt(dedPers.conyuge)} × ${mesActivo+1}/12 = ${fmt(dedPers.conyuge * frac)}`)}
                  </tr>
                )}
                {hijos > 0 && (
                  <tr className="neg" style={{ opacity: globalExcl.hijos ? 0.55 : 1 }}>
                    <td>{chkGlobal('hijos', `${fila('cargas_familia','hijos').label || 'Hijos'} (${hijos})`)}{Badge('cargas_familia','hijos')}</td>
                    {V(globalExcl.hijos ? 0 : -dedPers.hijos * frac,
                       globalExcl.hijos ? 'Excluido del cálculo'
                       : `Anual: ${fmt(dedPers.hijos)} (${hijos} hijo/s) × ${mesActivo+1}/12 = ${fmt(dedPers.hijos * frac)}`)}
                  </tr>
                )}
                {hijosInc > 0 && (
                  <tr className="neg" style={{ opacity: globalExcl.hijosInc ? 0.55 : 1 }}>
                    <td>{chkGlobal('hijosInc', `${fila('cargas_familia','hijos_inc').label || 'Hijos incapacitados'} (${hijosInc})`)}{Badge('cargas_familia','hijos_inc')}</td>
                    {V(globalExcl.hijosInc ? 0 : -dedPers.hijosInc * frac,
                       globalExcl.hijosInc ? 'Excluido del cálculo'
                       : `Anual: ${fmt(dedPers.hijosInc)} (${hijosInc}) × ${mesActivo+1}/12 = ${fmt(dedPers.hijosInc * frac)}`)}
                  </tr>
                )}
              </>)}

              {/* ── MNI + DEDUCCIÓN ESPECIAL ── */}
              <tr className="sec">
                <td colSpan={2}>{(seccion('deducciones_personales').label || 'Deducciones personales — Art. 30 — {fraccion}/12').replace('{fraccion}', mesActivo + 1)}</td>
              </tr>
              <tr className="neg" style={{ opacity: globalExcl.mni ? 0.55 : 1 }}>
                <td>{chkGlobal('mni', fila('deducciones_personales','mni').label || 'Ganancia no imponible — Art. 30 a)')}{Badge('deducciones_personales','mni')}</td>
                {V(globalExcl.mni ? 0 : -dedPers.mni * frac,
                   globalExcl.mni ? 'Excluido del cálculo'
                   : `Anual: ${fmt(dedPers.mni)} × ${mesActivo+1}/12 = ${fmt(dedPers.mni * frac)}`)}
              </tr>
              <tr className="neg" style={{ opacity: globalExcl.esp ? 0.55 : 1 }}>
                <td>{chkGlobal('esp', fila('deducciones_personales','esp').label || 'Deducción especial rel. dependencia — Art. 30 c) (= MNI × 4,8)')}{Badge('deducciones_personales','esp')}</td>
                {V(globalExcl.esp ? 0 : -dedPers.esp * frac,
                   globalExcl.esp ? 'Excluido del cálculo'
                   : `Anual: ${fmt(dedPers.esp)} × ${mesActivo+1}/12 = ${fmt(dedPers.esp * frac)}`)}
              </tr>
              <tr className="neg" style={{ opacity: globalExcl.dedEspAp2 ? 0.55 : 1 }}>
                <td>{chkGlobal('dedEspAp2', fila('deducciones_personales','ded_esp_ap2').label || 'Ded. Especial Ap.2 — Art. 30 c) ap.2 (RG 5531/2024)')}{Badge('deducciones_personales','ded_esp_ap2')}</td>
                {V(globalExcl.dedEspAp2 ? 0 : -d.dedEspAp2Acum,
                   globalExcl.dedEspAp2 ? 'Excluido del cálculo'
                   : `Ded.pers.acum. ${fmt(d.dPersAcum)} ÷ 12 = ${fmt(d.dedEspAp2Acum)}`)}
              </tr>

              {/* ── TOTAL DEDUCCIONES ── */}
              <tr className="sub neg" style={{ fontSize: '0.92rem' }}>
                <td><strong>{fila('total_deducciones','total_ded_acum').label || 'Total deducciones acumuladas'}</strong>{Badge('total_deducciones','total_ded_acum')}</td>
                {V(-d.dedTotalAcum,
                   `Ded.pers. ${fmt(d.dPersAcum)} + Esp.Ap.2 ${fmt(d.dedEspAp2Acum)} + Art.85 ${fmt(d.dedArt85Acum)} = ${fmt(d.dedTotalAcum)}`)}
              </tr>

              {/* ── GNSI ── */}
              {d.gnsiAcum > 0
                ? <tr className="total">
                    <td><strong>{(fila('gnsi','gnsi_acum').label || 'GNSI acumulada hasta {mes}').replace('{mes}', d.mes)}</strong>{Badge('gnsi','gnsi_acum')}</td>
                    {V(d.gnsiAcum,
                       `GN acum. ${fmt(d.gNetaAcum)} − ded. total ${fmt(d.dedTotalAcum)} = ${fmt(d.gnsiAcum)}`)}
                  </tr>
                : <tr className="notax">
                    <td>✅ GNSI acumulada</td>
                    <td>
                      <span data-tip={`${fmt(d.gNetaAcum)} − ${fmt(d.dedTotalAcum)} = negativo → $0`}>
                        $0 — sin impuesto hasta {d.mes}
                      </span>
                    </td>
                  </tr>
              }

              {/* ── RETENCIÓN DEL MES ── */}
              <tr className="sec"><td colSpan={2}>{(seccion('retencion_mes').label || 'Retención — {mes}').replace('{mes}', d.mes)}</td></tr>
              <tr>
                <td>{(fila('retencion_mes','imp_acum').label || 'Impuesto determinado acumulado hasta {mes}').replace('{mes}', d.mes)}{Badge('retencion_mes','imp_acum')}</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                  <span data-tip={`Escala Art.94 aplicada sobre GNSI ${fmt(d.gnsiAcum)}`}>{fmt(d.impAcum)}</span>
                </td>
              </tr>
              <tr className="neg">
                <td>{fila('retencion_mes','imp_anterior').label || '(−) Impuesto retenido en meses anteriores'}{Badge('retencion_mes','imp_anterior')}</td>
                {V(-(d.impAcum - d.retencion),
                   `Imp. acum. hasta ${prev ? prev.mes : '—'}: ${fmt(d.impAcum - d.retencion)}`)}
              </tr>
              <tr className={d.retencion > 0.5 ? 'total' : d.retencion < -0.5 ? 'notax' : ''}>
                <td>
                  <strong>
                    {d.retencion > 0.5
                      ? `🔴 ${fila('retencion_mes','retencion').nota_positivo || 'Retiene el empleador'}`
                      : d.retencion < -0.5
                        ? `🟢 ${fila('retencion_mes','retencion').nota_negativo || 'Devuelve el empleador'}`
                        : 'Sin retención'}
                  </strong>
                </td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, fontSize: '1.05rem' }}>
                  <span data-tip={`Imp.acum. ${fmt(d.impAcum)} − imp.mes ant. ${fmt(d.impAcum - d.retencion)} = ${fmt(d.retencion)}`}>
                    {Math.abs(d.retencion) < 0.5 ? '—' : fmt(Math.abs(d.retencion))}
                  </span>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      )}

      {!d && (
        <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.6rem' }}>
          Clic en un mes para ver el detalle completo.
        </p>
      )}
    </div>
  );
}
