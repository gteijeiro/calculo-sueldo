/**
 * Orquestador principal del cálculo.
 * Toma la configuración y los datos mensuales, devuelve todos los resultados.
 */
import { A } from '../constants/arca2026.js';
import { calcularIngresos, totalesAnualesDed } from './ingresos.js';
import { calcularDeduccionesPersonales, calcularCapsAnuales } from './deducciones.js';
import { calcularImpuesto, encontrarTramo, detalleEscala } from './impuesto.js';
import { calcularRG4003 } from './rg4003.js';

// Conceptos remunerativos que computan para SAC (excluye horas extras - Art.121 LCT)
const KEYS_REM     = ['he50','he100','comisiones','antiguedad','presentismo','guardia','premios','otrosRem'];
const KEYS_SAC     = ['comisiones','antiguedad','presentismo','guardia','premios','otrosRem'];
const KEYS_NO_REM  = ['viaticos','snrParitaria','snrEmergencia','beneficios','herramientas','otrosNoRem'];

function sumaKeys(obj, keys) {
  return keys.reduce((s, k) => s + (obj?.[k] || 0), 0);
}

/**
 * SAC auto-cálculo (RG 4003, Art.16):
 * Cada mes agrega la doceava parte de la mejor remuneración acumulada
 * hasta ese mes en el semestre correspondiente.
 *
 * La base SAC = sueldo + extras con incluye_sac=true (excluye HE) + vacaciones.
 * HE excluidas: no son remuneración "normal y habitual" (Art.121 LCT).
 */
function autoCalcSAC(sueldos, vacs, sacsOrig) {
  const sacs = [...sacsOrig];
  const autoCalc = { junio: false, diciembre: false };

  // H1: índices 0–5
  if (sacs[5] === 0) {
    let mejorH1 = 0;
    for (let m = 0; m < 6; m++) {
      mejorH1 = Math.max(mejorH1, sueldos[m] + vacs[m]);
      sacs[m] += mejorH1 / 12;
    }
    if (mejorH1 > 0) autoCalc.junio = true;
  }

  // H2: índices 6–11
  if (sacs[11] === 0) {
    let mejorH2 = 0;
    for (let m = 6; m < 12; m++) {
      mejorH2 = Math.max(mejorH2, sueldos[m] + vacs[m]);
      sacs[m] += mejorH2 / 12;
    }
    if (mejorH2 > 0) autoCalc.diciembre = true;
  }

  return { sacs, autoCalc };
}

/**
 * @param {Object} config
 * @param {number} config.pJubilacion  - % jubilación (0–100)
 * @param {number} config.pObraSocial  - % obra social (0–100)
 * @param {number} config.pPAMI        - % PAMI (0–100)
 * @param {number} config.conyuge      - 0 o 1
 * @param {number} config.hijos        - entero >= 0
 * @param {number} config.hijosInc     - entero >= 0
 *
 * @param {Array}  mesData - array[12] de { s, sac, vac, alq, prep, dom, segv, segr, hip, otros }
 *
 * @returns {Object} resultado completo
 */
