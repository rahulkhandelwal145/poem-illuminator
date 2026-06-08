import { useApp } from '../App'
import DecoRule from './DecoRule'
import { exportPDF } from '../utils/exportPDF'

const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X',
               'XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX']

export default function FinalScreen() {
  const { state, goToStanza } = useApp()
  const { poem, results } = state

  const handleExport = () => {
    exportPDF({ poem, results })
  }

  return (
    <div className="final-screen">
      <header className="final-screen__header">
        <h1 className="final-screen__title">{poem.title || 'Untitled'}</h1>
        {poem.author && (
          <p className="final-screen__author">{poem.author}</p>
        )}
        <DecoRule className="final-screen__rule" />
      </header>

      <main className="final-screen__main">
        {results.map((result, i) => (
          <article key={i}>
            <div className="final-pair__label">
              {ROMAN[i] ?? String(i + 1)}
            </div>
            <div className="final-pair__card">
              {result.selectedImage ? (
                <button
                  className="final-pair__image-btn"
                  onClick={() => goToStanza(i)}
                  title="Click to re-select image for this stanza"
                  aria-label={`Re-select image for stanza ${i + 1}`}
                >
                  <img
                    src={result.selectedImage}
                    alt={`Illustration for stanza ${i + 1}`}
                    className="final-pair__image"
                    loading="lazy"
                  />
                </button>
              ) : (
                <div
                  className="final-pair__image"
                  style={{
                    background: 'var(--color-cream)',
                    border: '1px solid var(--color-gold-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-taupe)',
                    fontSize: '1.5rem',
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  ◆
                </div>
              )}
              <div className="final-pair__stanza">
                <p>{result.stanza}</p>
              </div>
            </div>
          </article>
        ))}
      </main>

      <footer className="final-screen__footer">
        <button className="btn-notched" onClick={handleExport}>
          ⬇ Export Illuminated PDF
        </button>
      </footer>
    </div>
  )
}
