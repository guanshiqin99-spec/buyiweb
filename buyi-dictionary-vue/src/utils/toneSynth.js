let audioContext = null

const toneContours = {
  55: [660, 660],
  11: [310, 310],
  53: [660, 390],
  31: [450, 310],
  24: [370, 540],
  33: [480, 480]
}

export async function playToneContour(value) {
  const Context = window.AudioContext || window.webkitAudioContext
  if (!Context) return false

  audioContext ||= new Context()
  if (audioContext.state === 'suspended') await audioContext.resume()

  const [startFrequency, endFrequency] = toneContours[value] || [440, 440]
  const now = audioContext.currentTime
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(startFrequency, now)
  oscillator.frequency.linearRampToValueAtTime(endFrequency, now + 0.55)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.13, now + 0.035)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.66)

  oscillator.connect(gain)
  gain.connect(audioContext.destination)
  oscillator.start(now)
  oscillator.stop(now + 0.68)
  return true
}

