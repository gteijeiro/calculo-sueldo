/**
 * Calcula ingresos brutos anuales y aportes.
 *
 * @param {number[]} sueldos - array 12 meses
 * @param {number[]} sacs    - array 12 meses (SAC/bonos)
 * @param {number[]} vacs    - array 12 meses (haberes vacacionales)
 * @param {{ jubilacion, obraSocial, pami }} aportesPct - porcentajes (0–1)
 * @returns {{ salAn, sacAn, vacAn, bruto, pAp, aTotal, gNeta }}
 */
export function calcularIngresos(sueldos, sacs, vacs, { jubilacion, obraSocial, pami }) {
  const salAn = sueldos.reduce((a, b) => a + b, 0);
  const sacAn = sacs.reduce((a, b) => a + b, 0);
  const vacAn = vacs.reduce((a, b) => a + b, 0);
  const bruto = salAn + sacAn + vacAn;
  const pAp   = jubilacion + obraSocial + pami;
  const aTotal = bruto * pAp;
  const gNeta  = bruto - aTotal;
  return { salAn, sacAn, vacAn, bruto, pAp, aTotal, gNeta };
}

/**
 * Totales anuales de cada columna de deducciones Art.85.
 * @param {Object} mesData - array[12]
 * @returns {{ alq, prep, dom, segv, segr, hip, otros }}
 */
export function totalesAnualesDed(mesData) {
  const keys = ['alq','prep','dom','segv','segr','hip','otros40','otros100'];
  const result = {};
  for (const k of keys) {
    result[k] = mesData.reduce((sum, m) => sum + (m[k] || 0), 0);
  }
  return result;
}
