/**
 * Motor de fórmulas.
 * Las definiciones (id, expresion, tags) vienen de /public/formulas.json.
 * Al inicio, _initFormulas() compila fn() para cada una.
 * ejecutar(id, inputs) resuelve constantes del tag y corre la fn compilada.
 * Los overrides permiten reemplazar expresiones en runtime (editor UI).
 */

// Registro: id → { id, label, expresion, ley, tags, fn }
const _registry = new Map();

// Overrides de usuario: id → fn compilada
const _overrides = new Map();

// ── Compilación ──────────────────────────────────────────────────────────────

function compilarFn(expresion, tags) {
  const nombres = Object.keys(tags).join(', ');
  // eslint-disable-next-line no-new-func
  return new Function('ctx', `const { ${nombres} } = ctx; return (${expresion});`);
}

/** Compila + valida (test-run con valores 1). Lanza si hay variables no declaradas. */
export function compilarExpresion(expresion, tags) {
  const fn = compilarFn(expresion, tags);
  const testCtx = Object.fromEntries(Object.keys(tags).map(k => [k, 1]));
  let r;
  try { r = fn(testCtx); } catch (e) { throw new Error(`Error en expresión: ${e.message}`); }
  if (!isFinite(r)) throw new Error(`Variables no declaradas en los tags. Disponibles: ${Object.keys(tags).join(', ')}`);
  return fn;
}

// ── Inicialización desde JSON ─────────────────────────────────────────────────

export function _initFormulas(defs) {
  for (const def of defs) {
    const fn = compilarFn(def.expresion, def.tags);
    _registry.set(def.id, { ...def, fn });
  }
}

// ── API pública ───────────────────────────────────────────────────────────────

export function getFormula(id) {
  return _registry.get(id);
}

export function getAllFormulas() {
  return Array.from(_registry.values());
}

function resolverCtx(formula, inputs) {
  const ctx = {};
  for (const [tag, def] of Object.entries(formula.tags)) {
    ctx[tag] = def.tipo === 'constante' ? def.valor
      : (inputs[tag] !== undefined && inputs[tag] !== null) ? inputs[tag]
      : (def.defecto ?? 0);
  }
  return ctx;
}

export function ejecutar(id, inputs = {}) {
  const formula = _registry.get(id);
  if (!formula) { console.warn(`Formula no encontrada: ${id}`); return 0; }
  const ctx = resolverCtx(formula, inputs);
  const fn  = _overrides.get(id) ?? formula.fn;
  try {
    const r = fn(ctx);
    return isFinite(r) ? r : 0;
  } catch {
    return formula.fn(ctx);
  }
}

export function ejecutarConDetalle(id, inputs = {}) {
  const formula = _registry.get(id);
  if (!formula) return null;
  const contexto = resolverCtx(formula, inputs);
  const fn = _overrides.get(id) ?? formula.fn;
  let resultado, error;
  try { resultado = fn(contexto); if (!isFinite(resultado)) resultado = 0; }
  catch (e) { resultado = formula.fn(contexto); error = e.message; }
  return { ...formula, contexto, resultado, error };
}

// ── Overrides (editor UI) ─────────────────────────────────────────────────────

export function setOverride(id, expresion) {
  const formula = _registry.get(id);
  if (!formula) throw new Error(`Formula no encontrada: ${id}`);
  const fn = compilarExpresion(expresion, formula.tags);
  _overrides.set(id, fn);
  // actualizar expresion visible en registry
  _registry.set(id, { ..._registry.get(id), expresionActual: expresion });
}

export function clearOverride(id) {
  _overrides.delete(id);
  const f = _registry.get(id);
  if (f) { const { expresionActual: _, ...rest } = f; _registry.set(id, rest); }
}

export function resetAllOverrides() { _overrides.clear(); }
export function isOverridden(id)    { return _overrides.has(id); }
export function getOverrides()      { return new Map(_overrides); }
