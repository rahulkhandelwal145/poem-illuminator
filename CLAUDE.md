# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server on http://localhost:3000
npm run build     # production build → dist/
npm run preview   # serve the dist/ build locally
```

There are no tests or linting scripts configured.

## Environment Variables

Create a `.env` file at the root (not committed):

```
VITE_GROQ_API_KEY=...   # optional — enables LLM prompt generation via Groq
VITE_HF_TOKEN=...       # optional — enables image generation via HuggingFace FLUX
```

Both are optional. The app has a full fallback chain that works without any keys.

## Architecture

**Poem Illuminator** is a React 18 PWA (Vite + Tailwind) that walks users through illuminating a poem stanza-by-stanza with AI-generated images.

### Three-screen flow

App state lives in a single `useState` object in [App.jsx](src/App.jsx), shared via `AppContext`. Screen transitions are driven by `state.screen`:

1. **`input`** → `InputScreen` — collect title, author, raw poem text
2. **`stanza`** → `StanzaScreen` — for each stanza, generate a visual prompt then 3 images; user selects one before advancing
3. **`final`** → `FinalScreen` — gallery view of all stanza+image pairs; PDF export

`parsePoem` splits raw text on blank lines to produce `state.stanzas[]`. `state.results[]` mirrors this array, holding per-stanza: `visualPrompt`, `llmSource`, `images[]`, `selectedImage`.

### LLM → image pipeline

`StanzaScreen` coordinates two hooks:

- **`useLLM(stanza, cached)`** ([src/hooks/useLLM.js](src/hooks/useLLM.js)) — generates a visual image prompt from the stanza text. Tries in order: Groq (`llama3-70b-8192`) → Ollama (local `llama3`) → hardcoded fallback string. Result is persisted into `AppContext` via `updateResult` so revisiting a stanza doesn't re-fetch.
- **`useImages(visualPrompt)`** ([src/hooks/useImages.js](src/hooks/useImages.js)) — fires 3 parallel image requests with independent random seeds. Tries HuggingFace FLUX.1-schnell first, falls back to `picsum.photos` (seeded placeholder). Each slot has a `status` of `idle | loading | done | error`. Abort controllers are used to cancel in-flight requests on prompt change or regenerate.

Image URLs are built in [src/utils/pollinationsUrl.js](src/utils/pollinationsUrl.js) (Pollinations.ai) and [src/utils/generateImage.js](src/utils/generateImage.js) (HuggingFace/picsum). Both prepend a shared art-deco style prefix to every prompt.

### PDF export

[src/utils/exportPDF.js](src/utils/exportPDF.js) uses jsPDF (loaded from CDN via `<script>` in `index.html`, available as `window.jspdf`). It generates a cover page + one page per stanza. Images are fetched and converted to base64 via a canvas element to satisfy jsPDF's `addImage` API.

### Styling

Tailwind is used alongside two global CSS files:
- [src/styles/globals.css](src/styles/globals.css) — CSS custom properties (color tokens, font stacks), base resets, and utility component classes (`.btn-notched`, `.input-field`, `.stanza-card`, etc.)
- [src/styles/deco.css](src/styles/deco.css) — decorative/ornamental component styles

Tailwind theme extends the same color palette (parchment, cream, gold variants, charcoal, taupe) for use in inline class-based styling.

Fonts loaded from Google Fonts: **Cormorant Garamond** (display headings), **EB Garamond** (body/verse text), **Josefin Sans** (UI labels).

### PWA

`public/sw.js` is a hand-written service worker (not Workbox). Strategy:
- API calls (Groq, Pollinations, localhost) → network-first
- Google Fonts → cache-first
- Static assets → cache-first with network fallback
- Full offline page served when app shell is unavailable

The service worker is registered in [src/main.jsx](src/main.jsx) on `load`. `public/manifest.json` configures the installable PWA (portrait orientation, parchment theme color).
