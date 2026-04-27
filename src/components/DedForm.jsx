import React, { useState, useCallback } from 'react';
import { A } from '../constants/arca2026.js';

const MESES_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function fmt(n) {
  return '$ ' + Math.round(n).toLocaleString('es-AR');
}

// Calculado en render (no en módulo) — A se llena después de _initArca
function buildRecurring() {
  return [
    { key: 'prep', label: 'Prepaga / Med. privada', icon: '🏥', pct: 100,
      capInfo: '100% del importe · tope 5% de la ganancia neta anual' },
    { key: 'dom',  label: 'Personal doméstico',     icon: '🧹', pct: 100,
      capInfo: `100% del importe · tope anual MNI (${fmt(A.MNI)})` },
    { key: 'segv', label: 'Seguro de vida',          icon: '🛡️', pct: 100,
      capInfo: `100% del importe · tope ${fmt(A.SEG_VIDA_TOPE)} por año` },
    { key: 'segr', label: 'Seguro de retiro',        icon: '📋', pct: 100,
      capInfo: `100% del importe · tope ${fmt(A.SEG_VIDA_TOPE)} por año` },
    { key: 'hip',  label: 'Crédito hipotecario',     icon: '🏦', pct: 100,
      capInfo: `Intereses · tope $ ${A.HIP_TOPE.toLocaleString('es-AR')} por año` },
  ];
}

const OTROS_SUBTIPOS = {
  '40': [
    { id: 'medico',    label: 'Honorarios médicos / dentista' },
    { id: 'educacion', label: 'Educación hijos (Art. 85 h)' },
    { id: 'otro40',    label: 'Otro (40%)' },
  ],
  '100': [
    { id: 'indumentaria', label: 'Indumentaria de trabajo' },
    { id: 'colegio_prof', label: 'Colegio profesional' },
    { id: 'donaciones',   label: 'Donaciones (Art. 85 c)' },
    { id: 'sepelio',      label: 'Gastos de sepelio' },
    { id: 'caja_prov',    label: 'Caja provincial / mutual' },
    { id: 'otro100',      label: 'Otro (100%)' },
  ],
};

const newTramo = () => ({ id: Date.now() + Math.random(), importe: 0, meses: [] });

const emptyConfig = () => ({
  alq:  { tramos: [newTramo()] },
  prep: { importe: 0, meses: [] },
  dom:  { importe: 0, meses: [] },
  segv: { importe: 0, meses: [] },
  segr: { importe: 0, meses: [] },
  hip:  { importe: 0, meses: [] },
  otros: [],
});

function configToDedData(cfg) {
  const recurring = buildRecurring();
  return Array(12).fill(null).map((_, i) => {
    const row = {};
    row.alq = cfg.alq.tramos.reduce((s, t) =>
      s + (t.meses.includes(i) ? (t.importe || 0) : 0), 0);
    for (const d of recurring) {
      row[d.key] = cfg[d.key].meses.includes(i) ? (cfg[d.key].importe || 0) : 0;
    }
    row.otros40  = cfg.otros.filter(o => o.tipo === '40'  && o.mes === i).reduce((s, o) => s + (o.importe || 0), 0);
    row.otros100 = cfg.otros.filter(o => o.tipo === '100' && o.mes === i).reduce((s, o) => s + (o.importe || 0), 0);
    return row;
  });
}

