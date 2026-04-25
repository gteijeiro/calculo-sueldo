/**
 * Formatea un número como peso argentino.
 * Negativo muestra "− $ X", positivo "$ X".
 */
export function fmt(n) {
  const s = Math.abs(Math.round(n)).toLocaleString('es-AR');
  return (n < 0 ? '− ' : '') + '$ ' + s;
}

/**
 * Formatea para retenciones con signo invertido para mostrar al usuario:
 * positivo (retiene) → "− $ X", negativo (devuelve) → "+ $ X", ~0 → "—"
 */
export function fmtSigned(n) {
  if (Math.abs(n) < 0.5) return '—';
  const s = Math.abs(Math.round(n)).toLocaleString('es-AR');
  return (n < 0 ? '+ $ ' : '− $ ') + s;
}

export function pct(n) {
  return n.toFixed(2).replace('.', ',') + '%';
}
