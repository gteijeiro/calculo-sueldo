import React, { useState } from 'react';
import { getArgentina } from '../constants/argentina.js';
import { distribuirDiasPorMes } from '../utils/licencias.js';
import { DIAS_MES_2026 } from '../constants/arca2026.js';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function fmt(n) {
  return '$ ' + Math.round(n).toLocaleString('es-AR');
}

function resolverDiv(d, mesIdx) {
  if (d === 'mes') return DIAS_MES_2026[mesIdx] || 30;
  return Number(d) || 30;
}

function calcDesdeDistribucion(dist, dH, dDRaw, sueldoPorMes) {
  const dD = (m) => resolverDiv(dDRaw, m);
  let importe = 0, descuento = 0;
  Object.entries(dist).forEach(([mes, dias]) => {
    const m = Number(mes);
    const s = sueldoPorMes?.[m] || 0;
    if (s > 0) { importe += (s / dH) * dias; descuento += (s / dD(m)) * dias; }
  });
  return { importe, descuento };
}

function calcImporteLic(lic, sueldoPorMes) {
  const dH  = lic.divisorHaber || 25;
  const dD  = lic.divisorDesc ?? 30;
  if (lic.ocurrencias) {
    return lic.ocurrencias.reduce((t, oc) => {
      if (!oc.fecha || !oc.dias) return t;
      const r = calcDesdeDistribucion(distribuirDiasPorMes(oc.fecha, oc.dias), dH, dD, sueldoPorMes);
      return { importe: t.importe + r.importe, descuento: t.descuento + r.descuento };
    }, { importe: 0, descuento: 0 });
  }
  if (!lic.activa || !lic.dias || !lic.fecha) return { importe: 0, descuento: 0 };
  return calcDesdeDistribucion(distribuirDiasPorMes(lic.fecha, lic.dias), dH, dD, sueldoPorMes);
}

function distTotalLic(lic) {
  if (lic.ocurrencias) {
    const result = {};
    lic.ocurrencias.forEach(oc => {
      if (!oc.fecha || !oc.dias) return;
      const d = distribuirDiasPorMes(oc.fecha, oc.dias);
      Object.entries(d).forEach(([m, v]) => { result[m] = (result[m] || 0) + v; });
    });
    return result;
  }
  if (!lic.fecha || !lic.dias) return {};
  return distribuirDiasPorMes(lic.fecha, lic.dias);
}

const inputStyle = {
  padding: '0.25rem 0.4rem', border: '1.5px solid var(--border)',
  borderRadius: '5px', fontSize: '0.8rem', background: 'var(--bg-input)', color: 'var(--text-main)',
};

