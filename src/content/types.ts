export const carIds = ['mp44', 'f2002', 'w11', 'rb19'] as const

export type CarId = (typeof carIds)[number]

export type Vector3 = readonly [number, number, number]

export type SourceReference = {
  label: string
  url: string
}

export type SpeedFigure = {
  /** A documented trap must never be presented as an estimate, and vice versa. */
  label: 'Fastest season speed trap' | 'Recorded speed trap' | 'Estimated peak speed'
  valueKph: number
  qualifier?: string
  context: string
  confidence: 'recorded' | 'estimated'
}

export type ChampionshipWin = {
  winner: string
  year: number
}

export type CarFacts = {
  id: CarId
  year: number
  name: string
  constructor: string
  powerUnit: string
  drivers: readonly string[]
  raceWins: {
    wins: number
    races: number
  }
  poles: number
  podiums: number
  fastestLaps: number
  worldDriversChampionship: ChampionshipWin
  worldConstructorsChampionship: ChampionshipWin
  speed: SpeedFigure
  /** Repository-only editorial research; never rendered in the gallery UI. */
  research: readonly SourceReference[]
}

export type ModelCalibration = {
  rotation: Vector3
  scale: number
  position: Vector3
  cameraTarget: Vector3
  heroCamera: {
    position: Vector3
    fov: number
  }
  evidence: {
    rawBounds: {
      dimensions: Vector3
      minimumY: number
    }
    referenceMeasurement: {
      dimension: 'length' | 'width'
      metres: number
      rawUnits: number
    }
    source: SourceReference
    method: string
  }
}

export type RuntimeModelStatus = 'not-generated' | 'ready' | 'approved'

export type RuntimeCarManifestEntry = {
  id: CarId
  displayName: string
  year: number
  runtimeModelUrl: string
  runtimeStatus: RuntimeModelStatus
  sourceAssetPath: string
  attributionKey: CarId
  calibration: ModelCalibration | null
}
