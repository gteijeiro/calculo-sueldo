import React, { useState } from 'react';

const COOLDOWN_MS = 60 * 60 * 1000;

function getCooldownRemaining() {
  const last = localStorage.getItem('bug_report_ts');
  if (!last) return 0;
  return Math.max(0, COOLDOWN_MS - (Date.now() - Number(last)));
}

const EMPTY_FORM = {
  description: '',
  esperado: '',
  pasos: '',
  fuente: '',
  extras: '',
};

export default function ReportarError({ stateSnapshot = null, isDebug = false, onLoadSnapshot = null }) {
  const [open, setOpen]         = useState(false);
  const [tab, setTab]           = useState('report');
  const [form, setForm]         = useState(EMPTY_FORM);
  const [status, setStatus]     = useState('idle');
  const [message, setMessage]   = useState('');
  const [issueUrl, setIssueUrl] = useState('');
  const [cooldown, setCooldown] = useState(getCooldownRemaining);
  const [jsonInput, setJsonInput] = useState('');
  const [loadError, setLoadError] = useState('');

  const enCooldown = cooldown > 0;
  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  function openModal() {
    setCooldown(getCooldownRemaining());
    setStatus('idle');
    setMessage('');
    setIssueUrl('');
    setForm(EMPTY_FORM);
    setJsonInput('');
    setLoadError('');
    setTab('report');
    setOpen(true);
  }

  function close() { setOpen(false); }

  async function enviar(e) {
    e.preventDefault();
    if (!form.description.trim()) return;
    setStatus('loading');

    const browserInfo = `${navigator.userAgent} | ${window.innerWidth}×${window.innerHeight}`;

    const sections = [
      '## Descripción',
      form.description.trim(),
    ];
    if (form.esperado.trim()) {
      sections.push('## Resultado esperado', form.esperado.trim());
    }
    if (form.pasos.trim()) {
      sections.push('## Pasos para reproducir', form.pasos.trim());
    }
    if (form.fuente.trim()) {
      sections.push('## Fuente / referencia', form.fuente.trim());
    }
    if (form.extras.trim()) {
      sections.push('## Información adicional', form.extras.trim());
    }

    try {
      const body = {
        description: form.description,
        fullBody: sections.join('\n\n'),
        browserInfo,
      };
      if (stateSnapshot) body.stateSnapshot = stateSnapshot;

      const res = await fetch('/api/report-bug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error ?? 'Error desconocido');
      } else {
        localStorage.setItem('bug_report_ts', String(Date.now()));
        setCooldown(COOLDOWN_MS);
        setStatus('success');
        setIssueUrl(data.url);
      }
    } catch {
      setStatus('error');
      setMessage('No se pudo conectar. Revisá tu conexión.');
    }
  }

  function handleLoad() {
    setLoadError('');
    if (!jsonInput.trim()) { setLoadError('Pegá un JSON'); return; }
    try { JSON.parse(jsonInput); } catch {
      setLoadError('JSON inválido — verificá la sintaxis');
      return;
    }
    onLoadSnapshot(jsonInput);
    close();
  }

  return (
    <>
      <button className="report-bug-fab" onClick={openModal} aria-label="Reportar un error">
        🐛 Reportar error
      </button>

      {open && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title">

            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h2 id="modal-title">
                  {tab === 'load' ? 'Cargar estado desde JSON' : 'Reportar un error'}
                </h2>
                {isDebug && (
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    {['report', 'load'].map(t => (
                      <button key={t} onClick={() => setTab(t)} style={{
                        fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                        borderRadius: '4px', border: '1px solid var(--border)', cursor: 'pointer',
                        background: tab === t ? 'var(--blue)' : 'transparent',
                        color: tab === t ? 'white' : 'var(--text-sub)',
                      }}>
                        {t === 'report' ? 'Reportar' : 'Cargar JSON'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="modal-close" onClick={close} aria-label="Cerrar">✕</button>
            </div>

            {tab === 'load' ? (
              <>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="json-input">Pegá el JSON del estado</label>
                    <span className="hint">Copiá el snapshot de un issue y pegalo acá para reproducir el caso.</span>
                    <textarea
                      id="json-input"
                      className="report-textarea"
                      value={jsonInput}
                      onChange={e => { setJsonInput(e.target.value); setLoadError(''); }}
                      placeholder='{"config":{...},"sueldoConfig":{...},...}'
                      rows={8}
                      style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}
                    />
                    {loadError && <div className="alert alert-warn" style={{ marginTop: '0.5rem' }}>{loadError}</div>}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={close}>Cancelar</button>
                  <button type="button" className="btn-primary" onClick={handleLoad} disabled={!jsonInput.trim()}>
                    Cargar estado
                  </button>
                </div>
              </>

            ) : status === 'success' ? (
              <div className="modal-body">
                <div className="report-success">
                  <span className="report-success-icon">✅</span>
                  <p>¡Gracias! El reporte fue enviado.</p>
                  <a href={issueUrl} target="_blank" rel="noopener noreferrer" className="report-issue-link">
                    Ver issue #{issueUrl.split('/').pop()}
                  </a>
                </div>
                <div className="modal-footer">
                  <button className="btn-primary" onClick={close}>Cerrar</button>
                </div>
              </div>

            ) : (
              <form onSubmit={enviar} className="modal-form">
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {enCooldown && (
                    <div className="alert alert-warn">
                      Ya enviaste un reporte recientemente. Podés enviar otro en {Math.ceil(cooldown / 60000)} minutos.
                    </div>
                  )}

                  {/* Descripción — requerida */}
                  <div className="form-group">
                    <label htmlFor="bug-desc">
                      ¿Qué pasó? <span style={{ color: 'var(--red-dark)' }}>*</span>
                    </label>
                    <span className="hint">Describí el error o comportamiento inesperado.</span>
                    <textarea
                      id="bug-desc"
                      className="report-textarea"
                      value={form.description}
                      onChange={set('description')}
                      placeholder="Ej: Al ingresar sueldo de $800.000 con cónyuge el resultado muestra un valor negativo..."
                      rows={4}
                      maxLength={2000}
                      disabled={status === 'loading' || enCooldown}
                      required
                    />
                    <span className="hint" style={{ textAlign: 'right' }}>{form.description.length}/2000</span>
                  </div>

                  {/* Resultado esperado */}
                  <div className="form-group">
                    <label htmlFor="bug-esperado">¿Qué resultado esperabas? <span className="hint" style={{ display: 'inline' }}>(opcional)</span></label>
                    <textarea
                      id="bug-esperado"
                      className="report-textarea"
                      value={form.esperado}
                      onChange={set('esperado')}
                      placeholder="Ej: Debería mostrar una retención de $45.000 según mi recibo de sueldo..."
                      rows={2}
                      maxLength={1000}
                      disabled={status === 'loading' || enCooldown}
                    />
                  </div>

                  {/* Pasos para reproducir */}
                  <div className="form-group">
                    <label htmlFor="bug-pasos">Pasos para reproducir <span className="hint" style={{ display: 'inline' }}>(opcional)</span></label>
                    <textarea
                      id="bug-pasos"
                      className="report-textarea"
                      value={form.pasos}
                      onChange={set('pasos')}
                      placeholder={"1. Ingresar sueldo $800.000\n2. Marcar cónyuge\n3. Presionar Calcular\n4. Ver resultado en DetalleMensual"}
                      rows={3}
                      maxLength={1000}
                      disabled={status === 'loading' || enCooldown}
                    />
                  </div>

                  {/* Fuente de referencia */}
                  <div className="form-group">
                    <label htmlFor="bug-fuente">Fuente / referencia <span className="hint" style={{ display: 'inline' }}>(opcional)</span></label>
                    <span className="hint">Recibo de sueldo, liquidación del contador, resolución ARCA, Excel Errepar, etc.</span>
                    <textarea
                      id="bug-fuente"
                      className="report-textarea"
                      value={form.fuente}
                      onChange={set('fuente')}
                      placeholder="Ej: Mi recibo real de abril 2026 muestra $42.500. URL: https://..."
                      rows={2}
                      maxLength={500}
                      disabled={status === 'loading' || enCooldown}
                    />
                  </div>

                  {/* Info adicional */}
                  <div className="form-group">
                    <label htmlFor="bug-extras">Información adicional <span className="hint" style={{ display: 'inline' }}>(opcional)</span></label>
                    <span className="hint">Cualquier otro dato relevante: convenio colectivo, provincia, situación especial, etc.</span>
                    <textarea
                      id="bug-extras"
                      className="report-textarea"
                      value={form.extras}
                      onChange={set('extras')}
                      placeholder="Ej: Convenio 130/75 gastronómicos, Buenos Aires, empleado mensualizado..."
                      rows={2}
                      maxLength={500}
                      disabled={status === 'loading' || enCooldown}
                    />
                  </div>

                  {stateSnapshot && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ✓ Los valores actuales del formulario se incluirán automáticamente en el reporte.
                    </p>
                  )}

                  {status === 'error' && (
                    <div className="alert alert-warn">{message}</div>
                  )}
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={close}>Cancelar</button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={status === 'loading' || enCooldown || !form.description.trim()}
                  >
                    {status === 'loading' ? 'Enviando…' : 'Enviar reporte'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
