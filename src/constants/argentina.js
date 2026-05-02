import { _initFormulas } from '../logic/formula.js';

// Datos del recibo argentino — cargados desde /public/argentina.json
let _data = null;

export function _initArgentina(data) {
  _data = data;

  // Fórmulas embebidas en deducciones del recibo (jubilacion, obra_social, pami)
  const dedFormulas = Object.values(data.recibo_sueldo.deducciones)
    .map(d => ({ ...d.formula, ley: d.ley }));

  // Fórmulas embebidas en vacaciones
  const vacFormulas = Object.values(data.vacaciones.formulas);

  // Art.85: NO se registran desde aquí — sus IDs (cap_con_tope, cap_con_porcentaje)
  // son genéricos y ya están en formulas.json con tope como input variable.
  // Las definiciones en argentina.json son documentación de los parámetros concretos.

  _initFormulas([...dedFormulas, ...vacFormulas]);
}

export function getArgentina() {
  return _data;
}

export function getReciboConfig() {
  return _data?.recibo_sueldo_detalle_mensual ?? null;
}

export function getDetalleConfig() {
  return _data?.detalle_base_calculo ?? null;
}

export function getResumenConfig() {
  return _data?.resumen_final ?? null;
}

/** Defaults de config iniciales leídos desde el JSON */
export function getConfigDefault() {
  if (!_data) return {};
  const ded = _data.recibo_sueldo.deducciones;
  const caf = _data.recibo_sueldo.cargas_familia;
  return {
    pJubilacion: ded.jubilacion.default,
    pObraSocial: ded.obra_social.default,
    pPAMI:       ded.pami.default,
    conyuge:     caf.conyuge.default,
    hijos:       caf.hijos.default,
    hijosInc:    caf.hijos_incapacitados.default,
    convenio:    'general',
  };
}
