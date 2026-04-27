// Valores ARCA — cargados desde /public/arca2026.json al inicio
export const A              = {};
export const MESES          = [];
export const COLS           = [];
export const ESCENARIOS_PISO = [];
export const DIAS_MES_2026  = [];

export function _initArca(data) {
  Object.assign(A, data.A);
  // null en JSON representa Infinity (último tramo de la escala)
  A.ESCALA = data.A.ESCALA.map(t => ({ ...t, h: t.h === null ? Infinity : t.h }));
  MESES.splice(0, MESES.length, ...data.MESES);
  COLS.splice(0, COLS.length, ...data.COLS);
  ESCENARIOS_PISO.splice(0, ESCENARIOS_PISO.length, ...data.ESCENARIOS_PISO);
  DIAS_MES_2026.splice(0, DIAS_MES_2026.length, ...data.DIAS_MES_2026);
}
