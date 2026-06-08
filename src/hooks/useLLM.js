import { useState, useEffect } from 'react'

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY

const STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with',
  'is','are','was','were','be','been','have','has','had','do','did','will',
  'would','could','should','may','might','shall','not','no','nor','so',
  'yet','both','either','neither','as','than','then','that','this','these',
  'those','i','me','my','we','our','you','your','he','his','she','her',
  'it','its','they','them','their','what','which','who','whom','when',
  'where','why','how','all','each','every','some','any','few','more',
  'most','other','into','onto','upon','from','by','up','out','about',
])

function stanzaFallback(stanza, poem) {
  const words = stanza
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w))
  const unique = [...new Set(words)].slice(0, 7)
  const context = poem?.title ? `inspired by "${poem.title}", ` : ''
  const style = 'painterly illuminated manuscript, warm golden light, art nouveau, parchment tones'
  return unique.length > 0
    ? `${context}${unique.join(', ')}, ${style}`
    : `${context}${style}`
}

function buildUserPrompt(stanza, poem, theme) {
  const context = poem?.title
    ? `The poem is "${poem.title}"${poem.author ? ` by ${poem.author}` : ''}. `
    : ''
  const styleNote = theme?.label ? ` The illustration style is ${theme.label}.` : ''
  return `You are an illustrator creating an illuminated manuscript.${styleNote} ${context}For this stanza:\n\n"${stanza}"\n\nWrite a single image generation prompt under 70 words. Start with a specific scene, figure, or object drawn directly from the stanza's imagery and meaning. Name concrete visual subjects (people, landscapes, creatures, objects). Then add mood and atmosphere that match the poem's tone. Return ONLY the prompt, no explanation.`
}

async function tryGroq(stanza, poem, theme) {
  const userPrompt = buildUserPrompt(stanza, poem, theme)
  console.log('[llm] Groq request prompt:\n', userPrompt)
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), 7000)
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: userPrompt }],
        max_tokens: 150,
        temperature: 0.75,
      }),
      signal: controller.signal,
    })
    clearTimeout(id)
    if (!res.ok) throw new Error(`Groq ${res.status}`)
    const data = await res.json()
    return data.choices[0].message.content.trim()
  } catch (e) {
    clearTimeout(id)
    throw e
  }
}

async function tryOllama(stanza, poem, theme) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        prompt: buildUserPrompt(stanza, poem, theme),
        stream: false,
      }),
      signal: controller.signal,
    })
    clearTimeout(id)
    if (!res.ok) throw new Error(`Ollama ${res.status}`)
    const data = await res.json()
    return data.response.trim()
  } catch (e) {
    clearTimeout(id)
    throw e
  }
}

export function useLLM(stanza, cached = null, poem = null, theme = null) {
  const [state, setState] = useState(() =>
    cached
      ? { prompt: cached, source: 'groq', loading: false, error: null }
      : { prompt: null, source: null, loading: true, error: null }
  )

  useEffect(() => {
    if (cached) {
      setState({ prompt: cached, source: 'groq', loading: false, error: null })
      return
    }
    if (!stanza) return

    let cancelled = false
    setState({ prompt: null, source: null, loading: true, error: null })

    async function run() {
      if (GROQ_KEY) {
        try {
          const prompt = await tryGroq(stanza, poem, theme)
          console.log('[llm] Groq ✓ visual prompt:', prompt)
          if (!cancelled) setState({ prompt, source: 'groq', loading: false, error: null })
          return
        } catch (e) {
          console.warn('[llm] Groq failed:', e.message)
        }
      } else {
        console.log('[llm] No GROQ key — skipping Groq')
      }

      try {
        const prompt = await tryOllama(stanza, poem, theme)
        console.log('[llm] Ollama ✓ visual prompt:', prompt)
        if (!cancelled) setState({ prompt, source: 'ollama', loading: false, error: null })
        return
      } catch (e) {
        console.warn('[llm] Ollama failed:', e.message)
      }

      const prompt = stanzaFallback(stanza, poem)
      console.warn('[llm] All LLM sources failed — using stanza keywords:', prompt)
      if (!cancelled)
        setState({ prompt, source: 'fallback', loading: false, error: null })
    }

    run()
    return () => { cancelled = true }
  }, [stanza, cached])

  return state
}
