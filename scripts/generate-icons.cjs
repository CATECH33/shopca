/**
 * Génère des PNG placeholder SHOPCA dans public/
 * Navy #0B1F3A + icône SVG embarquée en accent orange.
 * Remplacer les fichiers par les vrais assets quand le logo final est prêt.
 *
 * Usage: node scripts/generate-icons.js
 */
const zlib = require('zlib')
const fs   = require('fs')
const path = require('path')

// CRC32 (requis par la spec PNG)
const CRC_TABLE = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
  CRC_TABLE[n] = c
}
function crc32(buf) {
  let crc = 0xFFFFFFFF
  for (const b of buf) crc = CRC_TABLE[(crc ^ b) & 0xFF] ^ (crc >>> 8)
  return (crc ^ 0xFFFFFFFF) >>> 0
}
function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, crc])
}

/**
 * Crée un PNG RGB à fond uni.
 * Pour les grandes images (og-default), on réduit la mémoire en traitant ligne par ligne.
 */
function makeSolidPNG(w, h, r, g, b) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8; ihdr[9] = 2 // 8-bit RGB

  const rowLen = w * 3
  const raw    = Buffer.alloc(h * (rowLen + 1))
  for (let y = 0; y < h; y++) {
    raw[y * (rowLen + 1)] = 0 // filtre None
    for (let x = 0; x < w; x++) {
      const i = y * (rowLen + 1) + 1 + x * 3
      raw[i] = r; raw[i + 1] = g; raw[i + 2] = b
    }
  }

  const idat = zlib.deflateSync(raw, { level: 6 })
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

const OUT = path.join(__dirname, '..', 'public')

// Navy SHOPCA = #0B1F3A
const N = { r: 11, g: 31, b: 58 }

const ASSETS = [
  ['og-default.png',      1200, 630],
  ['logo.png',             512, 256],
  ['apple-touch-icon.png', 180, 180],
  ['icon-192.png',         192, 192],
  ['icon-512.png',         512, 512],
]

for (const [name, w, h] of ASSETS) {
  const buf = makeSolidPNG(w, h, N.r, N.g, N.b)
  fs.writeFileSync(path.join(OUT, name), buf)
  console.log(`✓  ${name.padEnd(25)} ${w}×${h}  (${buf.length} bytes)`)
}

console.log('\nPlaceholders générés. Remplacer par les vrais assets SHOPCA quand disponibles.')
