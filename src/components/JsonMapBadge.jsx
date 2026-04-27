import React from 'react';

/**
 * Muestra debajo de un input el path del JSON de argentina y el valor default.
 * Solo visible cuando showJsonMap=true.
 */
export default function JsonMapBadge({ visible, path, variable, defaultValue, ley, formulaId }) {
  if (!visible) return null;
  return (
    <div style={{
      marginTop: '3px',
      fontSize: '0.67rem',
      fontFamily: 'monospace',
      background: '#ebf8ff',
      border: '1px solid #bee3f8',
      borderRadius: 4,
      padding: '0.2rem 0.5rem',
      color: '#2b6cb0',
      lineHeight: 1.5,
    }}>
      <span style={{ opacity: 0.65 }}>argentina.json → </span>
      <strong>{path}</strong>
      {variable  && <span style={{ marginLeft: 8, color: '#276749' }}>var: <strong>{variable}</strong></span>}
      {defaultValue !== undefined && <span style={{ marginLeft: 8, opacity: 0.75 }}>default: <strong>{JSON.stringify(defaultValue)}</strong></span>}
      {formulaId && <span style={{ marginLeft: 8, color: '#c05621' }}>fórmula: <strong>{formulaId}</strong></span>}
      {ley       && <span style={{ marginLeft: 8, opacity: 0.55 }}>{ley}</span>}
    </div>
  );
}
