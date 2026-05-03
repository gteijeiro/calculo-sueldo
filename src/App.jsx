import React, { useState, useEffect, useMemo } from 'react';
import AppLCT from './AppLCT.jsx';
import AppLey26844 from './AppLey26844.jsx';
import SobreLaPagina from './components/SobreLaPagina.jsx';
import { getFeatures } from './constants/argentina.js';

const _params = new URLSearchParams(window.location.search);
// Debug mode solo si ?mode=debug en la URL
const IS_DEBUG = _params.get('mode') === 'debug';
const DOM_QUERY = _params.get('dom') === '1';

const MODULO_LCT = { id: 'lct',   label: '💼 Relación de dependencia', sublabel: 'LCT / Ley 27.743', color: 'var(--blue)' };
const MODULO_DOM = { id: 'dom',   label: '🏠 Personal doméstico',       sublabel: 'Ley 26.844',       color: 'var(--orange-dark)' };
const MODULO_INFO= { id: 'info',  label: 'ℹ️ Sobre la página',          sublabel: '',                  color: 'var(--gray-600)' };

export default function App() {
  const features    = getFeatures();
  const domHabilitado = DOM_QUERY || (features?.modulo_ley26844?.habilitado ?? false);

  const MODULOS = useMemo(() => {
    const list = [MODULO_LCT];
    if (domHabilitado) list.push(MODULO_DOM);
    list.push(MODULO_INFO);
    return list;
  }, [domHabilitado]);

  const [modulo, setModulo]       = useState(() => {
    const saved = localStorage.getItem('modulo') || 'lct';
    // Si el módulo guardado ya no está habilitado, volver a lct
    if (saved === 'dom' && !domHabilitado) return 'lct';
    return saved;
  });
  const [theme, setTheme]         = useState(() => localStorage.getItem('theme') || 'auto');
  const [showJsonMap, setShowJsonMap] = useState(false);

  useEffect(() => { localStorage.setItem('modulo', modulo); }, [modulo]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'auto' && prefersDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [theme]);

  useEffect(() => {
    if (theme !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = e => document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const cycleTheme = () => setTheme(t => t === 'auto' ? 'light' : t === 'light' ? 'dark' : 'auto');
  const themeLabel = theme === 'auto' ? '💻 Auto' : theme === 'light' ? '☀️ Claro' : '🌙 Oscuro';

  return (
    <>
      <div className="header">
        <div className="header-actions">
          {IS_DEBUG && (
            <button
              onClick={() => setShowJsonMap(v => !v)}
              title="Mostrar/ocultar mapa JSON (modo debug)"
              style={{
                background: showJsonMap ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: showJsonMap ? '#2b6cb0' : 'white',
                borderRadius: '6px', padding: '0.3rem 0.55rem',
                cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, lineHeight: 1,
              }}
            >&#123;&#125;</button>
          )}
          <button className={`theme-btn${theme !== 'auto' ? ' active' : ''}`} onClick={cycleTheme}>
            {themeLabel}
          </button>
        </div>

        <h1>Liquidación de Sueldos</h1>

        {/* Tabs de módulos */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.8rem', flexWrap: 'wrap' }}>
          {MODULOS.map(m => (
            <button
              key={m.id}
              onClick={() => setModulo(m.id)}
              style={{
                padding: '0.4rem 1.1rem', borderRadius: '8px', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.82rem', border: '2px solid',
                transition: 'all 0.15s',
                borderColor: modulo === m.id ? 'white' : 'rgba(255,255,255,0.35)',
                background:  modulo === m.id ? 'white' : 'rgba(255,255,255,0.12)',
                color:       modulo === m.id ? m.color : 'white',
              }}
            >
              {m.label}
              {m.sublabel && (
                <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 400, opacity: 0.8 }}>
                  {m.sublabel}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {modulo === 'lct'  && <AppLCT showJsonMap={showJsonMap} />}
      {modulo === 'dom'  && domHabilitado && <AppLey26844 showJsonMap={showJsonMap} />}
      {modulo === 'info' && <SobreLaPagina />}
    </>
  );
}
