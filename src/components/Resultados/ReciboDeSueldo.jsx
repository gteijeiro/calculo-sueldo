import React, { useState } from 'react';
import { fmt } from '../../utils/format.js';
import { getDivisorSueldo } from '../../logic/vacaciones.js';
import { CONVENIOS_DETALLE } from '../../constants/convenios.js';
import { getReciboConfig, getArgentina } from '../../constants/argentina.js';

const T = (value, tip) => <span data-tip={tip}>{fmt(value)}</span>;

const secStyle   = { padding: '0.25rem 0.4rem', fontWeight: 700, fontSize: '0.74rem',
  textTransform: 'uppercase', letterSpacing: '0.04em' };
const rowStyle   = { padding: '0.2rem 0.5rem' };
const monoRight  = { textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 };
const totalStyle = { borderTop: '2px solid var(--gray-200)', fontWeight: 700 };

function SubRecibo({ label, color, borderColor, base, pJubilacion, pObraSocial, pPAMI, pApPct, children }) {
  return (
    <div style={{ border: `1.5px solid ${borderColor}`, borderRadius: '6px',
      marginTop: '0.6rem', overflow: 'hidden' }}>
      <div style={{ background: borderColor, color: 'white', fontWeight: 700,
        fontSize: '0.75rem', padding: '0.3rem 0.6rem', letterSpacing: '0.03em' }}>
        {label}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', background: 'var(--bg-card)', color: 'var(--text-main)' }}>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

const REM_KEYS   = ['he50','he100','comisiones','antiguedad','presentismo','guardia','premios','otrosRem'];
const NO_REM_KEYS= ['viaticos','snrParitaria','snrEmergencia','beneficios','herramientas','otrosNoRem'];

export default function ReciboDeSueldo({ resultado, vacConfig = {}, convenio = 'general', conceptosData = [], licenciasPorMes = [] }) {
  const { detalleM, pAp, sacAutoCalc, sacUsados, config, vacAn, diasVacs } = resultado;
  const { pJubilacion, pObraSocial, pPAMI } = config;
  const [mesAbierto, setMesAbierto] = useState(null);

  // Descuentos extra del convenio
  const convDet = CONVENIOS_DETALLE[convenio] || CONVENIOS_DETALLE.general;
  const descExtras = convDet.descuentos_extra || [];
  const pExtras = descExtras.reduce((s, d) => s + d.pct / 100, 0);

  const tieneVac    = vacAn > 0;
  const pApPct      = Math.round(pAp * 100);

  // Límites aportes
  const arg         = getArgentina();
  const limites     = arg?.aportes_limites_2026 ?? {};
  const SMVM        = limites.smvm || 0;
  const SIPA_TOPE   = limites.sipa_tope_empleado || 0;
  const remDef      = arg?.conceptos_remunerativos   ?? [];
  const noRemDef    = arg?.conceptos_no_remunerativos ?? [];
  const labelRem    = id => remDef.find(c => c.id === id)?.label   ?? id;
  const labelNoRem  = id => noRemDef.find(c => c.id === id)?.label ?? id;
  const leyRem      = id => remDef.find(c => c.id === id)?.ley     ?? '';

  // ¿Hay algún concepto extra en cualquier mes?
  const hayExtrasRem   = detalleM.some(d => (d.extraRem || 0) > 0);
  const hayExtrasNoRem = detalleM.some(d => (d.extraNoRem || 0) > 0);

  // Columnas y secciones desde argentina.json
  const reciboConfig   = getReciboConfig();
  const columnasDef    = reciboConfig?.columnas_tabla ?? [];
  const seccionesDef   = reciboConfig?.secciones_detalle ?? [];

  const columnas = columnasDef.filter(col => {
    if (col.visible === 'si_hay_vacaciones') return tieneVac;
    if (col.visible === 'si_hay_extras_rem')   return hayExtrasRem;
    if (col.visible === 'si_hay_extras_no_rem') return hayExtrasNoRem;
    return col.visible === true;
  });
  // Si no hay config JSON, usar columnas hardcoded + extras dinámicos
  const colBase  = tieneVac ? 8 : 7;
  const colExtra = (hayExtrasRem ? 1 : 0) + (hayExtrasNoRem ? 1 : 0);
  const colTotal = (columnas.length || colBase) + (columnasDef.length === 0 ? colExtra : 0);

  const seccion = id => seccionesDef.find(s => s.id === id) ?? {};
  const fila = (secId, filaId) => seccion(secId)?.filas?.find(f => f.id === filaId) ?? {};
  const pctLabel = pct_config => config[pct_config] ?? '';
  const diasVacTotal = diasVacs ? diasVacs.reduce((s, v) => s + v, 0) : 0;
  const mesesConVac  = detalleM.filter(m => (m.vac || 0) > 0).length;

  return (
    <div className="card">
      <div className="card-title">📄 Recibo de sueldo — detalle mensual</div>

      {descExtras.length > 0 && (
        <div style={{ fontSize: '0.78rem', color: 'var(--orange-dark)', background: 'var(--orange-light)',
          borderRadius: '6px', padding: '0.5rem 0.8rem', marginBottom: '0.6rem' }}>
          <strong>Convenio {convDet.nombre}:</strong>{' '}
          {descExtras.map((d, i) => (
            <span key={d.key}>{i > 0 ? ' · ' : ''}{d.label} {d.pct}% (no deduce Ganancias)</span>
          ))}
        </div>
      )}
      {sacAutoCalc && (sacAutoCalc.junio || sacAutoCalc.diciembre) && (
        <div style={{ fontSize: '0.78rem', color: 'var(--orange-dark)', background: 'var(--orange-light)',
          borderRadius: '6px', padding: '0.5rem 0.8rem', marginBottom: '0.8rem' }}>
          <strong>SAC auto-calculado:</strong>
          {sacAutoCalc.junio    && ` Junio ${fmt(sacUsados[5])}`}
          {sacAutoCalc.diciembre && ` · Diciembre ${fmt(sacUsados[11])}`}
          {' '}(mejor sueldo semestre ÷ 2)
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table className="det-table" style={{ minWidth: '600px' }}>
          <thead>
            <tr>
              {columnas.length > 0
                ? columnas.map(col => (
                    <th key={col.id} title={col.ley}>
                      {col.label}
                      {col.pct_config && (
                        <><br/><span style={{fontWeight:400,fontSize:'0.65rem'}}>{pctLabel(col.pct_config)}%</span></>
                      )}
                    </th>
                  ))
                : <>
                    <th>Mes</th>
                    <th>Sueldo bruto</th>
                    {hayExtrasRem && <th>Extras rem.</th>}
                    {tieneVac && <th>Hab. vacacionales</th>}
                    <th>SAC</th>
                    {hayExtrasNoRem && <th>No rem.</th>}
                    <th>Jubilación<br/><span style={{fontWeight:400,fontSize:'0.65rem'}}>{pJubilacion}%</span></th>
                    <th>Obra social<br/><span style={{fontWeight:400,fontSize:'0.65rem'}}>{pObraSocial}%</span></th>
                    <th>PAMI<br/><span style={{fontWeight:400,fontSize:'0.65rem'}}>{pPAMI}%</span></th>
                    <th>Neto (sin Ganancias)</th>
                  </>
              }
            </tr>
          </thead>
          <tbody>
            {detalleM.map((d, i) => {
              const sinDatos = !d.sueldo && !d.vac;
              if (sinDatos) {
                return (
                  <React.Fragment key={d.mes}>
                    <tr style={{ opacity: 0.45 }}>
                      <td style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.82rem' }}>{d.mes}</td>
                      <td colSpan={colTotal - 1} style={{
                        color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic',
                      }}>
                        Sin datos — aportes no calculados
                      </td>
                    </tr>
                  </React.Fragment>
                );
              }
              const baseRecibo  = (d.sueldo || 0) + (d.vac || 0);
              const bajoPiso    = SMVM > 0 && baseRecibo < SMVM;
              const superaTope  = SIPA_TOPE > 0 && baseRecibo > SIPA_TOPE;
              const baseJub     = superaTope ? SIPA_TOPE : baseRecibo;
              const jubTotal    = baseJub    * pJubilacion / 100;
              const osTotal     = baseRecibo * pObraSocial / 100;
              const pamiTotal   = baseRecibo * pPAMI       / 100;
              // Descuentos extra convenio (cuota sindical, etc.) — base: remuneración bruta
              const extrasTotal = baseRecibo * pExtras;
              const netoTotal   = baseRecibo - jubTotal - osTotal - pamiTotal - extrasTotal;
              const isOpen   = mesAbierto === i;
              const licsDelMes    = licenciasPorMes?.[i] ?? [];
              const totalLics     = licsDelMes.reduce((s, l) => s + l.importe,   0);
              const totalDescLics = licsDelMes.reduce((s, l) => s + l.descuento, 0);

              // Derivar sueldo base para mostrar la reducción por vacaciones
              // Fórmula: sueldo_mes = base − (base/div) × dias_vac → base = sueldo × div / (div − dias_vac)
              const diasVacMes   = diasVacs?.[i] || 0;
              const divMes       = getDivisorSueldo(vacConfig.divisorSueldo ?? 30, i);
              let sueldoBase     = d.sueldo;
              if (diasVacMes > 0 && d.sueldo > 0) {
                const divisorResto = divMes - diasVacMes;
                sueldoBase = divisorResto > 0 ? d.sueldo * divMes / divisorResto : d.sueldo;
              }
              const reduccionVac = sueldoBase - d.sueldo;
              const diasTrab     = diasVacMes > 0 ? (divMes - diasVacMes) : null;

              // Conceptos por mes
              const conMes   = conceptosData[i] || {};
              const extraRem = d.extraRem || 0;
              const extraNoRem = d.extraNoRem || 0;

              // Sub-recibo sueldo: aportes sobre base + extras rem
              const baseSueldo = d.sueldo || 0;
              const baseConExtras = baseSueldo + extraRem;
              const jubS = baseConExtras * pJubilacion / 100;
              const osS  = baseConExtras * pObraSocial / 100;
              const pamS = baseConExtras * pPAMI       / 100;
              const netS = baseConExtras - jubS - osS - pamS;

              const jubV = d.vac * pJubilacion / 100;
              const osV  = d.vac * pObraSocial / 100;
              const pamV = d.vac * pPAMI       / 100;
              const netV = d.vac - jubV - osV - pamV;

              return (
                <React.Fragment key={d.mes}>
                  <tr onClick={() => setMesAbierto(isOpen ? null : i)}
                    style={{ cursor: 'pointer', background: isOpen ? 'var(--blue-light)' : 'var(--bg-card)' }}>
                    <td style={{ fontWeight: 700 }}>
                      {d.mes}{d.sac > 0 ? ' ⊕' : ''}{isOpen ? ' ▲' : ' ▼'}
                    </td>
                    <td>{T(d.sueldo, reduccionVac > 0
                      ? `Base ${fmt(sueldoBase)} − vacaciones ${fmt(reduccionVac)} = ${fmt(d.sueldo)}`
                      : `Sueldo bruto del mes: ${fmt(d.sueldo)}`)}</td>
                    {hayExtrasRem && (
                      <td style={{ color: extraRem > 0 ? 'var(--green-dark)' : 'var(--gray-400)' }}>
                        {extraRem > 0 ? T(extraRem, `Extras remunerativos: ${fmt(extraRem)}`) : '—'}
                      </td>
                    )}
                    {tieneVac && (
                      <td style={{ color: d.vac > 0 ? 'var(--green-dark)' : 'var(--gray-400)' }}>
                        {d.vac > 0
                          ? T(d.vac, `Sueldo base ÷ 25 × días vacaciones = ${fmt(d.vac)}`)
                          : '—'}
                      </td>
                    )}
                    <td style={{ color: d.sac > 0 ? 'var(--blue-dark)' : 'var(--gray-400)' }}>
                      {d.sac > 0
                        ? T(d.sac, sacAutoCalc && ((i === 5 && sacAutoCalc.junio) || (i === 11 && sacAutoCalc.diciembre))
                            ? `Mejor sueldo semestre ÷ 2 = ${fmt(d.sac)}`
                            : `Dato ingresado: ${fmt(d.sac)}`)
                        : '—'}
                    </td>
                    {hayExtrasNoRem && (
                      <td style={{ color: extraNoRem > 0 ? 'var(--orange-dark)' : 'var(--gray-400)' }}>
                        {extraNoRem > 0 ? T(extraNoRem, `No remunerativos: ${fmt(extraNoRem)}`) : '—'}
                      </td>
                    )}
                    <td className="d-red">
                      {T(-jubTotal, superaTope
                        ? `Tope SIPA ${fmt(SIPA_TOPE)} × ${pJubilacion}% = ${fmt(jubTotal)} ①`
                        : `${fmt(baseRecibo)} × ${pJubilacion}% = ${fmt(jubTotal)}`)}
                      {superaTope && <sup style={{ color: 'var(--orange-dark)', fontWeight: 900 }}>①</sup>}
                    </td>
                    <td className="d-red">
                      {T(-osTotal, bajoPiso
                        ? `Base real ${fmt(baseRecibo)} < SMVM ${fmt(SMVM)} — aporte sobre base real ${fmt(osTotal)} ②`
                        : `${fmt(baseRecibo)} × ${pObraSocial}% = ${fmt(osTotal)}`)}
                      {bajoPiso && <sup style={{ color: 'var(--orange-dark)', fontWeight: 900 }}>②</sup>}
                    </td>
                    <td className="d-red">
                      {T(-pamiTotal, bajoPiso
                        ? `Base real ${fmt(baseRecibo)} < SMVM ${fmt(SMVM)} — aporte sobre base real ${fmt(pamiTotal)} ②`
                        : `${fmt(baseRecibo)} × ${pPAMI}% = ${fmt(pamiTotal)}`)}
                      {bajoPiso && <sup style={{ color: 'var(--orange-dark)', fontWeight: 900 }}>②</sup>}
                    </td>
                    <td className="d-grn">{T(netoTotal,
                      extrasTotal > 0
                        ? `${fmt(baseRecibo)} − aportes ${fmt(jubTotal+osTotal+pamiTotal)} − convenio ${fmt(extrasTotal)} = ${fmt(netoTotal)}`
                        : `${fmt(baseRecibo)} × (1−${pApPct}%) = ${fmt(netoTotal)}`)}</td>
                  </tr>

                  {isOpen && (
                    <tr>
                      <td colSpan={colTotal} style={{ padding: '0.6rem 1rem', background: 'var(--bg-card-alt)', fontSize: '0.82rem' }}>

                        {/* ── SUB-RECIBO SUELDO ── */}
                        <SubRecibo label={`Recibo de sueldo — ${d.mes}`} borderColor={seccion('haberes_sueldo').color_borde || '#4299e1'}>
                          <tr><td style={{...secStyle, color:'var(--green-dark)'}} colSpan={2}>{seccion('haberes_sueldo').label || 'Haberes'}</td></tr>
                          <tr>
                            <td style={rowStyle}>{fila('haberes_sueldo','sueldo_bruto').label || 'Sueldo bruto mensual'}</td>
                            <td style={{...monoRight, color:'var(--green-dark)'}}>
                              {T(sueldoBase, reduccionVac > 0
                                ? `Sueldo base: ${fmt(sueldoBase)}`
                                : `Dato ingresado: ${fmt(sueldoBase)}`)}
                            </td>
                          </tr>
                          {reduccionVac > 0 && (
                            <tr>
                              <td style={{...rowStyle, color:'var(--red-dark)'}}>
                                {fila('haberes_sueldo','reduccion_vacaciones').label || '(−) Reducción por vacaciones'} ({diasVacMes} días)
                              </td>
                              <td style={{...monoRight, color:'var(--red-dark)'}}>
                                {T(-reduccionVac,
                                  `${fmt(sueldoBase)} ÷ ${divMes} × ${diasVacMes} días = ${fmt(reduccionVac)}`)}
                              </td>
                            </tr>
                          )}
                          {(reduccionVac > 0 || licsDelMes.length > 0) && (
                            <tr style={{ fontWeight: 700 }}>
                              <td style={rowStyle}>
                                Sueldo por días trabajados
                              </td>
                              <td style={{...monoRight}}>
                                {T(d.sueldo - totalDescLics,
                                  [
                                    reduccionVac > 0 ? `${fmt(sueldoBase)} − vac ${fmt(reduccionVac)}` : fmt(sueldoBase),
                                    totalDescLics > 0 ? `− lic ${fmt(totalDescLics)}` : '',
                                    `= ${fmt(d.sueldo - totalDescLics)}`,
                                  ].filter(Boolean).join(' '))}
                              </td>
                            </tr>
                          )}
                          {/* Licencias especiales — deducción + haber */}
                          {licsDelMes.map((lic, li) => (
                            <React.Fragment key={li}>
                              <tr>
                                <td style={{...rowStyle, color:'var(--red-dark)'}}>
                                  (−) Días de licencia: {lic.label}
                                  <span style={{ fontSize:'0.67rem', display:'block', opacity:0.7 }}>
                                    {lic.dias} día{lic.dias > 1 ? 's' : ''} descontados del sueldo
                                  </span>
                                </td>
                                <td style={{...monoRight, color:'var(--red-dark)'}}>
                                  {T(-lic.descuento, `Sueldo ÷ 30 × ${lic.dias} días = ${fmt(lic.descuento)}`)}
                                </td>
                              </tr>
                              <tr>
                                <td style={{...rowStyle, color:'var(--blue-dark)'}}>
                                  (+) {lic.label} (licencia paga)
                                  <span style={{ fontSize:'0.67rem', display:'block', opacity:0.7 }}>
                                    Art.158 / LCT — días abonados íntegramente
                                  </span>
                                </td>
                                <td style={{...monoRight, color:'var(--blue-dark)'}}>
                                  {T(lic.importe, `Licencia paga ${lic.dias} días = ${fmt(lic.importe)}`)}
                                </td>
                              </tr>
                            </React.Fragment>
                          ))}
                          {/* Extras remunerativos (cada uno) */}
                          {REM_KEYS.map(k => {
                            const v = conMes[k] || 0;
                            if (!v) return null;
                            return (
                              <tr key={k}>
                                <td style={{...rowStyle, color:'var(--green-dark)'}}>
                                  {labelRem(k)}
                                  <span style={{ fontSize:'0.67rem', display:'block', opacity:0.7 }}>{leyRem(k)}</span>
                                </td>
                                <td style={{...monoRight, color:'var(--green-dark)'}}>{T(v, `${labelRem(k)}: ${fmt(v)}`)}</td>
                              </tr>
                            );
                          })}
                          <tr style={totalStyle}>
                            <td style={rowStyle}>{fila('haberes_sueldo','total_haberes_sueldo').label || 'Total haberes'}</td>
                            <td style={monoRight}>
                              {T(baseConExtras, `Sueldo ${fmt(baseSueldo)}${extraRem > 0 ? ` + extras ${fmt(extraRem)}` : ''} = ${fmt(baseConExtras)}`)}
                            </td>
                          </tr>
                          {/* Conceptos no remunerativos */}
                          {extraNoRem > 0 && (<>
                            <tr><td style={{...secStyle, color:'var(--orange-dark)'}} colSpan={2}>Conceptos no remunerativos</td></tr>
                            {NO_REM_KEYS.map(k => {
                              const v = conMes[k] || 0;
                              if (!v) return null;
                              return (
                                <tr key={k}>
                                  <td style={{...rowStyle, color:'var(--orange-dark)'}}>
                                    {labelNoRem(k)}
                                    <span style={{ fontSize:'0.67rem', display:'block', opacity:0.7 }}>Sin aportes · sin Ganancias</span>
                                  </td>
                                  <td style={{...monoRight, color:'var(--orange-dark)'}}>{T(v, `${labelNoRem(k)}: ${fmt(v)}`)}</td>
                                </tr>
                              );
                            })}
                            <tr style={totalStyle}>
                              <td style={rowStyle}>Total no remunerativos</td>
                              <td style={{...monoRight, color:'var(--orange-dark)'}}>{T(extraNoRem, `No rem.: ${fmt(extraNoRem)}`)}</td>
                            </tr>
                          </>)}
                          <tr><td style={{...secStyle, color:'var(--red-dark)'}} colSpan={2}>{seccion('descuentos_sueldo').label || 'Descuentos'}</td></tr>
                          <tr>
                            <td style={rowStyle}>{fila('descuentos_sueldo','jubilacion').label || 'Jubilación SIPA'} ({pJubilacion}%)</td>
                            <td style={{...monoRight, color:'var(--red-dark)'}}>
                              {T(-jubS, `${fmt(baseConExtras)} × ${pJubilacion}% = ${fmt(jubS)}`)}
                            </td>
                          </tr>
                          <tr>
                            <td style={rowStyle}>{fila('descuentos_sueldo','obra_social').label || 'Obra social'} ({pObraSocial}%)</td>
                            <td style={{...monoRight, color:'var(--red-dark)'}}>
                              {T(-osS, `${fmt(baseConExtras)} × ${pObraSocial}% = ${fmt(osS)}`)}
                            </td>
                          </tr>
                          <tr>
                            <td style={rowStyle}>{fila('descuentos_sueldo','pami').label || 'PAMI / INSSJP'} ({pPAMI}%)</td>
                            <td style={{...monoRight, color:'var(--red-dark)'}}>
                              {T(-pamS, `${fmt(baseConExtras)} × ${pPAMI}% = ${fmt(pamS)}`)}
                            </td>
                          </tr>
                          {descExtras.map(de => {
                            const monto = d.sueldo * de.pct / 100;
                            return (
                              <tr key={de.key}>
                                <td style={{...rowStyle, color:'var(--orange-dark)'}}>
                                  {de.label} ({de.pct}%)
                                  <span style={{ fontSize:'0.67rem', display:'block', opacity:0.8 }}>No deducible en Ganancias</span>
                                </td>
                                <td style={{...monoRight, color:'var(--orange-dark)'}}>
                                  {T(-monto, `${fmt(d.sueldo)} × ${de.pct}% = ${fmt(monto)}`)}
                                </td>
                              </tr>
                            );
                          })}
                          <tr style={totalStyle}>
                            <td style={rowStyle}>{fila('descuentos_sueldo','total_descuentos').label || 'Total descuentos'}</td>
                            <td style={{...monoRight, color:'var(--red-dark)'}}>
                              {T(-(jubS+osS+pamS + baseConExtras*pExtras),
                                `Aportes ${fmt(jubS+osS+pamS)}${pExtras > 0 ? ` + convenio ${fmt(baseConExtras*pExtras)}` : ''} = ${fmt(jubS+osS+pamS + baseConExtras*pExtras)}`)}
                            </td>
                          </tr>
                          <tr style={{ background: 'var(--blue-light)', fontWeight: 700 }}>
                            <td style={{...rowStyle, color:'var(--blue-dark)'}}>{fila('neto','neto_sin_ganancias').label || 'Neto sueldo (sin Ganancias)'}</td>
                            <td style={{...monoRight, color:'var(--blue-dark)', fontSize:'0.88rem'}}>
                              {T(netS - baseConExtras*pExtras + extraNoRem,
                                `${fmt(baseConExtras)} − descuentos ${fmt(jubS+osS+pamS + baseConExtras*pExtras)}${extraNoRem > 0 ? ` + no rem. ${fmt(extraNoRem)}` : ''} = ${fmt(netS - baseConExtras*pExtras + extraNoRem)}`)}
                            </td>
                          </tr>
                          {d.retencion > 0 && (() => {
                            const netoConGan = netS - baseConExtras*pExtras + extraNoRem - d.retencion;
                            return (<>
                              <tr><td style={{...secStyle, color:'var(--red-dark)'}} colSpan={2}>{seccion('ganancias').label || 'Impuesto a las Ganancias'}</td></tr>
                              <tr>
                                <td style={{...rowStyle, color:'var(--red-dark)'}}>
                                  {fila('ganancias','retencion').label || 'Retención Ganancias 4ª Cat.'} — {d.mes}
                                  <span style={{ display:'block', fontSize:'0.67rem', opacity:0.8 }}>
                                    {fila('ganancias','retencion').nota || 'Calculada por método acumulado RG 4003/2017'}
                                  </span>
                                </td>
                                <td style={{...monoRight, color:'var(--red-dark)'}}>
                                  {T(-d.retencion, `Impuesto acumulado ${fmt(d.impAcum)} − retenido previo = ${fmt(d.retencion)}`)}
                                </td>
                              </tr>
                              <tr style={{ background: 'var(--green-light)', fontWeight: 800, borderTop: '2px solid var(--green-dark)' }}>
                                <td style={{...rowStyle, color:'var(--green-dark)', fontSize:'0.88rem'}}>{fila('neto','neto_con_ganancias').label || 'Neto a cobrar (con Ganancias)'}</td>
                                <td style={{...monoRight, color:'var(--green-dark)', fontSize:'0.95rem'}}>
                                  {T(netoConGan, `Neto sin Gan. ${fmt(netS - d.sueldo*pExtras)} − Ganancias ${fmt(d.retencion)} = ${fmt(netoConGan)}`)}
                                </td>
                              </tr>
                            </>);
                          })()}
                          {d.retencion < 0 && (() => {
                            const devolucion = Math.abs(d.retencion);
                            const netoConGan = netS - baseConExtras*pExtras + extraNoRem + devolucion;
                            return (<>
                              <tr><td style={{...secStyle, color:'var(--green-dark)'}} colSpan={2}>{seccion('ganancias').label_devolucion || seccion('ganancias').label || 'Impuesto a las Ganancias'}</td></tr>
                              <tr>
                                <td style={{...rowStyle, color:'var(--green-dark)'}}>
                                  {fila('ganancias','devolucion').label || 'Devolución Ganancias 4ª Cat.'} — {d.mes}
                                  <span style={{ display:'block', fontSize:'0.67rem', opacity:0.8 }}>
                                    {fila('ganancias','devolucion').nota || 'El acumulado bajó — empleador devuelve retención excedente'}
                                  </span>
                                </td>
                                <td style={{...monoRight, color:'var(--green-dark)'}}>
                                  {T(devolucion, `Devolución del período: ${fmt(devolucion)}`)}
                                </td>
                              </tr>
                              <tr style={{ background: 'var(--green-light)', fontWeight: 800, borderTop: '2px solid var(--green-dark)' }}>
                                <td style={{...rowStyle, color:'var(--green-dark)', fontSize:'0.88rem'}}>{fila('neto','neto_con_ganancias').label || 'Neto a cobrar (con Ganancias)'}</td>
                                <td style={{...monoRight, color:'var(--green-dark)', fontSize:'0.95rem'}}>
                                  {T(netoConGan, `Neto sin Gan. ${fmt(netS - d.sueldo*pExtras)} + devolución ${fmt(devolucion)} = ${fmt(netoConGan)}`)}
                                </td>
                              </tr>
                            </>);
                          })()}
                        </SubRecibo>

                        {/* ── SUB-RECIBO VACACIONES (solo si hay) ── */}
                        {d.vac > 0 && (() => {
                          // Si cobradoPorAdelantado (un solo mes con vac), ese recibo cubre todos los días.
                          // Si distribuido (varios meses con vac), cada mes cubre sus días calendario.
                          // diasVacMes ya calculado arriba; para cobrado adelantado el recibo
                          // cubre todos los meses, mostramos el desglose en el tooltip
                          const labelDias = mesesConVac === 1
                            ? `${diasVacTotal} días corridos (cobrado adelantado)`
                            : `${diasVacMes} días en ${d.mes}`;
                          const vacTip = mesesConVac === 1
                            ? `${fmt(sueldoBase)} ÷ 25 × ${diasVacTotal} días (total) = ${fmt(d.vac)}`
                            : `${fmt(sueldoBase)} ÷ 25 × ${diasVacMes} días = ${fmt(d.vac)}`;
                          return (
                            <SubRecibo label={`Recibo de vacaciones — ${d.mes} (${labelDias})`} borderColor={seccion('neto').color_borde || '#38a169'}>
                              <tr><td style={{...secStyle, color:'var(--green-dark)'}} colSpan={2}>{seccion('haberes_sueldo').label || 'Haberes'}</td></tr>
                              <tr>
                                <td style={rowStyle}>{fila('haberes_sueldo','haberes_vacacionales')?.label || 'Hab. vacacionales'}</td>
                                <td style={{...monoRight, color:'var(--green-dark)'}}>
                                  {T(d.vac, vacTip)}
                                </td>
                              </tr>
                              <tr><td style={{...secStyle, color:'var(--red-dark)'}} colSpan={2}>{seccion('descuentos_sueldo').label || 'Descuentos'}</td></tr>
                              <tr>
                                <td style={rowStyle}>{fila('descuentos_sueldo','jubilacion').label || 'Jubilación SIPA'} ({pJubilacion}%)</td>
                                <td style={{...monoRight, color:'var(--red-dark)'}}>
                                  {T(-jubV, `${fmt(d.vac)} × ${pJubilacion}% = ${fmt(jubV)}`)}
                                </td>
                              </tr>
                              <tr>
                                <td style={rowStyle}>{fila('descuentos_sueldo','obra_social').label || 'Obra social'} ({pObraSocial}%)</td>
                                <td style={{...monoRight, color:'var(--red-dark)'}}>
                                  {T(-osV, `${fmt(d.vac)} × ${pObraSocial}% = ${fmt(osV)}`)}
                                </td>
                              </tr>
                              <tr>
                                <td style={rowStyle}>{fila('descuentos_sueldo','pami').label || 'PAMI / INSSJP'} ({pPAMI}%)</td>
                                <td style={{...monoRight, color:'var(--red-dark)'}}>
                                  {T(-pamV, `${fmt(d.vac)} × ${pPAMI}% = ${fmt(pamV)}`)}
                                </td>
                              </tr>
                              <tr style={totalStyle}>
                                <td style={rowStyle}>{fila('descuentos_sueldo','total_descuentos').label || 'Total descuentos'}</td>
                                <td style={{...monoRight, color:'var(--red-dark)'}}>
                                  {T(-(jubV+osV+pamV), `${fmt(d.vac)} × ${pApPct}% = ${fmt(jubV+osV+pamV)}`)}
                                </td>
                              </tr>
                              <tr style={{ background: 'var(--green-light)', fontWeight: 800 }}>
                                <td style={{...rowStyle, color:'var(--green-dark)'}}>Neto vacaciones (sin Ganancias)</td>
                                <td style={{...monoRight, color:'var(--green-dark)', fontSize:'0.9rem'}}>
                                  {T(netV, `${fmt(d.vac)} × (1−${pApPct}%) = ${fmt(netV)}`)}
                                </td>
                              </tr>
                            </SubRecibo>
                          );
                        })()}

                        {/* ── TOTAL DEL MES ── */}
                        {d.vac > 0 && (
                          <div style={{ marginTop: '0.6rem', background: 'var(--green-light)',
                            borderRadius: '6px', padding: '0.5rem 0.8rem',
                            display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                            <span style={{ color: 'var(--green-dark)' }}>NETO TOTAL COBRADO en {d.mes} (sin Ganancias)</span>
                            <span style={{ fontFamily: 'monospace', color: 'var(--green-dark)', fontSize: '0.95rem' }}>
                              {T(netoTotal,
                                extrasTotal > 0
                                  ? `Neto sueldo ${fmt(netS - d.sueldo*pExtras)} + neto vac ${fmt(netV - (d.vac||0)*pExtras)} = ${fmt(netoTotal)}`
                                  : `Neto sueldo ${fmt(netS)} + neto vac ${fmt(netV)} = ${fmt(netoTotal)}`)}
                            </span>
                          </div>
                        )}

                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {(() => {
        const usaSipaTope  = SIPA_TOPE > 0 && detalleM.some(d => (d.sueldo||0)+(d.vac||0) > SIPA_TOPE);
        const usaBajoPiso  = SMVM > 0 && detalleM.some(d => { const b=(d.sueldo||0)+(d.vac||0); return b>0 && b<SMVM; });
        const tieneSinDatos = detalleM.some(d => !d.sueldo && !d.vac);
        return (
          <div style={{ fontSize: '0.71rem', color: 'var(--gray-400)', marginTop: '0.5rem', lineHeight: 1.6 }}>
            <p>Clic en un mes para ver el recibo detallado. ⊕ = mes con SAC incluido.
            El neto no incluye descuento de Ganancias (ver retención mensual abajo).
            Pasar el cursor sobre cualquier número para ver la fórmula.</p>
            {tieneSinDatos && (
              <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                <em>Meses en gris:</em> sin datos ingresados — aportes no calculados.
              </p>
            )}
            {usaSipaTope && (
              <p style={{ color: 'var(--orange-dark)', marginTop: '0.3rem' }}>
                <sup style={{ fontWeight: 900 }}>①</sup>{' '}
                <strong>Tope SIPA aplicado:</strong> la base para jubilación (11%) se limitó a {fmt(SIPA_TOPE)}.
                El excedente no genera aporte al SIPA.
              </p>
            )}
            {usaBajoPiso && (
              <p style={{ color: 'var(--orange-dark)', marginTop: '0.3rem' }}>
                <sup style={{ fontWeight: 900 }}>②</sup>{' '}
                <strong>Sueldo por debajo del SMVM ({fmt(SMVM)}):</strong> los aportes de OS y PAMI se calcularon
                sobre la remuneración real. El empleador podría estar obligado a calcularlos sobre el SMVM
                como base mínima según el CCT aplicable — verificar con el liquidador.
              </p>
            )}
          </div>
        );
      })()}
    </div>
  );
}
