import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './App.css';
import { _initArca }       from './constants/arca2026.js';
import { _initConvenios }  from './constants/convenios.js';
import { _initArgentina }  from './constants/argentina.js';
import { _initFormulas }   from './logic/formula.js';

Promise.all([
  fetch('/arca2026.json').then(r => r.json()),
  fetch('/formulas.json').then(r => r.json()),
  fetch('/convenios.json').then(r => r.json()),
  fetch('/argentina.json').then(r => r.json()),
]).then(([arcaData, formulasData, conveniosData, argData]) => {
  _initArca(arcaData);
  _initFormulas(formulasData);   // fórmulas genéricas primero
  _initArgentina(argData);       // registra fórmulas de deducciones Argentina
  _initConvenios(conveniosData);
  createRoot(document.getElementById('root')).render(<App />);
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
