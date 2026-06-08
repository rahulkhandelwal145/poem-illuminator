const STYLE_SUFFIX =
  ', art deco book illustration, warm golden light, parchment and gold tones, ornate engraving style'

export function getPollinationsUrl(prompt, seed) {
  const full = prompt + STYLE_SUFFIX
  return `https://gen.pollinations.ai/image/${encodeURIComponent(full)}?seed=${seed}&width=512&height=512&model=flux`
}

export function randomSeed() {
  return Math.floor(Math.random() * 9_000_000) + 1_000_000
}

export function generateSeeds(count = 3) {
  return Array.from({ length: count }, randomSeed)
}
