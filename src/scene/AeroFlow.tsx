import { useMemo } from 'react'
import * as THREE from 'three'
import { useAeroGuide, type AeroGuidePath } from '../content/aero-guides'
import type { RuntimeCarManifestEntry } from '../content/types'
import { showcaseCarElevation } from './CarModel'
import { SmokeStrand, type StrandStyle } from './SmokeRibbon'

type AeroQualityTier = 'showcase' | 'safeguard'

type AeroFlowProps = {
  car: RuntimeCarManifestEntry
  tier: AeroQualityTier
  reducedMotion: boolean
}

// ---------- per-family strand config ----------

type FamilyStrandConfig = {
  /** Half-width of each individual strand — hair-thin */
  width: number
  /** Base opacity per strand (kept low, additive blending stacks them) */
  opacity: number
  /** Turbulence at tail end */
  turbulence: number
  /** Base flow speed */
  flowSpeed: number
  /** How many procedural strands to spawn per authored guide path */
  strandsPerPath: number
  /** Max perpendicular offset for procedural strand variation */
  spreadRadius: number
}

const familyConfigs: Readonly<
  Record<AeroGuidePath['family'], FamilyStrandConfig>
> = {
  'front-wing': {
    width: 0.04,
    opacity: 0.65,
    turbulence: 0.05,
    flowSpeed: 1.7,
    strandsPerPath: 6,
    spreadRadius: 0.05,
  },
  'top-chassis': {
    width: 0.05,
    opacity: 0.55,
    turbulence: 0.08,
    flowSpeed: 1.5,
    strandsPerPath: 8,
    spreadRadius: 0.04,
  },
  'body-sidepod': {
    width: 0.04,
    opacity: 0.55,
    turbulence: 0.1,
    flowSpeed: 1.4,
    strandsPerPath: 8,
    spreadRadius: 0.04,
  },
  'underfloor-diffuser': {
    width: 0.05,
    opacity: 0.5,
    turbulence: 0.12,
    flowSpeed: 1.7,
    strandsPerPath: 6,
    spreadRadius: 0.06,
  },
  'rear-wing-wake': {
    width: 0.06,
    opacity: 0.55,
    turbulence: 0.2,
    flowSpeed: 2.0,
    strandsPerPath: 10,
    spreadRadius: 0.1,
  },
}

// ---------- safeguard tier reductions ----------

const safeguardScale = {
  strandsPerPath: 0.4,  // reduce strand count dramatically
  segments: 0.6,
  opacity: 0.9,
} as const

// ---------- ribbon segments by tier ----------

const strandSegments = {
  showcase: 64,
  safeguard: 36,
} as const

// ---------- deterministic pseudo-random ----------

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// ---------- procedural strand generation ----------

type GeneratedStrand = {
  id: string
  curve: THREE.CatmullRomCurve3
  style: StrandStyle
}

function generateStrands(
  path: AeroGuidePath,
  config: FamilyStrandConfig,
  strandCount: number,
  scaleInv: number,
  opacityMult: number,
): GeneratedStrand[] {
  const strands: GeneratedStrand[] = []
  const rand = seededRandom(hashString(path.id))
  const basePoints = path.points.map(([x, y, z]) => new THREE.Vector3(x, y, z))
  const spread = config.spreadRadius * scaleInv

  for (let i = 0; i < strandCount; i++) {
    // Create offset control points for this strand
    const offsetPoints = basePoints.map((p, pi) => {
      const t = pi / (basePoints.length - 1) // 0 at start, 1 at end
      // Offset grows slightly toward the rear for natural dispersion
      const offsetScale = 0.3 + t * 0.7
      const ox = (rand() - 0.5) * 2 * spread * offsetScale
      const oy = (rand() - 0.5) * 2 * spread * offsetScale * 0.5 // less vertical spread
      const oz = (rand() - 0.5) * 2 * spread * offsetScale * 0.3 // minimal along-path jitter
      return new THREE.Vector3(p.x + ox, Math.max(0.01, p.y + oy), p.z + oz)
    })

    const curve = new THREE.CatmullRomCurve3(offsetPoints, false, 'centripetal', 0.5)

    // Vary style per strand for organic look
    const speedVariation = 0.8 + rand() * 0.4    // 80%-120% of base speed
    const opacityVariation = 0.7 + rand() * 0.6  // 70%-130% of base opacity
    const widthVariation = 0.6 + rand() * 0.8    // 60%-140% of base width

    strands.push({
      id: `${path.id}-strand-${i}`,
      curve,
      style: {
        width: config.width * scaleInv * widthVariation,
        opacity: config.opacity * opacityMult * opacityVariation * Math.min(1, path.opacity + 0.1),
        turbulence: config.turbulence,
        flowSpeed: config.flowSpeed * path.speed * 5 * speedVariation,
        phase: path.phase + i * 0.31 + rand() * 0.5,
      },
    })
  }

  return strands
}

function hashString(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

// ---------- single guide stream ----------

function GuideStream({
  path,
  tier,
  reducedMotion,
  modelScale,
}: {
  path: AeroGuidePath
  tier: AeroQualityTier
  reducedMotion: boolean
  modelScale: number
}) {
  const config = familyConfigs[path.family]
  const isSafeguard = tier === 'safeguard'
  const segments = isSafeguard ? strandSegments.safeguard : strandSegments.showcase

  // Scale widths by inverse of model scale so they appear consistent in world space
  const scaleInv = 1 / modelScale

  const strandCount = isSafeguard
    ? Math.max(1, Math.round(config.strandsPerPath * safeguardScale.strandsPerPath))
    : config.strandsPerPath

  const opacityMult = isSafeguard ? safeguardScale.opacity : 1

  const strands = useMemo(
    () => generateStrands(path, config, strandCount, scaleInv, opacityMult),
    [path, config, strandCount, scaleInv, opacityMult],
  )

  return (
    <group>
      {strands.map((strand) => (
        <SmokeStrand
          key={strand.id}
          curve={strand.curve}
          reducedMotion={reducedMotion}
          segments={segments}
          style={strand.style}
        />
      ))}
    </group>
  )
}

// ---------- main component ----------

export function AeroFlow({ car, tier, reducedMotion }: AeroFlowProps) {
  const guideState = useAeroGuide(car.id)
  const calibration = car.calibration

  if (guideState.status !== 'ready' || !calibration) return null

  return (
    <group
      position={[
        calibration.position[0],
        calibration.position[1] + showcaseCarElevation,
        calibration.position[2],
      ]}
      rotation={[...calibration.rotation]}
      scale={calibration.scale}
    >
      {guideState.guide.paths.map((path) => (
        <GuideStream
          key={path.id}
          modelScale={calibration.scale}
          path={path}
          reducedMotion={reducedMotion}
          tier={tier}
        />
      ))}
    </group>
  )
}
