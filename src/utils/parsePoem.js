export function parsePoem(raw) {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split(/\n[ \t]*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}
