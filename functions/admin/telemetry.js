function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

export function onRequest({ request }) {
  const accessUser = request.headers.get('Cf-Access-Authenticated-User-Email');
  if (!accessUser) {
    return json({ error: 'Cloudflare Access required' }, 403);
  }

  return json({
    enabled: false,
    message: 'Telemetry admin view is scaffolded only. Choose Analytics Engine or R2 daily summaries before enabling storage.'
  }, 501);
}
