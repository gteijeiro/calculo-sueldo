import React, { useState } from 'react';
import { CONVENIOS_DETALLE } from '../constants/convenios.js';
import JsonMapBadge from './JsonMapBadge.jsx';

const CONVENIOS = [
  { id: 'general',      label: 'Sin convenio / General',                  jub: 11, os: 3, pami: 3, nota: null },
  { id: 'comercio',     label: 'Empleados de Comercio (FAECYS)',           jub: 11, os: 3, pami: 3, nota: 'Cuota sindical FAECYS y aporte OSECAC adicional no son deducibles en Ganancias.' },
  { id: 'bancarios',    label: 'Bancarios (La Bancaria)',                  jub: 11, os: 3, pami: 3, nota: 'El aporte solidario bancario no es deducible en Ganancias.' },
  { id: 'smata',        label: 'Mecánicos / Automotor (SMATA)',            jub: 11, os: 3, pami: 3, nota: null },
  { id: 'uom',          label: 'Metalúrgicos (UOM)',                       jub: 11, os: 3, pami: 3, nota: null },
  { id: 'uocra',        label: 'Construcción (UOCRA)',                     jub: 11, os: 3, pami: 3, nota: 'El Fondo de Desempleo UOCRA no es deducible. Verificar aportes específicos del convenio.' },
  { id: 'uthgra',       label: 'Gastronomía y Hotelería (UTHGRA)',         jub: 11, os: 3, pami: 3, nota: null },
  { id: 'sadop',        label: 'Docentes privados (SADOP)',                jub: 11, os: 3, pami: 3, nota: null },
  { id: 'docentes_pub', label: 'Docentes públicos / Estatales educación',  jub: 11, os: 3, pami: 3, nota: 'Si tenés caja provincial en lugar de ANSES, verificar la alícuota de jubilación (puede diferir del 11%).' },
  { id: 'estatal_nac',  label: 'Adm. Pública Nacional (ATE / UPCN)',      jub: 11, os: 3, pami: 3, nota: null },
  { id: 'sanidad',      label: 'Sanidad (ATSA)',                           jub: 11, os: 3, pami: 3, nota: null },
  { id: 'camioneros',   label: 'Camioneros / Transporte de cargas',        jub: 11, os: 3, pami: 3, nota: null },
  { id: 'custom',       label: '— Personalizado (completar manualmente) —', jub: null, os: null, pami: null, nota: null },
];

function fmt(n) {
  return n.toFixed(1).replace('.0', '') + '%';
}

function fmtPesos(n) {
  return '$ ' + Math.round(n).toLocaleString('es-AR');
}

