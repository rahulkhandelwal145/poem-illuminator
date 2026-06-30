import { useState, useEffect, useCallback, useRef } from 'react'
import { generateImage } from '../utils/generateImage'
import { randomSeed } from '../utils/pollinationsUrl'

const idle = () => ({ url: null, status: 'idle' })
const loading = () => ({ url: null, status: 'loading' })

export function useImages(visualPrompt, theme = null, onLoad = null) {
  const [seeds, setSeeds] = useState(() => [randomSeed(), randomSeed(), randomSeed()])
  const [slots, setSlots] = useState([idle(), idle(), idle()])
  const [modelDown, setModelDown] = useState(false)
  const abortRefs = useRef([null, null, null])
  // Always call the latest onLoad even if the ref changes between effect runs
  const onLoadRef = useRef(onLoad)
  useEffect(() => { onLoadRef.current = onLoad }, [onLoad])

  function abortAll() {
    abortRefs.current.forEach((c) => c?.abort())
    abortRefs.current = [null, null, null]
  }

  useEffect(() => {
    if (!visualPrompt) return

    abortAll()
    setSlots([loading(), loading(), loading()])
    setModelDown(false)

    let cancelled = false

    async function runSequential() {
      const loadedUrls = new Array(seeds.length).fill(null)
      const placeholderFlags = new Array(seeds.length).fill(false)
      let anyCompleted = false
      for (let i = 0; i < seeds.length; i++) {
        if (cancelled) break
        const ctrl = new AbortController()
        abortRefs.current[i] = ctrl
        try {
          const { url, isPlaceholder } = await generateImage(visualPrompt, seeds[i], ctrl.signal, theme?.style)
          if (!cancelled) {
            loadedUrls[i] = url
            placeholderFlags[i] = isPlaceholder
            anyCompleted = true
            setSlots((prev) => {
              const next = [...prev]
              next[i] = { url, status: 'done' }
              return next
            })
          }
        } catch (err) {
          if (err.name === 'AbortError') break
          if (!cancelled) {
            placeholderFlags[i] = true
            anyCompleted = true
            setSlots((prev) => {
              const next = [...prev]
              next[i] = { url: null, status: 'error' }
              return next
            })
          }
        }
      }
      if (!cancelled) {
        if (anyCompleted && placeholderFlags.every(Boolean)) {
          setModelDown(true)
        }
        if (onLoadRef.current) onLoadRef.current(loadedUrls)
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

  return { slots, regenerate, modelDown }
}
