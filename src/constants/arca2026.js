// Valores ARCA/AFIP — Período Fiscal 2026, H1
// Fuente: RG ARCA y Ley 27.743 (reforma 2024)
export const A = {
  MNI:       5_151_802.50,
  DED_ESP:  24_728_652.02,  // MNI × 4.8 — rel.dependencia (Art.30 inc.c ap.1)
  CONYUGE:   4_851_964.66,
  HIJO:      2_446_863.48,
  HIJO_INC:  4_893_726.96,
  SEG_VIDA_TOPE:  753_472.14,
  HIP_TOPE:        20_000.00,
  SEPELIO_TOPE:       996.23,
  ESCALA: [
    { d:           0,   h:  2_000_030.09, cf:           0,   p:  5 },
    { d:  2_000_030.09, h:  4_000_060.17, cf:     100_001.50, p:  9 },
    { d:  4_000_060.17, h:  6_000_090.26, cf:     280_004.21, p: 12 },
    { d:  6_000_090.26, h:  9_000_135.40, cf:     520_007.82, p: 15 },
    { d:  9_000_135.40, h: 18_000_270.80, cf:     970_014.59, p: 19 },
    { d: 18_000_270.80, h: 27_000_406.20, cf:   2_680_040.32, p: 23 },
    { d: 27_000_406.20, h: 40_500_609.30, cf:   4_750_071.46, p: 27 },
    { d: 40_500_609.30, h: 60_750_913.96, cf:   8_395_126.30, p: 31 },
    { d: 60_750_913.96, h: Infinity,       cf:  14_672_720.74, p: 35 },
  ],
};

export const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

// 's','sac','diasVac' = ingresos; resto = deducciones Art.85
export const COLS = ['s','sac','diasVac','alq','prep','dom','segv','segr','hip','otros'];

// Escenarios para tabla de pisos
export const ESCENARIOS_PISO = [
  { lbl: 'Soltero/a sin cargas',   c: 0, h: 0, i: 0 },
  { lbl: 'Soltero/a, 1 hijo/a',    c: 0, h: 1, i: 0 },
  { lbl: 'Soltero/a, 2 hijos/as',  c: 0, h: 2, i: 0 },
  { lbl: 'Casado/a sin hijos',      c: 1, h: 0, i: 0 },
  { lbl: 'Casado/a, 1 hijo/a',      c: 1, h: 1, i: 0 },
  { lbl: 'Casado/a, 2 hijos/as',    c: 1, h: 2, i: 0 },
  { lbl: 'Casado/a, 3 hijos/as',    c: 1, h: 3, i: 0 },
];
