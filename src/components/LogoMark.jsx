export default function LogoMark({ size = 56, className = '' }) {
  const G  = '#b07820'
  const Gm = 'rgba(176,120,32,0.75)'
  const Gf = 'rgba(176,120,32,0.32)'

  const ray = (i, n, r1, r2) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    return {
      x1: (r1 * Math.cos(a)).toFixed(3),
      y1: (r1 * Math.sin(a)).toFixed(3),
      x2: (r2 * Math.cos(a)).toFixed(3),
      y2: (r2 * Math.sin(a)).toFixed(3),
    }
  }

  return (
    <svg
      width={size} height={size}
      viewBox="-50 -50 100 100"
      className={className}
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* outer ring */}
      <circle r="46" stroke={Gm} strokeWidth="0.8" />

      {/* 16 rays — alternating long/short */}
      {Array.from({ length: 16 }, (_, i) => {
        const long = i % 2 === 0
        const r    = ray(i, 16, long ? 26 : 31, long ? 42 : 37)
        return (
          <line key={i}
            x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
            stroke={G}
            strokeWidth={long ? '1' : '0.6'}
            opacity={long ? 0.85 : 0.55}
          />
        )
      })}

      {/* mid ring */}
      <circle r="24" stroke={G} strokeWidth="0.7" opacity="0.75" />

      {/* 4 diamond pips at cardinal points */}
      {[0, 90, 180, 270].map((deg) => {
        const a  = (deg - 90) * Math.PI / 180
        const px = (24 * Math.cos(a)).toFixed(2)
        const py = (24 * Math.sin(a)).toFixed(2)
        return (
          <rect key={deg}
            x={Number(px) - 2.5} y={Number(py) - 2.5}
            width="5" height="5"
            transform={`rotate(45,${px},${py})`}
            fill={G} opacity="0.8"
          />
        )
      })}

      {/* inner ring */}
      <circle r="12" stroke={Gm} strokeWidth="0.6" />

      {/* diagonal ticks between cardinals */}
      {[45, 135, 225, 315].map((deg) => {
        const a = (deg - 90) * Math.PI / 180
        return (
          <line key={deg}
            x1={(14 * Math.cos(a)).toFixed(2)} y1={(14 * Math.sin(a)).toFixed(2)}
            x2={(22 * Math.cos(a)).toFixed(2)} y2={(22 * Math.sin(a)).toFixed(2)}
            stroke={G} strokeWidth="0.6" opacity="0.55"
          />
        )
      })}

      {/* centre */}
      <circle r="5"   fill={Gf} />
      <circle r="2.8" fill={G}  opacity="0.9" />
      <circle r="1.2" fill="#f4efe4" />
    </svg>
  )
}
