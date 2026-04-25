import { A } from '../constants/arca2026.js';

/**
 * Calcula el impuesto determinado sobre la ganancia neta sujeta a impuesto.
 * Aplica la escala progresiva Art.94 LIG (Ley 27.743).
 *
 * @param {number} sujeta - GNSI (base imponible), debe ser >= 0
 * @returns {number} impuesto determinado
 */
export function calcularImpuesto(sujeta) {
  if (sujeta <= 0) return 0;
  for (const t of A.ESCALA) {
    if (sujeta <= t.h) return t.cf + (sujeta - t.d) * t.p / 100;
  }
  return 0;
}

/**
 * Encuentra el índice del tramo de la escala que contiene la GNSI dada.
 * @param {number} gnsi
 * @returns {number|null} índice del tramo, o null si gnsi <= 0
 */
export function encontrarTramo(gnsi) {
  if (gnsi <= 0) return null;
  for (let i = 0; i < A.ESCALA.length; i++) {
    if (gnsi <= A.ESCALA[i].h) return i;
  }
  return A.ESCALA.length - 1;
}

/**
 * Construye el detalle fila por fila de la escala progresiva.
 * @param {number} gnsi - GNSI anual
 * @returns {Array} filas con { rango, alicuota, excedente, impuesto, estado }
 *   estado: 'inactive' | 'full' | 'partial'
 */
export function detalleEscala(gnsi) {
  return A.ESCALA.map(t => {
    if (gnsi <= t.d) {
      return { d: t.d, h: t.h, p: t.p, excedente: 0, impuesto: 0, estado: 'inactive' };
    }
    const techo  = t.h === Infinity ? gnsi : t.h;
    const exc    = Math.min(gnsi, techo) - t.d;
    const imp    = exc * t.p / 100;
    const estado = t.h !== Infinity && gnsi >= t.h ? 'full' : 'partial';
    return { d: t.d, h: t.h, p: t.p, excedente: exc, impuesto: imp, estado };
  });
}
