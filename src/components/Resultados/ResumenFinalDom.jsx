import React from 'react';
import { fmt, pct } from '../../utils/format.js';

export default function ResumenFinalDom({ resultado }) {
  const {
    totalBruto, totalAporte, totalNeto, totalCostoEmp, totalCosto,
    totalSalAn, totalSacAn, totalVacAn, totalExtrasRem,
    pAp, pEmp, contribEmpDef = [],
  } = resultado;

  const pApPct  = Math.round(pAp  * 100);
  const pEmpPct = (pEmp * 100).toFixed(1);

  return (
    <div className="card">
      <div className="card-title">✅ Resultado final — Personal doméstico</div>

      {/* Cards */}
      <div className="result-grid">
        <div className="rbox green">
          <div className="amt"><span data-tip={`${fmt(totalBruto)} × (1−${pApPct}%) = ${fmt(totalNeto)}`}>{fmt(totalNeto)}</span></div>
          <div className="lbl">Neto trabajador</div>
        </div>
        <div className="rbox">
          <div className="amt"><span data-tip={`${fmt(totalBruto)} × ${pApPct}% = ${fmt(totalAporte)}`}>{fmt(totalAporte)}</span></div>
          <div className="lbl">Total aportes ({pApPct}%)</div>
        </div>
        <div className="rbox" style={{ borderColor: 'var(--orange-dark)', background: 'var(--orange-light)' }}>
          <div className="amt" style={{ color: 'var(--orange-dark)' }}>
            <span data-tip={`Bruto ${fmt(totalBruto)} + contrib. ${fmt(totalCostoEmp)} = ${fmt(totalCosto)}`}>{fmt(totalCosto)}</span>
          </div>
          <div className="lbl" style={{ color: 'var(--orange-dark)' }}>Costo total empleador</div>
        </div>
      </div>

      {/* Ingresos del trabajador */}
      <div style={{ fontWeight: 700, fontSize: '0.74rem', color: 'var(--blue-dark)',
        textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
        Liquidación del trabajador
      </div>
      <div className="srow"><span>Sueldos</span><span className="v">{fmt(totalSalAn)}</span></div>
      {totalExtrasRem > 0 && <div className="srow"><span>Extras remunerativos</span><span className="v">{fmt(totalExtrasRem)}</span></div>}
      {totalVacAn     > 0 && <div className="srow"><span>Haberes vacacionales <span style={{fontSize:'0.72rem',color:'var(--gray-400)'}}>Art.27 Ley 26.844</span></span><span className="v">{fmt(totalVacAn)}</span></div>}
      {totalSacAn     > 0 && <div className="srow"><span>SAC <span style={{fontSize:'0.72rem',color:'var(--gray-400)'}}>Art.33 Ley 26.844</span></span><span className="v">{fmt(totalSacAn)}</span></div>}
      <div className="srow"><span><strong>Total remunerativo bruto</strong></span><span className="v" style={{fontWeight:800}}>{fmt(totalBruto)}</span></div>
      <div className="srow">
        <span>Aportes trabajador ({pApPct}%)</span>
        <span className="v" style={{ color: 'var(--red-dark)' }} data-tip={`${fmt(totalBruto)} × ${pApPct}% = ${fmt(totalAporte)}`}>{fmt(-totalAporte)}</span>
      </div>
      <div className="srow net">
        <span>Neto trabajador</span>
        <span className="v">{fmt(totalNeto)}</span>
      </div>

      {/* Costo empleador */}
      <div style={{ fontWeight: 700, fontSize: '0.74rem', color: 'var(--orange-dark)',
        textTransform: 'uppercase', letterSpacing: '0.04em',
        marginBottom: '0.3rem', marginTop: '1rem',
        borderTop: '2px solid var(--orange-dark)', paddingTop: '0.6rem' }}>
        Costo empleador (referencia AFIP/SICOSS)
      </div>
      <div className="srow"><span>Remuneración bruta abonada</span><span className="v">{fmt(totalBruto)}</span></div>
      {contribEmpDef.map(c => {
        const monto = totalBruto * c.pct / 100;
        return (
          <div key={c.id} className="srow">
            <span>
              {c.label} ({c.pct}%)
              <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginLeft: 4 }}>{c.ley}</span>
              {c.nota && <span style={{ display:'block', fontSize:'0.7rem', color:'var(--gray-400)' }}>{c.nota}</span>}
            </span>
            <span className="v" style={{ color: 'var(--orange-dark)' }} data-tip={`${fmt(totalBruto)} × ${c.pct}% = ${fmt(monto)}`}>{fmt(monto)}</span>
          </div>
        );
      })}
      <div className="srow" style={{ fontWeight: 800, fontSize: '0.95rem' }}>
        <span style={{ color: 'var(--orange-dark)' }}>Costo total empleador</span>
        <span className="v" style={{ color: 'var(--orange-dark)' }} data-tip={`Bruto ${fmt(totalBruto)} + contrib. ${fmt(totalCostoEmp)} = ${fmt(totalCosto)}`}>{fmt(totalCosto)}</span>
      </div>
      <div className="srow">
        <span style={{ fontSize: '0.8rem' }}>Contribuciones como % del bruto</span>
        <span className="v" style={{ color: 'var(--orange-dark)', fontSize: '0.88rem' }}>~{pEmpPct}%</span>
      </div>
    </div>
  );
}
