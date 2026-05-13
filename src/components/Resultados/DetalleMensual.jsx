import React from 'react';
import { fmt } from '../../utils/format.js';

const T = (value, tip) => <span data-tip={tip}>{fmt(value)}</span>;

export default function DetalleMensual({ resultado }) {
  const { detalleM, bruto, aTotal, baseAnual, impAnual, salAn, vacAn, sacAn, pAp,
          config: { pJubilacion, pObraSocial, pPAMI }, sacAutoCalc } = resultado;
  const pApPct = Math.round(pAp * 100);
  const tieneVac = detalleM.some(d => (d.vac || 0) > 0);

  return (
    <div className="card">
      <div className="card-title">📆 Retención mes a mes — Método acumulado RG 4003/2017</div>
      <div className="det-table-wrap">
        <table className="det-table">
          <thead>
            <tr>
              <th>Mes</th>
              <th>Sueldo</th>
              {tieneVac && <th>Hab. vacacionales<br/><span style={{fontWeight:400,fontSize:'0.65rem'}}>sueldo÷25×días</span></th>}
              {tieneVac && <th>Total ingreso</th>}
              {!tieneVac && <th>Ingreso del mes</th>}
              <th>Aportes<br/><span style={{fontWeight:400,fontSize:'0.65rem'}}>(jub+OS+PAMI)</span></th>
              <th>GNSI acumulada</th>
              <th>Impuesto acumulado</th>
              <th>Este mes</th>
              <th>Neto bolsillo estimado</th>
            </tr>
          </thead>
          <tbody>
            {detalleM.map((d, i) => {
              if (d.ingreso === 0 && Math.abs(d.retencion) < 1) {
                const cols = tieneVac ? 9 : 7;
                return (
                  <tr key={d.mes} className="d-gray">
                    <td>{d.mes}</td>
                    {Array(cols - 1).fill(null).map((_, j) => <td key={j}>—</td>)}
                  </tr>
                );
              }

              const sueldoSac = d.sueldo + (d.sac || 0);
              const impPrev   = i > 0 ? detalleM[i - 1].impAcum : 0;
              const retLabel  = d.retencion > 0.5
                ? <span className="d-red">{T(d.retencion, `Imp.acum.${d.mes} ${fmt(d.impAcum)} − imp.ant. ${fmt(impPrev)} = ${fmt(d.retencion)}`)}</span>
                : d.retencion < -0.5
                  ? <span className="d-grn">{T(-d.retencion, `Imp.acum.${d.mes} ${fmt(d.impAcum)} − imp.ant. ${fmt(impPrev)} = ${fmt(d.retencion)} (devolución)`)}</span>
                  : <span className="d-gray">—</span>;

              return (
                <tr key={d.mes}>
                  <td><strong>{d.mes}</strong></td>
                  <td>{T(sueldoSac,
                    d.sac > 0
                      ? `sueldo ${fmt(d.sueldo)} + SAC ${fmt(d.sac)} = ${fmt(sueldoSac)}`
                      : `sueldo del mes: ${fmt(d.sueldo)}`)}</td>
                  {tieneVac && (
                    <td style={{ color: (d.vac || 0) > 0 ? 'var(--blue-dark)' : 'var(--gray-400)' }}>
                      {(d.vac || 0) > 0
                        ? <><span data-tip={`${fmt(d.sueldo)} ÷ 25 × ${Math.round(d.vac / d.sueldo * 25)} días = ${fmt(d.vac)}`}>{fmt(d.vac)}</span>
                            <br/><span style={{fontSize:'0.68rem',color:'var(--gray-400)'}}>÷25×{Math.round(d.vac / d.sueldo * 25)} días</span></>
                        : '—'}
                    </td>
                  )}
                  {tieneVac && (
                    <td style={{ fontWeight: 700 }}>
                      {T(d.ingreso, `${fmt(d.sueldo)}${d.vac > 0 ? ` + hab.vac ${fmt(d.vac)}` : ''}${d.sac > 0 ? ` + SAC ${fmt(d.sac)}` : ''} = ${fmt(d.ingreso)}`)}
                    </td>
                  )}
                  {!tieneVac && (
                    <td>{T(d.ingreso, `sueldo${d.sac > 0 ? ` + SAC ${fmt(d.sac)}` : ''} = ${fmt(d.ingreso)}`)}</td>
                  )}
                  <td className="d-red">
                    {T(-d.aporte, `${fmt(d.ingresoSinSac)} × ${pApPct}% (${pJubilacion}+${pObraSocial}+${pPAMI}) = ${fmt(d.aporte)}`)}
                    {(d.vac || 0) > 0 && (
                      <><br/><span style={{fontSize:'0.68rem',color:'var(--gray-400)'}}>
                        incl. <span data-tip={`hab.vac ${fmt(d.vac)} × ${pApPct}%`}>{fmt(-d.vac * pAp)}</span> vac.
                      </span></>
                    )}
                  </td>
                  <td>{T(d.gnsiAcum, `GN acum. ${fmt(d.brutoAcum * (1 - pAp))} − ded. total ${fmt(d.brutoAcum * (1-pAp) - d.gnsiAcum)} = ${fmt(d.gnsiAcum)}`)}</td>
                  <td>{T(d.impAcum, `Escala Art.94 sobre GNSI ${fmt(d.gnsiAcum)}`)}</td>
                  <td>{retLabel}</td>
                  <td className="d-grn">
                    {T(d.neto, `(${fmt(d.sueldo + d.vac)}) × (1−${pApPct}%) − retención ${fmt(Math.max(0, d.retencion))} = ${fmt(d.neto)}`)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td>TOTAL AÑO</td>
              <td>{T(salAn + sacAn,
                sacAn > 0
                  ? `sueldos ${fmt(salAn)} + SAC ${fmt(sacAn)} = ${fmt(salAn + sacAn)}`
                  : `sueldos anuales: ${fmt(salAn)}`)}</td>
              {tieneVac && (
                <td style={{ color: 'var(--blue-dark)', fontWeight: 700 }}>
                  {vacAn > 0 ? T(vacAn, `total hab. vacacionales del año: ${fmt(vacAn)}`) : '—'}
                </td>
              )}
              <td>{T(bruto,
                [fmt(salAn), sacAn > 0 && `SAC ${fmt(sacAn)}`, vacAn > 0 && `vac ${fmt(vacAn)}`]
                  .filter(Boolean).join(' + ') + ` = ${fmt(bruto)}`)}</td>
              <td className="d-red">{T(-aTotal, `${fmt(bruto)} × ${pApPct}% = ${fmt(aTotal)}`)}</td>
              <td>{T(baseAnual, `GNSI anual (base imponible): ${fmt(baseAnual)}`)}</td>
              <td>{T(impAnual, `Escala Art.94 sobre ${fmt(baseAnual)}`)}</td>
              <td className="d-red">{T(-impAnual, `Impuesto determinado anual: ${fmt(impAnual)}`)}</td>
              <td className="d-grn">{T(salAn * (1 - pAp) - impAnual,
                `${fmt(salAn)} × (1−${pApPct}%) − imp. ${fmt(impAnual)} = ${fmt(salAn * (1 - pAp) - impAnual)}`)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p style={{ fontSize: '0.71rem', color: 'var(--gray-400)', marginTop: '0.5rem' }}>
        Hab. vacacionales = sueldo ÷ 25 × días. Sujetas a jubilación + obra social + PAMI (igual que sueldo).
        GNSI = Ganancia Neta Sujeta a Impuesto acumulada.
        Retención del mes = Impuesto acumulado (mes) − Impuesto acumulado (mes anterior).
        Pasar el cursor sobre cualquier número para ver la fórmula.
      </p>
    </div>
  );
}
