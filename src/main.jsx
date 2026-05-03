import React from 'react';
import { createRoot } from 'react-dom/client';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import App from './App.jsx';
import './App.css';
import { _initArca }       from './constants/arca2026.js';
import { _initConvenios }  from './constants/convenios.js';
import { _initArgentina }  from './constants/argentina.js';
import { _initFormulas }   from './logic/formula.js';
import { _initLey26844 }   from './components/DatosFormDom.jsx';

Promise.all([
  fetch('/argentina.json').then(r => r.json()),
  fetch('/argentina-ley26844.json').then(r => r.json()),
]).then(([data, data26844]) => {
  _initArca(data.arca2026);
  _initFormulas(data.formulas);  // fórmulas genéricas primero
  _initArgentina(data);          // registra fórmulas de deducciones Argentina
  _initConvenios(data.convenios);
  _initLey26844(data26844);
  createRoot(document.getElementById('root')).render(<><App /><SpeedInsights /><Analytics /></>);
}).catch(err => {
  document.getElementById('root').innerHTML =
    `<div style="padding:2rem;color:red;font-family:monospace">
      Error cargando datos: ${err.message}
    </div>`;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
