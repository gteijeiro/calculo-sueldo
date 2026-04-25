import React from 'react';
import { fmt, pct } from '../../utils/format.js';

const T = (value, tip, render) => (
  <span data-tip={tip}>{render ? render(value) : fmt(value)}</span>
);

export default function ResumenFinal({ resultado, hastaHoy }) {
  const {
    bruto, salAn, sacAn, vacAn, aTotal, impAnual, baseAnual, gNeta,
    dedPers, caps, tEfectiva, tMarginal, pAp, sacAutoCalc,
  } = resultado;

  const totalDed = dedPers.total + caps.total;
  const pApPct   = Math.round(pAp * 100);
  const netoBolsillo = salAn * (1 - pAp) - impAnual;
  const noRetiene = baseAnual <= 0;
  const sfx = hastaHoy ? ' acumulado (ene–abr)' : ' anual';

  // Suma de retenciones positivas efectivas de detalleM (lo realmente retenido hasta hoy)
  const { detalleM, totalRetenido, totalDevuelto } = resultado;

  return (
    <div className="card">
      <div className="card-title">✅ Resultado final</div>
      {noRetiene && !hastaHoy && (
        <div className="alert alert-info" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
          No corresponde retención anual. Deducciones ({fmt(totalDed)}) superan la ganancia neta ({fmt(gNeta)}).
        </div>
      )}
      {noRetiene && hastaHoy && (
        <div className="alert alert-info" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
          <strong>Sin retención acumulada hasta abril.</strong> Las deducciones del período
          ({fmt(totalDed)}) superan la ganancia neta acumulada ({fmt(gNeta)}).
          {totalRetenido > 0 && (
            <> Retenciones efectivas hasta el momento: <strong>{fmt(totalRetenido)}</strong>.</>
          )}
          {' '}El resultado final puede variar al incorporar los ingresos y deducciones de los meses restantes del año.
        </div>
      )}
      <div className="result-grid">
        <div className="rbox">
          <div className="amt">
            <span data-tip={`Escala Art.94 aplicada sobre GNSI ${fmt(baseAnual)}`}>{fmt(impAnual)}</span>
          </div>
          <div className="lbl">Impuesto determinado{sfx}</div>
        </div>
        <div className="rbox">
          <div className="amt">
            <span data-tip={
              hastaHoy
                ? `Total retenido: ${fmt(totalRetenido)} · devuelto: ${fmt(Math.abs(totalDevuelto))}`
                : `${fmt(impAnual)} ÷ 12 = ${fmt(impAnual / 12)}`
            }>
              {hastaHoy ? fmt(totalRetenido) : fmt(impAnual / 12)}
            </span>
          </div>
          <div className="lbl">{hastaHoy ? 'Total retenido hasta abril' : 'Retención promedio mensual'}</div>
        </div>
        <div className="rbox green">
          <div className="amt">
            <span data-tip={`${fmt(salAn)} × (1−${pApPct}%) − imp. ${fmt(impAnual)} = ${fmt(netoBolsillo)}`}>{fmt(netoBolsillo)}</span>
          </div>
          <div className="lbl">Neto bolsillo{sfx}</div>
        </div>
      </div>

      <div className="srow">
        <span>Sueldos{sfx}</span>
        <span className="v" data-tip={`Suma de sueldos período: ${fmt(salAn)}`}>{fmt(salAn)}</span>
      </div>
      {sacAn > 0 && (
        <div className="srow">
          <span>SAC / Bonos{sacAutoCalc.junio || sacAutoCalc.diciembre ? ' (parcial auto-calc)' : ''}</span>
          <span className="v" data-tip={`SAC 1er sem. + 2do sem. = ${fmt(sacAn)}`}>{fmt(sacAn)}</span>
        </div>
      )}
      {vacAn > 0 && (
        <div className="srow">
          <span>Haberes vacacionales</span>
          <span className="v" data-tip={`Total hab. vacacionales del período: ${fmt(vacAn)}`}>{fmt(vacAn)}</span>
        </div>
      )}
      <div className="srow">
        <span><strong>Total ingresos brutos{sfx}</strong></span>
        <span className="v" data-tip={
          [fmt(salAn), sacAn > 0 && `SAC ${fmt(sacAn)}`, vacAn > 0 && `vac ${fmt(vacAn)}`]
            .filter(Boolean).join(' + ') + ` = ${fmt(bruto)}`
        }>{fmt(bruto)}</span>
      </div>
      <div className="srow">
        <span>Total aportes ({pApPct}%)</span>
        <span className="v" style={{ color: 'var(--red-dark)' }}
          data-tip={`${fmt(bruto)} × ${pApPct}% = ${fmt(aTotal)}`}>
          {fmt(-aTotal)}
        </span>
      </div>
      <div className="srow">
        <span>Total deducciones{sfx}</span>
        <span className="v" style={{ color: 'var(--red-dark)' }}
          data-tip={`Ded. personales ${fmt(dedPers.total)} + Art.85 ${fmt(caps.total)} = ${fmt(totalDed)}`}>
          {fmt(-totalDed)}
        </span>
      </div>
      <div className="srow">
        <span>Impuesto a las Ganancias{sfx}</span>
        <span className="v" style={{ color: 'var(--red-dark)' }}
          data-tip={`Escala Art.94 sobre GNSI ${fmt(baseAnual)}`}>
          {fmt(-impAnual)}
        </span>
      </div>
      <div className="srow net">
        <span>Neto bolsillo{sfx}</span>
        <span className="v"
          data-tip={`${fmt(salAn)} × (1−${pApPct}%) − imp. ${fmt(impAnual)} = ${fmt(netoBolsillo)}`}>
          {fmt(netoBolsillo)}
        </span>
      </div>
      <div className="srow">
        <span>Tasa efectiva (impuesto ÷ bruto)</span>
        <span className="v"
          data-tip={`${fmt(impAnual)} ÷ ${fmt(bruto)} × 100 = ${tEfectiva.toFixed(2)}%`}>
          {pct(tEfectiva)}
        </span>
      </div>
      <div className="srow">
        <span>Tasa marginal</span>
        <span className="v"
          data-tip={`Tramo de la escala Art.94 que aplica al último peso de GNSI: ${tMarginal}%`}>
          {tMarginal}%
        </span>
      </div>
    </div>
  );
}
