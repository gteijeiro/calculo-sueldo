import React from 'react';
import { fmt, pct } from '../../utils/format.js';
import { getResumenConfig } from '../../constants/argentina.js';
import JsonMapBadge from '../JsonMapBadge.jsx';

const T = (value, tip, render) => (
  <span data-tip={tip}>{render ? render(value) : fmt(value)}</span>
);

export default function ResumenFinal({ resultado, hastaHoy, showJsonMap = false }) {
  const {
    bruto, salAn, sacAn, vacAn, aTotal, impAnual, baseAnual, gNeta,
    dedPers, caps, tEfectiva, tMarginal, pAp, sacAutoCalc,
  } = resultado;

  const cfg      = getResumenConfig();
  const filasDef = cfg?.filas_detalle ?? [];
  const fila = id => filasDef.find(f => f.id === id) ?? {};

  const Badge = (id) => {
    if (!showJsonMap) return null;
    const f = fila(id);
    return (
      <div style={{ flex: '0 0 100%', marginTop: 0 }}>
        <JsonMapBadge
          visible={true}
          path={`resumen_final.filas_detalle.${id}`}
          variable={f.variable}
          ley={f.ley}
          formulaId={f.formulaId}
          formulaExpresion={f.formula?.expresion}
        />
      </div>
    );
  };

  const MetricaBadge = (id) => {
    if (!showJsonMap) return null;
    const m = cfg?.metricas_principales?.find(m => m.id === id) ?? {};
    return (
      <JsonMapBadge
        visible={true}
        path={`resumen_final.metricas_principales.${id}`}
        variable={m.variable}
        ley={m.ley}
        formulaExpresion={m.formula?.expresion ?? m.formula_anual?.expresion}
      />
    );
  };

  const totalDed = dedPers.total + caps.total;
  const pApPct   = Math.round(pAp * 100);
  const netoBolsillo = salAn * (1 - pAp) - impAnual;
  const noRetiene = baseAnual <= 0;
  const sfx = hastaHoy ? ' acumulado (ene–abr)' : ' anual';

  const { detalleM, totalRetenido, totalDevuelto } = resultado;

  const titulo = cfg?.titulo || '✅ Resultado final';

  const lbl = (id, fallback) => {
    const f = fila(id);
    const raw = f.label || fallback;
    return raw.replace('{sfx}', sfx).replace('{pApPct}', pApPct);
  };

  const metLbl = (id, key, fallback) => {
    const m = cfg?.metricas_principales?.find(m => m.id === id) ?? {};
    return (m[key] || fallback).replace('{sfx}', sfx);
  };

  return (
    <div className="card">
      <div className="card-title">{titulo}</div>
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
          <div className="lbl">{metLbl('impuesto_determinado','label','Impuesto determinado{sfx}')}</div>
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
          <div className="lbl">
            {hastaHoy
              ? metLbl('retencion_periodo','label_parcial','Total retenido hasta {mes_actual}').replace('{mes_actual}','abril')
              : metLbl('retencion_periodo','label_anual','Retención promedio mensual')}
          </div>
        </div>
        <div className="rbox green">
          <div className="amt">
            <span data-tip={`${fmt(salAn)} × (1−${pApPct}%) − imp. ${fmt(impAnual)} = ${fmt(netoBolsillo)}`}>{fmt(netoBolsillo)}</span>
          </div>
          <div className="lbl">{metLbl('neto_bolsillo','label','Neto bolsillo{sfx}')}</div>
        </div>
      </div>
      {showJsonMap && (
        <div style={{ marginBottom: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {MetricaBadge('impuesto_determinado')}
          {MetricaBadge('retencion_periodo')}
          {MetricaBadge('neto_bolsillo')}
        </div>
      )}

      <div className="srow">
        <span>{lbl('sueldos','Sueldos{sfx}')}</span>
        <span className="v" data-tip={`Suma de sueldos período: ${fmt(salAn)}`}>{fmt(salAn)}</span>
        {Badge('sueldos')}
      </div>
      {sacAn > 0 && (
        <div className="srow">
          <span>{lbl('sac','SAC / Bonos')}{sacAutoCalc.junio || sacAutoCalc.diciembre ? ' (parcial auto-calc)' : ''}</span>
          <span className="v" data-tip={`SAC 1er sem. + 2do sem. = ${fmt(sacAn)}`}>{fmt(sacAn)}</span>
          {Badge('sac')}
        </div>
      )}
      {vacAn > 0 && (
        <div className="srow">
          <span>{lbl('vac','Haberes vacacionales')}</span>
          <span className="v" data-tip={`Total hab. vacacionales del período: ${fmt(vacAn)}`}>{fmt(vacAn)}</span>
          {Badge('vac')}
        </div>
      )}
      <div className="srow">
        <span><strong>{lbl('total_bruto','Total ingresos brutos{sfx}')}</strong></span>
        <span className="v" data-tip={
          [fmt(salAn), sacAn > 0 && `SAC ${fmt(sacAn)}`, vacAn > 0 && `vac ${fmt(vacAn)}`]
            .filter(Boolean).join(' + ') + ` = ${fmt(bruto)}`
        }>{fmt(bruto)}</span>
        {Badge('total_bruto')}
      </div>
      <div className="srow">
        <span>{lbl('total_aportes','Total aportes ({pApPct}%)')}</span>
        <span className="v" style={{ color: 'var(--red-dark)' }}
          data-tip={`${fmt(bruto)} × ${pApPct}% = ${fmt(aTotal)}`}>
          {fmt(-aTotal)}
        </span>
        {Badge('total_aportes')}
      </div>
      <div className="srow">
        <span>{lbl('total_deducciones','Total deducciones{sfx}')}</span>
        <span className="v" style={{ color: 'var(--red-dark)' }}
          data-tip={`Ded. personales ${fmt(dedPers.total)} + Art.85 ${fmt(caps.total)} = ${fmt(totalDed)}`}>
          {fmt(-totalDed)}
        </span>
        {Badge('total_deducciones')}
      </div>
      <div className="srow">
        <span>{lbl('impuesto_ganancias','Impuesto a las Ganancias{sfx}')}</span>
        <span className="v" style={{ color: 'var(--red-dark)' }}
          data-tip={`Escala Art.94 sobre GNSI ${fmt(baseAnual)}`}>
          {fmt(-impAnual)}
        </span>
        {Badge('impuesto_ganancias')}
      </div>
      <div className="srow net">
        <span>{lbl('neto_bolsillo_fila','Neto bolsillo{sfx}')}</span>
        <span className="v"
          data-tip={`${fmt(salAn)} × (1−${pApPct}%) − imp. ${fmt(impAnual)} = ${fmt(netoBolsillo)}`}>
          {fmt(netoBolsillo)}
        </span>
        {Badge('neto_bolsillo_fila')}
      </div>
      <div className="srow">
        <span>{lbl('tasa_efectiva','Tasa efectiva (impuesto ÷ bruto)')}</span>
        <span className="v"
          data-tip={`${fmt(impAnual)} ÷ ${fmt(bruto)} × 100 = ${tEfectiva.toFixed(2)}%`}>
          {pct(tEfectiva)}
        </span>
        {Badge('tasa_efectiva')}
      </div>
      <div className="srow">
        <span>{lbl('tasa_marginal','Tasa marginal')}</span>
        <span className="v"
          data-tip={`Tramo de la escala Art.94 que aplica al último peso de GNSI: ${tMarginal}%`}>
          {tMarginal}%
        </span>
        {Badge('tasa_marginal')}
      </div>
    </div>
  );
}
