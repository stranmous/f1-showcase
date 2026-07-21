import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const families = ['front-wing', 'body-sidepod', 'underfloor-diffuser', 'rear-wing-wake', 'top-chassis']
const expectedCounts = {
  'front-wing': 7,
  'body-sidepod': 4,
  'underfloor-diffuser': 7,
  'rear-wing-wake': 5,
  'top-chassis': 4,
}

const bounds = {
  mp44: { sourceModel: '/models/1988-mclaren-mp4-4.glb', dimensions: [10.349, 4.907, 21.545], scale: 0.2039452309 },
  f2002: { sourceModel: '/models/2002-ferrari-f2002.glb', dimensions: [1.79, 1.038, 4.317], scale: 1.0412323373 },
  w11: { sourceModel: '/models/2020-mercedes-amg-w11.glb', dimensions: [2, 1.104, 5.695], scale: 1 },
  rb19: { sourceModel: '/models/2023-red-bull-rb19.glb', dimensions: [1.387, 0.805, 3.737], scale: 1.4419610671 },
}

const failures = []

for (const [carId, envelope] of Object.entries(bounds)) {
  const file = resolve(`public/aero-guides/${carId}.json`)
  const guide = JSON.parse(await readFile(file, 'utf8'))
  if (guide.version !== 1 || guide.carId !== carId || guide.coordinateSpace !== 'model-local') {
    failures.push(`${carId}: invalid guide identity.`)
  }
  if (guide.sourceModel !== envelope.sourceModel) failures.push(`${carId}: source model mismatch.`)
  if (!Array.isArray(guide.paths) || guide.paths.length !== 27) failures.push(`${carId}: expected exactly 27 paths.`)

  const counts = Object.fromEntries(families.map((family) => [family, 0]))
  const lateralAllowance = envelope.dimensions[0] / 2 + 0.95 / envelope.scale
  const verticalAllowance = envelope.dimensions[1] + 0.95 / envelope.scale
  const longitudinalAllowance = envelope.dimensions[2] / 2 + 0.95 / envelope.scale

  for (const path of guide.paths ?? []) {
    if (!families.includes(path.family)) failures.push(`${carId}:${path.id}: unknown family.`)
    else counts[path.family] += 1
    if (!Array.isArray(path.points) || path.points.length < 4) failures.push(`${carId}:${path.id}: needs at least four points.`)
    if (!Number.isFinite(path.speed) || path.speed <= 0 || path.speed > 1) failures.push(`${carId}:${path.id}: invalid speed.`)
    if (!Number.isFinite(path.phase) || path.phase < 0 || path.phase > 1) failures.push(`${carId}:${path.id}: invalid phase.`)
    if (!Number.isFinite(path.opacity) || path.opacity <= 0 || path.opacity > 1) failures.push(`${carId}:${path.id}: invalid opacity.`)
    for (const point of path.points ?? []) {
      if (!Array.isArray(point) || point.length !== 3 || !point.every(Number.isFinite)) {
        failures.push(`${carId}:${path.id}: malformed point.`)
        continue
      }
      const exceedsEnvelope = Math.abs(point[0]) > lateralAllowance
        || point[1] < -0.15 / envelope.scale
        || point[1] > verticalAllowance
        || Math.abs(point[2]) > longitudinalAllowance
      if (exceedsEnvelope) {
        failures.push(`${carId}:${path.id}: point outside the authored-envelope allowance.`)
      }
    }
  }

  for (const family of families) {
    if (counts[family] !== expectedCounts[family]) {
      failures.push(`${carId}: expected ${expectedCounts[family]} ${family} paths; found ${counts[family]}.`)
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('Aero guide validation passed for MP4/4, F2002, W11, and RB19.')