export default function DedForm({ onChange }) {
  const RECURRING = buildRecurring();
  const [cfg, setCfg] = useState(emptyConfig);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const emit = useCallback((newCfg) => onChange(configToDedData(newCfg)), [onChange]);

  // ── Helpers para RECURRING ──
  const setRec = (key, field, value) => {
    const newCfg = { ...cfg, [key]: { ...cfg[key], [field]: value } };
    setCfg(newCfg); emit(newCfg);
  };
  const toggleMes = (key, i) => {
    const cur = cfg[key].meses;
    const meses = cur.includes(i) ? cur.filter(m => m !== i) : [...cur, i].sort((a, b) => a - b);
    setRec(key, 'meses', meses);
  };
  const setAllMeses = (key) => {
    const all = cfg[key].meses.length === 12 ? [] : [...Array(12).keys()];
    setRec(key, 'meses', all);
  };

  // ── Helpers para alquiler multi-tramo ──
  const addTramo = () => {
    const newCfg = { ...cfg, alq: { tramos: [...cfg.alq.tramos, newTramo()] } };
    setCfg(newCfg); emit(newCfg);
  };
  const delTramo = (id) => {
    let tramos = cfg.alq.tramos.filter(t => t.id !== id);
    if (tramos.length === 0) tramos = [newTramo()];
    const newCfg = { ...cfg, alq: { tramos } };
    setCfg(newCfg); emit(newCfg);
  };
  const setTramo = (id, field, val) => {
    const tramos = cfg.alq.tramos.map(t => t.id === id ? { ...t, [field]: val } : t);
    const newCfg = { ...cfg, alq: { tramos } };
    setCfg(newCfg); emit(newCfg);
  };
  const toggleTramoMes = (id, mesIdx) => {
    const tramos = cfg.alq.tramos.map(t => {
      if (t.id !== id) return t;
      const meses = t.meses.includes(mesIdx)
        ? t.meses.filter(m => m !== mesIdx)
        : [...t.meses, mesIdx].sort((a, b) => a - b);
      return { ...t, meses };
    });
    const newCfg = { ...cfg, alq: { tramos } };
    setCfg(newCfg); emit(newCfg);
  };
  const setAllTramoMes = (id) => {
    const tramo = cfg.alq.tramos.find(t => t.id === id);
    const meses = tramo.meses.length === 12 ? [] : [...Array(12).keys()];
    setTramo(id, 'meses', meses);
  };

  // ── Otros ──
  const addOtro = (tipo) => {
    const item = { id: Date.now(), tipo, subtipo: OTROS_SUBTIPOS[tipo][0].id, mes: 0, importe: 0 };
    const newCfg = { ...cfg, otros: [...cfg.otros, item] };
    setCfg(newCfg); emit(newCfg);
  };
  const updOtro = (id, field, val) => {
    const newCfg = { ...cfg, otros: cfg.otros.map(o => o.id === id ? { ...o, [field]: val } : o) };
    setCfg(newCfg); emit(newCfg);
  };
  const delOtro = (id) => {
    const newCfg = { ...cfg, otros: cfg.otros.filter(o => o.id !== id) };
    setCfg(newCfg); emit(newCfg);
  };
  const limpiar = () => { const c = emptyConfig(); setCfg(c); emit(c); };

  // ── Badge ──
  const alqActivo = cfg.alq.tramos.some(t => t.importe > 0 && t.meses.length > 0);
  const activosRec = RECURRING.filter(d => cfg[d.key].importe > 0 && cfg[d.key].meses.length > 0);
  const activosOtros = cfg.otros.filter(o => o.importe > 0);
  const totalActivos = (alqActivo ? 1 : 0) + activosRec.length + (activosOtros.length > 0 ? 1 : 0);

  // Alquiler total anual
  const alqTotalAnual = cfg.alq.tramos.reduce((s, t) => s + t.importe * 0.4 * t.meses.length, 0);

  const toggleExp = (key) => setExpanded(expanded === key ? null : key);

  const MesBtn = ({ active, onClick, label }) => (
    <button onClick={onClick} style={{
      padding: '0.25rem 0.48rem', borderRadius: '5px', cursor: 'pointer',
      border: '1.5px solid', minWidth: '36px', fontSize: '0.74rem', fontWeight: 700,
      borderColor: active ? 'var(--blue)' : 'var(--border)',
      background: active ? 'var(--blue)' : 'var(--bg-input)',
      color: active ? 'white' : 'var(--text-sub)',
    }}>{label}</button>
  );

  return (
    <div className="card">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: open ? '1rem' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className="card-title" style={{ marginBottom: 0 }}>
            🧾 Deducciones adicionales (Art. 85)
          </div>
          {totalActivos > 0 && (
            <span style={{ background: 'var(--blue)', color: 'white', borderRadius: '12px',
              padding: '0.1rem 0.55rem', fontSize: '0.73rem', fontWeight: 700 }}>
              {totalActivos}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {totalActivos > 0 && open && (
            <button onClick={limpiar} style={{
              fontSize: '0.75rem', padding: '0.3rem 0.7rem', borderRadius: '5px',
              border: '1px solid var(--border)', background: 'var(--bg-card)',
              cursor: 'pointer', color: 'var(--text-sub)',
            }}>✕ Limpiar</button>
          )}
          <button onClick={() => setOpen(o => !o)} style={{
            background: open ? 'var(--gray-100)' : 'var(--blue)', color: open ? 'var(--text-sub)' : 'white',
            border: 'none', borderRadius: '6px', padding: '0.35rem 1rem',
            fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
          }}>
            {open ? '▲ Cerrar' : (totalActivos > 0 ? '✏️ Editar' : '＋ Agregar')}
          </button>
        </div>
      </div>

      {/* Resumen colapsado */}
      {!open && totalActivos > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {alqActivo && (
            <span style={{ fontSize: '0.75rem', background: 'var(--blue-light)',
              border: '1px solid var(--blue)', borderRadius: '5px', padding: '0.2rem 0.5rem',
              color: 'var(--blue-dark)' }}>
              🏠 Alquiler: {fmt(alqTotalAnual)} (anual 40%)
            </span>
          )}
          {activosRec.map(d => (
            <span key={d.key} style={{ fontSize: '0.75rem', background: 'var(--blue-light)',
              border: '1px solid var(--blue)', borderRadius: '5px', padding: '0.2rem 0.5rem',
              color: 'var(--blue-dark)' }}>
              {d.icon} {d.label}: {fmt(d.pct === 40 ? cfg[d.key].importe * 0.4 : cfg[d.key].importe)} × {cfg[d.key].meses.length}m
            </span>
          ))}
          {activosOtros.length > 0 && (
            <span style={{ fontSize: '0.75rem', background: 'var(--green-light)',
              border: '1px solid var(--green-dark)', borderRadius: '5px', padding: '0.2rem 0.5rem',
              color: 'var(--green-dark)' }}>
              📂 Otros: {activosOtros.length} item{activosOtros.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
      {!open && totalActivos === 0 && (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
          Alquiler, prepaga, doméstico, seguros, hipoteca y otros.
        </p>
      )}

      {/* Panel expandido */}
      {open && (
        <div>

          {/* ── ALQUILER (multi-tramo) ── */}
          <div style={{
            border: '1.5px solid', marginBottom: '0.5rem', borderRadius: '8px',
            borderColor: alqActivo ? 'var(--blue)' : 'var(--border)',
            background: alqActivo ? 'var(--blue-light)' : 'var(--bg-card)',
            overflow: 'hidden',
          }}>
            <div onClick={() => toggleExp('alq')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.65rem 1rem', cursor: 'pointer', userSelect: 'none' }}>
              <span style={{ fontSize: '1rem' }}>🏠</span>
              <span style={{ fontWeight: 600, fontSize: '0.86rem', flex: 1 }}>Alquiler</span>
              {alqActivo ? (
                <span style={{ fontSize: '0.77rem', color: 'var(--blue-dark)',
                  fontFamily: 'monospace', background: 'var(--blue-light)', padding: '0.15rem 0.4rem',
                  borderRadius: '4px', border: '1px solid var(--blue)' }}>
                  {cfg.alq.tramos.filter(t => t.importe > 0).length} tramo{cfg.alq.tramos.filter(t => t.importe > 0).length > 1 ? 's' : ''} · {fmt(alqTotalAnual)} (40% anual)
                </span>
              ) : (
                <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>sin valor</span>
              )}
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {expanded === 'alq' ? '▲' : '▼'}
              </span>
            </div>

            {expanded === 'alq' && (
              <div style={{ padding: '0.8rem 1rem 1rem', borderTop: `1px solid var(--border)`,
                background: 'var(--bg-card-alt)' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0 0 0.7rem' }}>
                  40% del importe · tope anual MNI ({fmt(A.MNI)}).
                  Podés agregar tramos con diferentes montos para distintos períodos del año.
                </p>

                {cfg.alq.tramos.map((tramo, tIdx) => {
                  const applied = tramo.importe * 0.4;
                  const totalTramo = applied * tramo.meses.length;
                  return (
                    <div key={tramo.id} style={{
                      border: `1px solid var(--border)`, borderRadius: '7px',
                      padding: '0.7rem 0.9rem', marginBottom: '0.6rem',
                      background: 'var(--bg-card)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem',
                        marginBottom: '0.7rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-sub)',
                          background: 'var(--gray-100)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          Tramo {tIdx + 1}
                        </span>
                        <label style={{ fontSize: '0.83rem', fontWeight: 600, margin: 0 }}>
                          Importe mensual
                        </label>
                        <input
                          type="number" value={tramo.importe || ''} placeholder="0" min="0"
                          onChange={e => setTramo(tramo.id, 'importe', parseFloat(e.target.value) || 0)}
                          style={{ width: '150px', padding: '0.3rem 0.5rem',
                            border: `1.5px solid var(--border)`, borderRadius: '6px',
                            fontSize: '0.85rem', fontFamily: 'monospace',
                            background: 'var(--bg-input)', color: 'var(--text-main)' }}
                        />
                        {tramo.importe > 0 && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--blue-dark)', fontWeight: 600 }}>
                            → 40% = {fmt(applied)}/mes
                          </span>
                        )}
                        {cfg.alq.tramos.length > 1 && (
                          <button onClick={() => delTramo(tramo.id)} style={{
                            marginLeft: 'auto', background: 'none', border: 'none',
                            cursor: 'pointer', color: 'var(--red-dark)', fontSize: '1.1rem', lineHeight: 1,
                          }}>✕</button>
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.83rem', fontWeight: 600 }}>Meses que aplica</span>
                          <button onClick={() => setAllTramoMes(tramo.id)} style={{
                            fontSize: '0.7rem', padding: '0.15rem 0.55rem', borderRadius: '4px',
                            cursor: 'pointer', border: `1px solid var(--blue)`,
                            background: tramo.meses.length === 12 ? 'var(--blue)' : 'var(--bg-card)',
                            color: tramo.meses.length === 12 ? 'white' : 'var(--blue)',
                          }}>
                            {tramo.meses.length === 12 ? '✓ Todos' : 'Todos'}
                          </button>
                          {tramo.meses.length > 0 && tramo.meses.length < 12 && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {tramo.meses.length} seleccionado{tramo.meses.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {MESES_SHORT.map((m, i) => (
                            <MesBtn key={i} active={tramo.meses.includes(i)}
                              onClick={() => toggleTramoMes(tramo.id, i)} label={m} />
                          ))}
                        </div>
                      </div>

                      {tramo.importe > 0 && tramo.meses.length > 0 && (
                        <div style={{ marginTop: '0.6rem', background: 'var(--blue-light)',
                          borderRadius: '5px', padding: '0.35rem 0.7rem',
                          fontSize: '0.78rem', color: 'var(--blue-dark)' }}>
                          <strong>Tramo {tIdx+1}:</strong> {fmt(tramo.importe)} × 40% = {fmt(applied)} ×{' '}
                          {tramo.meses.length} mes{tramo.meses.length > 1 ? 'es' : ''} = <strong>{fmt(totalTramo)}</strong>
                          <span style={{ opacity: 0.7 }}> (antes de topes)</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                <button onClick={addTramo} style={{
                  padding: '0.35rem 0.9rem', fontSize: '0.79rem', fontWeight: 600,
                  cursor: 'pointer', border: `1.5px dashed var(--blue)`, borderRadius: '6px',
                  background: 'var(--bg-card)', color: 'var(--blue)', width: '100%',
                }}>
                  ＋ Agregar tramo (distinto monto para otro período)
                </button>

                {alqActivo && (
                  <div style={{ marginTop: '0.7rem', background: 'var(--blue-light)',
                    borderRadius: '6px', padding: '0.45rem 0.8rem',
                    fontSize: '0.8rem', color: 'var(--blue-dark)' }}>
                    <strong>Total anual deducible:</strong> {fmt(alqTotalAnual)}
                    <span style={{ opacity: 0.7, marginLeft: '0.4rem' }}>(antes de topes Art. 85)</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── DEDUCCIONES RECURRENTES ── */}
          {RECURRING.map(def => {
            const dc = cfg[def.key];
            const isExp = expanded === def.key;
            const hasVal = dc.importe > 0 && dc.meses.length > 0;
            const applied = def.pct === 40 ? dc.importe * 0.4 : dc.importe;
            const totalAnual = applied * dc.meses.length;

            return (
              <div key={def.key} style={{
                border: '1.5px solid', marginBottom: '0.5rem', borderRadius: '8px',
                borderColor: hasVal ? 'var(--blue)' : 'var(--border)',
                background: hasVal ? 'var(--blue-light)' : 'var(--bg-card)',
                overflow: 'hidden',
              }}>
                <div onClick={() => toggleExp(def.key)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.65rem 1rem', cursor: 'pointer', userSelect: 'none' }}>
                  <span style={{ fontSize: '1rem' }}>{def.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.86rem', flex: 1 }}>{def.label}</span>
                  {hasVal ? (
                    <span style={{ fontSize: '0.77rem', color: 'var(--blue-dark)',
                      fontFamily: 'monospace', background: 'var(--blue-light)', padding: '0.15rem 0.4rem',
                      borderRadius: '4px', border: '1px solid var(--blue)' }}>
                      {fmt(applied)} × {dc.meses.length}m = {fmt(totalAnual)}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>sin valor</span>
                  )}
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{isExp ? '▲' : '▼'}</span>
                </div>

                {isExp && (
                  <div style={{ padding: '0.8rem 1rem 1rem', borderTop: `1px solid var(--border)`,
                    background: 'var(--bg-card-alt)' }}>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0 0 0.7rem' }}>
                      {def.capInfo}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem',
                      marginBottom: '0.9rem', flexWrap: 'wrap' }}>
                      <label style={{ fontSize: '0.84rem', fontWeight: 600, whiteSpace: 'nowrap', margin: 0 }}>
                        Importe mensual
                      </label>
                      <input type="number" value={dc.importe || ''} placeholder="0" min="0"
                        onChange={e => setRec(def.key, 'importe', parseFloat(e.target.value) || 0)}
                        style={{ width: '160px', padding: '0.35rem 0.6rem',
                          border: `1.5px solid var(--border)`, borderRadius: '6px',
                          fontSize: '0.85rem', fontFamily: 'monospace',
                          background: 'var(--bg-input)', color: 'var(--text-main)' }} />
                      {dc.importe > 0 && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--blue-dark)', fontWeight: 600 }}>
                          {def.pct === 40
                            ? `→ 40% = ${fmt(dc.importe * 0.4)} deducible/mes`
                            : `→ ${fmt(dc.importe)} deducible/mes`}
                        </span>
                      )}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Meses que aplica</span>
                        <button onClick={() => setAllMeses(def.key)} style={{
                          fontSize: '0.7rem', padding: '0.15rem 0.55rem', borderRadius: '4px',
                          cursor: 'pointer', border: `1px solid var(--blue)`,
                          background: dc.meses.length === 12 ? 'var(--blue)' : 'var(--bg-card)',
                          color: dc.meses.length === 12 ? 'white' : 'var(--blue)',
                        }}>
                          {dc.meses.length === 12 ? '✓ Todos' : 'Todos'}
                        </button>
                        {dc.meses.length > 0 && dc.meses.length < 12 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {dc.meses.length} seleccionado{dc.meses.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {MESES_SHORT.map((m, i) => (
                          <MesBtn key={i} active={dc.meses.includes(i)}
                            onClick={() => toggleMes(def.key, i)} label={m} />
                        ))}
                      </div>
                    </div>

                    {dc.importe > 0 && dc.meses.length > 0 && (
                      <div style={{ marginTop: '0.7rem', background: 'var(--blue-light)',
                        borderRadius: '6px', padding: '0.45rem 0.8rem',
                        fontSize: '0.8rem', color: 'var(--blue-dark)' }}>
                        {def.pct === 40
                          ? <><strong>Total anual deducible:</strong> {fmt(dc.importe)} × 40% = {fmt(dc.importe * 0.4)} × {dc.meses.length}m = <strong>{fmt(totalAnual)}</strong></>
                          : <><strong>Total anual deducible:</strong> {fmt(dc.importe)} × {dc.meses.length}m = <strong>{fmt(totalAnual)}</strong></>
                        }
                        <span style={{ opacity: 0.7, marginLeft: '0.4rem' }}>(antes de topes Art. 85)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* ── OTROS ── */}
          <div style={{
            border: '1.5px solid', borderRadius: '8px', overflow: 'hidden',
            borderColor: activosOtros.length > 0 ? 'var(--green-dark)' : 'var(--border)',
            background: activosOtros.length > 0 ? 'var(--green-light)' : 'var(--bg-card)',
          }}>
            <div onClick={() => toggleExp('otros')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.65rem 1rem', cursor: 'pointer', userSelect: 'none' }}>
              <span style={{ fontSize: '1rem' }}>📂</span>
              <span style={{ fontWeight: 600, fontSize: '0.86rem', flex: 1 }}>
                Otros — honorarios médicos, indumentaria, donaciones…
              </span>
              {activosOtros.length > 0 ? (
                <span style={{ fontSize: '0.77rem', color: 'var(--green-dark)',
                  background: 'var(--green-light)', padding: '0.15rem 0.4rem', borderRadius: '4px',
                  border: '1px solid var(--green-dark)' }}>
                  {activosOtros.length} item{activosOtros.length > 1 ? 's' : ''}
                </span>
              ) : (
                <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>sin items</span>
              )}
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {expanded === 'otros' ? '▲' : '▼'}
              </span>
            </div>

            {expanded === 'otros' && (
              <div style={{ padding: '0.8rem 1rem 1rem', borderTop: `1px solid var(--border)`,
                background: 'var(--bg-card-alt)' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                  <button onClick={() => addOtro('40')} style={{
                    padding: '0.32rem 0.8rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                    border: `1.5px solid var(--blue)`, borderRadius: '6px',
                    background: 'var(--blue-light)', color: 'var(--blue-dark)',
                  }}>＋ Agregar 40% — hon. médicos / educación</button>
                  <button onClick={() => addOtro('100')} style={{
                    padding: '0.32rem 0.8rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                    border: `1.5px solid var(--green-dark)`, borderRadius: '6px',
                    background: 'var(--green-light)', color: 'var(--green-dark)',
                  }}>＋ Agregar 100% — indumentaria / donaciones</button>
                </div>

                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  <strong>40%:</strong> Honorarios médicos, gastos educativos hijos. &nbsp;
                  <strong>100%:</strong> Indumentaria laboral, col. profesional, donaciones, sepelio.
                </div>

                {cfg.otros.length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)',
                    fontSize: '0.78rem', padding: '0.6rem 0' }}>
                    Sin items. Usá los botones de arriba para agregar.
                  </p>
                )}

                {cfg.otros.map(item => (
                  <div key={item.id} style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto auto auto auto',
                    alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 0.7rem', marginBottom: '0.4rem', borderRadius: '6px',
                    border: '1px solid',
                    borderColor: item.tipo === '40' ? 'var(--blue)' : 'var(--green-dark)',
                    background: item.tipo === '40' ? 'var(--blue-light)' : 'var(--green-light)',
                  }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem',
                      borderRadius: '4px', whiteSpace: 'nowrap',
                      background: item.tipo === '40' ? 'var(--blue)' : 'var(--green-dark)', color: 'white',
                    }}>{item.tipo}%</span>
                    <select value={item.subtipo} onChange={e => updOtro(item.id, 'subtipo', e.target.value)}
                      style={{ fontSize: '0.79rem', padding: '0.25rem 0.4rem',
                        border: `1px solid var(--border)`, borderRadius: '5px', width: '100%',
                        background: 'var(--bg-input)', color: 'var(--text-main)' }}>
                      {OTROS_SUBTIPOS[item.tipo].map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                    <select value={item.mes} onChange={e => updOtro(item.id, 'mes', parseInt(e.target.value))}
                      style={{ fontSize: '0.79rem', padding: '0.25rem 0.4rem',
                        border: `1px solid var(--border)`, borderRadius: '5px', width: '72px',
                        background: 'var(--bg-input)', color: 'var(--text-main)' }}>
                      {MESES_SHORT.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <input type="number" value={item.importe || ''} placeholder="0" min="0"
                      onChange={e => updOtro(item.id, 'importe', parseFloat(e.target.value) || 0)}
                      style={{ width: '130px', padding: '0.25rem 0.5rem',
                        border: `1px solid var(--border)`, borderRadius: '5px',
                        fontSize: '0.8rem', fontFamily: 'monospace',
                        background: 'var(--bg-input)', color: 'var(--text-main)' }} />
                    <span style={{ fontSize: '0.77rem', fontFamily: 'monospace',
                      color: 'var(--text-sub)', whiteSpace: 'nowrap', minWidth: '120px' }}>
                      {item.importe > 0
                        ? item.tipo === '40' ? `→ 40% = ${fmt(item.importe * 0.4)}` : `→ ${fmt(item.importe)}`
                        : ''}
                    </span>
                    <button onClick={() => delOtro(item.id)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--red-dark)', fontSize: '1.1rem', lineHeight: 1, padding: '0 0.2rem',
                    }}>✕</button>
                  </div>
                ))}

                {activosOtros.length > 0 && (
                  <div style={{ marginTop: '0.6rem', background: 'var(--green-light)',
                    borderRadius: '6px', padding: '0.45rem 0.8rem',
                    fontSize: '0.8rem', color: 'var(--green-dark)' }}>
                    <strong>Total 40%:</strong> {fmt(cfg.otros.filter(o => o.tipo === '40').reduce((s, o) => s + o.importe * 0.4, 0))}
                    &nbsp;·&nbsp;
                    <strong>Total 100%:</strong> {fmt(cfg.otros.filter(o => o.tipo === '100').reduce((s, o) => s + o.importe, 0))}
                    <span style={{ opacity: 0.7, marginLeft: '0.4rem' }}>(antes de topes Art. 85)</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
