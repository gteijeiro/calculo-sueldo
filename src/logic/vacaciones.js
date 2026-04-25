/**
 * Días de cada mes en 2026 (no bisiesto).
 * Usado cuando el empleador usa días reales del mes como divisor del sueldo.
 */
export const DIAS_MES_2026 = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Distribuye los días de vacaciones por mes del año 2026.
 * LCT Art.150: días corridos (calendario).
 */
export function distribuirVacacionesPorMes(fechaInicio, cantDias) {
  const result = Array(12).fill(0);
  if (!fechaInicio || cantDias <= 0) return result;
  const inicio = new Date(fechaInicio + 'T12:00:00');
  for (let d = 0; d < cantDias; d++) {
    const fecha = new Date(inicio);
    fecha.setDate(inicio.getDate() + d);
    if (fecha.getFullYear() === 2026) result[fecha.getMonth()]++;
  }
  return result;
}

/**
 * Valor día de vacaciones = sueldo / 25 (LCT Art.155)
 */
export function haberVacacional(sueldoBase, diasEnMes) {
  if (!sueldoBase || !diasEnMes) return 0;
  return (sueldoBase / 25) * diasEnMes;
}

/**
 * Devuelve el divisor del sueldo para el mes m.
 * divisorSueldo: 30 (fijo, default) | 'mes' (días reales del mes)
 */
export function getDivisorSueldo(divisorSueldo, mesIdx) {
  if (divisorSueldo === 'mes') return DIAS_MES_2026[mesIdx];
  return Number(divisorSueldo) || 30;
}

/**
 * Valor día de vacaciones = sueldo / 25  (LCT Art.155)
 * Valor día de sueldo     = sueldo / divisorSueldo
 *   divisorSueldo = 30 (estándar) o días reales del mes
 *
 * Para cada mes con días de vacaciones:
 *   sueldo_mes = sueldo − (sueldo / divisor) × dias_vac_en_mes
 *   haber_vac  = (sueldo / 25) × dias_vac_en_mes
 *
 * cobradoPorAdelantado = true:
 *   Todo el haber vacacional se cobra en el mes donde inician las vacaciones.
 * cobradoPorAdelantado = false:
 *   El haber vacacional se cobra en el mes que corresponde.
 */
export function ajustarPorVacaciones(sueldosBase, vacConfig) {
  const { tiene, fechaInicio, cantDias, cobradoPorAdelantado, divisorSueldo = 30 } = vacConfig;

  const diasPorMes = (tiene && fechaInicio && cantDias > 0)
    ? distribuirVacacionesPorMes(fechaInicio, cantDias)
    : Array(12).fill(0);

  if (!tiene || !fechaInicio || cantDias <= 0) {
    return {
      sueldos: [...sueldosBase],
      vacImpPorMes: Array(12).fill(0),
      diasPorMes,
      mesAbono: -1,
    };
  }

  const sueldos      = [...sueldosBase];
  const vacImpPorMes = Array(12).fill(0);
  const inicio       = new Date(fechaInicio + 'T12:00:00');
  const mesInicio    = inicio.getMonth();

  // Reducción del sueldo: sueldo − (sueldo / divisor_mes) × días_vac_en_mes
  for (let m = 0; m < 12; m++) {
    if (diasPorMes[m] > 0) {
      const div = getDivisorSueldo(divisorSueldo, m);
      sueldos[m] = sueldosBase[m] - (sueldosBase[m] / div) * diasPorMes[m];
    }
  }

  // Haber vacacional: (sueldo/25) × días_vac_en_mes
  if (cobradoPorAdelantado) {
    for (let m = 0; m < 12; m++) {
      if (diasPorMes[m] > 0) {
        vacImpPorMes[mesInicio] += sueldosBase[m] / 25 * diasPorMes[m];
      }
    }
  } else {
    for (let m = 0; m < 12; m++) {
      if (diasPorMes[m] > 0) {
        vacImpPorMes[m] = sueldosBase[m] / 25 * diasPorMes[m];
      }
    }
  }

  return { sueldos, vacImpPorMes, diasPorMes, mesAbono: mesInicio };
}

export function resumenVacaciones(fechaInicio, cantDias) {
  if (!fechaInicio || cantDias <= 0) return null;
  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const inicio = new Date(fechaInicio + 'T12:00:00');
  const fin    = new Date(inicio);
  fin.setDate(inicio.getDate() + cantDias - 1);
  const diasPorMes = distribuirVacacionesPorMes(fechaInicio, cantDias);
  return {
    fechaFin: fin.toISOString().split('T')[0],
    mesesAfectados: diasPorMes
      .map((dias, i) => ({ mes: MESES[i], mesIdx: i, diasEnMes: dias }))
      .filter(m => m.diasEnMes > 0),
  };
}
