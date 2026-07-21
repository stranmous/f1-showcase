import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import * as THREE from 'three'

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

function getNodeMatrix(node) {
  if (node.matrix) return new THREE.Matrix4().fromArray(node.matrix)
  const translation = node.translation ? new THREE.Vector3(...node.translation) : new THREE.Vector3()
  const rotation = node.rotation ? new THREE.Quaternion(...node.rotation) : new THREE.Quaternion()
  const scale = node.scale ? new THREE.Vector3(...node.scale) : new THREE.Vector3(1, 1, 1)
  return new THREE.Matrix4().compose(translation, rotation, scale)
}

async function dumpWorldBounds(filePath, carName) {
  const buffer = await readFile(resolve(filePath))
  const { json } = parseGlb(buffer)
  
  console.log(`\n=== ${carName} MESH WORLD BOUNDS ===`)
  
  const nodes = json.nodes
  const meshes = json.meshes
  const accessors = json.accessors
  
  // Recursively calculate world matrices
  const worldMatrices = new Array(nodes.length)
  
  function computeWorldMatrix(nodeIdx, parentMatrix) {
    const node = nodes[nodeIdx]
    const localMatrix = getNodeMatrix(node)
    const worldMatrix = new THREE.Matrix4().multiplyMatrices(parentMatrix, localMatrix)
    worldMatrices[nodeIdx] = worldMatrix
    if (node.children) {
      for (const child of node.children) computeWorldMatrix(child, worldMatrix)
    }
  }
  
  // Find root nodes
  const rootNodes = json.scenes[json.scene || 0].nodes
  for (const root of rootNodes) {
    computeWorldMatrix(root, new THREE.Matrix4())
  }
  
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (node.mesh !== undefined) {
      const mesh = meshes[node.mesh]
      const accessor = accessors[mesh.primitives[0].attributes.POSITION]
      if (accessor.min && accessor.max) {
        const box = new THREE.Box3(
          new THREE.Vector3(...accessor.min),
          new THREE.Vector3(...accessor.max)
        )
        box.applyMatrix4(worldMatrices[i])
        
        const center = new THREE.Vector3()
        box.getCenter(center)
        
        const size = new THREE.Vector3()
        box.getSize(size)
        
        console.log(`MeshIndex ${node.mesh} / Node ${i}: Center=(${center.x.toFixed(2)}, ${center.y.toFixed(2)}, ${center.z.toFixed(2)}) Size=(${size.x.toFixed(2)}, ${size.y.toFixed(2)}, ${size.z.toFixed(2)})`)
      }
    }
  }
}

async function run() {
  await dumpWorldBounds('CarModels/1988 McLaren MP44/mclaren_mp44_for_dallin_l (converted 1k).glb', 'MP4/4')
  await dumpWorldBounds('CarModels/2002 Ferrari F2002/2002_ferrari_f2002 (converted 1k).glb', 'F2002')
  await dumpWorldBounds('CarModels/2023 Red Bull Racing RB19/oracle_red_bull_f1_car_rb19_2023(converted 1k).glb', 'RB19')
}

run().catch(console.error)
