export default function FloralCorner({ className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 140 140"
      width="140" height="140"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── main curving vine ── */}
      <path
        d="M4,136 C18,100 38,76 62,52 C80,34 106,18 136,4"
        stroke="#8b5e14" strokeWidth="1.4" strokeLinecap="round"
      />
      {/* branch left */}
      <path d="M38,98 C28,88 22,76 30,64" stroke="#8b5e14" strokeWidth="1" strokeLinecap="round"/>
      {/* branch right */}
      <path d="M72,62 C82,52 94,50 100,42" stroke="#8b5e14" strokeWidth="1" strokeLinecap="round"/>
      {/* small twig */}
      <path d="M54,82 C48,72 52,62 58,58" stroke="#8b5e14" strokeWidth="0.8" strokeLinecap="round"/>

      {/* ── Leaf 1 — near bottom ── */}
      <ellipse cx="24" cy="118" rx="10" ry="5" fill="#4a7a3a" opacity="0.75"
        transform="rotate(-40 24 118)" />
      <ellipse cx="18" cy="118" rx="8" ry="4" fill="#5a8a44" opacity="0.5"
        transform="rotate(-40 18 118)" />

      {/* ── Leaf 2 ── */}
      <ellipse cx="46" cy="94" rx="9" ry="4.5" fill="#4a7a3a" opacity="0.7"
        transform="rotate(-65 46 94)" />

      {/* ── Leaf 3 — mid vine ── */}
      <ellipse cx="72" cy="66" rx="9" ry="4" fill="#5a8a44" opacity="0.65"
        transform="rotate(-120 72 66)" />

      {/* ── Leaf 4 — upper ── */}
      <ellipse cx="98" cy="40" rx="8" ry="3.8" fill="#4a7a3a" opacity="0.7"
        transform="rotate(-150 98 40)" />

      {/* ── Leaf 5 — branch ── */}
      <ellipse cx="28" cy="74" rx="7" ry="3.2" fill="#5a8a44" opacity="0.55"
        transform="rotate(-20 28 74)" />

      {/* ── Rose 1 — large, lower ── */}
      <g transform="translate(30,64)">
        {[0,72,144,216,288].map((a) => (
          <ellipse key={a} cx={0} cy={-7} rx="5" ry="8"
            fill="#c04060" opacity="0.82"
            transform={`rotate(${a})`} />
        ))}
        {[36,108,180,252,324].map((a) => (
          <ellipse key={a} cx={0} cy={-5} rx="3.5" ry="6"
            fill="#e06080" opacity="0.65"
            transform={`rotate(${a})`} />
        ))}
        <circle r="4" fill="#f0a040" opacity="0.9" />
        <circle r="2" fill="#f8d060" />
      </g>

      {/* ── Rose 2 — upper branch end ── */}
      <g transform="translate(100,42)">
        {[0,72,144,216,288].map((a) => (
          <ellipse key={a} cx={0} cy={-6} rx="4" ry="7"
            fill="#b03858" opacity="0.8"
            transform={`rotate(${a})`} />
        ))}
        {[36,108,180,252,324].map((a) => (
          <ellipse key={a} cx={0} cy={-4} rx="3" ry="5"
            fill="#d05878" opacity="0.6"
            transform={`rotate(${a})`} />
        ))}
        <circle r="3.5" fill="#f0a040" opacity="0.9" />
        <circle r="1.6" fill="#f8d060" />
      </g>

      {/* ── Small flower 1 — twig end ── */}
      <g transform="translate(58,56)">
        {[0,60,120,180,240,300].map((a) => (
          <ellipse key={a} cx={0} cy={-4.5} rx="2.5" ry="4.5"
            fill="#d080c0" opacity="0.75"
            transform={`rotate(${a})`} />
        ))}
        <circle r="2.5" fill="#f8e060" opacity="0.95" />
      </g>

      {/* ── Small flower 2 — top near end ── */}
      <g transform="translate(118,22)">
        {[0,60,120,180,240,300].map((a) => (
          <ellipse key={a} cx={0} cy={-4} rx="2.2" ry="4"
            fill="#e07090" opacity="0.72"
            transform={`rotate(${a})`} />
        ))}
        <circle r="2.2" fill="#f8d050" opacity="0.9" />
      </g>

      {/* ── Tiny bud on branch ── */}
      <g transform="translate(26,66)">
        <ellipse cx="0" cy="-3" rx="2" ry="3.5" fill="#c04060" opacity="0.6" />
        <ellipse cx="0" cy="-3" rx="1.2" ry="2.5" fill="#e06080" opacity="0.5"
          transform="rotate(40)" />
      </g>

      {/* ── Gold accent dots (pollen) ── */}
      {[[32,68],[102,44],[60,58],[120,24]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="1.2" fill="#d4a830" opacity="0.7" />
      ))}
    </svg>
  )
}
