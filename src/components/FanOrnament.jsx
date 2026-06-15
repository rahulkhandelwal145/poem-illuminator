export default function FanOrnament({ size = 120, className = '' }) {
  const W  = size
  const H  = Math.round(size * 0.58)
  const cx = W / 2
  const cy = H
  const R1 = H * 0.95
  const R2 = H * 0.72
  const R3 = H * 0.5
  const GOLD     = '#d4a830'
  const GOLD_DIM = '#b88820'

  function rayEnd(angleDeg, r) {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
  }

  function arc(r, opacity, width, color = GOLD) {
    const startRad = ((-60 - 90) * Math.PI) / 180
    const endRad   = ((60  - 90) * Math.PI) / 180
    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)
    return (
      <path
        d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
        stroke={color}
        strokeWidth={width}
        fill="none"
        opacity={opacity}
      />
    )
  }

  const angles    = [-55, -40, -25, -12, 0, 12, 25, 40, 55]
  const pipAngles = [-40, 0, 40]

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className={`fan-ornament ${className}`}
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="fan-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feColorMatrix in="b" type="matrix"
            values="0 0 0 0 0.83  0 0 0 0 0.69  0 0 0 0 0.22  0 0 0 0.5 0"
            result="g" />
          <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <g filter="url(#fan-glow)">
        {/* Rays */}
        {angles.map((a, i) => {
          const [x, y] = rayEnd(a, R1)
          const alpha  = i % 2 === 0 ? 0.52 : 0.28
          return (
            <line key={a}
              x1={cx} y1={cy} x2={x} y2={y}
              stroke={GOLD}
              strokeWidth="0.7"
              opacity={alpha}
            />
          )
        })}

        {/* Outer fine petal outlines */}
        {[-45, 0, 45].map((a) => {
          const [x1, y1] = rayEnd(a - 8, R2)
          const [x2, y2] = rayEnd(a + 8, R2)
          const [mx, my] = rayEnd(a, R1 * 0.88)
          return (
            <path key={`p${a}`}
              d={`M ${cx} ${cy} Q ${mx} ${my} ${x2} ${y2}`}
              stroke={GOLD} strokeWidth="0.4" opacity="0.22" />
          )
        })}

        {/* Arc rings */}
        {arc(R1, 0.32, 0.9)}
        {arc(R2, 0.65, 0.75)}
        {arc(R3, 0.38, 0.5, GOLD_DIM)}

        {/* Diamond pips on middle arc */}
        {pipAngles.map((a) => {
          const [px, py] = rayEnd(a, R2)
          return (
            <rect key={a}
              x={px - 3} y={py - 3} width="6" height="6"
              transform={`rotate(45 ${px} ${py})`}
              fill={GOLD}
              opacity="0.75"
            />
          )
        })}

        {/* Center pip */}
        <circle cx={cx} cy={cy} r="3.5" fill={GOLD} opacity="0.82" />

        {/* Base line */}
        <line
          x1={cx - R1 * 0.98} y1={cy}
          x2={cx + R1 * 0.98} y2={cy}
          stroke={GOLD} strokeWidth="0.5" opacity="0.22"
        />
      </g>
    </svg>
  )
}
