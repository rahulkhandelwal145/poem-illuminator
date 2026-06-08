const HF_TOKEN = import.meta.env.VITE_HF_TOKEN
const DEFAULT_STYLE = ', painterly illuminated manuscript, warm golden light, art nouveau, parchment tones'

// ── Tier 1: HuggingFace Inference API ────────────────────────────────────────
async function tryHuggingFace(prompt, signal, themeStyle) {
  const style = themeStyle || DEFAULT_STYLE
  const fullPrompt = prompt + style
  console.log('[HF] → POST FLUX.1-schnell')
  console.log('[HF] prompt:', fullPrompt.slice(0, 120) + (fullPrompt.length > 120 ? '…' : ''))

  const res = await fetch(
    'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${HF_TOKEN}`,
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: { num_inference_steps: 4, guidance_scale: 3.5 },
      }),
      signal,
    }
  )

  console.log('[HF] ← status:', res.status, res.statusText)

  if (!res.ok) {
    const retryAfter = res.headers.get('retry-after') || res.headers.get('x-ratelimit-reset-requests')
    const remaining = res.headers.get('x-ratelimit-remaining-requests')
    const limit = res.headers.get('x-ratelimit-limit-requests')

    let body = ''
    try { body = await res.text() } catch (_) {}
    const bodySnippet = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200)

    if (res.status === 429) {
      console.warn(`[HF] 429 Rate limit exceeded`)
      if (limit) console.warn(`[HF] limit: ${limit}, remaining: ${remaining}`)
      if (retryAfter) console.warn(`[HF] retry-after: ${retryAfter}s`)
      if (bodySnippet) console.warn(`[HF] body: ${bodySnippet}`)
    } else if (res.status === 401) {
      console.warn('[HF] 401 Unauthorized — token invalid or revoked')
    } else if (res.status === 403) {
      console.warn('[HF] 403 Forbidden — accept model license at huggingface.co/black-forest-labs/FLUX.1-schnell')
    } else if (res.status === 503) {
      console.warn('[HF] 503 Model loading — try again in ~20s')
      if (bodySnippet) console.warn(`[HF] body: ${bodySnippet}`)
    } else {
      console.warn(`[HF] ${res.status} error — body: ${bodySnippet}`)
    }

    throw new Error(`HF ${res.status}`)
  }

  const contentType = res.headers.get('Content-Type') || ''
  console.log('[HF] content-type:', contentType)
  if (!contentType.startsWith('image/')) {
    const snippet = await res.text().then(t => t.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300))
    throw new Error(`HF non-image response: ${snippet}`)
  }

  const blob = await res.blob()
  console.log('[HF] blob size:', blob.size, 'bytes')
  if (!blob.size) throw new Error('empty blob')
  return URL.createObjectURL(blob)
}

// ── Tier 2: Local generation API ─────────────────────────────────────────────
async function tryLocal(prompt, signal, themeStyle) {
  const style = themeStyle || DEFAULT_STYLE
  const fullPrompt = prompt + style
  console.log('[local] → POST /local-generate (proxied to localhost:8083/generate)')
  console.log('[local] prompt:', fullPrompt.slice(0, 120) + (fullPrompt.length > 120 ? '…' : ''))

  const res = await fetch('/local-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: fullPrompt }),
    signal,
  })

  console.log('[local] ← status:', res.status, res.statusText)

  if (!res.ok) {
    let body = ''
    try { body = await res.text() } catch (_) {}
    console.warn(`[local] ${res.status} error — ${body.slice(0, 200)}`)
    throw new Error(`local ${res.status}`)
  }

  const contentType = res.headers.get('Content-Type') || ''
  console.log('[local] content-type:', contentType)
  if (!contentType.startsWith('image/')) {
    const snippet = await res.text().then(t => t.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200))
    throw new Error(`local non-image response: ${snippet}`)
  }

  const blob = await res.blob()
  console.log('[local] blob size:', blob.size, 'bytes')
  if (!blob.size) throw new Error('empty blob')
  return URL.createObjectURL(blob)
}

// ── Tier 3: Canvas art-deco placeholder (instant, always works) ───────────────
function canvasPlaceholder(prompt) {
  return new Promise((resolve) => {
    const W = 512, H = 512
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#faf6ee'
    ctx.fillRect(0, 0, W, H)

    ctx.strokeStyle = '#b8963e'; ctx.lineWidth = 2.5
    ctx.strokeRect(16, 16, W - 32, H - 32)
    ctx.strokeStyle = '#d4af6a'; ctx.lineWidth = 0.8
    ctx.strokeRect(24, 24, W - 48, H - 48)

    const arms = 18
    ;[[16,16],[W-16,16],[16,H-16],[W-16,H-16]].forEach(([x, y]) => {
      const dx = x < W / 2 ? 1 : -1
      const dy = y < H / 2 ? 1 : -1
      ctx.strokeStyle = '#c9a84c'; ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x + dx * arms, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy * arms)
      ctx.stroke()
    })

    ctx.fillStyle = '#b8963e'; ctx.font = '13px serif'; ctx.textAlign = 'center'
    ctx.fillText('◆', W / 2, 50)
    ctx.strokeStyle = '#d4af6a'; ctx.lineWidth = 0.7
    ctx.beginPath(); ctx.moveTo(50, 60); ctx.lineTo(W - 50, 60); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(50, 64); ctx.lineTo(W - 50, 64); ctx.stroke()

    ctx.fillStyle = '#4a3820'
    ctx.font = 'italic 15px Georgia, serif'
    const maxW = W - 80, lh = 22
    const lines = []
    let cur = ''
    for (const word of prompt.split(' ')) {
      const test = cur ? cur + ' ' + word : word
      if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = word }
      else cur = test
    }
    if (cur) lines.push(cur)
    const startY = H / 2 - (lines.length * lh) / 2 + lh / 2
    lines.forEach((l, i) => ctx.fillText(l, W / 2, startY + i * lh))

    ctx.strokeStyle = '#d4af6a'; ctx.lineWidth = 0.7
    ctx.beginPath(); ctx.moveTo(50, H - 64); ctx.lineTo(W - 50, H - 64); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(50, H - 60); ctx.lineTo(W - 50, H - 60); ctx.stroke()
    ctx.fillStyle = '#b8963e'; ctx.font = '11px serif'
    ctx.fillText('· ✦ ·', W / 2, H - 46)

    canvas.toBlob(
      blob => resolve(blob ? URL.createObjectURL(blob) : canvas.toDataURL()),
      'image/jpeg', 0.9
    )
  })
}

// ── Main entry point ──────────────────────────────────────────────────────────
export async function generateImage(visualPrompt, seed, signal, themeStyle) {
  console.log('[image] token present:', !!HF_TOKEN, '| seed:', seed)

  if (HF_TOKEN) {
    try {
      const url = await tryHuggingFace(visualPrompt, signal, themeStyle)
      console.log('[image] ✓ HuggingFace succeeded')
      return url
    } catch (e) {
      if (e.name === 'AbortError') throw e
      console.warn('[image] HuggingFace failed →', e.message, '— trying local API')
    }
  } else {
    console.warn('[image] No VITE_HF_TOKEN — trying local API')
  }

  try {
    const url = await tryLocal(visualPrompt, signal, themeStyle)
    console.log('[image] ✓ local API succeeded')
    return url
  } catch (e) {
    if (e.name === 'AbortError') throw e
    console.warn('[image] local API failed →', e.message, '— falling back to canvas placeholder')
  }

  console.log('[image] rendering canvas placeholder')
  return canvasPlaceholder(visualPrompt)
}
