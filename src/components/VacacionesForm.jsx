import React from 'react';
import { resumenVacaciones, haberVacacional, DIAS_MES_2026 } from '../logic/vacaciones.js';
import JsonMapBadge from './JsonMapBadge.jsx';

function fmt(n) {
  return '$ ' + Math.round(n).toLocaleString('es-AR');
}

export default function VacacionesForm({ vacConfig, sueldoBase, onChange, showJsonMap = false }) {
  const { tiene, fechaInicio, cantDias, cobradoPorAdelantado, divisorSueldo = 30 } = vacConfig;

  const set = (key, val) => onChange({ ...vacConfig, [key]: val });

  const resumen = tiene && fechaInicio && cantDias > 0
    ? resumenVacaciones(fechaInicio, cantDias)
    : null;

  return (
    <div className="card">
      <div className="card-title">🏖️ Vacaciones</div>

      <label style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        fontSize: '0.88rem', fontWeight: 600, color: 'var(--gray-800)',
        cursor: 'pointer', marginBottom: '1rem',
      }}>
        <input
          type="checkbox"
          checked={tiene}
          onChange={e => set('tiene', e.target.checked)}
          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
        />
        Tomé vacaciones en 2026
      </label>
      <JsonMapBadge visible={showJsonMap} path="vacaciones.tiene" variable="tiene" defaultValue={false} ley="LCT Art.150" />

      {tiene && (
        <>
          <label style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-800)',
            cursor: 'pointer', marginBottom: '1rem',
          }}>
            <input
              type="checkbox"
              checked={cobradoPorAdelantado}
              onChange={e => set('cobradoPorAdelantado', e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            Las vacaciones se cobran por adelantado
            <span className="hint" style={{ display: 'inline', marginLeft: '0.3rem' }}>
              (todo el período cobrado en el mes que comienzan)
            </span>
          </label>
          <JsonMapBadge visible={showJsonMap} path="vacaciones.cobrado_por_adelantado" variable="cobradoPorAdelantado" defaultValue={true} />
          {/* Divisor del sueldo para calcular reducción por días de vacaciones */}
          <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--gray-800)' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>
              Divisor para reducción de sueldo
              <span className="hint" style={{ display: 'inline', marginLeft: '0.4rem' }}>
                (sueldo ÷ divisor × días de vac.)
              </span>
            </div>
            <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="divisorSueldo"
                  checked={divisorSueldo === 30}
                  onChange={() => set('divisorSueldo', 30)}
                />
                <strong>30</strong>
                <span style={{ color: 'var(--gray-400)', fontSize: '0.78rem' }}>(estándar)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="divisorSueldo"
                  checked={divisorSueldo === 'mes'}
                  onChange={() => set('divisorSueldo', 'mes')}
                />
                <strong>Días del mes</strong>
                <span style={{ color: 'var(--gray-400)', fontSize: '0.78rem' }}>
                  {resumenVacaciones(fechaInicio, cantDias)?.mesesAfectados.map(m =>
                    `${m.mes.slice(0,3)}: ${DIAS_MES_2026[m.mesIdx]}`
                  ).join(' · ')}
                </span>
              </label>
            </div>
            <JsonMapBadge visible={showJsonMap} path="vacaciones.divisor_sueldo" variable="divisorSueldo" defaultValue={30} formulaId="reduccion_sueldo_vacaciones" />
          </div>

          <div className="form-grid" style={{ maxWidth: '520px', marginBottom: '1rem' }}>
            <div className="form-group">
              <label>Fecha de inicio</label>
              <input
                type="date"
                value={fechaInicio}
                min="2026-01-01"
                max="2026-12-31"
                onChange={e => set('fechaInicio', e.target.value)}
              />
              <JsonMapBadge visible={showJsonMap} path="vacaciones.fecha_inicio" variable="fechaInicio" defaultValue="2026-01-01" />
            </div>
            <div className="form-group">
              <label>
                Días de vacaciones
                <span className="hint">Días corridos (LCT Art.150)</span>
              </label>
              <input
                type="number"
                value={cantDias}
                min="1"
                max="35"
                onChange={e => set('cantDias', parseInt(e.target.value) || 0)}
              />
              <JsonMapBadge visible={showJsonMap} path="vacaciones.cant_dias" variable="cantDias" defaultValue={14} ley="LCT Art.150" formulaId="haber_vacacional" />
            </div>
          </div>

          {resumen && (
            <div style={{
              background: 'var(--green-light)', border: '1.5px solid var(--green-border, #9ae6b4)',
              borderRadius: '8px', padding: '1rem', marginTop: '0.5rem',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--green-dark)', marginBottom: '0.6rem' }}>
                Período: {fechaInicio.split('-').reverse().join('/')} al {resumen.fechaFin.split('-').reverse().join('/')} · {cantDias} días
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.3rem 0.4rem', color: 'var(--gray-600)',
                      fontSize: '0.72rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Mes</th>
                    <th style={{ textAlign: 'center', padding: '0.3rem 0.4rem', color: 'var(--gray-600)',
                      fontSize: '0.72rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Días</th>
                    <th style={{ textAlign: 'right', padding: '0.3rem 0.4rem', color: 'var(--gray-600)',
                      fontSize: '0.72rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>
                      Hab. vacacionales
                    </th>
                    {sueldoBase > 0 && (
                      <th style={{ textAlign: 'right', padding: '0.3rem 0.4rem', color: 'var(--gray-600)',
                        fontSize: '0.72rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>
                        Fórmula
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {resumen.mesesAfectados.map(m => {
                    const hv = sueldoBase > 0 ? haberVacacional(sueldoBase, m.diasEnMes) : null;
                    return (
                      <tr key={m.mes} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.3rem 0.4rem', fontWeight: 600 }}>{m.mes}</td>
                        <td style={{ padding: '0.3rem 0.4rem', textAlign: 'center', color: 'var(--blue-dark)', fontWeight: 700 }}>
                          {m.diasEnMes}
                        </td>
                        <td style={{ padding: '0.3rem 0.4rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: 'var(--green-dark)' }}>
                          {hv !== null ? fmt(hv) : <span style={{ color: 'var(--gray-400)' }}>ingrese sueldo</span>}
                        </td>
                        {sueldoBase > 0 && (
                          <td style={{ padding: '0.3rem 0.4rem', textAlign: 'right', fontSize: '0.72rem', color: 'var(--gray-400)' }}>
                            {fmt(sueldoBase)} ÷ 25 × {m.diasEnMes}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
                {sueldoBase > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan={2} style={{ padding: '0.4rem 0.4rem', fontWeight: 700, fontSize: '0.85rem' }}>
                        Total hab. vacacionales
                      </td>
                      <td style={{ padding: '0.4rem 0.4rem', textAlign: 'right', fontFamily: 'monospace',
                        fontWeight: 800, color: 'var(--green-dark)', fontSize: '0.95rem' }}>
                        {fmt(resumen.mesesAfectados.reduce((s, m) => s + haberVacacional(sueldoBase, m.diasEnMes), 0))}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
              <p style={{ fontSize: '0.71rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                Las deducciones (jubilación + obra social + PAMI) se calculan sobre los haberes vacacionales al igual que el sueldo.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
