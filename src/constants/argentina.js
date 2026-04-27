import { _initFormulas } from '../logic/formula.js';

// Datos del recibo argentino — cargados desde /public/argentina.json
let _data = null;

export function _initArgentina(data) {
  _data = data;

  // Fórmulas embebidas en deducciones del recibo
  const dedFormulas = Object.values(data.recibo_sueldo.deducciones)
    .map(d => ({ ...d.formula, ley: d.ley }));

  // Fórmulas embebidas en vacaciones
  const vacFormulas = Object.values(data.vacaciones.formulas);

  _initFormulas([...dedFormulas, ...vacFormulas]);
}

export function getArgentina() {
  return _data;
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
