import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js'
import * as THREE from 'three'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Mock the DOM and fetch for three.js loader
global.window = {}
global.document = { createElement: () => ({ width: 0, height: 0, getContext: () => null }) }
global.fetch = async (input) => {
  const urlStr = typeof input === 'string' ? input : (input.url ? input.url : input.toString())
  const isFile = urlStr.startsWith('file://')
  const data = fs.readFileSync(isFile ? fileURLToPath(urlStr) : urlStr)
  return { arrayBuffer: async () => data, text: async () => data.toString() }
}

const loader = new GLTFLoader()
loader.setMeshoptDecoder(MeshoptDecoder)

const glbPath = path.resolve('public/models/1988-mclaren-mp4-4.glb')
const fileUrl = `file:///${glbPath.replace(/\\/g, '/')}`

loader.load(fileUrl, (gltf) => {
  const materials = new Set()
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      console.log(`Mesh: ${child.name}, doubleSided: ${child.material.side === THREE.DoubleSide}, type: ${child.material.type}`)
      materials.add(child.material)
    }
  })
  
  for (const m of materials) {
    console.log(`\nMaterial: ${m.name} (${m.type})`)
    console.log(`  color: #${m.color?.getHexString()}`)
    console.log(`  metalness: ${m.metalness}, roughness: ${m.roughness}`)
    console.log(`  side: ${m.side}`)
    console.log(`  transparent: ${m.transparent}, opacity: ${m.opacity}`)
    console.log(`  specularColor: ${m.specularColor?.getHexString()}, specularIntensity: ${m.specularIntensity}`)
    console.log(`  envMapIntensity: ${m.envMapIntensity}`)
  }
}, undefined, (e) => console.error(e))
