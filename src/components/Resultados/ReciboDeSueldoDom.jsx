import React, { useState } from 'react';
import { fmt } from '../../utils/format.js';
import { getDivisorSueldo } from '../../logic/vacaciones.js';
import { getLey26844 } from '../DatosFormDom.jsx';

const T = (v, tip) => <span data-tip={tip}>{fmt(v)}</span>;
const secStyle  = { padding: '0.25rem 0.4rem', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' };
const rowStyle  = { padding: '0.2rem 0.5rem' };
const monoRight = { textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 };
const totalStyle= { borderTop: '2px solid var(--gray-200)', fontWeight: 700 };

export default function ReciboDeSueldoDom({ resultado }) {
  const {
    detalleM, pAp, sacs, contribEmpDef,
    conceptosData = [], vacConfig = {}, config = {},
  } = resultado;

  const { pJubilacion = 11, pObraSocial = 3, pPAMI = 3 } = config;
  const [mesAbierto, setMesAbierto] = useState(null);

  const d26          = getLey26844();
  const contribs     = contribEmpDef ?? d26?.contribuciones_empleador ?? [];
  const pEmpTotal    = contribs.reduce((s, c) => s + c.pct, 0);
  const pApPct       = Math.round(pAp * 100);

  const REM_KEYS     = ['he50','he100','antiguedad','presentismo','otrosRem'];
  const NO_REM_KEYS  = ['viaticos','snrParitaria','alojamiento','alimentacion','otrosNoRem'];
  const lblRem   = id => d26?.conceptos_remunerativos?.find(c => c.id === id)?.label   ?? id;
  const lblNoRem = id => d26?.conceptos_no_remunerativos?.find(c => c.id === id)?.label ?? id;

  const hayExtrasRem   = detalleM.some(d => (d.extraRem   || 0) > 0);
  const hayExtrasNoRem = detalleM.some(d => (d.extraNoRem || 0) > 0);
  const hayVac         = detalleM.some(d => (d.vac        || 0) > 0);
  const haySac         = detalleM.some(d => (d.sac        || 0) > 0);

  return (
    <div className="card">
      <div className="card-title">📄 Recibo de sueldo — Personal doméstico (Ley 26.844)</div>

      <div style={{ overflowX: 'auto' }}>
        <table className="det-table" style={{ minWidth: '520px' }}>
          <thead>
            <tr>
              <th>Mes</th>
              <th>Sueldo bruto</th>
              {hayExtrasRem   && <th>Extras rem.</th>}
              {hayVac         && <th>Hab. vacacionales</th>}
              {haySac         && <th>SAC</th>}
              {hayExtrasNoRem && <th>No rem.</th>}
              <th>Jub. {pJubilacion}%</th>
              <th>OS {pObraSocial}%</th>
              <th>PAMI {pPAMI}%</th>
              <th>Neto</th>
              <th>Costo empleador</th>
            </tr>
          </thead>
          <tbody>
            {detalleM.map((d, i) => {
              if (!d.sueldo && !d.vac) return null;
              const conMes    = conceptosData[i] || {};
              const isOpen    = mesAbierto === i;

              const diasVacMes = 0;
              const divMes     = getDivisorSueldo(vacConfig?.divisorSueldo ?? 30, i);
              const sueldoBase = d.sueldo;

              return (
                <React.Fragment key={d.mes}>
                  <tr onClick={() => setMesAbierto(isOpen ? null : i)}
                    style={{ cursor: 'pointer', background: isOpen ? 'var(--blue-light)' : 'var(--bg-card)' }}>
                    <td style={{ fontWeight: 700 }}>{d.mes}{d.sac > 0 ? ' ⊕' : ''}{isOpen ? ' ▲' : ' ▼'}</td>
                    <td>{T(d.sueldo, `Sueldo bruto: ${fmt(d.sueldo)}`)}</td>
                    {hayExtrasRem   && <td style={{ color: d.extraRem > 0 ? 'var(--green-dark)' : 'var(--gray-400)' }}>{d.extraRem > 0 ? T(d.extraRem, `Extras rem.: ${fmt(d.extraRem)}`) : '—'}</td>}
                    {hayVac         && <td style={{ color: d.vac > 0 ? 'var(--green-dark)' : 'var(--gray-400)' }}>{d.vac > 0 ? T(d.vac, `Hab. vac.: ${fmt(d.vac)}`) : '—'}</td>}
                    {haySac         && <td style={{ color: d.sac > 0 ? 'var(--blue-dark)' : 'var(--gray-400)' }}>{d.sac > 0 ? T(d.sac, `SAC: ${fmt(d.sac)}`) : '—'}</td>}
                    {hayExtrasNoRem && <td style={{ color: d.extraNoRem > 0 ? 'var(--orange-dark)' : 'var(--gray-400)' }}>{d.extraNoRem > 0 ? T(d.extraNoRem, `No rem.: ${fmt(d.extraNoRem)}`) : '—'}</td>}
                    <td className="d-red">{T(-d.pJub,   `${fmt(d.brutoRem)} × ${pJubilacion}% = ${fmt(d.pJub)}`)}</td>
                    <td className="d-red">{T(-d.pOS,    `${fmt(d.brutoRem)} × ${pObraSocial}% = ${fmt(d.pOS)}`)}</td>
                    <td className="d-red">{T(-d.pPAMI_m,`${fmt(d.brutoRem)} × ${pPAMI}% = ${fmt(d.pPAMI_m)}`)}</td>
                    <td className="d-grn">{T(d.neto, `${fmt(d.brutoRem)} − ${fmt(d.aporte)}${d.extraNoRem > 0 ? ` + no rem. ${fmt(d.extraNoRem)}` : ''} = ${fmt(d.neto)}`)}</td>
                    <td style={{ color: 'var(--orange-dark)', fontFamily: 'monospace', fontWeight: 700 }}>
                      {T(d.costoTotal, `Bruto ${fmt(d.brutoRem)} + contrib. ${fmt(d.costoEmp)} = ${fmt(d.costoTotal)}`)}
                    </td>
                  </tr>

                  {isOpen && (
                    <tr>
                      <td colSpan={10 + (hayExtrasRem?1:0) + (hayVac?1:0) + (haySac?1:0) + (hayExtrasNoRem?1:0)}
                        style={{ padding: '0.6rem 1rem', background: 'var(--bg-card-alt)', fontSize: '0.82rem' }}>

                        <div style={{ border: '1.5px solid #4299e1', borderRadius: '6px', overflow: 'hidden' }}>
                          <div style={{ background: '#4299e1', color: 'white', fontWeight: 700, fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                            Recibo de sueldo — {d.mes} — Ley 26.844
                          </div>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                            <tbody>
                              {/* Haberes remunerativos */}
                              <tr><td style={{...secStyle, color:'var(--green-dark)'}} colSpan={2}>Haberes remunerativos</td></tr>
                              <tr>
                                <td style={rowStyle}>Sueldo bruto <span style={{fontSize:'0.67rem',opacity:0.7}}>LCT/Ley 26.844</span></td>
                                <td style={{...monoRight, color:'var(--green-dark)'}}>{T(sueldoBase, `Sueldo del mes: ${fmt(sueldoBase)}`)}</td>
                              </tr>
                              {REM_KEYS.map(k => {
                                const v = conMes[k] || 0;
                                if (!v) return null;
                                return (
                                  <tr key={k}>
                                    <td style={{...rowStyle, color:'var(--green-dark)'}}>{lblRem(k)}</td>
                                    <td style={{...monoRight, color:'var(--green-dark)'}}>{T(v, `${fmt(v)}`)}</td>
                                  </tr>
                                );
                              })}
                              {d.vac > 0 && (
                                <tr>
                                  <td style={{...rowStyle, color:'var(--green-dark)'}}>Hab. vacacionales <span style={{fontSize:'0.67rem',opacity:0.7}}>Art.27 Ley 26.844</span></td>
                                  <td style={{...monoRight, color:'var(--green-dark)'}}>{T(d.vac, `÷ 25 × días = ${fmt(d.vac)}`)}</td>
                                </tr>
                              )}
                              {d.sac > 0 && (
                                <tr>
                                  <td style={{...rowStyle, color:'var(--blue-dark)'}}>SAC <span style={{fontSize:'0.67rem',opacity:0.7}}>Art.33 Ley 26.844</span></td>
                                  <td style={{...monoRight, color:'var(--blue-dark)'}}>{T(d.sac, `Mejor sueldo ÷ 12 = ${fmt(d.sac)}`)}</td>
                                </tr>
                              )}
                              <tr style={totalStyle}>
                                <td style={rowStyle}>Total remunerativo</td>
                                <td style={monoRight}>{T(d.brutoRem, `Total: ${fmt(d.brutoRem)}`)}</td>
                              </tr>

                              {/* No remunerativos */}
                              {d.extraNoRem > 0 && (<>
                                <tr><td style={{...secStyle, color:'var(--orange-dark)'}} colSpan={2}>Conceptos no remunerativos</td></tr>
                                {NO_REM_KEYS.map(k => {
                                  const v = conMes[k] || 0;
                                  if (!v) return null;
                                  return (
                                    <tr key={k}>
                                      <td style={{...rowStyle, color:'var(--orange-dark)'}}>
                                        {lblNoRem(k)}
                                        <span style={{ fontSize:'0.67rem', display:'block', opacity:0.7 }}>Sin aportes</span>
                                      </td>
                                      <td style={{...monoRight, color:'var(--orange-dark)'}}>{T(v, `${fmt(v)}`)}</td>
                                    </tr>
                                  );
                                })}
                              </>)}

                              {/* Descuentos trabajador */}
                              <tr><td style={{...secStyle, color:'var(--red-dark)'}} colSpan={2}>Descuentos al trabajador (aportes)</td></tr>
                              <tr>
                                <td style={rowStyle}>Jubilación SIPA ({pJubilacion}%) <span style={{fontSize:'0.67rem',opacity:0.7}}>Ley 24.241</span></td>
                                <td style={{...monoRight, color:'var(--red-dark)'}}>{T(-d.pJub, `${fmt(d.brutoRem)} × ${pJubilacion}% = ${fmt(d.pJub)}`)}</td>
                              </tr>
                              <tr>
                                <td style={rowStyle}>Obra social ({pObraSocial}%) <span style={{fontSize:'0.67rem',opacity:0.7}}>Ley 23.660</span></td>
                                <td style={{...monoRight, color:'var(--red-dark)'}}>{T(-d.pOS, `${fmt(d.brutoRem)} × ${pObraSocial}% = ${fmt(d.pOS)}`)}</td>
                              </tr>
                              <tr>
                                <td style={rowStyle}>PAMI ({pPAMI}%) <span style={{fontSize:'0.67rem',opacity:0.7}}>Ley 19.032</span></td>
                                <td style={{...monoRight, color:'var(--red-dark)'}}>{T(-d.pPAMI_m, `${fmt(d.brutoRem)} × ${pPAMI}% = ${fmt(d.pPAMI_m)}`)}</td>
                              </tr>
                              <tr style={totalStyle}>
                                <td style={rowStyle}>Total descuentos ({pApPct}%)</td>
                                <td style={{...monoRight, color:'var(--red-dark)'}}>{T(-d.aporte, `${fmt(d.brutoRem)} × ${pApPct}% = ${fmt(d.aporte)}`)}</td>
                              </tr>

                              {/* Neto trabajador */}
                              <tr style={{ background: 'var(--green-light)', fontWeight: 800, borderTop: '2px solid var(--green-dark)' }}>
                                <td style={{...rowStyle, color:'var(--green-dark)', fontSize:'0.9rem'}}>Neto a cobrar</td>
                                <td style={{...monoRight, color:'var(--green-dark)', fontSize:'0.95rem'}}>{T(d.neto, `${fmt(d.brutoRem)} − ${fmt(d.aporte)}${d.extraNoRem > 0 ? ` + no rem. ${fmt(d.extraNoRem)}` : ''} = ${fmt(d.neto)}`)}</td>
                              </tr>

                              {/* Contribuciones empleador */}
                              <tr><td style={{...secStyle, color:'var(--orange-dark)'}} colSpan={2}>Contribuciones del empleador</td></tr>
                              {contribs.map(c => {
                                const monto = d.brutoRem * c.pct / 100;
                                return (
                                  <tr key={c.id}>
                                    <td style={{...rowStyle, color:'var(--orange-dark)'}}>
                                      {c.label} ({c.pct}%) <span style={{fontSize:'0.67rem',opacity:0.7}}>{c.ley}</span>
                                      {c.nota && <span style={{ display:'block', fontSize:'0.65rem', opacity:0.75 }}>{c.nota}</span>}
                                    </td>
                                    <td style={{...monoRight, color:'var(--orange-dark)'}}>{T(monto, `${fmt(d.brutoRem)} × ${c.pct}% = ${fmt(monto)}`)}</td>
                                  </tr>
                                );
                              })}
                              <tr style={{ background: 'var(--orange-light)', fontWeight: 700, borderTop: '2px solid var(--orange-dark)' }}>
                                <td style={{...rowStyle, color:'var(--orange-dark)'}}>Costo total empleador (~{(100 + pEmpTotal).toFixed(1)}%)</td>
                                <td style={{...monoRight, color:'var(--orange-dark)', fontSize:'0.9rem'}}>{T(d.costoTotal, `Bruto ${fmt(d.brutoRem)} + contrib. ${fmt(d.costoEmp)} = ${fmt(d.costoTotal)}`)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
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
        Clic en un mes para ver el recibo completo. ⊕ = mes con SAC. Contribuciones empleador son referenciales.
      </p>
    </div>
  );
}