export default function LicenciasForm({ sueldoPorMes, licenciasData, onChange }) {
  const [open, setOpen] = useState(false);

  const arg = getArgentina();
  const tipos = arg?.licencias_especiales ?? [];

  const hayActivas = licenciasData.some(l => {
    if (!l.activa) return false;
    if (l.ocurrencias) return l.ocurrencias.some(o => o.fecha && o.dias);
    return l.fecha && l.dias > 0;
  });

  const upd = (id, patch) => onChange(licenciasData.map(l => l.id === id ? { ...l, ...patch } : l));

  // Ocurrencias helpers
  const addOcurrencia = (id, diasDefault) => {
    const lic = licenciasData.find(l => l.id === id);
    if (!lic) return;
    upd(id, { ocurrencias: [...lic.ocurrencias, { fecha: '', dias: diasDefault }] });
  };
  const updOcurrencia = (id, idx, key, val) => {
    const lic = licenciasData.find(l => l.id === id);
    if (!lic) return;
    const next = lic.ocurrencias.map((o, i) => i === idx ? { ...o, [key]: val } : o);
    upd(id, { ocurrencias: next });
  };
  const removeOcurrencia = (id, idx) => {
    const lic = licenciasData.find(l => l.id === id);
    if (!lic) return;
    upd(id, { ocurrencias: lic.ocurrencias.filter((_, i) => i !== idx) });
  };

  // Totales por mes (usa importe = divisorHaber)
  const totalesPorMes = Array(12).fill(0).map((_, i) =>
    licenciasData.reduce((s, l) => {
      if (!l.activa) return s;
      const dist = distTotalLic(l);
      const diasEnMes = dist[i] || 0;
      if (!diasEnMes) return s;
      const sueldo = sueldoPorMes?.[i] || 0;
      return s + (sueldo > 0 ? (sueldo / (l.divisorHaber || 25)) * diasEnMes : 0);
    }, 0)
  );
  const totalAnual = totalesPorMes.reduce((a, b) => a + b, 0);

  return (
    <div className="card">
      <div
        className="card-title"
        style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', justifyContent: 'space-between' }}
        onClick={() => setOpen(o => !o)}
      >
        <span>
          📋 Licencias especiales
          {hayActivas && <span style={{ color: 'var(--blue)', fontSize: '0.78rem', marginLeft: 8 }}>● con valores</span>}
        </span>
        <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--gray-400)' }}>
          {open ? '▲ ocultar' : '▼ expandir'}
        </span>
      </div>

      {open && (
        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {tipos.map(tipo => {
            const lic = licenciasData.find(l => l.id === tipo.id);
            if (!lic) return null;
            const dH = lic.divisorHaber || 25;
            const dD = lic.divisorDesc  || 30;
            const { importe, descuento } = calcImporteLic(lic, sueldoPorMes);
            const dist = distTotalLic(lic);
            const spansMultiMes = Object.keys(dist).length > 1;
            const esMultiple = !!tipo.multiple;
            const ocurrencias = lic.ocurrencias ?? [];
            const totalDiasOcurrencias = ocurrencias.reduce((s, o) => s + (o.dias || 0), 0);
            const maxDias = tipo.diasMax || 999;

            return (
              <div key={tipo.id} style={{
                border: `1.5px solid ${lic.activa ? 'var(--blue)' : 'var(--border)'}`,
                borderRadius: '8px',
                background: lic.activa ? 'var(--blue-light)' : 'var(--bg-card-alt)',
                padding: '0.65rem 0.9rem',
                transition: 'all 0.15s',
              }}>
                {/* Header */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={lic.activa}
                    onChange={() => upd(tipo.id, { activa: !lic.activa })}
                    style={{ marginTop: '3px', width: '15px', height: '15px', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                        {tipo.icon} {tipo.label}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--blue)', fontWeight: 600 }}>{tipo.ley}</span>
                      {tipo.diasMax && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          máx. {tipo.diasMax} días {tipo.tipoDias}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem', lineHeight: 1.4 }}>
                      {tipo.descripcion}
                    </div>
                  </div>
                </label>

                {lic.activa && (
                  <div style={{ marginTop: '0.75rem' }}>
                    {/* Divisores */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.65rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--blue-dark)', minWidth: '80px' }}>Haber ÷</label>
                        <input type="number" min="1" value={dH}
                          onChange={e => upd(tipo.id, { divisorHaber: Number(e.target.value) || 25 })}
                          style={{ ...inputStyle, width: '55px', textAlign: 'right' }}
                        />
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>sueldo ÷ {dH} × días</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--red-dark)', minWidth: '80px' }}>Descuento ÷</span>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontSize: '0.78rem' }}>
                          <input type="radio" name={`dD-${tipo.id}`}
                            checked={dD === 30 || dD === '30'}
                            onChange={() => upd(tipo.id, { divisorDesc: 30 })}
                          />
                          <strong>30</strong>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>(estándar)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontSize: '0.78rem' }}>
                          <input type="radio" name={`dD-${tipo.id}`}
                            checked={dD === 'mes'}
                            onChange={() => upd(tipo.id, { divisorDesc: 'mes' })}
                          />
                          <strong>Días del mes</strong>
                          {lic.fecha && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                              ({DIAS_MES_2026[new Date(lic.fecha + 'T00:00:00').getMonth()] || '—'})
                            </span>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* MODO MÚLTIPLE (examen) */}
                    {esMultiple ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {ocurrencias.map((oc, idx) => {
                          const ocDist = oc.fecha && oc.dias ? distribuirDiasPorMes(oc.fecha, oc.dias) : {};
                          const { importe: ocHaber, descuento: ocDesc } = calcDesdeDistribucion(ocDist, dH, dD, sueldoPorMes);
                          const ocSpans = Object.keys(ocDist).length > 1;
                          return (
                            <div key={idx} style={{
                              display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-end',
                              background: 'var(--bg-card)', borderRadius: '6px', padding: '0.45rem 0.6rem',
                              border: '1px solid var(--border)',
                            }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', minWidth: '16px' }}>
                                #{idx + 1}
                              </span>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                <label style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-sub)' }}>Fecha</label>
                                <input type="date" value={oc.fecha || ''} min="2026-01-01" max="2026-12-31"
                                  onChange={e => updOcurrencia(tipo.id, idx, 'fecha', e.target.value)}
                                  style={{ ...inputStyle, border: `1.5px solid ${!oc.fecha ? 'var(--orange-dark)' : 'var(--border)'}` }}
                                />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                <label style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-sub)' }}>Días</label>
                                <input type="number" min="1" max={tipo.diasPorOcurrencia || 2}
                                  value={oc.dias || ''}
                                  onChange={e => updOcurrencia(tipo.id, idx, 'dias', Math.max(1, Number(e.target.value) || 1))}
                                  style={{ ...inputStyle, width: '60px', textAlign: 'right' }}
                                />
                              </div>
                              {oc.fecha && oc.dias > 0 && (
                                <div style={{ fontSize: '0.7rem', textAlign: 'right' }}>
                                  {ocSpans
                                    ? Object.entries(ocDist).map(([m, d]) => {
                                        const s = sueldoPorMes?.[Number(m)] || 0;
                                        return <div key={m} style={{ color: 'var(--blue-dark)', fontFamily: 'monospace', fontWeight: 700 }}>
                                          {MESES[Number(m)].slice(0,3)}: {s > 0 ? fmt((s/dH)*d) : '—'}
                                        </div>;
                                      })
                                    : <>
                                        <div style={{ color: 'var(--blue-dark)', fontFamily: 'monospace', fontWeight: 800 }}>{ocHaber > 0 ? fmt(ocHaber) : '—'}</div>
                                        {ocDesc > 0 && ocDesc !== ocHaber && <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>desc: {fmt(ocDesc)}</div>}
                                      </>
                                  }
                                </div>
                              )}
                              <button onClick={() => removeOcurrencia(tipo.id, idx)}
                                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
                                  color: 'var(--red-dark)', fontSize: '1rem', padding: '0.1rem 0.3rem', borderRadius: '4px' }}
                                title="Eliminar">✕</button>
                            </div>
                          );
                        })}

                        {/* Botón agregar + resumen */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => addOcurrencia(tipo.id, tipo.diasPorOcurrencia || 2)}
                            disabled={tipo.maxOcurrencias != null && totalDiasOcurrencias >= maxDias}
                            style={{
                              padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700,
                              border: '1.5px solid var(--blue)', background: 'transparent', color: 'var(--blue)',
                              cursor: totalDiasOcurrencias >= maxDias ? 'not-allowed' : 'pointer',
                              opacity: totalDiasOcurrencias >= maxDias ? 0.5 : 1,
                            }}
                          >
                            + Agregar {tipo.label.toLowerCase()}
                          </button>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {ocurrencias.length} evento{ocurrencias.length !== 1 ? 's' : ''}
                            {tipo.diasMax != null ? ` · ${totalDiasOcurrencias}/${tipo.diasMax} días` : ` · ${totalDiasOcurrencias} días`}
                          </span>
                          {importe > 0 && (
                            <span style={{ marginLeft: 'auto', fontFamily: 'monospace', fontWeight: 800,
                              color: 'var(--blue-dark)', fontSize: '0.95rem' }}>
                              Total: {fmt(importe)}
                            </span>
                          )}
                        </div>
                      </div>

                    ) : (
                      /* MODO SIMPLE */
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-sub)' }}>Fecha de inicio</label>
                          <input type="date" value={lic.fecha || ''} min="2026-01-01" max="2026-12-31"
                            onChange={e => upd(tipo.id, { fecha: e.target.value })}
                            style={{ ...inputStyle, border: `1.5px solid ${!lic.fecha ? 'var(--orange-dark)' : 'var(--border)'}` }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-sub)' }}>
                            Días {tipo.tipoDias}
                          </label>
                          <input type="number" min="1" max={maxDias}
                            value={lic.dias || ''}
                            onChange={e => upd(tipo.id, { dias: Math.max(1, Number(e.target.value) || 1) })}
                            style={{ ...inputStyle, width: '70px', textAlign: 'right' }}
                          />
                        </div>
                        {lic.fecha ? (
                          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                            {spansMultiMes && (
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                                {Object.entries(dist).map(([m, d]) => {
                                  const s = sueldoPorMes?.[Number(m)] || 0;
                                  return (
                                    <div key={m}>{MESES[Number(m)].slice(0,3)}: {d} día{d>1?'s':''} = {s > 0 ? fmt((s/dH)*d) : '—'}</div>
                                  );
                                })}
                              </div>
                            )}
                            {!spansMultiMes && lic.dias > 0 && (
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                {(() => {
                                  const mes = Object.keys(dist)[0];
                                  const s = sueldoPorMes?.[Number(mes)] || 0;
                                  return s > 0 ? `haber: ${fmt(s/dH)}/día · desc: ${fmt(s/dD)}/día` : 'Ingresá el sueldo';
                                })()}
                              </div>
                            )}
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--blue-dark)', fontFamily: 'monospace' }}>
                              {importe > 0 ? fmt(importe) : '—'}
                            </div>
                            {descuento > 0 && descuento !== importe && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--red-dark)', fontFamily: 'monospace' }}>
                                desc: {fmt(descuento)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--orange-dark)', marginLeft: 'auto' }}>
                            ← Ingresá fecha de inicio
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Resumen totales */}
          {hayActivas && (
            <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-card-alt)',
              border: '1px solid var(--border)', borderRadius: '8px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-sub)',
                marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Resumen por mes
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {totalesPorMes.map((total, i) =>
                  total > 0 ? (
                    <div key={i} style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem',
                      background: 'var(--blue-light)', borderRadius: '4px', color: 'var(--blue-dark)', fontWeight: 700 }}>
                      {MESES[i].slice(0,3)}: {fmt(total)}
                    </div>
                  ) : null
                )}
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.88rem', fontWeight: 800,
                color: 'var(--blue-dark)', fontFamily: 'monospace' }}>
                Total anual: {fmt(totalAnual)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
