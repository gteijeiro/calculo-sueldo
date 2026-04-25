import React, { useState } from 'react';
import { calcularTodosLosPisos } from '../logic/pisos.js';
import { fmt } from '../utils/format.js';
import { ESCENARIOS_PISO } from '../constants/arca2026.js';

export default function PisoTable({ onLoadConfig }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(null);
  const pisos = calcularTodosLosPisos(0.17);

  const handleLoad = (p, e, idx) => {
    onLoadConfig?.({ conyuge: e.c, hijos: e.h, hijosInc: e.i, pisoMensual: p.pisoMensual });
    setLoaded(idx);
    setTimeout(() => setLoaded(null), 2000);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: open ? '1rem' : 0 }}>
        <div>
          <div className="card-title" style={{ marginBottom: 0 }}>
            📊 ¿Desde qué sueldo se paga Ganancias en 2026?
          </div>
          {!open && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              Pisos según situación familiar · Aportes 17% · Sin deducciones adicionales
            </p>
          )}
        </div>
        <button onClick={() => setOpen(o => !o)} style={{
          background: open ? 'var(--gray-100)' : 'var(--blue-light)',
          color: open ? 'var(--text-sub)' : 'var(--blue)',
          border: `1.5px solid ${open ? 'var(--border)' : 'var(--blue)'}`,
          borderRadius: '6px', padding: '0.35rem 0.85rem', fontSize: '0.8rem',
          fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {open ? '▲ Cerrar' : '▼ Ver tabla'}
        </button>
      </div>

      {open && (
        <>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
            Sin deducciones adicionales · Con SAC · Aportes 17% · Hacé clic en "Usar" para cargar la situación familiar en el formulario.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table className="piso-table">
              <thead>
                <tr>
                  <th>Situación familiar</th>
                  <th>Deducciones anuales</th>
                  <th>Piso bruto mensual</th>
                  <th style={{ textAlign: 'center' }}>Cargar datos</th>
                </tr>
              </thead>
              <tbody>
                {pisos.map((p, idx) => {
                  const e = ESCENARIOS_PISO[idx];
                  const isLoaded = loaded === idx;
                  return (
                    <tr key={p.lbl}>
                      <td>{p.lbl}</td>
                      <td>{fmt(p.dedAnual)}</td>
                      <td>{fmt(p.pisoMensual)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleLoad(p, e, idx)}
                          style={{
                            fontSize: '0.72rem', padding: '0.22rem 0.65rem', cursor: 'pointer',
                            borderRadius: '5px', border: '1.5px solid',
                            fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.15s',
                            borderColor: isLoaded ? 'var(--green-dark)' : 'var(--blue)',
                            background: isLoaded ? 'var(--green-light)' : 'var(--blue-light)',
                            color: isLoaded ? 'var(--green-dark)' : 'var(--blue)',
                          }}>
                          {isLoaded ? '✓ Cargado' : 'Usar →'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
            * Piso mensual = deducciones ÷ (12 × 0,83). Criterio ARCA — coincide con valores publicados H1 2026.
          </p>
        </>
      )}
    </div>
  );
}
