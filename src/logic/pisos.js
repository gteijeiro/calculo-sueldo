import { A, ESCENARIOS_PISO } from '../constants/arca2026.js';

/**
 * Calcula el piso de sueldo bruto mensual para un escenario dado.
 * Piso = deducciones_anuales / (12 × (1 − pAp))
 * Con pAp = 17% (default ARCA: 11% + 3% + 3%)
 *
 * @param {{ c, h, i }} escenario - cónyuge, hijos, hijosInc (conteos)
 * @param {number} pAp - % aportes (fracción), default 0.17
 * @returns {{ dedAnual, pisoMensual }}
 */
export function calcularPiso({ c, h, i }, pAp = 0.17) {
  const ded = A.MNI + A.DED_ESP + c * A.CONYUGE + h * A.HIJO + i * A.HIJO_INC;
  return {
    dedAnual:     ded,
    pisoMensual:  ded / (12 * (1 - pAp)),
  };
}

/**
 * Calcula pisos para todos los escenarios predefinidos.
 * @param {number} pAp - % aportes (fracción), default 0.17
 * @returns Array con { lbl, dedAnual, pisoMensual }
 */
export function calcularTodosLosPisos(pAp = 0.17) {
  return ESCENARIOS_PISO.map(e => ({
    lbl: e.lbl,
    ...calcularPiso(e, pAp),
  }));
}
