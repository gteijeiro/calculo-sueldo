import React from 'react';
import { MESES } from '../constants/arca2026.js';

function fmtNum(n) {
  if (!n) return '';
  return Math.round(n).toLocaleString('es-AR');
}

export default function SueldoForm({ sueldoConfig, onChange }) {
  const { fijo, base, porMes } = sueldoConfig;

  const setFijo = v => onChange({ ...sueldoConfig, fijo: v });
  const setBase = v => onChange({ ...sueldoConfig, base: parseFloat(v) || 0 });
  const setMes  = (i, v) => {
    const next = [...porMes];
    next[i] = parseFloat(v) || 0;
    onChange({ ...sueldoConfig, porMes: next });
  };

  return (
    <div className="card">
      <div className="card-title">💼 Sueldo bruto</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <label style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontSize: '0.88rem', fontWeight: 600, color: 'var(--gray-800)', cursor: 'pointer',
        }}>
          <input
            type="checkbox"
            checked={fijo}
            onChange={e => setFijo(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          Mismo sueldo bruto todos los meses
        </label>
      </div>

      {fijo ? (
        <div className="form-group" style={{ maxWidth: '320px' }}>
          <label>Sueldo bruto mensual</label>
          <input
            type="number"
            value={base || ''}
            min="0"
            placeholder="Ej: 1500000"
            onChange={e => setBase(e.target.value)}
          />
          {base > 0 && (
            <span className="hint">
              SAC auto: {fmtNum(base / 2)} (junio y diciembre)
            </span>
          )}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: '0.85rem', width: '100%', minWidth: '480px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0.4rem 0.5rem', background: 'var(--gray-100)',
                  fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--gray-600)' }}>
                  Mes
                </th>
                <th style={{ textAlign: 'right', padding: '0.4rem 0.5rem', background: 'var(--gray-100)',
                  fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--gray-600)' }}>
                  Sueldo bruto
                </th>
                <th style={{ textAlign: 'right', padding: '0.4rem 0.5rem', background: 'var(--gray-100)',
                  fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--gray-600)' }}>
                  SAC auto
                </th>
              </tr>
            </thead>
            <tbody>
              {MESES.map((mes, i) => (
                <tr key={mes} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                  <td style={{ padding: '0.25rem 0.5rem', fontWeight: 700 }}>{mes}</td>
                  <td style={{ padding: '0.25rem 0.5rem' }}>
                    <input
                      type="number"
                      value={porMes[i] || ''}
                      min="0"
                      placeholder="0"
                      onChange={e => setMes(i, e.target.value)}
                      style={{ textAlign: 'right', padding: '0.25rem 0.4rem', border: '1.5px solid var(--gray-200)',
                        borderRadius: '4px', fontSize: '0.85rem', width: '140px' }}
                    />
                  </td>
                  <td style={{ padding: '0.25rem 0.5rem', textAlign: 'right',
                    fontSize: '0.8rem', color: 'var(--gray-400)', fontFamily: 'monospace' }}>
                    {(i === 5 || i === 11) && porMes[i] > 0
                      ? '$ ' + fmtNum(porMes[i] / 2)
                      : (i === 5 || i === 11) ? '(auto)' : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ fontSize: '0.71rem', color: 'var(--gray-400)', marginTop: '0.6rem' }}>
        SAC = mejor sueldo del semestre ÷ 2. Se incluye en junio y diciembre automáticamente.
      </p>
    </div>
  );
}
