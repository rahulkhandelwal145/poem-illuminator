export async function onRequestPost(context) {
  const { env, request } = context
  const accountId = env.VITE_CF_ACCOUNT_ID
  const token = env.VITE_CF_TOKEN

  if (!accountId || !token) {
    return new Response(JSON.stringify({ error: 'CF credentials not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await request.text()
  const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`

  const res = await fetch(cfUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body,
  })

  const data = await res.arrayBuffer()
  return new Response(data, {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'application/octet-stream',
    },
  })
}
