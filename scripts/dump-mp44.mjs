import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

function parseGlb(buffer) {
  let offset = 12
  let json

  while (offset < buffer.length) {
    const chunkLength = buffer.readUInt32LE(offset)
    const chunkType = buffer.readUInt32LE(offset + 4)
    const chunk = buffer.subarray(offset + 8, offset + 8 + chunkLength)
    if (chunkType === 0x4e4f534a) json = JSON.parse(chunk.toString('utf8').trim())
    offset += 8 + chunkLength
  }
  return json
}

async function dump() {
  const filename = resolve('CarModels/1988 McLaren MP44/mclaren_mp44_for_dallin_l (converted 1k).glb')
  const buffer = await readFile(filename)
  const json = parseGlb(buffer)
  
  console.log("=== MP4/4 MATERIALS ===")
  json.materials.forEach((m, i) => {
    console.log(`\nMaterial ${i}: ${m.name}`)
    if (m.pbrMetallicRoughness) {
      console.log(`  baseColorFactor: ${m.pbrMetallicRoughness.baseColorFactor}`)
      console.log(`  metallicFactor: ${m.pbrMetallicRoughness.metallicFactor}`)
      console.log(`  roughnessFactor: ${m.pbrMetallicRoughness.roughnessFactor}`)
      if (m.pbrMetallicRoughness.baseColorTexture) {
         console.log(`  baseColorTexture index: ${m.pbrMetallicRoughness.baseColorTexture.index}`)
      }
    }
    if (m.extensions) {
      console.log(`  extensions: ${JSON.stringify(m.extensions)}`)
    }
  })
}

dump().catch(console.error)
