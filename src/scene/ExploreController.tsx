import { EffectComposer, Outline } from '@react-three/postprocessing'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { findExplorePartGroup, type ExplorePartGroup } from '../content/explore-router'

type ExploreFocus = {
  distance: number
  target: THREE.Vector3
} | null

type ExploreControllerProps = {
  carId: string
  isExploded: boolean
  hoveredPart: ExplorePartGroup | null
  onFocusPart: (focus: ExploreFocus) => void
  reducedMotion: boolean
  scene: THREE.Group
  selectedPart: ExplorePartGroup | null
}

type ExplorableMesh = {
  basePosition: THREE.Vector3
  baseQuaternion: THREE.Quaternion
  materials: ExplorableMaterial[]
  mesh: THREE.Mesh
  outline: THREE.Mesh
  originalMaterial: THREE.Material | THREE.Material[]
  part: ExplorePartGroup
}

type ExplorableMaterial = {
  material: THREE.Material
  originalOpacity: number
  originalTransparent: boolean
}

type ExploreSceneData = {
  meshes: readonly THREE.Mesh[]
}

const temporaryCenter = new THREE.Vector3()
const temporarySize = new THREE.Vector3()

function cloneMeshMaterials(mesh: THREE.Mesh) {
  const originalMaterial = mesh.material
  const sourceMaterials = Array.isArray(originalMaterial) ? originalMaterial : [originalMaterial]
  const materials = sourceMaterials.map((material) => {
    const clone = material.clone()
    clone.needsUpdate = true
    return {
      material: clone,
      originalOpacity: clone.opacity,
      originalTransparent: clone.transparent,
    }
  })
  const clonedMaterials = materials.map((entry) => entry.material)
  mesh.material = Array.isArray(originalMaterial) ? clonedMaterials : clonedMaterials[0]
  return { materials, originalMaterial }
}

function createCoralOutline(mesh: THREE.Mesh) {
  const material = new THREE.MeshBasicMaterial({
    color: 0xf13b28,
    depthWrite: false,
    opacity: 0.66,
    side: THREE.BackSide,
    toneMapped: false,
    transparent: true,
  })
  const outline = new THREE.Mesh(mesh.geometry, material)
  outline.name = `${mesh.name}__explore-outline`
  outline.userData.isExploreOutline = true
  outline.renderOrder = 3
  outline.scale.setScalar(1.004)
  outline.visible = false
  outline.raycast = () => null
  mesh.add(outline)
  return outline
}

function copyWorldCenterIntoModelSpace(scene: THREE.Group, box: THREE.Box3) {
  const root = scene.parent
  const center = box.getCenter(temporaryCenter.clone())
  return root ? root.worldToLocal(center) : center
}

