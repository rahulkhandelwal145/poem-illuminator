const CACHE_NAME = 'poem-illuminator-v1'
const FONT_CACHE = 'poem-illuminator-fonts-v1'

const STATIC_ASSETS = ['/', '/index.html', '/manifest.json']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(STATIC_ASSETS).catch(() => {})
    )
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== FONT_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Network-first for API calls
  if (
    url.hostname.includes('groq.com') ||
    url.hostname.includes('huggingface.co') ||
    url.hostname.includes('localhost') ||
    url.hostname.includes('127.0.0.1') ||
    url.pathname.startsWith('/api/')
  ) {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(JSON.stringify({ error: 'offline' }), {
            headers: { 'Content-Type': 'application/json' },
          })
      )
    )
    return
  }

  // Cache-first for Google Fonts
  if (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached
          return fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone())
            return response
          })
        })
      )
    )
    return
  }

  // Cache-first with network fallback for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(
          () =>
            new Response(
              `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Poem Illuminator — Offline</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #faf6ee;
      color: #1a1208;
      font-family: Georgia, 'Times New Roman', serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 2rem;
    }
    .frame {
      max-width: 380px;
      padding: 3rem 2.5rem;
      border: 1.5px solid #b8963e;
      background: #fffdf8;
      box-shadow: 0 4px 24px rgba(90,60,10,0.08);
    }
    .rule {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 1.25rem 0;
    }
    .rule-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(to right, transparent, #b8963e, transparent);
    }
    .rule-line::after {
      content: '';
      display: block;
      margin-top: 3px;
      height: 1px;
      background: linear-gradient(to right, transparent, #d4af6a, transparent);
    }
    h1 {
      font-size: 1.4rem;
      color: #b8963e;
      letter-spacing: 0.12em;
      font-style: italic;
    }
    p {
      font-style: italic;
      color: #7a6848;
      font-size: 1.15rem;
      line-height: 1.9;
      margin-top: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="frame">
    <h1>Poem Illuminator</h1>
    <div class="rule"><div class="rule-line"></div><span style="color:#b8963e;font-size:.7rem">◆</span><div class="rule-line"></div></div>
    <p>Your verses await a connection</p>
  </div>
</body>
</html>`,
              { headers: { 'Content-Type': 'text/html' } }
            )
        )
    })
  )
})
