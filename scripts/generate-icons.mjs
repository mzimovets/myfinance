import sharp from 'sharp'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const srcSvg = readFileSync(path.join(__dirname, 'icon-source.svg'))
const iconsDir = path.join(root, 'public', 'icons')
mkdirSync(iconsDir, { recursive: true })

const plainSizes = [16, 32, 192, 512]
for (const size of plainSizes) {
  await sharp(srcSvg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(path.join(iconsDir, `icon-${size}.png`))
}

// Maskable icons need extra safe-zone padding (content within ~central 80%)
const maskableSizes = [192, 512]
for (const size of maskableSizes) {
  const contentSize = Math.round(size * 0.7)
  const pad = Math.round((size - contentSize) / 2)
  const content = await sharp(srcSvg, { density: 384 }).resize(contentSize, contentSize).toBuffer()
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 53, g: 71, b: 209, alpha: 1 },
    },
  })
    .composite([{ input: content, left: pad, top: pad }])
    .png()
    .toFile(path.join(iconsDir, `icon-maskable-${size}.png`))
}

// apple-touch-icon (no transparency, 180x180)
await sharp(srcSvg, { density: 384 })
  .resize(180, 180)
  .flatten({ background: '#3547d1' })
  .png()
  .toFile(path.join(root, 'public', 'apple-touch-icon.png'))

// favicon.ico-equivalent as png + copy svg favicon
writeFileSync(path.join(root, 'public', 'favicon.svg'), srcSvg)
await sharp(srcSvg, { density: 384 }).resize(64, 64).png().toFile(path.join(root, 'public', 'favicon.png'))

console.log('Icons generated in public/icons and public/')
