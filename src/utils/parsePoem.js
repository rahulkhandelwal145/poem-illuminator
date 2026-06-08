export function parsePoem(raw) {
  return raw
    .split(/\n[ \t]*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}
