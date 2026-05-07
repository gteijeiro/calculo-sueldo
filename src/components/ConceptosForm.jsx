import React, { useState } from 'react';
import { getArgentina } from '../constants/argentina.js';

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function parseMonto(v) {
  const s = String(v).trim().replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) || n < 0 ? 0 : n;
}

function fmtMini(n) {
  if (!n) return '';
  return '$ ' + Math.round(n).toLocaleString('es-AR');
}

function ConceptoTabla({ conceptos, conceptosData, onChange, activos, onToggle, colorHead, nota, sueldoPorMes, divisorHE }) {
  const activosList = conceptos.filter(c => activos[c.id]);

  return (
    <div style={{ marginBottom: '1.2rem' }}>
      {/* Selector de conceptos */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>
        {conceptos.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => onToggle(c.id)}
            title={c.ley}
            style={{
              padding: '0.2rem 0.6rem', borderRadius: '999px',
              fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer',
              border: `1.5px solid ${activos[c.id] ? colorHead : 'var(--gray-300)'}`,
              background: activos[c.id] ? colorHead : 'var(--bg-card)',
              color: activos[c.id] ? 'white' : 'var(--gray-500)',
              transition: 'all 0.15s',
            }}
          >
            {c.icon} {c.label}
            {c.incluye_sac === false && activos[c.id] && (
              <span style={{ marginLeft: 4, opacity: 0.75, fontSize: '0.65rem' }}>⚠️SAC</span>
            )}
          </button>
        ))}
      </div>

      {nota && (
        <div style={{ fontSize: '0.71rem', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>{nota}</div>
      )}

      {/* Tabla per-mes × concepto activo */}
      {activosList.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: '0.8rem', width: '100%', minWidth: `${180 + activosList.length * 120}px` }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0.3rem 0.5rem', background: 'var(--gray-100)',
                  fontSize: '0.7rem', fontWeight: 700, color: 'var(--gray-600)', minWidth: '60px' }}>
                  Mes
                </th>
                {activosList.map(c => (
                  <th key={c.id} style={{ padding: '0.3rem 0.4rem', background: 'var(--gray-100)',
                    fontSize: '0.7rem', color: colorHead, fontWeight: 700, textAlign: 'right', minWidth: '110px' }}
                    title={c.ley}>
                    {c.icon} {c.label}
                  </th>
                ))}
                {activosList.length > 1 && (
                  <th style={{ padding: '0.3rem 0.4rem', background: 'var(--gray-100)',
                    fontSize: '0.7rem', color: 'var(--gray-500)', textAlign: 'right', minWidth: '70px' }}>
                    Total mes
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {MESES.map((mes, i) => {
                const m = conceptosData[i] || {};
                const sueldoMes = sueldoPorMes?.[i] || 0;
                const dHE = divisorHE || 200;
                const totalMes = activosList.reduce((s, c) => {
                  if (c.tipoInput === 'horas') {
                    return s + (sueldoMes / dHE) * (c.factorHE || 1) * (m[c.id] || 0);
                  }
                  return s + (m[c.id] || 0);
                }, 0);
                return (
                  <tr key={mes} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                    <td style={{ padding: '0.2rem 0.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{mes}</td>
                    {activosList.map(c => {
                      const esHoras = c.tipoInput === 'horas';
                      const horas = m[c.id] || 0;
                      const importePreview = esHoras && sueldoMes
                        ? (sueldoMes / dHE) * (c.factorHE || 1) * horas
                        : 0;
                      return (
                        <td key={c.id} style={{ padding: '0.15rem 0.3rem' }}>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={m[c.id] ? String(esHoras ? m[c.id] : Math.round(m[c.id])) : ''}
                            placeholder="0"
                            onChange={e => {
                              const v = parseMonto(e.target.value);
                              const next = conceptosData.map((row, ri) =>
                                ri === i ? { ...row, [c.id]: v } : row
                              );
                              onChange(next);
                            }}
                            style={{
                              width: '100%', textAlign: 'right', padding: '0.2rem 0.4rem',
                              border: '1.5px solid var(--gray-200)', borderRadius: '4px',
                              fontSize: '0.8rem', background: 'var(--bg-input, white)',
                              color: 'var(--text-main)',
                            }}
                          />
                          {esHoras && importePreview > 0 && (
                            <div style={{ fontSize: '0.68rem', color: colorHead, textAlign: 'right',
                              fontFamily: 'monospace', marginTop: '1px' }}>
                              {fmtMini(importePreview)}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    {activosList.length > 1 && (
                      <td style={{ padding: '0.2rem 0.4rem', textAlign: 'right',
                        fontFamily: 'monospace', fontSize: '0.74rem',
                        color: totalMes > 0 ? colorHead : 'var(--gray-300)', fontWeight: 700 }}>
                        {totalMes > 0 ? fmtMini(totalMes) : '—'}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ConceptosForm({ conceptosData, onChange, conceptosDef, sueldoPorMes, divisorHE = 200, onChangeDivisorHE }) {
  const [open, setOpen]     = useState(true);
  const [activos, setActivos] = useState({});

  const arg   = getArgentina();
  const rem   = conceptosDef?.rem   ?? arg?.conceptos_remunerativos   ?? [];
  const noRem = conceptosDef?.noRem ?? arg?.conceptos_no_remunerativos ?? [];

  const hayActivos = Object.values(activos).some(Boolean);
  const hayValores = conceptosData.some(m => Object.values(m).some(v => v > 0));

  const toggleActivo = id =>
    setActivos(a => ({ ...a, [id]: !a[id] }));

  return (
    <div className="card">
      <div
        className="card-title"
        style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', justifyContent: 'space-between' }}
        onClick={() => setOpen(o => !o)}
      >
        <span>
          📋 Conceptos adicionales del recibo
          {hayValores && <span style={{ color: 'var(--blue)', fontSize: '0.78rem', marginLeft: 8 }}>● con valores</span>}
        </span>
        <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--gray-400)' }}>
          {open ? '▲ ocultar' : '▼ expandir'}
        </span>
      </div>

      {open && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--gray-500)', marginBottom: '1rem', lineHeight: 1.6 }}>
            Activá los conceptos que necesitás (clic en el botón) y cargá el importe por mes.
          </div>

          <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--green-dark)',
            textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem',
            borderBottom: '2px solid var(--green-dark)', paddingBottom: '0.2rem' }}>
            🟢 Remunerativos
          </div>
          {rem.some(c => c.tipoInput === 'horas') && onChangeDivisorHE && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-sub)', whiteSpace: 'nowrap' }}>
                Divisor HE (horas/mes):
              </label>
              <input
                type="number"
                min="1"
                value={divisorHE}
                onChange={e => onChangeDivisorHE(Number(e.target.value) || 200)}
                style={{ width: '70px', padding: '0.2rem 0.4rem', border: '1.5px solid var(--border)',
                  borderRadius: '5px', fontSize: '0.82rem', background: 'var(--bg-input)',
                  color: 'var(--text-main)', textAlign: 'right' }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Valor hora = sueldo ÷ {divisorHE} · HE50 ×1.5 · HE100 ×2.0
              </span>
            </div>
          )}
          <ConceptoTabla
            conceptos={rem}
            conceptosData={conceptosData}
            onChange={onChange}
            activos={activos}
            onToggle={toggleActivo}
            colorHead="var(--green-dark)"
            nota="Generan aportes (jub + OS + PAMI) · computan en Ganancias. ⚠️SAC = no computa en mejor sueldo semestral (horas extras)."
            sueldoPorMes={sueldoPorMes}
            divisorHE={divisorHE}
          />

          <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--orange-dark)',
            textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem',
            borderBottom: '2px solid var(--orange-dark)', paddingBottom: '0.2rem', marginTop: '0.5rem' }}>
            🟡 No remunerativos
          </div>
          <ConceptoTabla
            conceptos={noRem}
            conceptosData={conceptosData}
            onChange={onChange}
            activos={activos}
            onToggle={toggleActivo}
            colorHead="var(--orange-dark)"
            nota="Sin aportes · sin impacto en Ganancias · aparecen en el recibo."
            sueldoPorMes={sueldoPorMes}
            divisorHE={divisorHE}
          />
        </div>
      )}
    </div>
  );
}
