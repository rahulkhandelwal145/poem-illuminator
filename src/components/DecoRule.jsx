export default function DecoRule({ className = '' }) {
  return (
    <div className={`deco-rule ${className}`} aria-hidden="true">
      <div className="deco-rule__line" />
      <span className="deco-rule__center">◆</span>
      <div className="deco-rule__line" />
    </div>
  )
}
