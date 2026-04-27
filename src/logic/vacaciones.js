import { DIAS_MES_2026, MESES } from '../constants/arca2026.js';
import { ejecutar } from './formula.js';

export { DIAS_MES_2026 };

export function getDivisorSueldo(divisorSueldo, mesIdx) {
  if (divisorSueldo === 'mes') return DIAS_MES_2026[mesIdx];
  return Number(divisorSueldo) || 30;
}

export function haberVacacional(sueldoBase, diasEnMes) {
  return ejecutar('haber_vacacional', { sueldoBase, diasEnMes });
}

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

export function ajustarPorVacaciones(sueldosBase, vacConfig) {
  const { tiene, fechaInicio, cantDias, cobradoPorAdelantado, divisorSueldo = 30 } = vacConfig;
  const diasPorMes = (tiene && fechaInicio && cantDias > 0)
    ? distribuirVacacionesPorMes(fechaInicio, cantDias)
    : Array(12).fill(0);

  if (!tiene || !fechaInicio || cantDias <= 0) {
    return { sueldos: [...sueldosBase], vacImpPorMes: Array(12).fill(0), diasPorMes, mesAbono: -1 };
  }

  const sueldos      = [...sueldosBase];
  const vacImpPorMes = Array(12).fill(0);
  const mesInicio    = new Date(fechaInicio + 'T12:00:00').getMonth();

  for (let m = 0; m < 12; m++) {
    if (diasPorMes[m] > 0) {
      sueldos[m] = ejecutar('reduccion_sueldo_vacaciones', {
        sueldoBase: sueldosBase[m],
        divisorSueldo: getDivisorSueldo(divisorSueldo, m),
        diasVacacion: diasPorMes[m],
      });
    }
  }

  if (cobradoPorAdelantado) {
    for (let m = 0; m < 12; m++) {
      if (diasPorMes[m] > 0)
        vacImpPorMes[mesInicio] += ejecutar('haber_vacacional', { sueldoBase: sueldosBase[m], diasEnMes: diasPorMes[m] });
    }
  } else {
    for (let m = 0; m < 12; m++) {
      if (diasPorMes[m] > 0)
        vacImpPorMes[m] = ejecutar('haber_vacacional', { sueldoBase: sueldosBase[m], diasEnMes: diasPorMes[m] });
    }
  }

  return { sueldos, vacImpPorMes, diasPorMes, mesAbono: mesInicio };
}

export function resumenVacaciones(fechaInicio, cantDias) {
  if (!fechaInicio || cantDias <= 0) return null;
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
