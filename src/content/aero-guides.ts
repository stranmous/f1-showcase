import { useEffect, useState } from 'react'
import type { CarId, Vector3 } from './types'

export const aeroGuideFamilies = ['front-wing', 'body-sidepod', 'underfloor-diffuser', 'rear-wing-wake', 'top-chassis'] as const

export type AeroGuideFamily = (typeof aeroGuideFamilies)[number]
export type AeroGuideTone = 'ice' | 'cyan'

export type AeroGuidePath = {
  id: string
  family: AeroGuideFamily
  points: readonly Vector3[]
  speed: number
  phase: number
  opacity: number
  tone: AeroGuideTone
}

export type AeroGuideDocument = {
  version: 1
  carId: CarId
  coordinateSpace: 'model-local'
  sourceModel: string
  paths: readonly AeroGuidePath[]
}

type AeroGuideLoadState =
  | { status: 'loading'; guide: null }
  | { status: 'ready'; guide: AeroGuideDocument }
  | { status: 'error'; guide: null }

type CachedAeroGuideLoadState = AeroGuideLoadState & { carId: CarId }

const guideUrls: Readonly<Record<CarId, string>> = {
  mp44: '/aero-guides/mp44.json',
  f2002: '/aero-guides/f2002.json',
  w11: '/aero-guides/w11.json',
  rb19: '/aero-guides/rb19.json',
}

const guideCache = new Map<CarId, Promise<AeroGuideDocument>>()

function isVector3(value: unknown): value is Vector3 {
  return Array.isArray(value)
    && value.length === 3
    && value.every((entry) => typeof entry === 'number' && Number.isFinite(entry))
}

function isGuideDocument(value: unknown, expectedCarId: CarId): value is AeroGuideDocument {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<AeroGuideDocument>
  return candidate.version === 1
    && candidate.carId === expectedCarId
    && candidate.coordinateSpace === 'model-local'
    && typeof candidate.sourceModel === 'string'
    && Array.isArray(candidate.paths)
    && candidate.paths.every((path) => {
      if (!path || typeof path !== 'object') return false
      const entry = path as Partial<AeroGuidePath>
      return typeof entry.id === 'string'
        && aeroGuideFamilies.includes(entry.family as AeroGuideFamily)
        && Array.isArray(entry.points)
        && entry.points.length >= 4
        && entry.points.every(isVector3)
        && typeof entry.speed === 'number'
        && Number.isFinite(entry.speed)
        && typeof entry.phase === 'number'
        && Number.isFinite(entry.phase)
        && typeof entry.opacity === 'number'
        && Number.isFinite(entry.opacity)
        && (entry.tone === 'ice' || entry.tone === 'cyan')
    })
}

export function hasAeroGuide(carId: CarId) {
  return carId in guideUrls
}

export function loadAeroGuide(carId: CarId) {
  const existing = guideCache.get(carId)
  if (existing) return existing

  const request = fetch(`${guideUrls[carId]}?v=${Date.now()}`)
    .then((response) => {
      if (!response.ok) throw new Error(`Aero guide request failed: ${response.status}`)
      return response.json()
    })
    .then((document: unknown) => {
      if (!isGuideDocument(document, carId)) {
        throw new Error(`Aero guide payload for ${carId} is malformed.`)
      }
      return document
    })
    .catch((error: unknown) => {
      guideCache.delete(carId)
      throw error
    })

  guideCache.set(carId, request)
  return request
}

export function preloadAeroGuide(carId: CarId) {
  void loadAeroGuide(carId).catch(() => undefined)
}

export function useAeroGuide(carId: CarId): AeroGuideLoadState {
  const [state, setState] = useState<CachedAeroGuideLoadState>(() => ({ carId, status: 'loading', guide: null }))

  useEffect(() => {
    let cancelled = false
    void loadAeroGuide(carId).then(
      (guide) => {
        if (!cancelled) setState({ carId, status: 'ready', guide })
      },
      () => {
        if (!cancelled) setState({ carId, status: 'error', guide: null })
      },
    )

    return () => {
      cancelled = true
    }
  }, [carId])

  if (state.carId !== carId) return { status: 'loading', guide: null }
  return state
}

// Clear the memory cache during Vite HMR so JSON changes are applied
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    guideCache.clear()
  })
}
