import { modelCalibrations } from './calibrations'
import type { CarId, RuntimeCarManifestEntry } from './types'

// Approved source-preserving runtime derivatives live in public/models/. Source
// assets remain immutable inputs in CarModels/; see ATTRIBUTIONS.md for derivation.
// Vite serves this project below /f1-showcase/, so public assets must retain the
// configured base path rather than using root-relative URLs.
const modelBaseUrl = import.meta.env.BASE_URL

export const runtimeCars = [
  {
    id: 'mp44',
    displayName: 'McLaren MP4/4',
    year: 1988,
    runtimeModelUrl: `${modelBaseUrl}models/1988-mclaren-mp4-4.glb`,
    runtimeStatus: 'ready',
    sourceAssetPath: 'CarModels/1988 McLaren MP44/Orignal Format/source/mp44.glb',
    attributionKey: 'mp44',
    calibration: modelCalibrations.mp44,
  },
  {
    id: 'f2002',
    displayName: 'Ferrari F2002',
    year: 2002,
    runtimeModelUrl: `${modelBaseUrl}models/2002-ferrari-f2002.glb`,
    runtimeStatus: 'ready',
    sourceAssetPath: 'CarModels/2002 Ferrari F2002/Orignal Format/source/f1_2002_ferrari.glb',
    attributionKey: 'f2002',
    calibration: modelCalibrations.f2002,
  },
  {
    id: 'w11',
    displayName: 'Mercedes-AMG F1 W11 EQ Performance',
    year: 2020,
    runtimeModelUrl: `${modelBaseUrl}models/2020-mercedes-amg-w11.glb`,
    runtimeStatus: 'ready',
    sourceAssetPath: 'CarModels/2020 Mercedes-AMG W11/Orignal Format/source/2020 F1 Mercedes-Benz W11.glb',
    attributionKey: 'w11',
    calibration: modelCalibrations.w11,
  },
  {
    id: 'rb19',
    displayName: 'Red Bull Racing RB19',
    year: 2023,
    runtimeModelUrl: `${modelBaseUrl}models/2023-red-bull-rb19.glb`,
    runtimeStatus: 'ready',
    sourceAssetPath: 'CarModels/2023 Red Bull Racing RB19/oracle_red_bull_f1_car_rb19_2023(converted 4k).glb',
    attributionKey: 'rb19',
    calibration: modelCalibrations.rb19,
  },
] as const satisfies readonly RuntimeCarManifestEntry[]

export const runtimeCarById: Readonly<Record<CarId, RuntimeCarManifestEntry>> = Object.fromEntries(
  runtimeCars.map((car) => [car.id, car]),
) as Record<CarId, RuntimeCarManifestEntry>
