import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

function parseGlb(buffer) {
  let offset = 12
  let json, binaryChunk

  while (offset < buffer.length) {
    const chunkLength = buffer.readUInt32LE(offset)
    const chunkType = buffer.readUInt32LE(offset + 4)
    const chunk = buffer.subarray(offset + 8, offset + 8 + chunkLength)
    if (chunkType === 0x4e4f534a) json = JSON.parse(chunk.toString('utf8').trim())
    if (chunkType === 0x004e4942) binaryChunk = chunk
    offset += 8 + chunkLength
  }
  return { json, binaryChunk }
}

async function extract() {
  const filename = resolve('CarModels/1988 McLaren MP44/mclaren_mp44_for_dallin_l (converted 1k).glb')
  const buffer = await readFile(filename)
  const { json, binaryChunk } = parseGlb(buffer)
  
  if (!json.images) return
  
  for (let i = 0; i < json.images.length; i++) {
    const img = json.images[i]
    if (img.bufferView !== undefined) {
      const view = json.bufferViews[img.bufferView]
      const bytes = binaryChunk.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength)
      const ext = img.mimeType === 'image/png' ? 'png' : 'jpg'
      await writeFile(resolve(`CarModels/1988 McLaren MP44/img_${i}.${ext}`), bytes)
      console.log(`Extracted img_${i}.${ext}`)
    }
  }
}

extract().catch(console.error)
