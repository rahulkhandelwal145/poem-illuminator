export default function FanOrnament({ size = 120, className = '' }) {
  const W = size
  const H = Math.round(size * 0.58)
  const cx = W / 2
  const cy = H
  const R1 = H * 0.95
  const R2 = H * 0.72
  const R3 = H * 0.5

  function rayEnd(angleDeg, r) {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
  }

  function arc(r, opacity, width) {
    const startRad = ((-60 - 90) * Math.PI) / 180
    const endRad = ((60 - 90) * Math.PI) / 180
    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)
    return (
      <path
        d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
        stroke="#b8963e"
        strokeWidth={width}
        fill="none"
        opacity={opacity}
      />
    )
  }

  const angles = [-55, -40, -25, -12, 0, 12, 25, 40, 55]
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
      {/* Rays */}
      {angles.map((a, i) => {
        const [x, y] = rayEnd(a, R1)
        const alpha = i % 2 === 0 ? 0.55 : 0.38
        return (
          <line
            key={a}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#b8963e"
            strokeWidth="0.75"
            opacity={alpha}
          />
        )
      })}

      {/* Arc rings */}
      {arc(R1, 0.4, 1)}
      {arc(R2, 0.6, 0.75)}
      {arc(R3, 0.45, 0.5)}

      {/* Diamond pips on middle arc */}
      {pipAngles.map((a) => {
        const [px, py] = rayEnd(a, R2)
        return (
          <rect
            key={a}
            x={px - 3}
            y={py - 3}
            width="6"
            height="6"
            transform={`rotate(45 ${px} ${py})`}
            fill="#b8963e"
            opacity="0.65"
          />
        )
      })}

      {/* Center pip */}
      <circle cx={cx} cy={cy} r="3" fill="#b8963e" opacity="0.75" />

      {/* Base line */}
      <line
        x1={cx - R1 * 0.98}
        y1={cy}
        x2={cx + R1 * 0.98}
        y2={cy}
        stroke="#b8963e"
        strokeWidth="0.5"
        opacity="0.3"
      />
    </svg>
  )
}
