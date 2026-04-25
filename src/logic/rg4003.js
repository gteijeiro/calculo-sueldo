import { calcularImpuesto } from './impuesto.js';
import { MESES } from '../constants/arca2026.js';

/**
 * Calcula la retención mes a mes según RG 4003/2017 (método acumulado).
 *
 * Deducciones personales: prorrateadas (M+1)/12.
 * Deducción Especial Ap.2 (RG 5531/2024): dPersAcum(M) / 12 adicional.
 * Deducciones Art.85: acumuladas mes a mes hasta cap anual.
 * otros40/otros100: acumulados mes a mes con 40%/100% aplicado al bruto ingresado.
 */
export function calcularRG4003({
  sueldos, sacs, vacs, alqs, preps, doms, segvs, segrs, hips, otrs40s, otrs100s,
  pAp, dPers, caps, excluirEspAp2 = false,
}) {
  const resultado = [];
  let impPrev    = 0;
  let sueldoAcum = 0, sacAcum = 0, vacAcum = 0;
  let alqAcum    = 0, prepAcum   = 0, domAcum    = 0;
  let segVAcum   = 0, segRAcum   = 0, hipAcum    = 0;
  let otros40Run = 0, otros100Run = 0;

  for (let m = 0; m < 12; m++) {
    // Bruto acumulado (incremental)
    sueldoAcum += sueldos[m];
    sacAcum    += sacs[m];
    vacAcum    += vacs[m];
    const brutoAcum = sueldoAcum + sacAcum + vacAcum;
    const gNetaAcum = brutoAcum * (1 - pAp);

    // Deducciones personales: prorrateo (M+1)/12
    const frac      = (m + 1) / 12;
    const dPersAcum = dPers * frac;

    // Deducción Especial Ap.2 Art.30 c) RG 5531/2024:
    const dedEspAp2Acum = excluirEspAp2 ? 0 : dPersAcum / 12;

    // Art.85 — acumular mes a mes hasta cap anual
    const alq_m = Math.max(0, Math.min(alqs[m] * 0.40, caps.alq.cap - alqAcum));
    alqAcum += alq_m;

    const prep_m = Math.max(0, Math.min(preps[m], caps.prep.cap - prepAcum));
    prepAcum += prep_m;

    const dom_m = Math.max(0, Math.min(doms[m], caps.dom.cap - domAcum));
    domAcum += dom_m;

    const segV_m = Math.max(0, Math.min(segvs[m], caps.segv.cap - segVAcum));
    segVAcum += segV_m;

    const segR_m = Math.max(0, Math.min(segrs[m], caps.segr.cap - segRAcum));
    segRAcum += segR_m;

    const hip_m = Math.max(0, Math.min(hips[m], caps.hip.cap - hipAcum));
    hipAcum += hip_m;

    // Otros (40%): acumular mes a mes, aplicar 40% al bruto ingresado
    const o40_bruto = (otrs40s  || [])[m] || 0;
    const o40_m     = Math.max(0, Math.min(o40_bruto * 0.40, caps.otros40.cap - otros40Run));
    otros40Run += o40_m;

    // Otros (100%): acumular mes a mes, 100% del bruto ingresado
    const o100_bruto = (otrs100s || [])[m] || 0;
    const o100_m     = Math.max(0, Math.min(o100_bruto * 1.00, caps.otros100.cap - otros100Run));
    otros100Run += o100_m;

    const otrsAcum = otros40Run + otros100Run;

    const dedArt85Acum = alqAcum + prepAcum + domAcum + segVAcum + segRAcum + hipAcum + otrsAcum;
    const dedTotalAcum = dPersAcum + dedEspAp2Acum + dedArt85Acum;
    const baseAcum     = Math.max(0, gNetaAcum - dedTotalAcum);
    const impAcum      = calcularImpuesto(baseAcum);

    const retencion_m = impAcum - impPrev;
    impPrev = impAcum;

    const aporteMes = (sueldos[m] + sacs[m] + vacs[m]) * pAp;
    const netoMes   = (sueldos[m] + vacs[m]) * (1 - pAp) - Math.max(0, retencion_m);

    resultado.push({
      mes:     MESES[m],
      sueldo:  sueldos[m],
      sac:     sacs[m],
      vac:     vacs[m],
      ingreso: sueldos[m] + sacs[m] + vacs[m],
      // acumulados por componente (para desglose en UI)
      sueldoAcum, sacAcum, vacAcum,
      aporte:  aporteMes,
      // acumulados
      brutoAcum,
      gNetaAcum,
      dPersAcum,
      dedEspAp2Acum,
      dedArt85Acum,
      dedTotalAcum,
      alqAcum,  prepAcum,  domAcum,
      segVAcum, segRAcum,  hipAcum,
      otros40Acum: otros40Run,
      otros100Acum: otros100Run,
      otrsAcum,
      // contribución del mes (para tooltips)
      alqMes:     alq_m,
      prepMes:    prep_m,
      domMes:     dom_m,
      segVMes:    segV_m,
      segRMes:    segR_m,
      hipMes:     hip_m,
      otros40Mes:  o40_m,
      otros40BrutoMes: o40_bruto,
      otros100Mes: o100_m,
      otros100BrutoMes: o100_bruto,
      otrsMes:    o40_m + o100_m,
      gnsiAcum:  baseAcum,
      impAcum,
      retencion: retencion_m,
      neto:      netoMes,
    });
  }

  return resultado;
}
