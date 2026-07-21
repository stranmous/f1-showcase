import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import * as THREE from 'three'
import type { RuntimeCarManifestEntry } from '../content/types'

export type ModelLoadState =
  | { status: 'loading'; progress: number }
  | { status: 'ready'; progress: 100 }
  | { status: 'error'; message: string }

export const showcaseCarElevation = 0.32

type CarModelProps = {
  car: RuntimeCarManifestEntry
  children?: (scene: THREE.Group) => ReactNode
  interaction?: {
    onClick?: (event: ThreeEvent<MouseEvent>) => void
    onPointerMove?: (event: ThreeEvent<PointerEvent>) => void
    onPointerOut?: (event: ThreeEvent<PointerEvent>) => void
  }
  onLoadState: (state: ModelLoadState) => void
  onPresentedCar: (car: RuntimeCarManifestEntry) => void
}

type LoadedModel = {
  scene: THREE.Group
  car: RuntimeCarManifestEntry
}

function disposeScene(scene: THREE.Group) {
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  const textures = new Set<THREE.Texture>()

  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return

    geometries.add(object.geometry)
    const objectMaterials = Array.isArray(object.material) ? object.material : [object.material]
    objectMaterials.forEach((material) => {
      materials.add(material)
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture) textures.add(value)
      })
    })
  })

  geometries.forEach((geometry) => geometry.dispose())
  textures.forEach((texture) => texture.dispose())
  materials.forEach((material) => material.dispose())
}

export function CarModel({ car, children, interaction, onLoadState, onPresentedCar }: CarModelProps) {
  const [displayedModel, setDisplayedModel] = useState<LoadedModel | null>(null)
  const displayedScene = useRef<THREE.Group | null>(null)

  useEffect(() => {
    displayedScene.current = displayedModel?.scene ?? null
  }, [displayedModel])

  useEffect(() => {
    let cancelled = false
    let incomingScene: THREE.Group | null = null
    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)
    onLoadState({ status: 'loading', progress: 0 })

    loader.load(
      car.runtimeModelUrl,
      (gltf) => {
        const scene = gltf.scene
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true
            object.receiveShadow = true
            
            if (object.material) {
              const materials = Array.isArray(object.material) ? object.material : [object.material]
              for (let i = 0; i < materials.length; i++) {
                const mat = materials[i]
                // Ensure double-sided lighting for single-layer meshes like wings/floor
                mat.side = THREE.DoubleSide
                // Force shadows to only cast from the front faces to avoid massive shadow acne on thin DoubleSide meshes
                if (mat instanceof THREE.MeshStandardMaterial) {
                  mat.envMapIntensity = 1.0
                  mat.needsUpdate = true
                  mat.shadowSide = THREE.FrontSide
                  
                  // Fix MP4/4 materials that suffer from specular/energy-conservation blackouts
                  // The GLTF has KHR_materials_specular which turns it into a MeshPhysicalMaterial.
                  // It causes a catastrophic bug in Three.js where it multiplies diffuse by 0 in shadows.
                  // We completely rebuild the material as a standard PBR material to strip the buggy physical extensions.
                  if (car.id === 'mp44') {
                    const cleanMat = new THREE.MeshStandardMaterial({
                      name: mat.name + '_clean',
                      map: mat.map,
                      normalMap: mat.normalMap,
                      roughnessMap: mat.roughnessMap,
                      metalnessMap: mat.metalnessMap,
                      color: mat.color,
                      roughness: 0.5,
                      metalness: 0.1,
                      envMapIntensity: 1.0,
                      transparent: mat.transparent,
                      opacity: mat.opacity,
                      alphaTest: mat.alphaTest,
                      side: THREE.DoubleSide // Force double side to prevent any normal-flipping culling bugs
                    })
                    
                    // Ensure pure black untextured parts are dark gray carbon instead of a void
                    if (cleanMat.color && cleanMat.color.getHexString() === '000000' && !cleanMat.map) {
                      cleanMat.color.setHex(0x2a2a2a)
                    }
                    
                    if (Array.isArray(object.material)) {
                      object.material[i] = cleanMat
                    } else {
                      object.material = cleanMat
                    }
                  }
                }
              }
            }
          }
        })

        if (cancelled) {
          disposeScene(scene)
          return
        }

        incomingScene = scene
        setDisplayedModel({ scene, car })
        onPresentedCar(car)
        onLoadState({ status: 'ready', progress: 100 })
      },
      (event) => {
        if (cancelled) return
        const progress = event.total > 0 ? Math.round((event.loaded / event.total) * 100) : 0
        onLoadState({ status: 'loading', progress: Math.min(progress, 99) })
      },
      (error: unknown) => {
        if (cancelled) return
        const message = error instanceof Error ? error.message : 'The selected car could not be loaded.'
        onLoadState({ status: 'error', message })
      },
    )

    return () => {
      cancelled = true
      if (incomingScene && displayedScene.current !== incomingScene) disposeScene(incomingScene)
    }
  }, [car, onLoadState, onPresentedCar])

  useEffect(() => {
    if (!displayedModel) return
    return () => disposeScene(displayedModel.scene)
  }, [displayedModel])

  if (!displayedModel || !displayedModel.car.calibration) return null

  return (
    <group
      position={[
        displayedModel.car.calibration.position[0],
        displayedModel.car.calibration.position[1] + showcaseCarElevation,
        displayedModel.car.calibration.position[2],
      ]}
      rotation={[...displayedModel.car.calibration.rotation]}
      scale={displayedModel.car.calibration.scale}
    >
      <primitive
        dispose={null}
        object={displayedModel.scene}
        onClick={interaction?.onClick}
        onPointerMove={interaction?.onPointerMove}
        onPointerOut={interaction?.onPointerOut}
      />
      {children?.(displayedModel.scene)}
    </group>
  )
}
