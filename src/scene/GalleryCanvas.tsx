import { ContactShadows } from '@react-three/drei/core/ContactShadows'
import { Environment } from '@react-three/drei/core/Environment'
import { Lightformer } from '@react-three/drei/core/Lightformer'
import { OrbitControls } from '@react-three/drei/core/OrbitControls'
import { PerformanceMonitor } from '@react-three/drei/core/PerformanceMonitor'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { hasAeroGuide } from '../content/aero-guides'
import { findW11PartGroup, type ExplorePartGroup } from '../content/w11-parts'
import type { ModelCalibration, RuntimeCarManifestEntry } from '../content/types'
import { AeroFlow } from './AeroFlow'
import { CarModel, showcaseCarElevation } from './CarModel'
import type { ModelLoadState } from './CarModel'
import { ExploreController } from './ExploreController'

type GalleryCanvasProps = {
  car: RuntimeCarManifestEntry
  explore: {
    isExploded: boolean
    hoveredPart: ExplorePartGroup | null
    onClearSelection: () => void
    onHoverPart: (part: ExplorePartGroup | null, pointer: PointerPosition | null) => void
    onSelectPart: (part: ExplorePartGroup) => void
    selectedPart: ExplorePartGroup | null
  }
  mode: ExperienceMode
  onLoadState: (state: ModelLoadState) => void
  onPresentedCar: (carId: RuntimeCarManifestEntry['id']) => void
  resetViewSignal: number
  reducedMotion: boolean
}

type CameraControllerProps = {
  calibration: ModelCalibration
  exploreFocus: ExploreFocus
  isExploded: boolean
  mode: ExperienceMode
  reducedMotion: boolean
  resetViewSignal: number
}

type QualityTier = 'showcase' | 'safeguard'
type ExperienceMode = 'gallery' | 'explore' | 'aero'

type ExploreFocus = {
  distance: number
  target: THREE.Vector3
} | null

type PointerPosition = {
  x: number
  y: number
}

type QualityProps = {
  tier: QualityTier
}

type AeroLightingProps = QualityProps & {
  carId: RuntimeCarManifestEntry['id']
}

const showcaseFraming = {
  fov: 30,
  targetXOffset: 0.45,
} as const

const aeroFraming = {
  fov: 27,
  targetXOffset: 0.22,
} as const

const exploreFraming = {
  fov: 28,
  targetXOffset: 0.22,
} as const

function GalleryLighting({ tier }: QualityProps) {
  const isShowcase = tier === 'showcase'

  return (
    <>
      <hemisphereLight args={['#fffdf8', '#424856', 1.15]} />
      <directionalLight
        castShadow
        color="#fffdf6"
        intensity={2.45}
        position={[-6, 8, 4]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.05}
        shadow-camera-far={20}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-mapSize={isShowcase ? [2048, 2048] : [1024, 1024]}
      />
      <directionalLight color="#d9e3ff" intensity={0.42} position={[6, 5, -5]} />
      <spotLight color="#fff6ea" intensity={1.4} position={[0, 7, -4]} angle={0.46} penumbra={0.85} />
      <Environment environmentIntensity={0.68} resolution={isShowcase ? 256 : 128}>
        <Lightformer color="#fffdf8" form="rect" intensity={4.8} position={[-5, 6, 1]} rotation={[0, -0.7, 0]} scale={[6, 6, 1]} />
        <Lightformer color="#f8d5cf" form="rect" intensity={1.25} position={[4, 4, -4]} rotation={[0, 2.4, 0]} scale={[4, 4, 1]} />
        <Lightformer color="#f4f1ea" form="ring" intensity={1.1} position={[0, 4, 4]} rotation={[Math.PI / 2, 0, 0]} scale={[5, 5, 1]} />
      </Environment>
    </>
  )
}

function GallerySuspension({ tier }: QualityProps) {
  const isShowcase = tier === 'showcase'

  return (
    <group>
      <ContactShadows color="#242124" far={2.4} frames={1} opacity={0.3} position={[0, -0.01, 0]} resolution={isShowcase ? 1024 : 512} scale={11} blur={3.1} />
    </group>
  )
}

