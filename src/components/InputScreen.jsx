import { useState, useEffect } from 'react'
import { useApp } from '../App'
import LogoMark from './LogoMark'
import FloralCorner from './FloralCorner'
import DecoRule from './DecoRule'
import { THEMES, DEFAULT_THEME } from '../utils/themes'

export default function InputScreen() {
  const { state, beginIllumination } = useApp()
  const [title, setTitle] = useState(state.poem.title)
  const [author, setAuthor] = useState(state.poem.author)
  const [raw, setRaw] = useState(state.poem.raw)
  const [error, setError] = useState('')
  const [selectedTheme, setSelectedTheme] = useState(state.theme ?? DEFAULT_THEME)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

  const handleSubmit = () => {
    if (!title.trim()) { setError('Please enter a title.'); return }
    if (!raw.trim())   { setError('Please paste your poem.'); return }
    setError('')
    beginIllumination({ title: title.trim(), author: author.trim(), raw }, selectedTheme)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
  }

  return (
    <div className="input-screen">
      {deferredPrompt && (
        <div className="install-banner">
          <span>◆ Add to Home Screen for the full experience</span>
          <button className="install-banner__btn" onClick={handleInstall}>Install</button>
        </div>
      )}

      <main className="input-screen__inner">

        {/* ── Logo with flanking flowers ── */}
        <div className="input-screen__logo-wrap">
          <FloralCorner style={{ width: 80, height: 80, opacity: 0.8, animation: 'sway 6s ease-in-out infinite', flexShrink: 0 }} />
          <div className="input-screen__logo" style={{ animation: 'float-up 5s ease-in-out infinite' }}>
            <LogoMark size={52} />
            <div className="input-screen__logo-text">
              <span className="input-screen__logo-primary">Poem Illuminator</span>
              <span className="input-screen__logo-sub">verse made luminous</span>
            </div>
          </div>
          <FloralCorner style={{ width: 80, height: 80, opacity: 0.8, transform: 'scaleX(-1)', animation: 'sway 6s ease-in-out infinite', animationDelay: '2s', flexShrink: 0 }} />
        </div>

        <DecoRule className="input-screen__rule" />

        <form
          className="input-screen__form"
          onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
          noValidate
        >
            <div className="input-row">
              <div className="input-group">
                <label className="input-label" htmlFor="pi-title">Title</label>
                <input
                  id="pi-title"
                  className="input-field"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="The Waste Land"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="pi-author">Author</label>
                <input
                  id="pi-author"
                  className="input-field"
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="T. S. Eliot"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="pi-poem">Poem</label>
              <textarea
                id="pi-poem"
                className="input-field input-field--textarea"
                value={raw}
                onChange={(e) => setRaw(e.target.value.replace(/\r\n/g, '\n').replace(/\r/g, '\n'))}
                onPaste={(e) => {
                  e.preventDefault()
                  const text = e.clipboardData.getData('text/plain')
                  setRaw(text.replace(/\r\n/g, '\n').replace(/\r/g, '\n'))
                }}
                onKeyDown={handleKeyDown}
                placeholder="Lay your poem here, stanza by stanza…"
                required
              />
              <p className="input-helper">Separate stanzas with a blank line · ⌘ Enter to begin</p>
            </div>

            <div className="input-group">
              <label className="input-label">Image Style</label>
              <div className="theme-grid">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    className={`theme-card${selectedTheme.id === theme.id ? ' theme-card--active' : ''}`}
                    onClick={() => setSelectedTheme(theme)}
                  >
                    <span className="theme-card__label">{theme.label}</span>
                    <span className="theme-card__desc">{theme.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="input-error" role="alert">{error}</p>}

            <button type="submit" className="btn-illuminate">
              Begin Illumination
            </button>
          </form>
      </main>
    </div>
  )
}
