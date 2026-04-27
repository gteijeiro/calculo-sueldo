import { ejecutar } from './formula.js';

export function calcularIngresos(sueldos, sacs, vacs, { jubilacion, obraSocial, pami }) {
  const salAn = sueldos.reduce((a, b) => a + b, 0);
  const sacAn = sacs.reduce((a, b) => a + b, 0);
  const vacAn = vacs.reduce((a, b) => a + b, 0);
  const bruto  = ejecutar('remuneracion_bruta', { sueldo: salAn, sac: sacAn, vacacional: vacAn });
  const pAp    = ejecutar('tasa_aportes', { pJubilacion: jubilacion, pObraSocial: obraSocial, pPAMI: pami });
  const aTotal = ejecutar('total_aportes', { bruto, pAp });
  const gNeta  = ejecutar('ganancia_neta',  { bruto, pAp });
  return { salAn, sacAn, vacAn, bruto, pAp, aTotal, gNeta };
}

export function totalesAnualesDed(mesData) {
  const keys = ['alq','prep','dom','segv','segr','hip','otros40','otros100'];
  const result = {};
  for (const k of keys) result[k] = mesData.reduce((s, m) => s + (m[k] || 0), 0);
  return result;
}
