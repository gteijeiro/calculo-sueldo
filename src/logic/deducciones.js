import { A } from '../constants/arca2026.js';
import { ejecutar } from './formula.js';

export function calcularDeduccionesPersonales({ conyuge, hijos, hijosInc }) {
  const mni    = A.MNI;
  const esp    = A.DED_ESP;
  const dConyu = ejecutar('deduccion_familiar', { cantidad: conyuge,  tasaDeduccion: A.CONYUGE  });
  const dHijos = ejecutar('deduccion_familiar', { cantidad: hijos,    tasaDeduccion: A.HIJO     });
  const dHInc  = ejecutar('deduccion_familiar', { cantidad: hijosInc, tasaDeduccion: A.HIJO_INC });
  return {
    mni, esp, conyuge: dConyu, hijos: dHijos, hijosInc: dHInc,
    total: ejecutar('total_deducciones_personales', { mni, esp, conyuge: dConyu, hijos: dHijos, hijosInc: dHInc }),
  };
}

export function calcularCapsAnuales({ alq, prep, dom, segv, segr, hip, otros40, otros100 }, gNeta) {
  const alqRaw    = (alq || 0) * 0.40;
  const alqCap    = ejecutar('cap_alquiler',      { alquilerAnual: alq  || 0, MNI: A.MNI });
  const prepCap   = ejecutar('cap_prepaga',       { prepagaAnual:  prep || 0, gananciaNeta: gNeta });
  const domCap    = ejecutar('cap_con_tope',      { importeAnual:  dom  || 0, tope: A.MNI });
  const segvCap   = ejecutar('cap_con_tope',      { importeAnual:  segv || 0, tope: A.SEG_VIDA_TOPE });
  const segrCap   = ejecutar('cap_con_tope',      { importeAnual:  segr || 0, tope: A.SEG_VIDA_TOPE });
  const hipCap    = ejecutar('cap_con_tope',      { importeAnual:  hip  || 0, tope: A.HIP_TOPE });
  const otros40Cap  = ejecutar('cap_con_porcentaje', { importeAnual: otros40  || 0, pctDeducible: 0.40 });
  const otros100Cap = ejecutar('cap_con_porcentaje', { importeAnual: otros100 || 0, pctDeducible: 1.00 });
  return {
    alq:     { cap: alqCap,    raw: alqRaw,       hit: alqCap  < alqRaw        },
    prep:    { cap: prepCap,   raw: prep  || 0,   hit: prepCap < (prep  || 0)  },
    dom:     { cap: domCap,    raw: dom   || 0,   hit: domCap  < (dom   || 0)  },
    segv:    { cap: segvCap,   raw: segv  || 0,   hit: segvCap < (segv  || 0)  },
    segr:    { cap: segrCap,   raw: segr  || 0,   hit: segrCap < (segr  || 0)  },
    hip:     { cap: hipCap,    raw: hip   || 0,   hit: hipCap  < (hip   || 0)  },
    otros40:  { cap: otros40Cap,  raw: otros40  || 0, hit: false },
    otros100: { cap: otros100Cap, raw: otros100 || 0, hit: false },
    total: alqCap + prepCap + domCap + segvCap + segrCap + hipCap + otros40Cap + otros100Cap,
  };
}
