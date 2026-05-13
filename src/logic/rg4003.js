import { calcularImpuesto } from './impuesto.js';
import { MESES } from '../constants/arca2026.js';
import { ejecutar } from './formula.js';

export function calcularRG4003({
  sueldos, sacs, vacs, alqs, preps, doms, segvs, segrs, hips, otrs40s, otrs100s,
  extrasRem = [],
  pAp, dPers, caps, excluirEspAp2 = false,
}) {
  const resultado = [];
  let impPrev = 0;
  let sueldoAcum = 0, sacAcum = 0, vacAcum = 0;
  let alqAcum = 0, prepAcum = 0, domAcum = 0;
  let segVAcum = 0, segRAcum = 0, hipAcum = 0;
  let otros40Run = 0, otros100Run = 0;

  for (let m = 0; m < 12; m++) {
    const extraRemM = extrasRem[m] || 0;
    sueldoAcum += sueldos[m] + extraRemM;
    sacAcum    += sacs[m];
    vacAcum    += vacs[m];
    const brutoAcum = sueldoAcum + sacAcum + vacAcum;
    const gNetaAcum = ejecutar('ganancia_neta', { bruto: brutoAcum, pAp });

    const dPersAcum    = ejecutar('prorrateo_deduccion_personal', { dedAnual: dPers, mes: m });
    const dedEspAp2Acum = excluirEspAp2 ? 0 : ejecutar('ded_esp_ap2', { dPersAcum });

    const alq_m  = ejecutar('deduccion_mensual_con_cap', { importeMes: alqs[m],  pctDeducible: 0.40, capRestante: caps.alq.cap  - alqAcum  }); alqAcum  += alq_m;
    const prep_m = ejecutar('deduccion_mensual_con_cap', { importeMes: preps[m], pctDeducible: 1.00, capRestante: caps.prep.cap - prepAcum }); prepAcum += prep_m;
    const dom_m  = ejecutar('deduccion_mensual_con_cap', { importeMes: doms[m],  pctDeducible: 1.00, capRestante: caps.dom.cap  - domAcum  }); domAcum  += dom_m;
    const segV_m = ejecutar('deduccion_mensual_con_cap', { importeMes: segvs[m], pctDeducible: 1.00, capRestante: caps.segv.cap - segVAcum }); segVAcum += segV_m;
    const segR_m = ejecutar('deduccion_mensual_con_cap', { importeMes: segrs[m], pctDeducible: 1.00, capRestante: caps.segr.cap - segRAcum }); segRAcum += segR_m;
    const hip_m  = ejecutar('deduccion_mensual_con_cap', { importeMes: hips[m],  pctDeducible: 1.00, capRestante: caps.hip.cap  - hipAcum  }); hipAcum  += hip_m;

    const o40_bruto = (otrs40s  || [])[m] || 0;
    const o40_m     = ejecutar('deduccion_mensual_con_cap', { importeMes: o40_bruto,  pctDeducible: 0.40, capRestante: caps.otros40.cap  - otros40Run  }); otros40Run  += o40_m;
    const o100_bruto = (otrs100s || [])[m] || 0;
    const o100_m     = ejecutar('deduccion_mensual_con_cap', { importeMes: o100_bruto, pctDeducible: 1.00, capRestante: caps.otros100.cap - otros100Run }); otros100Run += o100_m;

    const otrsAcum     = otros40Run + otros100Run;
    const dedArt85Acum = alqAcum + prepAcum + domAcum + segVAcum + segRAcum + hipAcum + otrsAcum;
    const dedTotalAcum = dPersAcum + dedEspAp2Acum + dedArt85Acum;
    const baseAcum     = ejecutar('base_imponible',   { gNeta: gNetaAcum, dedTotal: dedTotalAcum });
    const impAcum      = calcularImpuesto(baseAcum);
    const retencion_m  = ejecutar('retencion_mensual', { impAcum, impPrev });
    impPrev = impAcum;

    const baseSueldo = sueldos[m] + extraRemM + vacs[m];
    const aporteMes  = ejecutar('total_aportes', { bruto: baseSueldo, pAp });
    const netoMes_   = ejecutar('neto_mes',      { sueldo: sueldos[m] + extraRemM, vac: vacs[m], pAp, retencion: retencion_m });

    resultado.push({
      mes: MESES[m], sueldo: sueldos[m], extraRem: extraRemM, sac: sacs[m], vac: vacs[m],
      ingreso: sueldos[m] + extraRemM + sacs[m] + vacs[m],
      ingresoSinSac: baseSueldo,
      sueldoAcum, sacAcum, vacAcum, aporte: aporteMes,
      brutoAcum, gNetaAcum, dPersAcum, dedEspAp2Acum,
      dedArt85Acum, dedTotalAcum,
      alqAcum, prepAcum, domAcum, segVAcum, segRAcum, hipAcum,
      otros40Acum: otros40Run, otros100Acum: otros100Run, otrsAcum,
      alqMes: alq_m, prepMes: prep_m, domMes: dom_m,
      segVMes: segV_m, segRMes: segR_m, hipMes: hip_m,
      otros40Mes: o40_m, otros40BrutoMes: o40_bruto,
      otros100Mes: o100_m, otros100BrutoMes: o100_bruto,
      otrsMes: o40_m + o100_m,
      gnsiAcum: baseAcum, impAcum, retencion: retencion_m, neto: netoMes_,
    });
  }
  return resultado;
}
