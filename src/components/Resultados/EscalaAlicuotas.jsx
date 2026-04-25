import React from 'react';
import { fmt } from '../../utils/format.js';

export default function EscalaAlicuotas({ resultado }) {
  const { escala, impAnual, baseAnual } = resultado;

  if (baseAnual <= 0) return null;

  return (
    <div className="card">
      <div className="card-title">📈 Escala progresiva (Art. 94 LIG) — sobre GNSI anual</div>
      <table className="scale-table">
        <thead>
          <tr>
            <th>Tramo anual</th>
            <th>Alícuota</th>
            <th>Excedente gravado</th>
            <th>Impuesto tramo</th>
          </tr>
        </thead>
        <tbody>
          {escala.map((t, i) => {
            const rango = t.h === Infinity
              ? `Más de ${fmt(t.d)}`
              : `${fmt(t.d)} – ${fmt(t.h)}`;
            return (
              <tr key={i} className={t.estado}>
                <td>{rango}{t.estado === 'partial' ? ' ◀' : ''}</td>
                <td>{t.p}%</td>
                <td>
                  {t.excedente > 0
                    ? <span data-tip={
                        t.estado === 'partial'
                          ? `GNSI ${fmt(baseAnual)} − inicio tramo ${fmt(t.d)} = ${fmt(t.excedente)}`
                          : `tramo completo: ${fmt(t.h)} − ${fmt(t.d)} = ${fmt(t.excedente)}`
                      }>{fmt(t.excedente)}</span>
                    : '—'}
                </td>
                <td>
                  {t.impuesto > 0
                    ? <span data-tip={
                        t.cf > 0
                          ? `CF ${fmt(t.cf)} + ${fmt(t.excedente)} × ${t.p}% = ${fmt(t.impuesto)}`
                          : `${fmt(t.excedente)} × ${t.p}% = ${fmt(t.impuesto)}`
                      }>{fmt(t.impuesto)}</span>
                    : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2}>Impuesto determinado anual</td>
            <td></td>
            <td>
              <span data-tip={`Suma impuesto de todos los tramos = ${fmt(impAnual)}`}>{fmt(impAnual)}</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
