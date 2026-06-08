import { useState, useEffect } from 'react'
import { useApp } from '../App'
import ProgressPips from './ProgressPips'
import DecoRule from './DecoRule'
import ImageCard from './ImageCard'
import { useLLM } from '../hooks/useLLM'
import { useImages } from '../hooks/useImages'

const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X',
               'XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX']

function SourceBadge({ source }) {
  if (!source) return null
  const map = {
    groq:     { icon: '✓', label: 'Groq · llama-3.3-70b', cls: 'badge--success' },
    ollama:   { icon: '✓', label: 'Ollama · local',        cls: 'badge--success' },
    fallback: { icon: '⚠', label: 'Fallback prompt',       cls: 'badge--warn'    },
    edited:   { icon: '✎', label: 'Edited prompt',         cls: 'badge--warn'    },
  }
  const cfg = map[source]
  if (!cfg) return null
  return <span className={`source-badge ${cfg.cls}`}>{cfg.icon} {cfg.label}</span>
}

export default function StanzaScreen() {
  const { state, updateResult, nextStanza } = useApp()
  const { stanzas, results, currentIndex, poem, theme } = state
  const result = results[currentIndex]
  const stanza = stanzas[currentIndex]
  const isLast = currentIndex === stanzas.length - 1

  const [promptOpen, setPromptOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState(false)
  const [draftPrompt, setDraftPrompt] = useState('')

  // LLM: fetch visual prompt (skip if already cached)
  const llm = useLLM(stanza, result?.visualPrompt ?? null, poem, theme)

  // Persist resolved prompt into global state once
  useEffect(() => {
    if (llm.prompt && !result?.visualPrompt) {
      updateResult(currentIndex, { visualPrompt: llm.prompt, llmSource: llm.source })
    }
  }, [llm.prompt, llm.source])

  const activePrompt = result?.visualPrompt ?? null

  // Prefetch next stanza's LLM prompt so images begin loading the moment the user arrives
  const nextIdx = currentIndex + 1
  const nextLlm = useLLM(stanzas[nextIdx] ?? null, results[nextIdx]?.visualPrompt ?? null, poem, theme)

  useEffect(() => {
    if (nextLlm.prompt && results[nextIdx] && !results[nextIdx].visualPrompt) {
      updateResult(nextIdx, { visualPrompt: nextLlm.prompt, llmSource: nextLlm.source })
    }
  }, [nextLlm.prompt, nextLlm.source])

  // Image generation driven by the persisted prompt
  const { slots, regenerate: regenerateImages } = useImages(activePrompt, theme)

  const handleRegenerate = () => {
    updateResult(currentIndex, { selectedImage: null })
    regenerateImages()
  }

  const startEdit = () => {
    setDraftPrompt(activePrompt || '')
    setEditingPrompt(true)
    setPromptOpen(true)
  }

  const saveEdit = () => {
    const trimmed = draftPrompt.trim()
    if (trimmed && trimmed !== activePrompt) {
      updateResult(currentIndex, { visualPrompt: trimmed, llmSource: 'edited' })
      updateResult(currentIndex, { selectedImage: null })
      regenerateImages()
    }
    setEditingPrompt(false)
  }

  const cancelEdit = () => {
    setEditingPrompt(false)
    setDraftPrompt('')
  }

  const handleSelect = (url) => {
    updateResult(currentIndex, { selectedImage: url })
  }

  const canNext = !!result?.selectedImage

  return (
    <div className="stanza-screen">
      <header className="stanza-screen__header">
        <ProgressPips
          total={stanzas.length}
          current={currentIndex}
          className="stanza-screen__pips"
        />
        {poem.title && <p className="stanza-screen__poem-title">{poem.title}</p>}
      </header>

      <main className="stanza-screen__main">
        {/* ── Stanza Card ── */}
        <div className="stanza-card">
          <div className="stanza-card__corner stanza-card__corner--tl" aria-hidden="true" />
          <div className="stanza-card__corner stanza-card__corner--tr" aria-hidden="true" />
          <div className="stanza-card__corner stanza-card__corner--bl" aria-hidden="true" />
          <div className="stanza-card__corner stanza-card__corner--br" aria-hidden="true" />

          <div className="stanza-card__label">
            {ROMAN[currentIndex] ?? String(currentIndex + 1)}
          </div>
          <DecoRule />
          <p className="stanza-card__text">{stanza}</p>
        </div>

        {/* ── LLM Section ── */}
        <div className="llm-section">
          {llm.loading ? (
            <div className="llm-loading">
              <div className="loading-shimmer" style={{ height: '1.5rem', width: '55%' }} />
              <div className="loading-shimmer" style={{ height: '1rem', width: '35%', marginTop: '0.4rem' }} />
            </div>
          ) : (
            <>
              <div className="llm-header">
                <SourceBadge source={result?.llmSource ?? llm.source} />
                <div className="llm-header__actions">
                  <button
                    className="prompt-toggle"
                    onClick={() => setPromptOpen((v) => !v)}
                    aria-expanded={promptOpen}
                  >
                    {promptOpen ? '▲ Hide prompt' : '▼ Visual prompt'}
                  </button>
                  {activePrompt && !editingPrompt && (
                    <button className="prompt-edit-btn" onClick={startEdit}>
                      ✎ Edit
                    </button>
                  )}
                </div>
              </div>
              {promptOpen && activePrompt && (
                editingPrompt ? (
                  <div className="visual-prompt-box visual-prompt-box--editing">
                    <textarea
                      className="prompt-textarea"
                      value={draftPrompt}
                      onChange={(e) => setDraftPrompt(e.target.value)}
                      rows={4}
                      autoFocus
                    />
                    <div className="prompt-edit-actions">
                      <button className="btn-notched" onClick={saveEdit}>
                        ✓ Apply & Regenerate
                      </button>
                      <button className="btn-notched btn-ghost" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="visual-prompt-box">
                    <p>{activePrompt}</p>
                  </div>
                )
              )}
            </>
          )}
        </div>

        {/* ── Image Grid (always 3 slots) ── */}
        <div className="image-grid">
          {(activePrompt ? slots : [{url:null,status:'loading'},{url:null,status:'loading'},{url:null,status:'loading'}]).map((slot, i) => (
            <ImageCard
              key={i}
              url={slot.url}
              status={activePrompt ? slot.status : 'loading'}
              selected={!!slot.url && result?.selectedImage === slot.url}
              onSelect={() => slot.url && handleSelect(slot.url)}
              index={i}
            />
          ))}
        </div>

        {/* ── Actions ── */}
        <div className="action-row">
          <button
            className="btn-notched btn-ghost"
            onClick={handleRegenerate}
            disabled={!activePrompt}
          >
            ↺ Regenerate
          </button>
          <button
            className="btn-notched"
            onClick={nextStanza}
            disabled={!canNext}
            title={canNext ? undefined : 'Select an image to continue'}
          >
            {isLast ? 'View Complete Poem →' : 'Next Stanza →'}
          </button>
        </div>
      </main>
    </div>
  )
}
