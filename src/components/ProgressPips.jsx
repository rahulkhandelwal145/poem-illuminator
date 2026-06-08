export default function ProgressPips({ total, current, className = '' }) {
  return (
    <div
      className={`progress-pips ${className}`}
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemax={total}
      aria-label={`Stanza ${current + 1} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => {
        const status = i < current ? 'done' : i === current ? 'active' : 'pending'
        return (
          <div
            key={i}
            className={`pip pip--${status}`}
            title={`Stanza ${i + 1}${i < current ? ' (complete)' : i === current ? ' (current)' : ''}`}
          />
        )
      })}
    </div>
  )
}