export function calcular(config, mesData, overrides = {}) {
  const { pJubilacion, pObraSocial, pPAMI, conyuge, hijos, hijosInc } = config;

  // Extras por mes
  const extrasRem   = mesData.map(m => sumaKeys(m, KEYS_REM));
  const extrasSac   = mesData.map(m => sumaKeys(m, KEYS_SAC));
  const extrasNoRem = mesData.map(m => sumaKeys(m, KEYS_NO_REM));

  const sueldosBase = mesData.map(m => m.s || 0);
  const sueldos     = sueldosBase;          // alias para ganancias (base puro)
  const sacsOrig    = mesData.map(m => m.sac || 0);
  // Haberes vacacionales = sueldo del mes ÷ 25 × días de vacaciones
  const diasVacs = mesData.map(m => m.diasVac || 0);
  const vacs     = sueldos.map((s, i) => s / 25 * diasVacs[i]);
  const alqs     = mesData.map(m => m.alq  || 0);
  const preps    = mesData.map(m => m.prep || 0);
  const doms     = mesData.map(m => m.dom  || 0);
  const segvs    = mesData.map(m => m.segv || 0);
  const segrs    = mesData.map(m => m.segr || 0);
  const hips     = mesData.map(m => m.hip  || 0);
  const otrs40s  = mesData.map(m => m.otros40  || 0);
  const otrs100s = mesData.map(m => m.otros100 || 0);

  // Ingresos — aplicar overrides de aportes
  const jubilacion = (overrides.jubilacion ? 0 : pJubilacion) / 100;
  const obraSocial = (overrides.obraSocial ? 0 : pObraSocial) / 100;
  const pami       = (overrides.pami       ? 0 : pPAMI)       / 100;

  // vacImporte: importe vacacional ya calculado externamente (cobra adelantado)
  // Tiene precedencia sobre diasVac si está presente y > 0
  const vacsFinales = mesData.map((m, i) =>
    m.vacImporte != null ? m.vacImporte : vacs[i]
  );

  // SAC: base = sueldo + extras con incluye_sac (excluye HE) + vacaciones
  const sueldosParaSac = sueldos.map((s, i) => s + extrasSac[i]);
  const { sacs, autoCalc } = autoCalcSAC(sueldosParaSac, vacsFinales, sacsOrig);

  // Ingresos totales = base + extras remunerativos + SAC + vac
  const sueldosTotalRem = sueldos.map((s, i) => s + extrasRem[i]);
  const { salAn, sacAn, vacAn, bruto, pAp, aTotal, gNeta } =
    calcularIngresos(sueldosTotalRem, sacs, vacsFinales, { jubilacion, obraSocial, pami });

  if (bruto <= 0) return null;

  // Deducciones personales — aplicar overrides
  const dedPersRaw = calcularDeduccionesPersonales({
    conyuge:   overrides.conyuge   ? 0 : conyuge,
    hijos:     overrides.hijos     ? 0 : hijos,
    hijosInc:  overrides.hijosInc  ? 0 : hijosInc,
  });
  const dedPers = {
    ...dedPersRaw,
    mni:   overrides.mni ? 0 : dedPersRaw.mni,
    esp:   overrides.esp ? 0 : dedPersRaw.esp,
    total: (overrides.mni ? 0 : dedPersRaw.mni)
         + (overrides.esp ? 0 : dedPersRaw.esp)
         + dedPersRaw.conyuge + dedPersRaw.hijos + dedPersRaw.hijosInc,
  };

  // Totales anuales columnas de deducciones
  const anDed = totalesAnualesDed(mesData);

  // Caps anuales Art.85
  const caps = calcularCapsAnuales(anDed, gNeta);

  // Base imponible anual y escala
  const baseAnual = Math.max(0, gNeta - dedPers.total - caps.total);
  const impAnual  = calcularImpuesto(baseAnual);
  const escala    = detalleEscala(baseAnual);

  // RG 4003: detalle mensual (sueldos = base; extrasRem se suma internamente)
  const detalleM = calcularRG4003({
    sueldos, sacs, vacs: vacsFinales, alqs, preps, doms, segvs, segrs, hips,
    otrs40s, otrs100s, extrasRem,
    pAp, dPers: dedPers.total, caps,
    excluirEspAp2: !!overrides.dedEspAp2,
  });

  // Totales retenciones
  const totalRetenido = detalleM.reduce((a, d) => a + Math.max(0, d.retencion), 0);
  const totalDevuelto = detalleM.reduce((a, d) => a + Math.min(0, d.retencion), 0);

  // Para periodos parciales (hastaHoy), usar el acumulado del último mes activo
  // en lugar del cálculo anual completo (que usa deducciones anuales contra ingresos parciales)
  const lastActiveIdx = detalleM.reduce((last, d, i) => d.ingreso > 0 ? i : last, -1);
  const impEfectivo  = lastActiveIdx >= 0 ? detalleM[lastActiveIdx].impAcum  : impAnual;
  const baseEfectivo = lastActiveIdx >= 0 ? detalleM[lastActiveIdx].gnsiAcum : baseAnual;
  const tramoIdx     = encontrarTramo(baseEfectivo);

  // Tasas
  const tEfectiva = bruto > 0 ? (impEfectivo / bruto) * 100 : 0;

  // Enriquecer detalleM con extras no-rem por mes (sólo para display en recibo)
  detalleM.forEach((d, i) => { d.extraNoRem = extrasNoRem[i] || 0; });

  return {
    // Ingresos
    salAn, sacAn, vacAn, bruto, pAp, aTotal, gNeta,
    // SAC auto-cálculo
    sacAutoCalc: autoCalc,
    sacUsados: sacs,
    diasVacs,
    vacs,
    // Deducciones personales
    dedPers,
    // Caps Art.85
    caps, anDed,
    // Base y escala anuales (efectivo = último mes activo para periodos parciales)
    baseAnual: baseEfectivo, impAnual: impEfectivo, escala, tramoIdx,
    // Tasas
    tEfectiva,
    tMarginal: tramoIdx !== null ? A.ESCALA[tramoIdx].p : 0,
    // Detalle mensual RG 4003
    detalleM, totalRetenido, totalDevuelto,
    // Config usada
    config: { pJubilacion, pObraSocial, pPAMI, conyuge, hijos, hijosInc },
  };
}
