// 预生成布依语六个舒声调的调值轮廓 wav 文件
// 频率参数取自 Web 端 src/utils/toneSynth.js 的 toneContours
// 正弦波从起始频率线性滑到结束频率，叠加淡入淡出避免爆音
const fs = require('fs');
const path = require('path');

const toneContours = {
  55: [660, 660],
  11: [310, 310],
  53: [660, 390],
  31: [450, 310],
  24: [370, 540],
  33: [480, 480],
};

const sampleRate = 44100;
const durationSec = 0.55; // 与 Web 端合成时长一致
const amplitude = 0.32; // 16bit 满量程的相对幅度

// 生成 16bit PCM mono 的采样 buffer
function buildPcmSamples(startFreq, endFreq) {
  const total = Math.round(sampleRate * durationSec);
  const samples = new Int16Array(total);
  let phase = 0;
  for (let i = 0; i < total; i += 1) {
    const progress = total > 1 ? i / (total - 1) : 0;
    const freq = startFreq + (endFreq - startFreq) * progress;
    phase += (2 * Math.PI * freq) / sampleRate;
    // 淡入前 6%、淡出后 12%，避免首尾爆音
    let env = 1;
    const fadeIn = Math.round(total * 0.06);
    const fadeOut = Math.round(total * 0.12);
    if (i < fadeIn) env = i / fadeIn;
    else if (i > total - fadeOut) env = (total - i) / fadeOut;
    const value = Math.sin(phase) * amplitude * env;
    samples[i] = Math.max(-1, Math.min(1, value)) * 32767;
  }
  return Buffer.from(samples.buffer);
}

// 手工构造 RIFF / WAVE 头 + PCM 数据
function buildWav(pcmBuffer) {
  const byteRate = sampleRate * 1 * 2; // 单声道 16bit
  const blockAlign = 1 * 2;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // PCM 子块长度
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // 单声道
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34); // 16bit
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);
  return Buffer.concat([header, pcmBuffer]);
}

const outDir = path.join(__dirname, '..', 'assets', 'audio', 'tones');
fs.mkdirSync(outDir, { recursive: true });

Object.entries(toneContours).forEach(([value, [startFreq, endFreq]]) => {
  const pcm = buildPcmSamples(startFreq, endFreq);
  const wav = buildWav(pcm);
  const file = path.join(outDir, `tone-${value}.wav`);
  fs.writeFileSync(file, wav);
  console.log(`已生成 ${file} (${wav.length} 字节, ${startFreq}Hz -> ${endFreq}Hz)`);
});

console.log(`\n共生成 ${Object.keys(toneContours).length} 个 wav 文件到 ${outDir}`);
