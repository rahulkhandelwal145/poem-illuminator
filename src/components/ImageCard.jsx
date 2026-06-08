import { useState } from 'react'

export default function ImageCard({ url, status, selected, onSelect, index }) {
  const [imgError, setImgError] = useState(false)

  const isLoading = status === 'loading' || status === 'idle'
  const isError = status === 'error' || imgError
  const isDone = status === 'done' && !imgError

  const activate = () => isDone && onSelect()

  return (
    <div
      className={`image-card${selected ? ' image-card--selected' : ''}`}
      onClick={activate}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && activate()}
      aria-label={`Illustration option ${index + 1}${selected ? ' — selected' : ''}`}
      aria-pressed={selected}
    >
      {isLoading && <div className="image-card__shimmer" aria-hidden="true" />}

      {status === 'done' && url && !imgError && (
        <img
          src={url}
          alt={`Generated illustration ${index + 1}`}
          className="image-card__img image-card__img--loaded"
          onError={() => setImgError(true)}
        />
      )}

      {isError && (
        <div className="image-card__error">
          <span style={{ fontSize: '1.2rem' }}>◆</span>
          <p>Unavailable</p>
        </div>
      )}

      {selected && (
        <div className="image-card__selected-overlay" aria-hidden="true">
          <span className="image-card__selected-label">✦ Selected</span>
        </div>
      )}
    </div>
  )
}
