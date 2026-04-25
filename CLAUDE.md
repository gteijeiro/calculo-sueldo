# Calculadora Ganancias 4ª Categoría 2026

Aplicación React + Vite para calcular retenciones del Impuesto a las Ganancias (relación de dependencia),
con valores oficiales ARCA H1 2026 y método acumulado RG 4003/2017.

## Stack

- React 18 + Vite 5, `"type": "module"`
- Sin frameworks de UI, CSS propio en `src/App.css`
- Tests: Node.js ESM puro (`node tests/calculos.test.mjs`), sin Jest/Vitest

## Estructura

```
src/
  constants/arca2026.js   — Todos los valores ARCA (MNI, DED_ESP, ESCALA, etc.)
  logic/
    impuesto.js           — calcularImpuesto(), encontrarTramo(), detalleEscala()
    deducciones.js        — calcularDeduccionesPersonales(), calcularCapsAnuales()
    ingresos.js           — calcularIngresos(), totalesAnualesDed()
    pisos.js              — calcularPiso(), calcularTodosLosPisos()
    rg4003.js             — calcularRG4003() — loop mensual acumulado
    calcular.js           — calcular() — orquestador principal
  utils/format.js         — fmt(), fmtSigned(), pct()
  components/
    PisoTable.jsx         — Tabla de pisos por situación familiar
    DatosForm.jsx         — Aportes % + cargas de familia
    TablaMensual.jsx      — Tabla 12 meses × 9 columnas
    Resultados/
      DetalleMensual.jsx  — Retención mes a mes RG 4003
      PasoAPaso.jsx       — Detalle anual base de cálculo
      EscalaAlicuotas.jsx — Escala progresiva Art.94
      ResumenFinal.jsx    — Resumen + neto bolsillo
  App.jsx                 — Estado global + orquestación
  App.css                 — Estilos (variables CSS, tablas, cards)
  main.jsx                — Entry point React
tests/calculos.test.mjs   — Tests Node.js para toda la lógica
```

## Estado en App.jsx

```js
const [config, setConfig]   = useState({ pJubilacion, pObraSocial, pPAMI, conyuge, hijos, hijosInc })
const [mesData, setMesData] = useState(Array(12).fill({ s, sac, alq, prep, dom, segv, segr, hip, otros }))
const [resultado, setResultado] = useState(null)
```

Cálculo se ejecuta solo al presionar el botón "Calcular →" (no live).

## Valores clave ARCA H1 2026

```
MNI:        $5.151.802,50
DED_ESP:    $24.728.652,02  (MNI × 4,8 — rel.dependencia)
CONYUGE:    $4.851.964,66
HIJO:       $2.446.863,48
HIJO_INC:   $4.893.726,96
SEG_VIDA_TOPE: $753.472,14
HIP_TOPE:   $20.000,00
```

Escala Art.94: 9 tramos, 5% → 35%.

## Ley aplicable

- **Ley 27.743 (2024)**: renombró Art.23→30, Art.81→85, Art.90→94
- **Art.30**: MNI + DED_ESP + cargas de familia
- **Art.85**: deducciones adicionales (alquiler, prepaga, doméstico, seguros, hipoteca, otros)
- **Art.94**: escala progresiva
- **RG 4003/2017**: método acumulado para retención mensual

## Algoritmo RG 4003 (rg4003.js)

```
Para cada mes M (0..11):
  brutoAcum(M) = Σ(sueldos[0..M]) + Σ(sacs[0..M])
  gNetaAcum(M) = brutoAcum(M) × (1 − pAp)
  dPersAcum(M) = dPers × (M+1)/12           ← prorrateo
  Para cada ded_X con cap anual T:
    ded_X_m = max(0, min(importe_mes, T − acumulado_X))
    acumulado_X += ded_X_m
  dedTotalAcum(M) = dPersAcum + Σ(ded_X_acum)
  baseAcum(M)    = max(0, gNetaAcum − dedTotalAcum)
  impAcum(M)     = calcularImpuesto(baseAcum)
  retención(M)   = impAcum(M) − impAcum(M−1)
```

- **Positivo**: empleador retiene
- **Negativo**: empleador devuelve (mes con devolución)
- La suma de todas las retenciones = impuesto anual determinado

## Cap tracking (Art.85)

Cada deducción tiene un tope anual. Se deduce el importe real del mes
hasta agotar el cap; meses posteriores no deducen si el cap ya fue alcanzado.
Esto replica el comportamiento de `maximoAcumulado` en el Excel Errepar.

## Columna "Otros ded."

El usuario ingresa el importe ya deducible (no el bruto). Sin tope adicional
en la lógica — el tope/porcentaje lo aplica el usuario antes de ingresar.

## Comandos

```bash
npm run dev      # servidor de desarrollo Vite
npm run build    # build producción
npm test         # node tests/calculos.test.mjs
```

## Archivo original

`ganancias-4ta.html` — versión HTML monolítica de referencia. No modificar; sirve
como documentación y para contrastar resultados si hay dudas.

## Excel de referencia

`errepar_retenciones4ta_2026.xlsm` — Excel con macro VBA (Errepar) que implementa
el mismo algoritmo. Funciones clave en VBA: `maximoAcumulado`, `acumuladoDeducido`,
`impuestoDeterminado`. Confirma el método acumulado RG 4003.

## Actualización H2 2026

En julio/agosto ARCA publica nuevos valores actualizados con IPC enero–junio.
Actualizar solo `src/constants/arca2026.js`.
