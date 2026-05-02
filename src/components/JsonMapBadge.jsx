import React from 'react';
import { getFormula } from '../logic/formula.js';

export default function JsonMapBadge({ visible, path, variable, defaultValue, ley, formulaId, formulaExpresion }) {
  if (!visible) return null;
  const formula = formulaId ? getFormula(formulaId) : null;
  const exprDisplay = formula
    ? (formula.expresionActual ?? formula.expresion)
    : formulaExpresion ?? null;
  return (
    <div style={{
      marginTop: '3px',
      fontSize: '0.67rem',
      fontFamily: 'monospace',
      background: '#ebf8ff',
      border: '1px solid #bee3f8',
      borderRadius: 4,
      padding: '0.25rem 0.5rem',
      color: '#2b6cb0',
      lineHeight: 1.7,
    }}>
      <div>
        <span style={{ opacity: 0.65 }}>argentina.json → </span>
        <strong>{path}</strong>
        {variable      && <span style={{ marginLeft: 8, color: '#276749' }}>var: <strong>{variable}</strong></span>}
        {defaultValue !== undefined && <span style={{ marginLeft: 8, opacity: 0.75 }}>default: <strong>{JSON.stringify(defaultValue)}</strong></span>}
        {ley           && <span style={{ marginLeft: 8, opacity: 0.55 }}>{ley}</span>}
      </div>
      {exprDisplay && (
        <div style={{ marginTop: '2px', color: '#744210', borderTop: '1px dashed #bee3f8', paddingTop: '2px' }}>
          <span style={{ opacity: 0.65 }}>fórmula: </span>
          {formulaId && <strong style={{ color: '#c05621' }}>{formulaId} </strong>}
          <span style={{ color: '#553c1c', opacity: 0.9 }}>= </span>
          <code style={{ background: '#fefcbf', color: '#744210', padding: '0 3px', borderRadius: 3, fontSize: '0.65rem' }}>
            {exprDisplay}
          </code>
        </div>
      )}
    </div>
  );
}
