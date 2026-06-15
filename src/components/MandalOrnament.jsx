export default function MandalOrnament({ size = 220, className = '', style = {} }) {
  const half = size / 2

  // Generate polygon points for a star
  const star = (n, r1, r2) => {
    return Array.from({ length: n * 2 }, (_, i) => {
      const r     = i % 2 === 0 ? r1 : r2
      const angle = (i * Math.PI / n) - Math.PI / 2
      return `${(r * Math.cos(angle)).toFixed(2)},${(r * Math.sin(angle)).toFixed(2)}`
    }).join(' ')
  }

  const ticks = (n, r1, r2) =>
    Array.from({ length: n }, (_, i) => {
      const a  = (i / n) * 2 * Math.PI - Math.PI / 2
      const x1 = (r1 * Math.cos(a)).toFixed(2), y1 = (r1 * Math.sin(a)).toFixed(2)
      const x2 = (r2 * Math.cos(a)).toFixed(2), y2 = (r2 * Math.sin(a)).toFixed(2)
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
    })

  const diamonds = (n, r) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * 2 * Math.PI - Math.PI / 2
      const px = (r * Math.cos(a)).toFixed(2)
      const py = (r * Math.sin(a)).toFixed(2)
      return (
        <rect key={i} x={px - 2.5} y={py - 2.5} width="5" height="5"
          transform={`rotate(45,${px},${py})`} />
      )
    })

  const G = '#d4af37'
  const gd = 'rgba(212,175,55,0.5)'

  return (
    <svg
      width={size} height={size}
      viewBox={`${-half} ${-half} ${size} ${size}`}
      className={className}
      style={{ display: 'block', ...style }}
      aria-hidden="true"
      fill="none"
    >
      <defs>
        <filter id="mglow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feColorMatrix in="b" type="matrix"
            values="0 0 0 0 0.83  0 0 0 0 0.68  0 0 0 0 0.22  0 0 0 0.55 0"
            result="g" />
          <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <g filter="url(#mglow)">

        {/* ── Outermost petal ring — slow CW ── */}
        <g style={{ animation: 'spin-cw 90s linear infinite', transformOrigin: '0 0' }}>
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i}
              d="M0,-108 C14,-88 14,-68 0,-50 C-14,-68 -14,-88 0,-108 Z"
              transform={`rotate(${i * 45})`}
              fill="rgba(212,175,55,0.06)" stroke={G} strokeWidth="0.4" opacity="0.45" />
          ))}
          <circle r="112" stroke={G} strokeWidth="0.25" opacity="0.18" strokeDasharray="3 5" />
        </g>

        {/* ── 8-point star ring — slow CCW ── */}
        <g style={{ animation: 'spin-ccw 65s linear infinite', transformOrigin: '0 0' }}>
          <polygon points={star(8, 88, 68)}
            stroke={G} strokeWidth="0.45" opacity="0.38" />
          <circle r="90"  stroke={G} strokeWidth="0.3" opacity="0.22" />
          <circle r="68"  stroke={G} strokeWidth="0.2" opacity="0.18" />
          <g stroke={G} strokeWidth="0.4" opacity="0.45" fill={G}>
            {diamonds(8, 90)}
          </g>
        </g>

        {/* ── Mid botanical ring — medium CW ── */}
        <g style={{ animation: 'spin-cw 110s linear infinite', transformOrigin: '0 0' }}>
          {/* 16 leaf shapes */}
          {Array.from({ length: 16 }, (_, i) => (
            <path key={i}
              d="M0,-54 C6,-44 6,-36 0,-28 C-6,-36 -6,-44 0,-54 Z"
              transform={`rotate(${i * 22.5})`}
              fill="rgba(212,175,55,0.05)" stroke={G} strokeWidth="0.35" opacity="0.3" />
          ))}
          <circle r="56" stroke={G} strokeWidth="0.35" opacity="0.28" />
          <g stroke={G} strokeWidth="0.5" opacity="0.5" strokeLinecap="round">
            {ticks(16, 56, 48)}
          </g>
        </g>

        {/* ── 6-point star inner — fast CCW ── */}
        <g style={{ animation: 'spin-ccw 45s linear infinite', transformOrigin: '0 0' }}>
          <polygon points={star(6, 44, 28)}
            stroke={G} strokeWidth="0.55" opacity="0.5" />
          <circle r="46" stroke={G} strokeWidth="0.3" opacity="0.3" />
          <g stroke={G} strokeWidth="0.6" opacity="0.55" strokeLinecap="round">
            {ticks(12, 46, 38)}
          </g>
        </g>

        {/* ── Tiny inner ring — slow CW ── */}
        <g style={{ animation: 'spin-cw 70s linear infinite', transformOrigin: '0 0' }}>
          <circle r="24" stroke={G} strokeWidth="0.5" opacity="0.4" />
          <g stroke={G} strokeWidth="0.6" opacity="0.55" strokeLinecap="round">
            {ticks(8, 24, 16)}
          </g>
          <g fill={G} opacity="0.45">{diamonds(8, 24)}</g>
        </g>

        {/* ── Centre ── */}
        <circle r="9"  fill="rgba(212,175,55,0.12)" stroke={G} strokeWidth="0.8" opacity="0.6" />
        <circle r="5"  fill={gd} />
        <circle r="2.5" fill="#f5e6a0" opacity="0.95" />
      </g>
    </svg>
  )
}
