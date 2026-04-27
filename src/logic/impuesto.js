import { A } from '../constants/arca2026.js';
import { ejecutar } from './formula.js';

export function calcularImpuesto(sujeta) {
  if (sujeta <= 0) return 0;
  for (const t of A.ESCALA) {
    if (sujeta <= t.h) return ejecutar('impuesto_por_tramo', { cf: t.cf, gnsi: sujeta, d: t.d, p: t.p });
  }
  return 0;
}

export function encontrarTramo(gnsi) {
  if (gnsi <= 0) return null;
  for (let i = 0; i < A.ESCALA.length; i++) {
    if (gnsi <= A.ESCALA[i].h) return i;
  }
  return A.ESCALA.length - 1;
}

export function detalleEscala(gnsi) {
  return A.ESCALA.map(t => {
    if (gnsi <= t.d) return { d: t.d, h: t.h, p: t.p, excedente: 0, impuesto: 0, estado: 'inactive' };
    const techo     = t.h === Infinity ? gnsi : t.h;
    const excedente = ejecutar('excedente_en_tramo', { gnsi, techo, d: t.d });
    const impuesto  = ejecutar('impuesto_excedente',  { excedente, p: t.p });
    const estado    = t.h !== Infinity && gnsi >= t.h ? 'full' : 'partial';
    return { d: t.d, h: t.h, p: t.p, excedente, impuesto, estado };
  });
}
