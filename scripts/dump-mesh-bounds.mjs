import { readFile } from 'node:fs/promises'
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

async function dumpBBox(filePath, carName) {
  const buffer = await readFile(resolve(filePath))
  const { json, binaryChunk } = parseGlb(buffer)
  
  console.log(`\n=== ${carName} MESH BOUNDING BOXES ===`)
  
  const nodesWithMeshes = json.nodes.map((n, idx) => ({ ...n, nodeIdx: idx })).filter(n => n.mesh !== undefined)
  
  nodesWithMeshes.forEach(n => {
    const mesh = json.meshes[n.mesh]
    const prim = mesh.primitives[0]
    const accessorId = prim.attributes.POSITION
    const accessor = json.accessors[accessorId]
    
    let min = accessor.min
    let max = accessor.max
    
    // In glTF, standard coordinate system is Y-up, but some models might have a root transform.
    // We just print the local bounds for now.
    
    if (min && max) {
      const center = [
        (min[0] + max[0]) / 2,
        (min[1] + max[1]) / 2,
        (min[2] + max[2]) / 2
      ]
      console.log(`${mesh.name || n.name || 'Mesh ' + n.mesh}: Center=(${center[0].toFixed(2)}, ${center[1].toFixed(2)}, ${center[2].toFixed(2)}) Min=(${min[0].toFixed(2)}, ${min[1].toFixed(2)}, ${min[2].toFixed(2)}) Max=(${max[0].toFixed(2)}, ${max[1].toFixed(2)}, ${max[2].toFixed(2)})`)
    } else {
      console.log(`${mesh.name || n.name || 'Mesh ' + n.mesh}: No bounds in accessor.`)
    }
  })
}

async function run() {
  await dumpBBox('CarModels/1988 McLaren MP44/mclaren_mp44_for_dallin_l (converted 1k).glb', 'MP4/4')
  await dumpBBox('CarModels/2002 Ferrari F2002/2002_ferrari_f2002 (converted 1k).glb', 'F2002')
  await dumpBBox('CarModels/2023 Red Bull Racing RB19/oracle_red_bull_f1_car_rb19_2023(converted 1k).glb', 'RB19')
}

run().catch(console.error)
