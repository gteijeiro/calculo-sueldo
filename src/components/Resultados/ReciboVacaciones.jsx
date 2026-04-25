import React from 'react';
import { fmt } from '../../utils/format.js';

const T = (value, tip) => <span data-tip={tip}>{fmt(value)}</span>;

export default function ReciboVacaciones({ resultado, vacConfig }) {
  const { detalleM, pAp, config } = resultado;
  const { pJubilacion, pObraSocial, pPAMI } = config;

  const mesesConVac = detalleM.filter(d => (d.vac || 0) > 0);
  if (mesesConVac.length === 0) return null;

  const totalVac     = mesesConVac.reduce((s, d) => s + d.vac, 0);
  const totalDescVac = totalVac * pAp;
  const totalNetoVac = totalVac - totalDescVac;

  return (
    <div className="card">
      <div className="card-title">🏖️ Recibo de vacaciones</div>

      <div style={{ fontSize: '0.82rem', color: 'var(--gray-600)', marginBottom: '1rem' }}>
        Período: <strong>{vacConfig.fechaInicio?.split('-').reverse().join('/')}</strong> ·{' '}
        <strong>{vacConfig.cantDias} días corridos</strong>
      </div>

      {mesesConVac.map(d => {
        const dias       = Math.round(d.vac / d.sueldo * 25);
        const jubilacion = d.vac * pJubilacion / 100;
        const os         = d.vac * pObraSocial / 100;
        const pami       = d.vac * pPAMI / 100;
        const neto       = d.vac - jubilacion - os - pami;

        return (
          <div key={d.mes} style={{
            background: '#f0fff4', border: '1.5px solid #9ae6b4',
            borderRadius: '8px', padding: '1rem', marginBottom: '0.8rem',
          }}>
            <div style={{ fontWeight: 700, color: 'var(--green-dark)', marginBottom: '0.6rem', fontSize: '0.9rem' }}>
              {d.mes} — {dias} día{dias !== 1 ? 's' : ''} de vacaciones
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', maxWidth: '420px' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #c6f6d5' }}>
                  <td style={{ padding: '0.25rem 0.4rem', color: 'var(--green-dark)', fontWeight: 700,
                    fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }} colSpan={2}>Haberes</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.2rem 0.5rem' }}>
                    Hab. vacacionales ({fmt(d.sueldo)} ÷ 25 × {dias} días)
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: 'var(--green-dark)' }}>
                    {T(d.vac, `${fmt(d.sueldo)} ÷ 25 × ${dias} días = ${fmt(d.vac)}`)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #c6f6d5', borderTop: '1px solid #c6f6d5' }}>
                  <td style={{ padding: '0.25rem 0.4rem', color: 'var(--red-dark)', fontWeight: 700,
                    fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }} colSpan={2}>Descuentos</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.2rem 0.5rem' }}>Jubilación SIPA ({pJubilacion}%)</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--red-dark)' }}>
                    {T(-jubilacion, `${fmt(d.vac)} × ${pJubilacion}% = ${fmt(jubilacion)}`)}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.2rem 0.5rem' }}>Obra social ({pObraSocial}%)</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--red-dark)' }}>
                    {T(-os, `${fmt(d.vac)} × ${pObraSocial}% = ${fmt(os)}`)}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.2rem 0.5rem' }}>PAMI ({pPAMI}%)</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--red-dark)' }}>
                    {T(-pami, `${fmt(d.vac)} × ${pPAMI}% = ${fmt(pami)}`)}
                  </td>
                </tr>
                <tr style={{ borderTop: '2px solid #9ae6b4', background: '#e6fffa', fontWeight: 800 }}>
                  <td style={{ padding: '0.35rem 0.5rem', color: 'var(--green-dark)' }}>Neto vacaciones</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--green-dark)', fontSize: '0.95rem' }}>
                    {T(neto, `${fmt(d.vac)} − ${fmt(jubilacion)} − ${fmt(os)} − ${fmt(pami)} = ${fmt(neto)}`)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}

      {mesesConVac.length > 1 && (
        <div style={{ background: 'var(--green-light)', borderRadius: '8px', padding: '0.8rem 1rem',
          display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 700 }}>
          <span>Total haberes vacacionales del año</span>
          <span style={{ fontFamily: 'monospace', color: 'var(--green-dark)' }}>
            {T(totalVac, `Suma hab. vac. todos los meses: ${fmt(totalVac)}`)}
          </span>
        </div>
      )}

      <p style={{ fontSize: '0.71rem', color: 'var(--gray-400)', marginTop: '0.6rem' }}>
        Los haberes vacacionales son remunerativos (LCT Art.103). Se descuentan jubilación + obra social + PAMI.
        También forman parte de la base de cálculo del Impuesto a las Ganancias.
        Pasar el cursor sobre cualquier número para ver la fórmula.
      </p>
    </div>
  );
}
