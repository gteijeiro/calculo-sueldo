import { A, ESCENARIOS_PISO } from '../constants/arca2026.js';
import { ejecutar } from './formula.js';

export function calcularPiso({ c, h, i }, pAp = 0.17) {
  const mni     = A.MNI;
  const esp     = A.DED_ESP;
  const conyuge = ejecutar('deduccion_familiar', { cantidad: c, tasaDeduccion: A.CONYUGE  });
  const hijos   = ejecutar('deduccion_familiar', { cantidad: h, tasaDeduccion: A.HIJO     });
  const hInc    = ejecutar('deduccion_familiar', { cantidad: i, tasaDeduccion: A.HIJO_INC });
  const dedAnual = ejecutar('total_deducciones_personales', { mni, esp, conyuge, hijos, hijosInc: hInc });
  return { dedAnual, pisoMensual: ejecutar('piso_sueldo', { dedAnual, pAp }) };
}

export function calcularTodosLosPisos(pAp = 0.17) {
  return ESCENARIOS_PISO.map(e => ({ lbl: e.lbl, ...calcularPiso(e, pAp) }));
}
