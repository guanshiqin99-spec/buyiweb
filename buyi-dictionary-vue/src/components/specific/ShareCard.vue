<script setup>
import { ref } from 'vue'

const canvasRef = ref(null)
const CARD_WIDTH = 1200
const CARD_HEIGHT = 1600
const SITE_NAME = '布依族词典'
const SITE_DOMAIN = 'buyi-dictionary.pages.dev'

function drawBatikPattern(context) {
  context.save()
  context.strokeStyle = 'rgba(255, 255, 255, 0.16)'
  context.lineWidth = 3

  const drawMotif = (centerX, centerY, radius) => {
    context.beginPath()
    for (let index = 0; index < 8; index += 1) {
      const angle = (Math.PI * 2 * index) / 8
      const nextAngle = angle + Math.PI / 8
      const innerX = centerX + Math.cos(angle) * radius * 0.35
      const innerY = centerY + Math.sin(angle) * radius * 0.35
      const outerX = centerX + Math.cos(nextAngle) * radius
      const outerY = centerY + Math.sin(nextAngle) * radius
      if (index === 0) context.moveTo(innerX, innerY)
      context.quadraticCurveTo(outerX, outerY, centerX + Math.cos(angle + Math.PI / 4) * radius * 0.35, centerY + Math.sin(angle + Math.PI / 4) * radius * 0.35)
    }
    context.closePath()
    context.stroke()

    context.beginPath()
    context.arc(centerX, centerY, radius * 0.18, 0, Math.PI * 2)
    context.stroke()
  }

  drawMotif(130, 140, 88)
  drawMotif(CARD_WIDTH - 150, CARD_HEIGHT - 180, 118)

  context.beginPath()
  context.moveTo(90, CARD_HEIGHT - 330)
  context.bezierCurveTo(270, CARD_HEIGHT - 430, 360, CARD_HEIGHT - 210, 530, CARD_HEIGHT - 300)
  context.bezierCurveTo(700, CARD_HEIGHT - 390, 790, CARD_HEIGHT - 170, 970, CARD_HEIGHT - 270)
  context.stroke()
  context.restore()
}

function drawWrappedText(context, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const characters = [...String(text || '')]
  const lines = []
  let line = ''

  characters.forEach((character) => {
    const candidate = `${line}${character}`
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line)
      line = character
    } else {
      line = candidate
    }
  })
  if (line) lines.push(line)

  const visibleLines = lines.slice(0, maxLines)
  if (lines.length > maxLines) {
    let lastLine = visibleLines[maxLines - 1]
    while (lastLine && context.measureText(`${lastLine}…`).width > maxWidth) lastLine = lastLine.slice(0, -1)
    visibleLines[maxLines - 1] = `${lastLine}…`
  }

  visibleLines.forEach((currentLine, index) => {
    context.fillText(currentLine, x, y + index * lineHeight)
  })
  return y + visibleLines.length * lineHeight
}

function normalizeStats(stats) {
  return (Array.isArray(stats) ? stats : []).slice(0, 3).map((stat) => {
    if (typeof stat === 'string') return { label: stat, value: '' }
    return {
      label: String(stat?.label || ''),
      value: `${stat?.value ?? 0}${stat?.unit || ''}`
    }
  })
}

function roundedRectPath(context, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2)
  context.moveTo(x + safeRadius, y)
  context.lineTo(x + width - safeRadius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius)
  context.lineTo(x + width, y + height - safeRadius)
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height)
  context.lineTo(x + safeRadius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius)
  context.lineTo(x, y + safeRadius)
  context.quadraticCurveTo(x, y, x + safeRadius, y)
  context.closePath()
}

// 跨域封面需以 anonymous 方式加载，避免画布被污染导致 toBlob 失败
function loadImage(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('缺少图片地址'))
      return
    }
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('封面图片加载失败'))
    image.src = url
  })
}

