import { useState, useEffect, useCallback, useRef } from 'react'
import { generateImage } from '../utils/generateImage'
import { randomSeed } from '../utils/pollinationsUrl'

const idle = () => ({ url: null, status: 'idle' })
const loading = () => ({ url: null, status: 'loading' })

export function useImages(visualPrompt, theme = null) {
  const [seeds, setSeeds] = useState(() => [randomSeed(), randomSeed(), randomSeed()])
  const [slots, setSlots] = useState([idle(), idle(), idle()])
  const abortRefs = useRef([null, null, null])

  function abortAll() {
    abortRefs.current.forEach((c) => c?.abort())
    abortRefs.current = [null, null, null]
  }

  useEffect(() => {
    if (!visualPrompt) return

    abortAll()
    setSlots([loading(), loading(), loading()])

    let cancelled = false

    async function runSequential() {
      for (let i = 0; i < seeds.length; i++) {
        if (cancelled) break
        const ctrl = new AbortController()
        abortRefs.current[i] = ctrl
        try {
          const url = await generateImage(visualPrompt, seeds[i], ctrl.signal, theme?.style)
          if (!cancelled) {
            setSlots((prev) => {
              const next = [...prev]
              next[i] = { url, status: 'done' }
              return next
            })
          }
        } catch (err) {
          if (err.name === 'AbortError') break
          if (!cancelled) {
            setSlots((prev) => {
              const next = [...prev]
              next[i] = { url: null, status: 'error' }
              return next
            })
          }
        }
      }
    }

    runSequential()

    return () => {
      cancelled = true
      abortAll()
    }
  }, [visualPrompt, seeds])

  const regenerate = useCallback(() => {
    setSeeds([randomSeed(), randomSeed(), randomSeed()])
  }, [])

  return { slots, regenerate }
}