function AeroLighting({ tier, carId }: AeroLightingProps) {
  const isShowcase = tier === 'showcase'
  const needsDarkLiverySeparation = carId === 'w11'

  return (
    <>
      <hemisphereLight args={['#8bbbcf', '#3a4c56', needsDarkLiverySeparation ? 1.34 : 1.16]} />
      <ambientLight color="#c7e5f0" intensity={needsDarkLiverySeparation ? 0.48 : 0.38} />
      <directionalLight color="#f6fcff" intensity={needsDarkLiverySeparation ? 4.6 : 4.05} position={[-6, 7, -5]} />
      <directionalLight color="#aee8fb" intensity={needsDarkLiverySeparation ? 1.78 : 1.42} position={[6, 4, 3]} />
      <directionalLight color="#e3f4ff" intensity={needsDarkLiverySeparation ? 0.95 : 0.72} position={[-3, 2, 6]} />
      <spotLight color="#e4f6ff" intensity={needsDarkLiverySeparation ? 2.85 : 2.34} position={[-1, 8, -4]} angle={0.5} penumbra={0.82} />
      <Environment environmentIntensity={needsDarkLiverySeparation ? 1.22 : 1.08} resolution={isShowcase ? 256 : 128}>
        <Lightformer color="#f7fdff" form="rect" intensity={needsDarkLiverySeparation ? 9.1 : 7.6} position={[-5, 5, -3]} rotation={[0, -0.62, 0]} scale={[7, 5, 1]} />
        <Lightformer color="#a5ebff" form="rect" intensity={needsDarkLiverySeparation ? 3.1 : 2.45} position={[5, 3.5, 2]} rotation={[0, 2.48, 0]} scale={[4, 3, 1]} />
        <Lightformer color="#173c4c" form="ring" intensity={1.6} position={[0, 4, 4]} rotation={[Math.PI / 2, 0, 0]} scale={[6, 6, 1]} />
      </Environment>
    </>
  )
}

function ExploreLighting({ tier, carId }: AeroLightingProps) {
  const isShowcase = tier === 'showcase'
  const needsDarkLiverySeparation = carId === 'w11'

  return (
    <>
      <hemisphereLight args={['#d7e0de', '#273138', needsDarkLiverySeparation ? 1.48 : 1.25]} />
      <ambientLight color="#bcc7c5" intensity={needsDarkLiverySeparation ? 0.36 : 0.28} />
      <directionalLight color="#f7faf8" intensity={needsDarkLiverySeparation ? 4.72 : 3.9} position={[-6, 7, -5]} />
      <directionalLight color="#a6c5c9" intensity={needsDarkLiverySeparation ? 1.36 : 1.04} position={[6, 4, 3]} />
      <spotLight color="#f0f5f2" intensity={needsDarkLiverySeparation ? 2.85 : 2.36} position={[-1, 8, -4]} angle={0.5} penumbra={0.84} />
      <Environment environmentIntensity={needsDarkLiverySeparation ? 1.16 : 0.96} resolution={isShowcase ? 256 : 128}>
        <Lightformer color="#f5f8f5" form="rect" intensity={needsDarkLiverySeparation ? 8.1 : 6.8} position={[-5, 5, -3]} rotation={[0, -0.62, 0]} scale={[7, 5, 1]} />
        <Lightformer color="#b7d1d3" form="rect" intensity={needsDarkLiverySeparation ? 2.2 : 1.65} position={[5, 3.6, 2]} rotation={[0, 2.48, 0]} scale={[4, 3, 1]} />
      </Environment>
    </>
  )
}

