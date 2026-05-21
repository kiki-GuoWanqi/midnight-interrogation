// --- Typewriter effect ---
export function createTypewriter(text, onChar, onDone, speed = 45) {
  let index = 0
  let cancelled = false

  function type() {
    if (cancelled || index >= text.length) {
      if (!cancelled) onDone()
      return
    }
    onChar(text.slice(0, index + 1))
    index++
    setTimeout(type, speed)
  }

  type()

  return () => { cancelled = true }
}
