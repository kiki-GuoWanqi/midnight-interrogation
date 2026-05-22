// Background music using user-provided audio file
let audio = null

function getAudio() {
  if (!audio) {
    audio = new Audio('/bgm.mp4')
    audio.loop = true
    audio.volume = 0.35
  }
  return audio
}

export function startBGM() {
  try {
    const a = getAudio()
    if (a.ended || a.currentTime === 0) a.currentTime = 0
    a.play().catch(() => {})
  } catch {}
}

export function stopBGM() {
  if (audio) {
    audio.pause()
    audio.currentTime = 0
  }
}

export function toggleBGM() {
  if (audio && !audio.paused) {
    stopBGM()
  } else {
    startBGM()
  }
}

export function getIsPlaying() {
  return audio ? !audio.paused : false
}
