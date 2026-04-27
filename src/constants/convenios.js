// Convenios colectivos — cargados desde /public/convenios.json al inicio
export const CONVENIOS_DETALLE = {};

export function _initConvenios(data) {
  Object.assign(CONVENIOS_DETALLE, data);
}
