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

async function dump(filePath, carName) {
  const buffer = await readFile(resolve(filePath))
  const json = parseGlb(buffer)
  console.log(`\n=== ${carName} MESHES ===`)
  const nodesWithMeshes = json.nodes.filter(n => n.mesh !== undefined)
  nodesWithMeshes.forEach(n => {
    console.log(`Node: ${n.name || 'unnamed'} -> Mesh: ${json.meshes[n.mesh]?.name || 'unnamed'}`)
  })
}

async function run() {
  await dump('CarModels/1988 McLaren MP44/mclaren_mp44_for_dallin_l (converted 1k).glb', 'MP4/4')
  await dump('CarModels/2002 Ferrari F2002/2002_ferrari_f2002 (converted 1k).glb', 'F2002')
  await dump('CarModels/2023 Red Bull Racing RB19/oracle_red_bull_f1_car_rb19_2023(converted 1k).glb', 'RB19')
}

run().catch(console.error)
