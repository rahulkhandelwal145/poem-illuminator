import { useState } from 'react'
import { useApp } from '../App'
import DecoRule from './DecoRule'
import HomeButton from './HomeButton'
import { exportPDF, exportBookPDF } from '../utils/exportPDF'

const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X',
               'XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX']

export default function FinalScreen() {
  const { state, goToStanza, addToBook, removeFromBook } = useApp()
  const { poem, results, book = [] } = state
  const [bookTitle, setBookTitle] = useState('')

  const handleExport = () => exportPDF({ poem, results })

  const handleExportBook = () => {
    if (!bookTitle.trim()) return
    exportBookPDF({ poems: [...book, { poem, results }], bookTitle: bookTitle.trim() })
  }

  return (
    <div className="final-screen">
      <HomeButton />
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
                <p>
                  {result.stanza.split('\n').map((line, i, arr) => (
                    <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                  ))}
                </p>
              </div>
            </div>
          </article>
        ))}
      </main>

      {book.length > 0 && (
        <div className="book-panel">
          <p className="book-panel__title">◆ Your Book · {book.length + 1} poems</p>
          <div className="book-panel__name-row">
            <input
              className="input-field book-panel__name-input"
              type="text"
              placeholder="Name your collection…"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
            />
          </div>
          <ul className="book-panel__list">
            {book.map((entry, i) => (
              <li key={i} className="book-panel__item">
                <span className="book-panel__item-num">{ROMAN[i] ?? i + 1}</span>
                <span className="book-panel__item-title">{entry.poem.title || 'Untitled'}</span>
                {entry.poem.author && <span className="book-panel__item-author">— {entry.poem.author}</span>}
                <button className="book-panel__remove" onClick={() => removeFromBook(i)} aria-label="Remove poem from book">×</button>
              </li>
            ))}
            <li className="book-panel__item book-panel__item--current">
              <span className="book-panel__item-num">{ROMAN[book.length] ?? book.length + 1}</span>
              <span className="book-panel__item-title">{poem.title || 'Untitled'}</span>
              {poem.author && <span className="book-panel__item-author">— {poem.author}</span>}
              <span className="book-panel__current-badge">current</span>
            </li>
          </ul>
        </div>
      )}

      <footer className="final-screen__footer">
        <button className="btn-notched btn-ghost" onClick={addToBook}>
          + Add Another Poem
        </button>
        <button className="btn-notched" onClick={handleExport}>
          ⬇ Export PDF
        </button>
        {book.length > 0 && (
          <button
            className="btn-notched"
            onClick={handleExportBook}
            disabled={!bookTitle.trim()}
            title={!bookTitle.trim() ? 'Enter a collection name above' : undefined}
          >
            ⬇ Export Book ({book.length + 1} poems)
          </button>
        )}
      </footer>
    </div>
  )
}