function CameraController({ calibration, exploreFocus, isExploded, mode, reducedMotion, resetViewSignal }: CameraControllerProps) {
  const controls = useRef<OrbitControlsImpl>(null)
  const invalidate = useThree((state) => state.invalidate)
  const desiredPosition = useRef(new THREE.Vector3())
  const desiredTarget = useRef(new THREE.Vector3())
  const isAnimating = useRef(false)

  useEffect(() => {
    const orbitControls = controls.current
    const perspectiveCamera = orbitControls?.object as THREE.PerspectiveCamera | undefined
    if (!perspectiveCamera || !orbitControls) return
    const [heroX, heroY, heroZ] = calibration.heroCamera.position
    const isAero = mode === 'aero'
    const isExplore = mode === 'explore'
    const framing = isAero ? aeroFraming : isExplore ? exploreFraming : showcaseFraming
    const defaultTarget = new THREE.Vector3(
      calibration.cameraTarget[0] + framing.targetXOffset,
      calibration.cameraTarget[1] + showcaseCarElevation + (isAero ? 0.16 : isExplore ? 0.13 : 0.12),
      calibration.cameraTarget[2],
    )
    const defaultPosition = new THREE.Vector3(
      heroX * (isExplore ? 0.8 : 0.78),
      heroY * (isAero ? 0.63 : isExplore ? 0.7 : 0.68) + showcaseCarElevation + (isAero ? 0.06 : isExplore ? 0.08 : 0),
      heroZ * (isAero ? 0.52 : isExplore ? 0.5 : 0.43),
    )
    
    if (isExploded) {
      // Top down camera for exploded view, lifted higher to frame everything
      defaultPosition.set(0, 13, 0)
      defaultTarget.set(0, 0, 0)
    }
    perspectiveCamera.fov = Math.min(calibration.heroCamera.fov, framing.fov)
    perspectiveCamera.updateProjectionMatrix()

    if (isExplore && exploreFocus) {
      const z = exploreFocus.distance
      const y = exploreFocus.distance * 0.4
      desiredPosition.current.set(0, y, z).add(exploreFocus.target)
      desiredTarget.current.copy(exploreFocus.target)
      isAnimating.current = !reducedMotion
      if (reducedMotion) {
        perspectiveCamera.position.copy(desiredPosition.current)
        orbitControls.target.copy(desiredTarget.current)
      }
    } else if (isExploded) {
      // Zoom out to a 3D angled perspective that frames the entire sprue
      desiredPosition.current.set(0, 9.0, -16.0)
      desiredTarget.current.set(0, 0, 0)
      perspectiveCamera.position.copy(desiredPosition.current)
      orbitControls.target.copy(desiredTarget.current)
      isAnimating.current = false
    } else {
      desiredPosition.current.copy(defaultPosition)
      desiredTarget.current.copy(defaultTarget)
      perspectiveCamera.position.copy(defaultPosition)
      orbitControls.target.copy(defaultTarget)
      isAnimating.current = false
    }

    orbitControls.update()
    invalidate()
  }, [calibration, exploreFocus, isExploded, invalidate, mode, reducedMotion, resetViewSignal])

  useFrame((_, delta) => {
    const perspectiveCamera = controls.current?.object as THREE.PerspectiveCamera | undefined
    if (!perspectiveCamera || !isAnimating.current) return
    const settle = 1 - Math.exp(-delta * 7.5)
    perspectiveCamera.position.lerp(desiredPosition.current, settle)
    const orbitControls = controls.current
    if (!orbitControls) return
    orbitControls.target.lerp(desiredTarget.current, settle)
    orbitControls.update()
    if (perspectiveCamera.position.distanceToSquared(desiredPosition.current) < 0.0001) isAnimating.current = false
    invalidate()
  })

  const framing = mode === 'aero' ? aeroFraming : mode === 'explore' ? exploreFraming : showcaseFraming

  return (
    <OrbitControls
      ref={controls}
      autoRotate={false}
      enableDamping
      enablePan={false}
      maxDistance={15}
      maxPolarAngle={Math.PI / 2.05}
      minDistance={3.5}
      minPolarAngle={0.45}
      target={[
        calibration.cameraTarget[0] + framing.targetXOffset,
        calibration.cameraTarget[1] + showcaseCarElevation + (mode === 'aero' ? 0.16 : mode === 'explore' ? 0.13 : 0.12),
        calibration.cameraTarget[2],
      ]}
    />
  )
}

