# Calculadora Ganancias 4ª Categoría 2026

Calcula retenciones del Impuesto a las Ganancias para trabajadores en relación de dependencia. Valores oficiales ARCA H1 2026, método acumulado RG 4003/2017.

## Stack

- React 18 + Vite 5
- Sin frameworks de UI, CSS propio
- Tests: Node.js ESM puro (sin Jest/Vitest)

## Instalación

```bash
npm install
```

## Comandos

```bash
npm run dev      # servidor de desarrollo
npm run build    # build producción
npm test         # correr tests
```

## Funcionalidades

- Ingreso de sueldo mensual + SAC por cada mes del año
- Configuración de aportes (jubilación, obra social, PAMI)
- Cargas de familia (cónyuge, hijos, hijos incapacitados)
- Deducciones Art.85: alquiler, prepaga, servicio doméstico, seguros de vida/retiro, hipoteca, otros
- Tabla de retención mensual (método acumulado RG 4003)
- Detalle de escala progresiva Art.94
- Tabla de pisos por situación familiar
- Cálculo de neto de bolsillo

## Valores ARCA H1 2026

| Concepto | Importe |
|----------|---------|
| MNI | $5.151.802,50 |
| Ded. especial (rel. dep.) | $24.728.652,02 |
| Cónyuge | $4.851.964,66 |
| Hijo | $2.446.863,48 |
| Hijo incapacitado | $4.893.726,96 |

Escala Art.94: 9 tramos, 5% → 35%.

## Estructura

```
src/
  constants/arca2026.js     — valores ARCA oficiales
  logic/
    calcular.js             — orquestador principal
    rg4003.js               — loop mensual acumulado
    impuesto.js             — cálculo de impuesto y escala
    deducciones.js          — deducciones personales y caps
    ingresos.js             — cálculo de ingresos
    pisos.js                — pisos por situación familiar
  components/
    DatosForm.jsx           — aportes % y cargas de familia
    TablaMensual.jsx        — ingreso de datos por mes
    PisoTable.jsx           — tabla de pisos
    Resultados/             — componentes de resultado
  utils/format.js           — funciones de formato
tests/calculos.test.mjs     — tests de toda la lógica
```

## Ley aplicable

- **Ley 27.743 (2024)**: Art.30 (MNI + cargas), Art.85 (ded. adicionales), Art.94 (escala)
- **RG 4003/2017**: método acumulado para retención mensual

## Actualización H2 2026

En julio/agosto ARCA publica nuevos valores con IPC enero–junio. Actualizar solo `src/constants/arca2026.js`.

## Archivos de referencia

- `ganancias-4ta.html` — versión HTML monolítica original (no modificar)
- `errepar_retenciones4ta_2026.xlsm` — Excel Errepar con macro VBA de referencia
