import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const master = path.join(__dirname, 'icon-master.jpg')
const iconsDir = path.join(root, 'public', 'icons')
mkdirSync(iconsDir, { recursive: true })

const plainSizes = [16, 32, 192, 512]
for (const size of plainSizes) {
  await sharp(master).resize(size, size).png().toFile(path.join(iconsDir, `icon-${size}.png`))
}

// Maskable icons need extra safe-zone padding (content within ~central 80%)
const maskableSizes = [192, 512]
for (const size of maskableSizes) {
  const contentSize = Math.round(size * 0.78)
  const pad = Math.round((size - contentSize) / 2)
  const content = await sharp(master).resize(contentSize, contentSize).toBuffer()
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 43, g: 56, b: 168, alpha: 1 },
    },
  })
    .composite([{ input: content, left: pad, top: pad }])
    .png()
    .toFile(path.join(iconsDir, `icon-maskable-${size}.png`))
}

// apple-touch-icon (no transparency, 180x180)
await sharp(master).resize(180, 180).png().toFile(path.join(root, 'public', 'apple-touch-icon.png'))

// favicon
await sharp(master).resize(64, 64).png().toFile(path.join(root, 'public', 'favicon.png'))
await sharp(master).resize(32, 32).png().toFile(path.join(root, 'public', 'favicon-32.png'))

console.log('Icons generated in public/icons and public/')
