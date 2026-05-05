const OWNER = 'gteijeiro';
const REPO  = 'calculo-sueldo';
const LABEL = 'usuario';
const MAX_DAILY = 15;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Método no permitido' });

  const { description, fullBody, browserInfo, stateSnapshot } = req.body ?? {};
  if (!description?.trim()) return res.status(400).json({ error: 'Descripción requerida' });
  if (description.trim().length > 2000) return res.status(400).json({ error: 'Descripción muy larga (máx 2000 caracteres)' });

  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).json({ error: 'Token no configurado' });

  const ghHeaders = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
    'User-Agent': 'calculo-sueldo-bug-reporter',
  };

  // Ensure label exists
  await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/labels`, {
    method: 'POST',
    headers: ghHeaders,
    body: JSON.stringify({ name: LABEL, color: 'e11d48', description: 'Reportado por usuario' }),
  }).catch(() => {});

  // Rate limit: count issues created today with label
  const today = new Date().toISOString().split('T')[0];
  const searchUrl = `https://api.github.com/search/issues?q=repo:${OWNER}/${REPO}+label:${LABEL}+created:>=${today}&per_page=1`;
  const searchRes = await fetch(searchUrl, { headers: ghHeaders });
  if (searchRes.ok) {
    const { total_count } = await searchRes.json();
    if (total_count >= MAX_DAILY) {
      return res.status(429).json({ error: 'Límite diario de reportes alcanzado. Intentá mañana.' });
    }
  }

  // Build issue
  const title = description.trim().slice(0, 80) + (description.trim().length > 80 ? '…' : '');
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ?? 'desconocida';
  const snapshotBlock = stateSnapshot
    ? `## Estado del formulario\n\n\`\`\`json\n${JSON.stringify(stateSnapshot, null, 2)}\n\`\`\``
    : '';
  const metaBlock = [
    '---',
    `**Fecha:** ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`,
    `**URL:** ${req.headers['referer'] ?? 'desconocida'}`,
    `**Navegador:** ${browserInfo ?? 'desconocido'}`,
    `**IP:** ${ip}`,
  ].join('\n');
  const body = [fullBody ?? `## Descripción\n\n${description.trim()}`, metaBlock, snapshotBlock]
    .filter(Boolean).join('\n\n');

  const createRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/issues`, {
    method: 'POST',
    headers: ghHeaders,
    body: JSON.stringify({ title, body, labels: [LABEL] }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    return res.status(500).json({ error: 'Error al crear el issue', detail: err.message });
  }

  const issue = await createRes.json();
  return res.status(201).json({ url: issue.html_url, number: issue.number });
}