async function generate(options = {}) {
  const canvas = canvasRef.value
  if (!canvas) throw new Error('分享卡片画布尚未就绪')

  if (document.fonts?.load) {
    await document.fonts.load('700 96px "Noto Serif SC"').catch(() => undefined)
  }

  canvas.width = CARD_WIDTH
  canvas.height = CARD_HEIGHT
  const context = canvas.getContext('2d')
  if (!context) throw new Error('当前浏览器无法创建分享卡片')

  const gradient = context.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT)
  gradient.addColorStop(0, '#1b3a5c')
  gradient.addColorStop(1, '#0d2538')
  context.fillStyle = gradient
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)
  drawBatikPattern(context)

  context.fillStyle = 'rgba(255, 255, 255, 0.68)'
  context.font = '600 30px "Noto Sans SC", sans-serif'
  context.letterSpacing = '5px'
  context.fillText(options.title || '今日布依语', 110, 210)
  context.letterSpacing = '0px'

  // 封面加载：优先传入的 coverUrl，失败时回退到 fallbackCover，保证画布不被污染且不卡死
  let coverImage = null
  if (options.coverUrl) {
    try {
      coverImage = await loadImage(options.coverUrl)
    } catch {
      coverImage = null
    }
  }
  if (!coverImage && options.fallbackCover) {
    try {
      coverImage = await loadImage(options.fallbackCover)
    } catch {
      coverImage = null
    }
  }

  const stats = normalizeStats(options.stats)

  if (coverImage) {
    // 民歌分享卡布局：封面 + 曲名 + 演唱者
    const coverSize = 720
    const coverX = (CARD_WIDTH - coverSize) / 2
    const coverY = 280

    context.save()
    context.shadowColor = 'rgba(0, 0, 0, 0.45)'
    context.shadowBlur = 56
    context.shadowOffsetY = 24
    context.beginPath()
    roundedRectPath(context, coverX, coverY, coverSize, coverSize, 32)
    context.fillStyle = '#0d2538'
    context.fill()
    context.restore()

    context.save()
    context.beginPath()
    roundedRectPath(context, coverX, coverY, coverSize, coverSize, 32)
    context.clip()
    context.drawImage(coverImage, coverX, coverY, coverSize, coverSize)
    context.restore()

    context.strokeStyle = 'rgba(255, 255, 255, 0.32)'
    context.lineWidth = 2
    context.beginPath()
    roundedRectPath(context, coverX, coverY, coverSize, coverSize, 32)
    context.stroke()

    context.fillStyle = '#ffffff'
    context.font = '700 76px "Noto Serif SC", "Songti SC", serif'
    const translationTop = drawWrappedText(context, options.word || '布依民歌', 110, 1100, 980, 92, 2)

    context.fillStyle = 'rgba(255, 255, 255, 0.74)'
    context.font = '500 38px "Noto Sans SC", sans-serif'
    drawWrappedText(context, options.translation || '', 110, translationTop + 50, 920, 56, 2)
  } else if (stats.length) {
    context.fillStyle = '#ffffff'
    context.font = '700 72px "Noto Serif SC", "Songti SC", serif'
    const reportBottom = drawWrappedText(context, options.title || '我的布依语学习报告', 110, 390, 980, 100, 2)

    const cardTop = Math.max(590, reportBottom + 90)
    const cardWidth = (980 - (stats.length - 1) * 24) / stats.length
    stats.forEach((stat, index) => {
      const left = 110 + index * (cardWidth + 24)
      context.fillStyle = 'rgba(255, 255, 255, 0.09)'
      context.strokeStyle = 'rgba(255, 255, 255, 0.22)'
      context.lineWidth = 2
      context.beginPath()
      roundedRectPath(context, left, cardTop, cardWidth, 280, 28)
      context.fill()
      context.stroke()

      context.fillStyle = '#ffffff'
      context.font = '700 68px "Noto Serif SC", "Songti SC", serif'
      context.textAlign = 'center'
      context.fillText(stat.value, left + cardWidth / 2, cardTop + 126)
      context.fillStyle = 'rgba(255, 255, 255, 0.7)'
      context.font = '500 28px "Noto Sans SC", sans-serif'
      context.fillText(stat.label, left + cardWidth / 2, cardTop + 205)
    })
    context.textAlign = 'left'
  } else {
    context.fillStyle = '#ffffff'
    context.font = '700 112px "Noto Serif SC", "Songti SC", serif'
    const wordBottom = drawWrappedText(context, options.word || '布依语', 110, 510, 980, 142, 3)

    context.fillStyle = 'rgba(255, 255, 255, 0.72)'
    context.font = '500 42px "Noto Sans SC", sans-serif'
    drawWrappedText(context, options.translation || '', 110, wordBottom + 90, 920, 66, 4)
  }

  context.strokeStyle = 'rgba(255, 255, 255, 0.25)'
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(110, CARD_HEIGHT - 190)
  context.lineTo(CARD_WIDTH - 110, CARD_HEIGHT - 190)
  context.stroke()

  context.fillStyle = '#ffffff'
  context.font = '600 34px "Noto Serif SC", "Songti SC", serif'
  context.fillText(SITE_NAME, 110, CARD_HEIGHT - 110)
  context.fillStyle = 'rgba(255, 255, 255, 0.58)'
  context.font = '400 25px "Noto Sans SC", sans-serif'
  context.textAlign = 'right'
  context.fillText(SITE_DOMAIN, CARD_WIDTH - 110, CARD_HEIGHT - 110)
  context.textAlign = 'left'

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('分享卡片导出失败'))
    }, 'image/png')
  })
}

function downloadCard(options) {
  const canvas = canvasRef.value
  if (!canvas) throw new Error('分享卡片画布尚未就绪')
  const anchor = document.createElement('a')
  anchor.download = options.filename || '布依族词典分享卡片.png'
  anchor.href = canvas.toDataURL('image/png')
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

async function share(options = {}) {
  const blob = await generate(options)
  const filename = options.filename || '布依族词典分享卡片.png'
  const file = typeof File === 'function' ? new File([blob], filename, { type: 'image/png' }) : null
  let canUseNativeShare = Boolean(file && typeof navigator.share === 'function')
  if (canUseNativeShare && typeof navigator.canShare === 'function') {
    try {
      canUseNativeShare = navigator.canShare({ files: [file] })
    } catch {
      canUseNativeShare = false
    }
  }

  if (canUseNativeShare) {
    try {
      await navigator.share({
        title: options.title || SITE_NAME,
        text: options.word ? `${options.word} · ${options.translation || SITE_NAME}` : (options.title || SITE_NAME),
        files: [file]
      })
      return { action: 'shared', blob }
    } catch (error) {
      if (error?.name === 'AbortError') return { action: 'cancelled', blob }
    }
  }

  downloadCard({ ...options, filename })
  return { action: 'downloaded', blob }
}

defineExpose({ generate, share })
</script>

<template>
  <canvas ref="canvasRef" class="share-card-canvas" aria-hidden="true"></canvas>
</template>

<style scoped>
.share-card-canvas {
  position: fixed;
  left: -10000px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
</style>
