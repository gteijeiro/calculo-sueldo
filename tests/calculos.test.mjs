/**
 * Tests de cálculos — Ganancias 4ª Categoría 2026
 * Ejecutar: node tests/calculos.test.mjs
 */
import { A, ESCENARIOS_PISO } from '../src/constants/arca2026.js';
import { calcularImpuesto, encontrarTramo, detalleEscala } from '../src/logic/impuesto.js';
import { calcularDeduccionesPersonales, calcularCapsAnuales } from '../src/logic/deducciones.js';
import { calcularIngresos, totalesAnualesDed } from '../src/logic/ingresos.js';
import { calcularPiso, calcularTodosLosPisos } from '../src/logic/pisos.js';
import { calcularRG4003 } from '../src/logic/rg4003.js';
import { calcular } from '../src/logic/calcular.js';

let passed = 0;
let failed = 0;

function assert(desc, actual, expected, tolerancia = 1) {
  const diff = Math.abs(actual - expected);
  if (diff <= tolerancia) {
    console.log(`  ✅ ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ ${desc}`);
    console.error(`     esperado: ${expected.toLocaleString('es-AR')}`);
    console.error(`     obtenido: ${actual.toLocaleString('es-AR')}`);
    console.error(`     diferencia: ${diff.toLocaleString('es-AR')}`);
    failed++;
  }
}

function assertEq(desc, actual, expected) {
  if (actual === expected) {
    console.log(`  ✅ ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ ${desc}`);
    console.error(`     esperado: ${JSON.stringify(expected)}`);
    console.error(`     obtenido: ${JSON.stringify(actual)}`);
    failed++;
  }
}

// ================================================================
// TEST 1: Escala Art.94 — valores de límite
// ================================================================
console.log('\n── TEST 1: Escala Art.94 (impuesto sobre base conocida) ──');

// $0 → impuesto = 0
assert('Impuesto sobre $0 = 0', calcularImpuesto(0), 0);

// Primer tramo: $1.000.000 → 5% de $1.000.000 = $50.000
assert('1er tramo $1.000.000 → $50.000', calcularImpuesto(1_000_000), 50_000);

// Exactamente en límite del 1er tramo: $2.000.030,09 → cf=0 + 5% * 2.000.030,09
const imp1 = calcularImpuesto(A.ESCALA[0].h);
assert('Limite 1er tramo exacto', imp1, A.ESCALA[0].cf + (A.ESCALA[0].h - A.ESCALA[0].d) * A.ESCALA[0].p / 100);

// Inicio 2do tramo: 1 peso sobre el límite → debe caer en 2do tramo
const base2 = A.ESCALA[1].d + 100;
const imp2  = calcularImpuesto(base2);
const imp2e = A.ESCALA[1].cf + 100 * 0.09;
assert('2do tramo entrada', imp2, imp2e);

// Tramo final: base bien dentro del último tramo
const baseUlt = A.ESCALA[8].d + 5_000_000;
const impUlt  = calcularImpuesto(baseUlt);
const impUlte = A.ESCALA[8].cf + 5_000_000 * 0.35;
assert('Último tramo (35%)', impUlt, impUlte);

// ================================================================
// TEST 2: Deducciones personales
// ================================================================
console.log('\n── TEST 2: Deducciones personales (Art.30) ──');

const dedSoltero = calcularDeduccionesPersonales({ conyuge: 0, hijos: 0, hijosInc: 0 });
assert('Soltero sin cargas: MNI + ESP', dedSoltero.total, A.MNI + A.DED_ESP);

const dedCasado1 = calcularDeduccionesPersonales({ conyuge: 1, hijos: 1, hijosInc: 0 });
assert('Casado 1 hijo: MNI+ESP+conyuge+1hijo',
  dedCasado1.total, A.MNI + A.DED_ESP + A.CONYUGE + A.HIJO);

