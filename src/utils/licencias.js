export function distribuirDiasPorMes(fechaStr, dias) {
  if (!fechaStr || !dias) return {};
  const result = {};
  let restantes = dias;
  let cur = new Date(fechaStr + 'T00:00:00');
  while (restantes > 0) {
    const mes = cur.getMonth();
    const ultimoDia = new Date(cur.getFullYear(), mes + 1, 0).getDate();
    const enEsteMes = Math.min(restantes, ultimoDia - cur.getDate() + 1);
    result[mes] = (result[mes] || 0) + enEsteMes;
    restantes -= enEsteMes;
    cur = new Date(cur.getFullYear(), mes + 1, 1);
  }
  return result;
}

// Devuelve array[12] donde cada elemento es lista de { id, label, dias, importe, descuento }
// importe  = sueldo / divisorHaber × días  (haber licencia, divisor 25 por LCT)
// descuento = sueldo / divisorDesc  × días  (reducción del sueldo, divisor 30)
export function calcLicenciasPorMes(licenciasData, tipos, sueldosPorMes) {
  const result = Array(12).fill(null).map(() => []);
  licenciasData.forEach(lic => {
    if (!lic.activa) return;
    const tipo = tipos.find(t => t.id === lic.id);
    if (!tipo) return;
    const dH = lic.divisorHaber || 25;
    const dD = lic.divisorDesc  || 30;
    const ocurrencias = lic.ocurrencias
      ? lic.ocurrencias
      : (lic.fecha ? [{ fecha: lic.fecha, dias: lic.dias }] : []);
    ocurrencias.forEach(oc => {
      if (!oc.fecha || !oc.dias) return;
      const dist = distribuirDiasPorMes(oc.fecha, oc.dias);
      Object.entries(dist).forEach(([mes, dias]) => {
        const m = Number(mes);
        const sueldo = sueldosPorMes?.[m] || 0;
        result[m].push({
          id:        lic.id,
          label:     tipo.label,
          dias,
          importe:   sueldo > 0 ? (sueldo / dH) * dias : 0,
          descuento: sueldo > 0 ? (sueldo / dD) * dias : 0,
        });
      });
    });
  });
  return result;
}