export function ExploreController({
  carId,
  isExploded,
  hoveredPart,
  onFocusPart,
  reducedMotion,
  scene,
  selectedPart,
}: ExploreControllerProps) {
  const meshStates = useRef<ExplorableMesh[]>([])
  const partCenters = useRef<Map<string, THREE.Vector3>>(new Map())
  const [sceneData, setSceneData] = useState<ExploreSceneData>({
    meshes: [],
  })

  useEffect(() => {
    const nextMeshStates: ExplorableMesh[] = []

    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh) || object.userData.isExploreOutline) return
      const part = findExplorePartGroup(carId, object)
      if (!part) return

      const { materials, originalMaterial } = cloneMeshMaterials(object)
      nextMeshStates.push({
        basePosition: object.position.clone(),
        baseQuaternion: object.quaternion.clone(),
        materials,
        mesh: object,
        outline: createCoralOutline(object),
        originalMaterial,
        part,
      })
    })

    const partBoxes = new Map<string, THREE.Box3>()
    nextMeshStates.forEach(({ mesh, part }) => {
      const temporaryBox = new THREE.Box3().setFromObject(mesh)
      const partBox = partBoxes.get(part.id) ?? new THREE.Box3()
      partBox.union(temporaryBox)
      partBoxes.set(part.id, partBox)
    })

    const centers = new Map<string, THREE.Vector3>()
    partBoxes.forEach((box, partId) => {
      centers.set(partId, copyWorldCenterIntoModelSpace(scene, box))
    })
    partCenters.current = centers

    let active = true

    meshStates.current = nextMeshStates
    queueMicrotask(() => {
      if (!active) return
      setSceneData({
        meshes: nextMeshStates.map((state) => state.mesh),
      })
    })

    return () => {
      active = false
      nextMeshStates.forEach((state) => {
        state.mesh.position.copy(state.basePosition)
        state.mesh.quaternion.copy(state.baseQuaternion)
        state.mesh.material = state.originalMaterial
        if (state.outline) {
          state.mesh.remove(state.outline)
          const outlineMaterial = state.outline.material as THREE.Material
          outlineMaterial.dispose()
        }
        state.materials.forEach(({ material }) => material.dispose())
      })
      meshStates.current = []
      partCenters.current.clear()
      onFocusPart(null)
    }
  }, [carId, onFocusPart, scene])

  useEffect(() => {
    if (!selectedPart) {
      onFocusPart(null)
      return
    }

    const partMeshes = meshStates.current.filter((state) => state.part.id === selectedPart.id).map((state) => state.mesh)
    if (partMeshes.length === 0) return

    const partBounds = new THREE.Box3()
    partMeshes.forEach((mesh) => partBounds.union(new THREE.Box3().setFromObject(mesh)))
    const size = partBounds.getSize(temporarySize.clone()).length()
    // When isolated, the part moves to (0,0,0) so the camera should look at (0,0,0)
    onFocusPart({ distance: Math.max(2.7, Math.min(5.8, size * 2.2)), target: new THREE.Vector3(0, 0, 0) })
  }, [onFocusPart, selectedPart])

  const outlineSelection = useMemo(
    () => sceneData.meshes.filter((mesh) => findExplorePartGroup(carId, mesh)?.id === hoveredPart?.id),
    [carId, hoveredPart, sceneData.meshes],
  )

  useFrame((frameState, delta) => {
    const settle = reducedMotion ? 1 : 1 - Math.exp(-delta * 8)

    meshStates.current.forEach((state) => {
      const { part, basePosition, baseQuaternion } = state
      let targetPosition = basePosition
      let targetQuaternion = baseQuaternion
      const pCenter = partCenters.current.get(part.id)

      if (pCenter) {
        if (selectedPart && part.id === selectedPart.id) {
          const gridRot = new THREE.Quaternion().setFromEuler(new THREE.Euler(...part.gridRotation))
          const offset = basePosition.clone().sub(pCenter)
          offset.applyQuaternion(gridRot)
          targetPosition = new THREE.Vector3(0, 0, 0).add(offset)
          targetQuaternion = gridRot.multiply(baseQuaternion)
        } else if (isExploded && part.gridPosition) {
          const gridRot = new THREE.Quaternion().setFromEuler(new THREE.Euler(...part.gridRotation))
          const gridPos = new THREE.Vector3(...part.gridPosition)
          const offset = basePosition.clone().sub(pCenter)
          offset.applyQuaternion(gridRot)
          targetPosition = gridPos.add(offset)
          targetQuaternion = gridRot.multiply(baseQuaternion)
        }
      }

      state.mesh.position.lerp(targetPosition, settle)
      state.mesh.quaternion.slerp(targetQuaternion, settle)

      const targetOpacity = selectedPart
        ? state.part.id === selectedPart.id ? undefined : 0.0 // Fade out entirely
        : undefined
      state.materials.forEach((entry) => {
        const desiredOpacity = targetOpacity === undefined ? entry.originalOpacity : entry.originalOpacity * targetOpacity
        entry.material.opacity += (desiredOpacity - entry.material.opacity) * settle
        const isGhosted = entry.material.opacity < entry.originalOpacity - 0.01
        const shouldBeTransparent = entry.originalTransparent || isGhosted
        if (entry.material.transparent !== shouldBeTransparent) {
          entry.material.transparent = shouldBeTransparent
          entry.material.needsUpdate = true
        }
        entry.material.depthWrite = !isGhosted
      })
      
      const isOutlined = state.part.id === hoveredPart?.id
      const outline = state.outline
      if (outline) {
        outline.visible = isOutlined
      }
      if (isOutlined && outline) {
        const outlineMaterial = outline.material as THREE.MeshBasicMaterial
        outlineMaterial.opacity = reducedMotion ? 0.66 : 0.52 + Math.sin(frameState.clock.elapsedTime * 4.2) * 0.14
      }
    })
  })

  return (
    <>
      {outlineSelection.length > 0 ? (
        <EffectComposer multisampling={0}>
          <Outline
            blur
            edgeStrength={3}
            hiddenEdgeColor={0x3c0d08}
            pulseSpeed={reducedMotion ? 0 : 0.55}
            selection={outlineSelection}
            visibleEdgeColor={0xf13b28}
            width={1.6}
          />
        </EffectComposer>
      ) : null}
    </>
  )
}