// ================================================================
// TEST 3: Tabla de pisos
// ================================================================
console.log('\n── TEST 3: Pisos de sueldo bruto (pAp=17%) ──');

const pisos = calcularTodosLosPisos(0.17);

// Soltero/a sin cargas: ded = MNI + DED_ESP; piso = ded / (12 * 0.83)
const dedSolt = A.MNI + A.DED_ESP;
const pisoSolt = dedSolt / (12 * 0.83);
assert('Piso soltero/a sin cargas', pisos[0].pisoMensual, pisoSolt, 2);

// Casado/a, 2 hijos: ded = MNI + DED_ESP + CONYUGE + 2*HIJO
const dedC2H = A.MNI + A.DED_ESP + A.CONYUGE + 2 * A.HIJO;
const pisoC2H = dedC2H / (12 * 0.83);
assert('Piso casado/a 2 hijos', pisos[5].pisoMensual, pisoC2H, 2);

// ================================================================
// TEST 4: Caps anuales Art.85
// ================================================================
console.log('\n── TEST 4: Caps anuales Art.85 ──');

const gNetaTest = 30_000_000; // ganancia neta anual de prueba

// Alquiler: 40% del total, tope MNI
const alqBajo  = 5_000_000; // 40% = $2M < MNI
const capsAlq1 = calcularCapsAnuales({ alq: alqBajo, prep: 0, dom: 0, segv: 0, segr: 0, hip: 0, otros: 0 }, gNetaTest);
assert('Alquiler sin llegar a tope', capsAlq1.alq.cap, alqBajo * 0.40);
assertEq('Alquiler capHit=false', capsAlq1.alq.hit, false);

const alqAlto  = 20_000_000; // 40% = $8M > MNI ($5.15M)
const capsAlq2 = calcularCapsAnuales({ alq: alqAlto, prep: 0, dom: 0, segv: 0, segr: 0, hip: 0, otros: 0 }, gNetaTest);
assert('Alquiler tope MNI aplicado', capsAlq2.alq.cap, A.MNI);
assertEq('Alquiler capHit=true', capsAlq2.alq.hit, true);

// Prepaga: tope 5% gNeta
const prepBajo  = 500_000; // < 5% de $30M = $1.5M
const capsPre1  = calcularCapsAnuales({ alq: 0, prep: prepBajo, dom: 0, segv: 0, segr: 0, hip: 0, otros: 0 }, gNetaTest);
assert('Prepaga sin llegar a tope', capsPre1.prep.cap, prepBajo);
assertEq('Prepaga capHit=false', capsPre1.prep.hit, false);

const prepAlto  = 3_000_000; // > 5% de $30M = $1.5M
const capsPre2  = calcularCapsAnuales({ alq: 0, prep: prepAlto, dom: 0, segv: 0, segr: 0, hip: 0, otros: 0 }, gNetaTest);
assert('Prepaga tope 5% gNeta', capsPre2.prep.cap, gNetaTest * 0.05);
assertEq('Prepaga capHit=true', capsPre2.prep.hit, true);

// Seguros: tope SEG_VIDA_TOPE
const capsSegv = calcularCapsAnuales({ alq: 0, prep: 0, dom: 0, segv: 2_000_000, segr: 0, hip: 0, otros: 0 }, gNetaTest);
assert('Seg.vida tope aplicado', capsSegv.segv.cap, A.SEG_VIDA_TOPE);
assertEq('Seg.vida capHit=true', capsSegv.segv.hit, true);

// ================================================================
// TEST 5: Escenario completo — sueldo fijo, sin deducciones adicionales
// ================================================================
console.log('\n── TEST 5: Cálculo completo — sueldo fijo sin deducciones adicionales ──');

// Sueldo bruto mensual: $10.000.000 (12 meses iguales)
// SAC: $5.000.000 en junio y diciembre
// Aportes: 17%
// Soltero/a sin cargas