export default function DatosForm({ config, onChange, onLoadSueldo, showJsonMap = false }) {
  const [showDetalle, setShowDetalle] = useState(false);
  const [cargoUsado, setCargoUsado] = useState(null);
  const set = (key, val) => onChange({ ...config, [key]: val });

  const handleUsarCargo = (sueldo, idx) => {
    onLoadSueldo?.({ fijo: true, base: Math.round(sueldo) });
    setCargoUsado(idx);
    setTimeout(() => setCargoUsado(null), 2000);
  };

  const handleConvenio = (id) => {
    setShowDetalle(false);
    setCargoUsado(null);
    const conv = CONVENIOS.find(c => c.id === id);
    if (!conv) return;
    const update = { ...config, convenio: id };
    if (conv.jub !== null) {
      update.pJubilacion = conv.jub;
      update.pObraSocial = conv.os;
      update.pPAMI       = conv.pami;
    }
    onChange(update);
  };

  const convenioActual = CONVENIOS.find(c => c.id === config.convenio) || CONVENIOS[0];

  return (
    <div className="card">
      <div className="card-title">⚙️ Datos fijos del período</div>

      {/* Convenio */}
      <div className="form-group" style={{ marginBottom: '1.2rem' }}>
        <label>
          Convenio colectivo / Actividad laboral
          <span className="hint">Precarga los porcentajes de aportes del convenio</span>
        </label>
        <select value={config.convenio || 'general'} onChange={e => handleConvenio(e.target.value)}>
          {CONVENIOS.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        {/* Advertencia rápida */}
        {convenioActual.nota && (
          <div style={{
            fontSize: '0.74rem', color: 'var(--orange-dark)',
            background: 'var(--orange-light)', borderRadius: '5px',
            padding: '0.35rem 0.65rem', marginTop: '0.4rem',
            borderLeft: '3px solid #d69e2e', lineHeight: 1.5,
          }}>
            ⚠️ {convenioActual.nota}
          </div>
        )}

        {/* Botón y panel de detalle */}
        {(config.convenio || 'general') !== 'custom' && (() => {
          const det = CONVENIOS_DETALLE[config.convenio || 'general'];
          if (!det) return null;
          const pAp = (config.pJubilacion || 11) + (config.pObraSocial || 3) + (config.pPAMI || 3);
          const totalDesc = pAp + det.descuentos_extra.reduce((s, d) => s + d.pct, 0);
          return (
            <div style={{ marginTop: '0.5rem' }}>
              <button onClick={() => setShowDetalle(v => !v)} style={{
                fontSize: '0.74rem', padding: '0.25rem 0.7rem', cursor: 'pointer',
                border: `1px solid var(--blue)`, borderRadius: '5px',
                background: showDetalle ? 'var(--blue)' : 'var(--blue-light)',
                color: showDetalle ? 'white' : 'var(--blue)', fontWeight: 600,
              }}>
                {showDetalle ? '▲ Ocultar detalle' : '▼ Ver detalle del convenio'}
              </button>

              {showDetalle && (
                <div style={{
                  marginTop: '0.6rem', border: `1.5px solid var(--blue)`,
                  borderRadius: '8px', overflow: 'hidden',
                }}>
                  {/* Header */}
                  <div style={{ background: 'var(--blue)', color: 'white', padding: '0.6rem 0.9rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{det.nombre}</div>
                    {det.cct && <div style={{ fontSize: '0.73rem', opacity: 0.85 }}>{det.cct}</div>}
                  </div>

                  <div style={{ padding: '0.8rem 0.9rem', background: 'var(--bg-card-alt)' }}>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginBottom: '0.8rem', lineHeight: 1.55 }}>
                      {det.descripcion}
                    </p>

                    {/* Tabla de descuentos */}
                    <div style={{ marginBottom: '0.8rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        Descuentos al empleado
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                        <thead>
                          <tr style={{ background: 'var(--gray-100)' }}>
                            <th style={{ textAlign: 'left', padding: '0.3rem 0.5rem', fontWeight: 600, color: 'var(--text-sub)', fontSize: '0.71rem' }}>Concepto</th>
                            <th style={{ textAlign: 'right', padding: '0.3rem 0.5rem', fontWeight: 600, color: 'var(--text-sub)', fontSize: '0.71rem' }}>%</th>
                            <th style={{ textAlign: 'center', padding: '0.3rem 0.5rem', fontWeight: 600, color: 'var(--text-sub)', fontSize: '0.71rem' }}>Deduce Ganancias</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ borderTop: `1px solid var(--border)` }}>
                            <td style={{ padding: '0.28rem 0.5rem', color: 'var(--text-main)' }}>Jubilación SIPA</td>
                            <td style={{ padding: '0.28rem 0.5rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>{fmt(config.pJubilacion || 11)}</td>
                            <td style={{ padding: '0.28rem 0.5rem', textAlign: 'center', color: 'var(--green-dark)' }}>✓ Sí</td>
                          </tr>
                          <tr style={{ borderTop: `1px solid var(--border)` }}>
                            <td style={{ padding: '0.28rem 0.5rem', color: 'var(--text-main)' }}>Obra social</td>
                            <td style={{ padding: '0.28rem 0.5rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>{fmt(config.pObraSocial || 3)}</td>
                            <td style={{ padding: '0.28rem 0.5rem', textAlign: 'center', color: 'var(--green-dark)' }}>✓ Sí</td>
                          </tr>
                          <tr style={{ borderTop: `1px solid var(--border)` }}>
                            <td style={{ padding: '0.28rem 0.5rem', color: 'var(--text-main)' }}>PAMI / INSSJP</td>
                            <td style={{ padding: '0.28rem 0.5rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>{fmt(config.pPAMI || 3)}</td>
                            <td style={{ padding: '0.28rem 0.5rem', textAlign: 'center', color: 'var(--green-dark)' }}>✓ Sí</td>
                          </tr>
                          {det.descuentos_extra.map(d => (
                            <tr key={d.key} style={{ borderTop: `1px solid var(--border)`, background: 'var(--orange-light)' }}>
                              <td style={{ padding: '0.28rem 0.5rem', color: 'var(--text-main)' }}>
                                {d.label}
                                {d.nota && <span style={{ display: 'block', fontSize: '0.67rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{d.nota}</span>}
                              </td>
                              <td style={{ padding: '0.28rem 0.5rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: 'var(--orange-dark)' }}>{fmt(d.pct)}</td>
                              <td style={{ padding: '0.28rem 0.5rem', textAlign: 'center', color: 'var(--red-dark)', fontWeight: 700 }}>✗ No</td>
                            </tr>
                          ))}
                          <tr style={{ borderTop: `2px solid var(--border)`, background: 'var(--gray-100)', fontWeight: 700 }}>
                            <td style={{ padding: '0.35rem 0.5rem', color: 'var(--text-main)' }}>Total descuentos</td>
                            <td style={{ padding: '0.35rem 0.5rem', textAlign: 'right', fontFamily: 'monospace', color: 'var(--red-dark)', fontSize: '0.88rem' }}>{totalDesc.toFixed(1).replace('.0','')}%</td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Cargos y escalas salariales */}
                    {det.cargos && det.cargos.length > 0 && (
                      <div style={{ marginBottom: '0.8rem' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                          Escalas salariales — referencia H1 2026
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--orange-dark)', marginBottom: '0.5rem',
                          background: 'var(--orange-light)', borderRadius: '4px', padding: '0.3rem 0.6rem' }}>
                          ⚠️ Valores aproximados — verificar con la última paritaria vigente. Hacé clic en "Usar →" para cargar el sueldo en el formulario.
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                          <thead>
                            <tr style={{ background: 'var(--gray-100)' }}>
                              <th style={{ textAlign: 'left', padding: '0.3rem 0.5rem', fontWeight: 600,
                                color: 'var(--text-sub)', fontSize: '0.71rem' }}>Cargo / Categoría</th>
                              <th style={{ textAlign: 'right', padding: '0.3rem 0.5rem', fontWeight: 600,
                                color: 'var(--text-sub)', fontSize: '0.71rem' }}>Sueldo bruto mensual</th>
                              <th style={{ textAlign: 'center', padding: '0.3rem 0.5rem', fontWeight: 600,
                                color: 'var(--text-sub)', fontSize: '0.71rem' }}>Cargar</th>
                            </tr>
                          </thead>
                          <tbody>
                            {det.cargos.map((c, idx) => {
                              const isUsado = cargoUsado === idx;
                              return (
                                <tr key={idx} style={{ borderTop: '1px solid var(--border)' }}>
                                  <td style={{ padding: '0.28rem 0.5rem', color: 'var(--text-main)' }}>
                                    {c.cargo}
                                  </td>
                                  <td style={{ padding: '0.28rem 0.5rem', textAlign: 'right',
                                    fontFamily: 'monospace', fontWeight: 700, color: 'var(--blue-dark)' }}>
                                    {fmtPesos(c.sueldo)}
                                  </td>
                                  <td style={{ padding: '0.28rem 0.5rem', textAlign: 'center' }}>
                                    <button
                                      onClick={() => handleUsarCargo(c.sueldo, idx)}
                                      style={{
                                        fontSize: '0.69rem', padding: '0.18rem 0.55rem', cursor: 'pointer',
                                        borderRadius: '4px', border: '1.5px solid', fontWeight: 600,
                                        whiteSpace: 'nowrap', transition: 'all 0.15s',
                                        borderColor: isUsado ? 'var(--green-dark)' : 'var(--blue)',
                                        background: isUsado ? 'var(--green-light)' : 'var(--blue-light)',
                                        color: isUsado ? 'var(--green-dark)' : 'var(--blue)',
                                      }}>
                                      {isUsado ? '✓ Cargado' : 'Usar →'}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Beneficios */}
                    {det.beneficios.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                          Beneficios principales
                        </div>
                        <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
                          {det.beneficios.map((b, i) => (
                            <li key={i} style={{ fontSize: '0.77rem', color: 'var(--text-sub)',
                              marginBottom: '0.2rem', lineHeight: 1.45 }}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Aportes */}
      <label style={{ display: 'block', marginBottom: '0.4rem' }}>
        Aportes previsionales obligatorios
        <span className="hint">% sobre el bruto — deducibles en Ganancias</span>
      </label>
      <div className="aportes-grid">
        <div className="form-group">
          <label>Jubilación SIPA</label>
          <input type="number" value={config.pJubilacion} min="0" max="30" step="0.5"
            onChange={e => onChange({ ...config, pJubilacion: parseFloat(e.target.value) || 0, convenio: 'custom' })} />
          <JsonMapBadge visible={showJsonMap} path="recibo_sueldo.deducciones.jubilacion" variable="pJubilacion" defaultValue={11} ley="Ley 24.241 Art.11" formulaId="jubilacion_sipa" />
        </div>
        <div className="form-group">
          <label>Obra social</label>
          <input type="number" value={config.pObraSocial} min="0" max="15" step="0.5"
            onChange={e => onChange({ ...config, pObraSocial: parseFloat(e.target.value) || 0, convenio: 'custom' })} />
          <JsonMapBadge visible={showJsonMap} path="recibo_sueldo.deducciones.obra_social" variable="pObraSocial" defaultValue={3} ley="Ley 23.660" formulaId="obra_social" />
        </div>
        <div className="form-group">
          <label>PAMI / INSSJP</label>
          <input type="number" value={config.pPAMI} min="0" max="10" step="0.5"
            onChange={e => onChange({ ...config, pPAMI: parseFloat(e.target.value) || 0, convenio: 'custom' })} />
          <JsonMapBadge visible={showJsonMap} path="recibo_sueldo.deducciones.pami" variable="pPAMI" defaultValue={3} ley="Ley 19.032" formulaId="pami_inssjp" />
        </div>
      </div>

      {/* Cargas de familia */}
      <div className="form-grid" style={{ marginTop: '1.2rem' }}>
        <div className="form-group">
          <label>
            Cónyuge / unión convivencial a cargo
            <span className="hint">Sin ingresos propios o menores al MNI ($5.151.802 anual)</span>
          </label>
          <select value={config.conyuge}
            onChange={e => set('conyuge', parseInt(e.target.value))}>
            <option value={0}>No / tiene ingresos propios</option>
            <option value={1}>Sí — a cargo sin ingresos</option>
          </select>
          <JsonMapBadge visible={showJsonMap} path="recibo_sueldo.cargas_familia.conyuge" variable="conyuge" defaultValue={0} ley="Ley 27.743 Art.30 b) 1" />
        </div>
        <div className="form-group">
          <label>
            Hijos/as menores de 18 años
            <span className="hint">Cantidad</span>
          </label>
          <input type="number" value={config.hijos} min="0" max="20" step="1"
            onChange={e => set('hijos', parseInt(e.target.value) || 0)} />
          <JsonMapBadge visible={showJsonMap} path="recibo_sueldo.cargas_familia.hijos" variable="hijos" defaultValue={0} ley="Ley 27.743 Art.30 b) 2" />
        </div>
        <div className="form-group">
          <label>
            Hijos/as incapacitados para el trabajo
            <span className="hint">Sin límite de edad</span>
          </label>
          <input type="number" value={config.hijosInc} min="0" max="10" step="1"
            onChange={e => set('hijosInc', parseInt(e.target.value) || 0)} />
          <JsonMapBadge visible={showJsonMap} path="recibo_sueldo.cargas_familia.hijos_incapacitados" variable="hijosInc" defaultValue={0} ley="Ley 27.743 Art.30 b) 2 inc." />
        </div>
      </div>
    </div>
  );
}
