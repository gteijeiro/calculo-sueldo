import React, { useState } from 'react';
import JsonMapBadge from './JsonMapBadge.jsx';

let _ley26844 = null;
export function _initLey26844(data) { _ley26844 = data; }
export function getLey26844() { return _ley26844; }

function fmtPesos(n) {
  return '$ ' + Math.round(n).toLocaleString('es-AR');
}

export default function DatosFormDom({ config, onChange, showJsonMap = false }) {
  const [showContrib, setShowContrib] = useState(false);
  const d = _ley26844;
  if (!d) return null;

  const modalidades  = d.modalidades ?? [];
  const cats         = d.categorias?.[config.modalidad] ?? [];
  const aportesTrab  = d.aportes_trabajador ?? [];
  const contribEmp   = d.contribuciones_empleador ?? [];
  const tramos       = d.tramos_horas_semanales ?? [];

  const catActual    = cats.find(c => c.id === config.categoria) ?? cats[0];
  const pisoMensual  = catActual?.sueldo_mensual ?? 0;
  const horasSemanales = config.horasSemanales ?? 48;

  // Sueldo proporcional por horas
  const sueldoBaseCalc = horasSemanales >= 48
    ? pisoMensual
    : Math.round(pisoMensual * horasSemanales / 48);

  // Antigüedad
  const aniosAntiguedad = config.fechaIngreso
    ? Math.max(0, Math.floor((new Date('2026-01-01') - new Date(config.fechaIngreso)) / (365.25 * 24 * 3600 * 1000)))
    : 0;
  const montoAntiguedad = Math.round(sueldoBaseCalc * aniosAntiguedad * d.antiguedad?.pct_por_anio / 100);

  // Zona patagónica
  const montoZonaPat = config.zonaPat
    ? Math.round(pisoMensual * (d.zona_patagonica?.pct_adicional ?? 30) / 100)
    : 0;

  // Tramo horas para referencia AFIP
  const tramoAfip = tramos.find(t => horasSemanales >= t.desde && horasSemanales <= t.hasta);

  const pTrabTotal = aportesTrab.reduce((s, a) => s + a.pct, 0);
  const pEmpTotal  = contribEmp.reduce((s, a) => s + a.pct, 0);

  const handleModalidad = id => {
    const newCats = d.categorias?.[id] ?? [];
    onChange({ ...config, modalidad: id, categoria: newCats[0]?.id ?? 'generales' });
  };

  return (
    <div className="card">
      <div className="card-title">👤 Datos del empleo doméstico</div>

      {/* Modalidad */}
      <div className="form-group">
        <label>
          Modalidad de prestación
          <JsonMapBadge visible={showJsonMap} path="modalidades" ley="Ley 26.844 Art.8" />
        </label>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {modalidades.map(m => (
            <label key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              padding: '0.4rem 0.8rem', borderRadius: '6px',
              border: `1.5px solid ${config.modalidad === m.id ? 'var(--blue)' : 'var(--gray-200)'}`,
              background: config.modalidad === m.id ? 'var(--blue-light)' : 'var(--bg-card)',
              color: config.modalidad === m.id ? 'var(--blue-dark)' : 'var(--text-main)',
            }}>
              <input type="radio" name="modalidad" value={m.id} checked={config.modalidad === m.id}
                onChange={() => handleModalidad(m.id)} style={{ display: 'none' }} />
              {m.label}
            </label>
          ))}
        </div>
        <span className="hint">{modalidades.find(m => m.id === config.modalidad)?.descripcion}</span>
      </div>

      {/* Categoría */}
      <div className="form-group">
        <label>
          Categoría laboral
          <JsonMapBadge visible={showJsonMap} path={`categorias.${config.modalidad}`} ley="Ley 26.844 / CCT UATRE" />
        </label>
        <select value={config.categoria} onChange={e => onChange({ ...config, categoria: e.target.value })}>
          {cats.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        {catActual && (
          <span className="hint">
            {catActual.descripcion}
            {' — '}
            <strong>Piso jornada completa: {fmtPesos(pisoMensual)}/mes</strong>
            {' '}
            <span style={{ color: 'var(--orange-dark)', fontSize: '0.7rem' }}>
              (orientativo — verificar paritaria vigente)
            </span>
          </span>
        )}
      </div>

      {/* Horas semanales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '0.8rem' }}>
        <div className="form-group">
          <label>
            Horas por semana
            <span className="hint">Jornada completa = 48 hs</span>
          </label>
          <input type="number" min="1" max="48" value={horasSemanales}
            onChange={e => onChange({ ...config, horasSemanales: parseInt(e.target.value) || 48 })} />
          {horasSemanales < 48 && (
            <span className="hint" style={{ color: 'var(--orange-dark)' }}>
              Sueldo proporcional: {fmtPesos(sueldoBaseCalc)}/mes ({horasSemanales}/48 hs)
            </span>
          )}
          {tramoAfip && (
            <span className="hint">
              Aporte AFIP fijo: <strong>{fmtPesos(tramoAfip.aportes_afip_fijos)}/mes</strong> ({tramoAfip.label})
              <span style={{ display: 'block', fontSize: '0.67rem', color: 'var(--gray-400)' }}>
                {d.nota_aportes_afip}
              </span>
            </span>
          )}
        </div>

        <div className="form-group">
          <label>
            Fecha de ingreso
            <span className="hint">Para calcular antigüedad</span>
          </label>
          <input type="date" value={config.fechaIngreso || ''}
            onChange={e => onChange({ ...config, fechaIngreso: e.target.value })}
            max="2026-01-01" />
          {aniosAntiguedad > 0 && (
            <span className="hint" style={{ color: 'var(--green-dark)' }}>
              Antigüedad: {aniosAntiguedad} año{aniosAntiguedad !== 1 ? 's' : ''} → +{fmtPesos(montoAntiguedad)}/mes
              <span style={{ display: 'block', fontSize: '0.67rem' }}>
                ({aniosAntiguedad} × 1% × {fmtPesos(sueldoBaseCalc)})
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Zona patagónica */}
      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={!!config.zonaPat}
            onChange={e => onChange({ ...config, zonaPat: e.target.checked })}
            style={{ width: '16px', height: '16px' }} />
          <span>
            Zona patagónica (+{d.zona_patagonica?.pct_adicional ?? 30}%)
            {config.zonaPat && montoZonaPat > 0 && (
              <span style={{ marginLeft: 8, color: 'var(--green-dark)', fontWeight: 700 }}>
                +{fmtPesos(montoZonaPat)}/mes
              </span>
            )}
          </span>
        </label>
        <span className="hint" style={{ marginLeft: '22px' }}>
          {d.zona_patagonica?.nota}
        </span>
      </div>

      {/* Resumen sueldo estimado */}
      {(sueldoBaseCalc > 0 || montoAntiguedad > 0 || montoZonaPat > 0) && (
        <div style={{
          background: 'var(--blue-light)', border: '1.5px solid var(--blue)',
          borderRadius: '8px', padding: '0.7rem 1rem', marginBottom: '0.5rem',
          fontSize: '0.84rem',
        }}>
          <div style={{ fontWeight: 700, color: 'var(--blue-dark)', marginBottom: '0.4rem' }}>
            Sueldo mínimo estimado
          </div>
          {sueldoBaseCalc > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Sueldo básico ({horasSemanales} hs)</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{fmtPesos(sueldoBaseCalc)}</span>
            </div>
          )}
          {aniosAntiguedad > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--green-dark)' }}>
              <span>+ Antigüedad ({aniosAntiguedad} año{aniosAntiguedad !== 1?'s':''})</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>+{fmtPesos(montoAntiguedad)}</span>
            </div>
          )}
          {montoZonaPat > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--green-dark)' }}>
              <span>+ Zona patagónica</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>+{fmtPesos(montoZonaPat)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800,
            borderTop: '1px solid var(--blue)', marginTop: '0.3rem', paddingTop: '0.3rem', color: 'var(--blue-dark)' }}>
            <span>Total bruto mínimo</span>
            <span style={{ fontFamily: 'monospace', fontSize: '1rem' }}>{fmtPesos(sueldoBaseCalc + montoAntiguedad + montoZonaPat)}</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginTop: '0.3rem' }}>
            Usá este valor como base en "💼 Sueldo bruto" abajo.
          </div>
        </div>
      )}

      {/* Aportes trabajador */}
      <div className="form-group">
        <label>Aportes del trabajador (descuentan del sueldo)</label>
        <table style={{ borderCollapse: 'collapse', fontSize: '0.8rem', width: '100%' }}>
          <thead>
            <tr style={{ background: 'var(--gray-100)' }}>
              <th style={{ textAlign:'left', padding:'0.3rem 0.5rem', fontSize:'0.71rem', color:'var(--gray-600)' }}>Concepto</th>
              <th style={{ textAlign:'right',padding:'0.3rem 0.5rem', fontSize:'0.71rem', color:'var(--gray-600)' }}>%</th>
              <th style={{ textAlign:'right',padding:'0.3rem 0.5rem', fontSize:'0.71rem', color:'var(--gray-600)' }}>Sobre sueldo mín.</th>
            </tr>
          </thead>
          <tbody>
            {aportesTrab.map(a => (
              <tr key={a.id} style={{ borderTop:'1px solid var(--border)' }}>
                <td style={{ padding:'0.25rem 0.5rem' }}>
                  {a.label}
                  {showJsonMap && <div style={{ fontSize:'0.63rem', fontFamily:'monospace', color:'#2b6cb0', background:'#ebf8ff', borderRadius:2, padding:'0 3px', marginTop:1 }}>aportes_trabajador.{a.id}</div>}
                </td>
                <td style={{ padding:'0.25rem 0.5rem', textAlign:'right', fontFamily:'monospace', fontWeight:700 }}>{a.pct}%</td>
                <td style={{ padding:'0.25rem 0.5rem', textAlign:'right', fontFamily:'monospace', color:'var(--red-dark)', fontSize:'0.8rem' }}>
                  {sueldoBaseCalc > 0 ? fmtPesos((sueldoBaseCalc + montoAntiguedad + montoZonaPat) * a.pct / 100) : '—'}
                </td>
              </tr>
            ))}
            <tr style={{ borderTop:'2px solid var(--border)', background:'var(--gray-100)', fontWeight:700 }}>
              <td style={{ padding:'0.3rem 0.5rem' }}>Total aportes</td>
              <td style={{ padding:'0.3rem 0.5rem', textAlign:'right', fontFamily:'monospace', color:'var(--red-dark)' }}>{pTrabTotal}%</td>
              <td style={{ padding:'0.3rem 0.5rem', textAlign:'right', fontFamily:'monospace', color:'var(--red-dark)' }}>
                {sueldoBaseCalc > 0 ? fmtPesos((sueldoBaseCalc + montoAntiguedad + montoZonaPat) * pTrabTotal / 100) : '—'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Contribuciones empleador (colapsable) */}
      <button onClick={() => setShowContrib(v => !v)} style={{
        fontSize:'0.74rem', padding:'0.25rem 0.7rem', cursor:'pointer',
        border:'1px solid var(--orange-dark)', borderRadius:'5px',
        background: showContrib ? 'var(--orange-dark)' : 'var(--orange-light)',
        color: showContrib ? 'white' : 'var(--orange-dark)', fontWeight:600,
        marginBottom: showContrib ? '0.5rem' : 0,
      }}>
        {showContrib ? '▲ Ocultar' : '▼ Ver'} contribuciones del empleador
      </button>

      {showContrib && (
        <div style={{ border:'1.5px solid var(--orange-dark)', borderRadius:'8px', overflow:'hidden' }}>
          <div style={{ background:'var(--orange-dark)', color:'white', padding:'0.5rem 0.9rem', fontWeight:700, fontSize:'0.82rem' }}>
            Contribuciones del empleador — costo adicional
            {showJsonMap && <span style={{ marginLeft:8, fontSize:'0.67rem', opacity:0.85, fontFamily:'monospace', background:'rgba(255,255,255,0.15)', borderRadius:2, padding:'0 4px' }}>argentina-ley26844.json → contribuciones_empleador</span>}
          </div>
          <div style={{ padding:'0.7rem 0.9rem', background:'var(--bg-card-alt)' }}>
            <p style={{ fontSize:'0.74rem', color:'var(--text-sub)', marginBottom:'0.7rem' }}>
              El empleador paga estas contribuciones <strong>adicionales al sueldo</strong>. No se descuentan del trabajador — son el costo extra para el empleador. Se abonan vía AFIP (F.102/RT).
            </p>
            {tramoAfip && (
              <div style={{ fontSize:'0.78rem', background:'var(--blue-light)', borderRadius:5, padding:'0.5rem 0.7rem', marginBottom:'0.7rem', color:'var(--blue-dark)' }}>
                <strong>Monto fijo ARCA H1 2026</strong> ({tramoAfip.label}): <strong>{fmtPesos(tramoAfip.aportes_afip_fijos)}/mes</strong>
                <div style={{ fontSize:'0.68rem', opacity:0.8, marginTop:2 }}>{d.nota_aportes_afip}</div>
              </div>
            )}
            <table style={{ borderCollapse:'collapse', fontSize:'0.8rem', width:'100%' }}>
              <thead>
                <tr style={{ background:'var(--gray-100)' }}>
                  <th style={{ textAlign:'left', padding:'0.3rem 0.5rem', fontSize:'0.71rem', color:'var(--gray-600)' }}>Concepto</th>
                  <th style={{ textAlign:'right',padding:'0.3rem 0.5rem', fontSize:'0.71rem', color:'var(--gray-600)' }}>%</th>
                  <th style={{ textAlign:'right',padding:'0.3rem 0.5rem', fontSize:'0.71rem', color:'var(--gray-600)' }}>Sobre sueldo mín.</th>
                </tr>
              </thead>
              <tbody>
                {contribEmp.map(c => {
                  const monto = sueldoBaseCalc > 0 ? (sueldoBaseCalc + montoAntiguedad + montoZonaPat) * c.pct / 100 : 0;
                  return (
                    <tr key={c.id} style={{ borderTop:'1px solid var(--border)' }}>
                      <td style={{ padding:'0.25rem 0.5rem' }}>
                        {c.label}
                        {c.nota && <span style={{ display:'block', fontSize:'0.67rem', color:'var(--text-muted)' }}>{c.nota}</span>}
                        {showJsonMap && <span style={{ display:'block', fontSize:'0.63rem', fontFamily:'monospace', color:'#744210', background:'#fefcbf', borderRadius:2, padding:'0 3px', marginTop:1 }}>contribuciones_empleador.{c.id}</span>}
                      </td>
                      <td style={{ padding:'0.25rem 0.5rem', textAlign:'right', fontFamily:'monospace', fontWeight:700 }}>{c.pct}%</td>
                      <td style={{ padding:'0.25rem 0.5rem', textAlign:'right', fontFamily:'monospace', color:'var(--orange-dark)', fontSize:'0.8rem' }}>
                        {monto > 0 ? fmtPesos(monto) : '—'}
                      </td>
                    </tr>
                  );
                })}
                <tr style={{ borderTop:'2px solid var(--border)', background:'var(--gray-100)', fontWeight:700 }}>
                  <td style={{ padding:'0.3rem 0.5rem' }}>Total contribuciones</td>
                  <td style={{ padding:'0.3rem 0.5rem', textAlign:'right', fontFamily:'monospace', color:'var(--orange-dark)' }}>~{pEmpTotal.toFixed(1)}%</td>
                  <td style={{ padding:'0.3rem 0.5rem', textAlign:'right', fontFamily:'monospace', color:'var(--orange-dark)' }}>
                    {sueldoBaseCalc > 0 ? fmtPesos((sueldoBaseCalc + montoAntiguedad + montoZonaPat) * pEmpTotal / 100) : '—'}
                  </td>
                </tr>
                <tr style={{ background:'var(--orange-light)', fontWeight:800 }}>
                  <td style={{ padding:'0.35rem 0.5rem', color:'var(--orange-dark)' }}>Costo total empleador</td>
                  <td style={{ padding:'0.35rem 0.5rem', textAlign:'right', fontFamily:'monospace', color:'var(--orange-dark)' }}>{(100+pEmpTotal).toFixed(1)}%</td>
                  <td style={{ padding:'0.35rem 0.5rem', textAlign:'right', fontFamily:'monospace', color:'var(--orange-dark)', fontSize:'0.88rem' }}>
                    {sueldoBaseCalc > 0 ? fmtPesos((sueldoBaseCalc + montoAntiguedad + montoZonaPat) * (1 + pEmpTotal / 100)) : '—'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
