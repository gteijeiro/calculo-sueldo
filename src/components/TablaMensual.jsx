import React, { useCallback } from 'react';
import { MESES, COLS } from '../constants/arca2026.js';

const COL_LABELS = [
  { key: 's',     label: 'Sueldo bruto',        rule: '',                          grp: false },
  { key: 'sac',   label: 'SAC / Bono',           rule: '0 = auto',                  grp: false },
  { key: 'diasVac', label: 'Días de vacaciones',  rule: 'hab. = sueldo ÷ 25 × días', grp: true  },
  { key: 'alq',   label: 'Alquiler',             rule: '40% · tope MNI/año',        grp: false },
  { key: 'prep',  label: 'Prepaga',         rule: '100% · tope 5% GN',         grp: false },
  { key: 'dom',   label: 'P. Doméstico',    rule: '100% · tope MNI/año',       grp: false },
  { key: 'segv',  label: 'Seg. Vida',       rule: '100% · tope $753k',         grp: false },
  { key: 'segr',  label: 'Seg. Retiro',     rule: '100% · tope $753k',         grp: false },
  { key: 'hip',   label: 'Hipoteca',        rule: '100% · tope $20k',          grp: false },
  { key: 'otros', label: 'Otros ded.',      rule: 'ver nota abajo',            grp: false },
];

function fmtTot(n) {
  if (!n) return '—';
  return '$ ' + Math.round(n).toLocaleString('es-AR');
}

export default function TablaMensual({ mesData, onChange }) {
  const setCell = useCallback((m, col, val) => {
    const next = mesData.map((row, i) =>
      i === m ? { ...row, [col]: parseFloat(val) || 0 } : row
    );
    onChange(next);
  }, [mesData, onChange]);

  const copiarEnero = () => {
    const enero = mesData[0];
    onChange(mesData.map((_, i) => i === 0 ? enero : { ...enero }));
  };

  const limpiar = () => {
    onChange(mesData.map(() =>
      Object.fromEntries(COLS.map(c => [c, 0]))
    ));
  };

  const totales = Object.fromEntries(
    COLS.map(col => [col, mesData.reduce((s, m) => s + (m[col] || 0), 0)])
  );

  return (
    <div className="card">
      <div className="card-title">📅 Ingresos y deducciones — mes a mes</div>
      <div className="month-btn-row">
        <button className="btn-sm btn-copy" onClick={copiarEnero}>
          ↓ Copiar Enero a todos los meses
        </button>
        <button className="btn-sm btn-muted" onClick={limpiar}>✕ Limpiar</button>
        <span style={{ fontSize: '0.73rem', color: 'var(--gray-400)' }}>
          SAC en 0 = se calcula automático (mejor sueldo semestre ÷ 2) · Vac. = sueldo ÷ 25 × días
        </span>
      </div>

      <div className="month-table-wrap">
        <table className="month-table">
          <thead>
            <tr>
              <th rowSpan={2} style={{ minWidth: '78px' }}>Mes</th>
              <th colSpan={3} style={{ background: '#234680' }}>📥 Ingresos</th>
              <th colSpan={7} style={{ background: '#276749' }}>🧾 Deducciones Art. 85 (valores del mes)</th>
            </tr>
            <tr className="th-rule">
              {COL_LABELS.map(c => (
                <th key={c.key} className={c.grp ? 'col-grp' : ''}>
                  {c.label}
                  {c.rule && <><br /><span style={{ fontWeight: 400, color: '#888' }}>{c.rule}</span></>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MESES.map((mes, i) => (
              <tr key={mes}>
                <td>{mes}</td>
                {COL_LABELS.map(c => (
                  <td key={c.key} className={c.grp ? 'col-grp' : ''}>
                    <input
                      type="number"
                      value={mesData[i][c.key] || 0}
                      min="0"
                      className={(mesData[i][c.key] || 0) > 0 ? 'has-value' : ''}
                      onChange={e => setCell(i, c.key, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total anual</td>
              {COL_LABELS.map((c, idx) => (
                <td key={c.key}
                  className={[
                    c.grp ? 'col-grp' : '',
                    idx < 3 ? 'tot-main' : 'tot-ded',
                  ].join(' ')}>
                  {fmtTot(totales[c.key])}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      <p style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginTop: '0.7rem' }}>
        <strong>Otros ded.:</strong> honorarios médicos (40%), indumentaria laboral (40%),
        colegios/consejos profesionales (100%), cajas provinciales (100%), gastos educativos hijos (40%),
        donaciones (100% · tope 5% GN), sepelio (100% · tope $996).
        Ingresá el importe bruto pagado en ese mes — el porcentaje deducible y topes se aplican
        automáticamente al acumulado del año.
      </p>
    </div>
  );
}