const sueldoMensual = 10_000_000;
const sacSem        = 5_000_000;
const mesData5 = Array.from({ length: 12 }, (_, i) => ({
  s:    sueldoMensual,
  sac:  (i === 5 || i === 11) ? sacSem : 0,
  alq: 0, prep: 0, dom: 0, segv: 0, segr: 0, hip: 0, otros: 0,
}));

const config5 = {
  pJubilacion: 11, pObraSocial: 3, pPAMI: 3,
  conyuge: 0, hijos: 0, hijosInc: 0,
};

const res5 = calcular(config5, mesData5);

// Bruto anual: 12 * 10M + 2 * 5M = $130M
assert('Bruto anual', res5.bruto, 130_000_000);

// Ganancia neta: bruto * (1 - 0.17)
assert('Ganancia neta anual', res5.gNeta, 130_000_000 * 0.83);

// Deducciones personales
assert('Deducciones personales soltero', res5.dedPers.total, A.MNI + A.DED_ESP);

// Base imponible anual
const gNetaAn5  = 130_000_000 * 0.83;
const baseAn5   = Math.max(0, gNetaAn5 - (A.MNI + A.DED_ESP));
assert('Base imponible anual', res5.baseAnual, baseAn5, 2);

// Impuesto anual
const impAn5 = calcularImpuesto(baseAn5);
assert('Impuesto anual', res5.impAnual, impAn5, 2);

// ================================================================
// TEST 6: RG 4003 — coherencia interna (suma de retenciones = impAnual)
// ================================================================
console.log('\n── TEST 6: RG 4003 — suma retenciones = impuesto anual ──');

// La retención de diciembre (mes 11) ajusta cualquier diferencia
// → retenciones.reduce(sum) == impAnual
const sumaRet5 = res5.detalleM.reduce((s, d) => s + d.retencion, 0);
assert('Suma retenciones mensuales = impuesto anual', sumaRet5, res5.impAnual, 1);

// ================================================================
// TEST 7: Escenario sin Ganancias — sueldo bajo
// ================================================================
console.log('\n── TEST 7: Sin Ganancias (sueldo bajo) ──');

const mesDataBajo = Array.from({ length: 12 }, () => ({
  s: 2_000_000, sac: 0, alq: 0, prep: 0, dom: 0, segv: 0, segr: 0, hip: 0, otros: 0,
}));
const resBajo = calcular(config5, mesDataBajo);
assert('Base anual = 0 (no paga)', resBajo.baseAnual, 0);
assert('Impuesto = 0', resBajo.impAnual, 0);
assert('Todas retenciones = 0', resBajo.detalleM.reduce((s, d) => s + d.retencion, 0), 0);

// ================================================================
// TEST 8: Deducciones Art.85 — cap tracking mes a mes
// ================================================================
console.log('\n── TEST 8: Cap tracking alquiler mes a mes ──');

// Alquiler $2.000.000/mes, 40% = $800.000/mes
// Cap anual = min(24M * 0.40, MNI) = min(9.6M, 5.15M) = 5.15M
// Después del mes 7 (8 * $800k = $6.4M > $5.15M), debería dejar de deducir
const mesDataAlq = Array.from({ length: 12 }, () => ({
  s: 10_000_000, sac: 0,
  alq: 2_000_000, prep: 0, dom: 0, segv: 0, segr: 0, hip: 0, otros: 0,
}));
const resAlq = calcular(config5, mesDataAlq);
// El total deducido por alquiler debe ser exactamente el cap = MNI
assert('Alquiler total deducido = MNI (cap tracking)', resAlq.caps.alq.cap, A.MNI, 1);

// ================================================================
// RESUMEN
// ================================================================
console.log('\n' + '═'.repeat(50));
console.log(`Resultados: ${passed} pasados, ${failed} fallados`);
if (failed > 0) {
  console.error('❌ Hay fallas en los tests');
  process.exit(1);
} else {
  console.log('✅ Todos los tests pasaron');
  process.exit(0);
}