export function GalleryCanvas({ car, explore, mode, onLoadState, onPresentedCar, resetViewSignal, reducedMotion }: GalleryCanvasProps) {
  const [qualityTier, setQualityTier] = useState<QualityTier>('showcase')
  const [presentedCar, setPresentedCar] = useState(car)
  const [exploreFocus, setExploreFocus] = useState<ExploreFocus>(null)
  const handlePresentedCar = useCallback((nextCar: RuntimeCarManifestEntry) => {
    setPresentedCar(nextCar)
    onPresentedCar(nextCar.id)
  }, [onPresentedCar])
  const animatesAeroFlow = mode === 'aero' && !reducedMotion && hasAeroGuide(presentedCar.id)
  const isW11Explore = mode === 'explore' && presentedCar.id === 'w11'

  const handleExplorePointerMove = useCallback((event: ThreeEvent<PointerEvent>) => {
    if (!isW11Explore) return
    const part = findW11PartGroup(event.object)
    if (!part) {
      explore.onHoverPart(null, null)
      return
    }
    event.stopPropagation()
    explore.onHoverPart(part, { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY })
  }, [explore, isW11Explore])

  const handleExplorePointerOut = useCallback(() => {
    if (isW11Explore) explore.onHoverPart(null, null)
  }, [explore, isW11Explore])

  const handleExploreClick = useCallback((event: ThreeEvent<MouseEvent>) => {
    if (!isW11Explore) return
    const part = findW11PartGroup(event.object)
    if (!part) return
    event.stopPropagation()
    explore.onSelectPart(part)
  }, [explore, isW11Explore])

  return (
    <Canvas
      className={mode === 'aero' ? 'gallery-canvas is-aero' : mode === 'explore' ? 'gallery-canvas is-explore' : 'gallery-canvas'}
      camera={{ fov: 32, position: [-6.1, 3, -7.2] }}
      dpr={
        mode === 'aero' || mode === 'explore'
          ? qualityTier === 'showcase' ? [1.25, 1.5] : [1, 1.25]
          : qualityTier === 'showcase' ? [1.5, 2] : [1, 1.25]
      }
      frameloop={animatesAeroFlow || mode === 'explore' ? 'always' : 'demand'}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance', stencil: false }}
      shadows="percentage"
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 0.92
      }}
      onPointerMissed={() => {
        if (mode === 'explore') explore.onClearSelection()
      }}
    >
      <PerformanceMonitor
        bounds={(refreshRate) => refreshRate > 100 ? [48, 90] : [32, 60]}
        iterations={6}
        ms={500}
        threshold={0.8}
        onDecline={() => setQualityTier('safeguard')}
      />
      {mode === 'explore' ? <color attach="background" args={['#24272b']} /> : null}
      {mode === 'aero' ? <AeroLighting carId={presentedCar.id} tier={qualityTier} /> : mode === 'explore' ? <ExploreLighting carId={presentedCar.id} tier={qualityTier} /> : <GalleryLighting tier={qualityTier} />}
      {mode === 'gallery' ? <GallerySuspension tier={qualityTier} /> : null}
      <CarModel
        car={car}
        interaction={isW11Explore ? { onClick: handleExploreClick, onPointerMove: handleExplorePointerMove, onPointerOut: handleExplorePointerOut } : undefined}
        onLoadState={onLoadState}
        onPresentedCar={handlePresentedCar}
      >
        {(scene) => isW11Explore ? (
          <ExploreController
            carId={presentedCar.id}
            isExploded={explore.isExploded}
            hoveredPart={explore.hoveredPart}
            onFocusPart={setExploreFocus}
            reducedMotion={reducedMotion}
            scene={scene}
            selectedPart={explore.selectedPart}
          />
        ) : null}
      </CarModel>
      {mode === 'aero' ? <AeroFlow car={presentedCar} reducedMotion={reducedMotion} tier={qualityTier} /> : null}
      {presentedCar.calibration ? <CameraController key={presentedCar.id} calibration={presentedCar.calibration} exploreFocus={exploreFocus} isExploded={explore.isExploded} mode={mode} reducedMotion={reducedMotion} resetViewSignal={resetViewSignal} /> : null}
    </Canvas>
  )
}
