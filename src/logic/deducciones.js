import { A } from '../constants/arca2026.js';

/**
 * Calcula las deducciones personales anuales (Art.30 LIG).
 *
 * @param {{ conyuge: number, hijos: number, hijosInc: number }} cargas
 * @returns {{ mni, esp, conyuge, hijos, hijosInc, total }}
 */
export function calcularDeduccionesPersonales({ conyuge, hijos, hijosInc }) {
  const mni     = A.MNI;
  const esp     = A.DED_ESP;
  const dConyu  = conyuge   * A.CONYUGE;
  const dHijos  = hijos     * A.HIJO;
  const dHInc   = hijosInc  * A.HIJO_INC;
  return {
    mni,
    esp,
    conyuge:  dConyu,
    hijos:    dHijos,
    hijosInc: dHInc,
    total:    mni + esp + dConyu + dHijos + dHInc,
  };
}

/**
 * Calcula los caps anuales para las deducciones Art.85, dado:
 *  - totales anuales por columna (suma de los 12 meses)
 *  - gNeta (ganancia neta anual, para el tope de prepaga)
 *
 * @param {{ alq, prep, dom, segv, segr, hip, otros }} anuales - totales anuales
 * @param {number} gNeta - ganancia neta anual
 * @returns objeto con cap y capHit para cada deducción
 */
export function calcularCapsAnuales({ alq, prep, dom, segv, segr, hip, otros40, otros100 }, gNeta) {
  const alqRaw    = alq    * 0.40;
  const alqCap    = Math.min(alqRaw,  A.MNI);
  const prepCap   = Math.min(prep,    gNeta * 0.05);
  const domCap    = Math.min(dom,     A.MNI);
  const segvCap   = Math.min(segv,    A.SEG_VIDA_TOPE);
  const segrCap   = Math.min(segr,    A.SEG_VIDA_TOPE);
  const hipCap    = Math.min(hip,     A.HIP_TOPE);
  // otros40: honorarios médicos, gastos educativos → 40% del bruto ingresado
  const otros40Cap  = (otros40  || 0) * 0.40;
  // otros100: indumentaria, col. profesionales, cajas provinciales, donaciones, sepelio → 100%
  const otros100Cap = (otros100 || 0) * 1.00;

  return {
    alq:     { cap: alqCap,     raw: alqRaw,    hit: alqCap    < alqRaw    },
    prep:    { cap: prepCap,    raw: prep,       hit: prepCap   < prep      },
    dom:     { cap: domCap,     raw: dom,        hit: domCap    < dom       },
    segv:    { cap: segvCap,    raw: segv,       hit: segvCap   < segv      },
    segr:    { cap: segrCap,    raw: segr,       hit: segrCap   < segr      },
    hip:     { cap: hipCap,     raw: hip,        hit: hipCap    < hip       },
    otros40:  { cap: otros40Cap,  raw: otros40  || 0, hit: false },
    otros100: { cap: otros100Cap, raw: otros100 || 0, hit: false },
    total: alqCap + prepCap + domCap + segvCap + segrCap + hipCap + otros40Cap + otros100Cap,
  };
}
