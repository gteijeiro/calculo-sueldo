import React, { useState } from 'react';
import { fmt } from '../../utils/format.js';
import { getDivisorSueldo } from '../../logic/vacaciones.js';
import { CONVENIOS_DETALLE } from '../../constants/convenios.js';

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

export default function ReciboDeSueldo({ resultado, vacConfig = {}, convenio = 'general' }) {
  const { detalleM, pAp, sacAutoCalc, sacUsados, config, vacAn, diasVacs } = resultado;
  const { pJubilacion, pObraSocial, pPAMI } = config;
  const [mesAbierto, setMesAbierto] = useState(null);

  // Descuentos extra del convenio
  const convDet = CONVENIOS_DETALLE[convenio] || CONVENIOS_DETALLE.general;
  const descExtras = convDet.descuentos_extra || [];
  const pExtras = descExtras.reduce((s, d) => s + d.pct / 100, 0);

  const tieneVac    = vacAn > 0;
  const colTotal    = tieneVac ? 8 : 7;
  const pApPct      = Math.round(pAp * 100);
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
              <th>Mes</th>
              <th>Sueldo bruto</th>
              {tieneVac && <th>Hab. vacacionales</th>}
              <th>SAC</th>
              <th>Jubilación<br/><span style={{fontWeight:400,fontSize:'0.65rem'}}>{pJubilacion}%</span></th>
              <th>Obra social<br/><span style={{fontWeight:400,fontSize:'0.65rem'}}>{pObraSocial}%</span></th>
              <th>PAMI<br/><span style={{fontWeight:400,fontSize:'0.65rem'}}>{pPAMI}%</span></th>
              <th>Neto (sin Ganancias)</th>
            </tr>
          </thead>
          <tbody>
            {detalleM.map((d, i) => {
              if (!d.sueldo && !d.vac) return null;
              const baseRecibo = (d.sueldo || 0) + (d.vac || 0);
              const jubTotal   = baseRecibo * pJubilacion / 100;
              const osTotal    = baseRecibo * pObraSocial / 100;
              const pamiTotal  = baseRecibo * pPAMI       / 100;
              // Descuentos extra convenio (cuota sindical, etc.) — base: remuneración bruta
              const extrasTotal = baseRecibo * pExtras;
              const netoTotal  = baseRecibo - jubTotal - osTotal - pamiTotal - extrasTotal;
              const isOpen   = mesAbierto === i;

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

              // Sub-recibo sueldo (SAC no genera aportes en recibo)
              const baseSueldo = d.sueldo || 0;
              const jubS = baseSueldo * pJubilacion / 100;
              const osS  = baseSueldo * pObraSocial / 100;
              const pamS = baseSueldo * pPAMI       / 100;
              const netS = baseSueldo - jubS - osS - pamS;

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
                    <td className="d-red">{T(-jubTotal, `${fmt(baseRecibo)} × ${pJubilacion}% = ${fmt(jubTotal)}`)}</td>
                    <td className="d-red">{T(-osTotal,  `${fmt(baseRecibo)} × ${pObraSocial}% = ${fmt(osTotal)}`)}</td>
                    <td className="d-red">{T(-pamiTotal,`${fmt(baseRecibo)} × ${pPAMI}% = ${fmt(pamiTotal)}`)}</td>
                    <td className="d-grn">{T(netoTotal,
                      extrasTotal > 0
                        ? `${fmt(baseRecibo)} − aportes ${fmt(jubTotal+osTotal+pamiTotal)} − convenio ${fmt(extrasTotal)} = ${fmt(netoTotal)}`
                        : `${fmt(baseRecibo)} × (1−${pApPct}%) = ${fmt(netoTotal)}`)}</td>
                  </tr>

                  {isOpen && (
                    <tr>
                      <td colSpan={colTotal} style={{ padding: '0.6rem 1rem', background: 'var(--bg-card-alt)', fontSize: '0.82rem' }}>

                        {/* ── SUB-RECIBO SUELDO ── */}
                        <SubRecibo label={`Recibo de sueldo — ${d.mes}`} borderColor="#4299e1">
                          <tr><td style={{...secStyle, color:'var(--green-dark)'}} colSpan={2}>Haberes</td></tr>
                          <tr>
                            <td style={rowStyle}>Sueldo bruto mensual</td>
                            <td style={{...monoRight, color:'var(--green-dark)'}}>
                              {T(sueldoBase, reduccionVac > 0
                                ? `Sueldo base: ${fmt(sueldoBase)}`
                                : `Dato ingresado: ${fmt(sueldoBase)}`)}
                            </td>
                          </tr>
                          {reduccionVac > 0 && (
                            <tr>
                              <td style={{...rowStyle, color:'var(--red-dark)'}}>
                                (−) Reducción por vacaciones ({diasVacMes} días)
                              </td>
                              <td style={{...monoRight, color:'var(--red-dark)'}}>
                                {T(-reduccionVac,
                                  `${fmt(sueldoBase)} ÷ ${divMes} × ${diasVacMes} días = ${fmt(reduccionVac)}`)}
                              </td>
                            </tr>
                          )}
                          {reduccionVac > 0 && (
                            <tr style={{ fontWeight: 700 }}>
                              <td style={rowStyle}>
                                Sueldo del período ({diasTrab} días trabajados)
                              </td>
                              <td style={{...monoRight}}>
                                {T(d.sueldo,
                                  `${fmt(sueldoBase)} − ${fmt(reduccionVac)} = ${fmt(d.sueldo)}`)}
                              </td>
                            </tr>
                          )}
                          <tr style={totalStyle}>
                            <td style={rowStyle}>Total haberes</td>
                            <td style={monoRight}>
                              {T(baseSueldo, `Sueldo del período: ${fmt(baseSueldo)}`)}
                            </td>
                          </tr>
                          <tr><td style={{...secStyle, color:'var(--red-dark)'}} colSpan={2}>Descuentos</td></tr>
                          <tr>
                            <td style={rowStyle}>Jubilación SIPA ({pJubilacion}%)</td>
                            <td style={{...monoRight, color:'var(--red-dark)'}}>
                              {T(-jubS, `${fmt(d.sueldo)} × ${pJubilacion}% = ${fmt(jubS)}`)}
                            </td>
                          </tr>
                          <tr>
                            <td style={rowStyle}>Obra social ({pObraSocial}%)</td>
                            <td style={{...monoRight, color:'var(--red-dark)'}}>
                              {T(-osS, `${fmt(d.sueldo)} × ${pObraSocial}% = ${fmt(osS)}`)}
                            </td>
                          </tr>
                          <tr>
                            <td style={rowStyle}>PAMI ({pPAMI}%)</td>
                            <td style={{...monoRight, color:'var(--red-dark)'}}>
                              {T(-pamS, `${fmt(d.sueldo)} × ${pPAMI}% = ${fmt(pamS)}`)}
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
                            <td style={rowStyle}>Total descuentos</td>
                            <td style={{...monoRight, color:'var(--red-dark)'}}>
                              {T(-(jubS+osS+pamS + d.sueldo*pExtras),
                                `Aportes ${fmt(jubS+osS+pamS)}${pExtras > 0 ? ` + convenio ${fmt(d.sueldo*pExtras)}` : ''} = ${fmt(jubS+osS+pamS + d.sueldo*pExtras)}`)}
                            </td>
                          </tr>
                          <tr style={{ background: 'var(--blue-light)', fontWeight: 700 }}>
                            <td style={{...rowStyle, color:'var(--blue-dark)'}}>Neto sueldo (sin Ganancias)</td>
                            <td style={{...monoRight, color:'var(--blue-dark)', fontSize:'0.88rem'}}>
                              {T(netS - d.sueldo*pExtras,
                                `${fmt(d.sueldo)} − descuentos ${fmt(jubS+osS+pamS + d.sueldo*pExtras)} = ${fmt(netS - d.sueldo*pExtras)}`)}
                            </td>
                          </tr>
                          {d.retencion > 0 && (() => {
                            const netoConGan = netS - d.sueldo*pExtras - d.retencion;
                            return (<>
                              <tr><td style={{...secStyle, color:'var(--red-dark)'}} colSpan={2}>Impuesto a las Ganancias</td></tr>
                              <tr>
                                <td style={{...rowStyle, color:'var(--red-dark)'}}>
                                  Retención Ganancias 4ª Cat. — {d.mes}
                                  <span style={{ display:'block', fontSize:'0.67rem', opacity:0.8 }}>
                                    Calculada por método acumulado RG 4003/2017
                                  </span>
                                </td>
                                <td style={{...monoRight, color:'var(--red-dark)'}}>
                                  {T(-d.retencion, `Impuesto acumulado ${fmt(d.impAcum)} − retenido previo = ${fmt(d.retencion)}`)}
                                </td>
                              </tr>
                              <tr style={{ background: 'var(--green-light)', fontWeight: 800, borderTop: '2px solid var(--green-dark)' }}>
                                <td style={{...rowStyle, color:'var(--green-dark)', fontSize:'0.88rem'}}>Neto a cobrar (con Ganancias)</td>
                                <td style={{...monoRight, color:'var(--green-dark)', fontSize:'0.95rem'}}>
                                  {T(netoConGan, `Neto sin Gan. ${fmt(netS - d.sueldo*pExtras)} − Ganancias ${fmt(d.retencion)} = ${fmt(netoConGan)}`)}
                                </td>
                              </tr>
                            </>);
                          })()}
                          {d.retencion < 0 && (() => {
                            const devolucion = Math.abs(d.retencion);
                            const netoConGan = netS - d.sueldo*pExtras + devolucion;
                            return (<>
                              <tr><td style={{...secStyle, color:'var(--green-dark)'}} colSpan={2}>Impuesto a las Ganancias</td></tr>
                              <tr>
                                <td style={{...rowStyle, color:'var(--green-dark)'}}>
                                  Devolución Ganancias 4ª Cat. — {d.mes}
                                  <span style={{ display:'block', fontSize:'0.67rem', opacity:0.8 }}>
                                    El acumulado bajó — empleador devuelve retención excedente
                                  </span>
                                </td>
                                <td style={{...monoRight, color:'var(--green-dark)'}}>
                                  {T(devolucion, `Devolución del período: ${fmt(devolucion)}`)}
                                </td>
                              </tr>
                              <tr style={{ background: 'var(--green-light)', fontWeight: 800, borderTop: '2px solid var(--green-dark)' }}>
                                <td style={{...rowStyle, color:'var(--green-dark)', fontSize:'0.88rem'}}>Neto a cobrar (con Ganancias)</td>
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
                            <SubRecibo label={`Recibo de vacaciones — ${d.mes} (${labelDias})`} borderColor="#38a169">
                              <tr><td style={{...secStyle, color:'var(--green-dark)'}} colSpan={2}>Haberes</td></tr>
                              <tr>
                                <td style={rowStyle}>Hab. vacacionales</td>
                                <td style={{...monoRight, color:'var(--green-dark)'}}>
                                  {T(d.vac, vacTip)}
                                </td>
                              </tr>
                              <tr><td style={{...secStyle, color:'var(--red-dark)'}} colSpan={2}>Descuentos</td></tr>
                              <tr>
                                <td style={rowStyle}>Jubilación SIPA ({pJubilacion}%)</td>
                                <td style={{...monoRight, color:'var(--red-dark)'}}>
                                  {T(-jubV, `${fmt(d.vac)} × ${pJubilacion}% = ${fmt(jubV)}`)}
                                </td>
                              </tr>
                              <tr>
                                <td style={rowStyle}>Obra social ({pObraSocial}%)</td>
                                <td style={{...monoRight, color:'var(--red-dark)'}}>
                                  {T(-osV, `${fmt(d.vac)} × ${pObraSocial}% = ${fmt(osV)}`)}
                                </td>
                              </tr>
                              <tr>
                                <td style={rowStyle}>PAMI ({pPAMI}%)</td>
                                <td style={{...monoRight, color:'var(--red-dark)'}}>
                                  {T(-pamV, `${fmt(d.vac)} × ${pPAMI}% = ${fmt(pamV)}`)}
                                </td>
                              </tr>
                              <tr style={totalStyle}>
                                <td style={rowStyle}>Total descuentos</td>
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
      <p style={{ fontSize: '0.71rem', color: 'var(--gray-400)', marginTop: '0.5rem' }}>
        Clic en un mes para ver el recibo detallado. ⊕ = mes con SAC incluido.
        El neto no incluye descuento de Ganancias (ver retención mensual abajo).
        Pasar el cursor sobre cualquier número para ver la fórmula.
      </p>
    </div>
  );
}
