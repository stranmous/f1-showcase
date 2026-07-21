import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const outputDirectory = resolve('public/aero-guides')

// We now use bespoke routing coordinates for the critical points 
// (wheels, halo, sidepods) for each individual car model, ensuring no clipping!
const cars = {
  mp44: {
    sourceModel: '/models/1988-mclaren-mp4-4.glb',
    scale: 0.2039452309,
    width: 2.11,
    height: 1.0,
    length: 4.394,
    rawOrigin: [-0.0055, -0.045, 0],
    tuning: { 
      frontLift: 0.14, sideLift: 0.04, floorExit: 0.84, wakeRise: 0.31, wakeSpread: 0.18,
      frontWheelRouteX: 0.65, frontWheelRouteY: 0.45,
      frontInnerRouteY: 0.45,
      haloRouteY: 0.85, 
      rearWheelRouteX: 0.65, rearWheelRouteY: 0.70
    },
  },
  f2002: {
    sourceModel: '/models/2002-ferrari-f2002.glb',
    scale: 1.0412323373,
    width: 1.79,
    height: 1.038,
    length: 4.495,
    rawOrigin: [0, -0.004, 0.2545],
    tuning: { 
      frontLift: 0.18, sideLift: 0.1, floorExit: 0.94, wakeRise: 0.35, wakeSpread: 0.22,
      frontWheelRouteX: 0.62, frontWheelRouteY: 0.40,
      frontInnerRouteY: 0.45,
      haloRouteY: 0.88, 
      rearWheelRouteX: 0.60, rearWheelRouteY: 0.75
    },
  },
  w11: {
    sourceModel: '/models/2020-mercedes-amg-w11.glb',
    scale: 1,
    width: 2.0,
    height: 1.104,
    length: 5.695,
    rawOrigin: [0, 0.004, 0.0055],
    tuning: { 
      frontLift: 0.12, sideLift: 0.14, floorExit: 0.88, wakeRise: 0.28, wakeSpread: 0.16,
      // Massive front wing/suspension clearance
      frontWheelRouteX: 0.70, frontWheelRouteY: 0.58,
      // Pop inner lines over the suspension
      frontInnerRouteY: 0.65,
      // Push way over the halo
      haloRouteY: 1.05, 
      // Push wide around the thick rear tires
      rearWheelRouteX: 0.72, rearWheelRouteY: 0.82
    },
  },
  rb19: {
    sourceModel: '/models/2023-red-bull-rb19.glb',
    scale: 1.4419610671,
    width: 2.0,
    height: 1.161,
    length: 5.389,
    rawOrigin: [0, 0, 0.3775],
    tuning: { 
      frontLift: 0.16, sideLift: 0.18, floorExit: 0.92, wakeRise: 0.42, wakeSpread: 0.27,
      frontWheelRouteX: 0.68, frontWheelRouteY: 0.55,
      frontInnerRouteY: 0.62,
      haloRouteY: 1.02, 
      rearWheelRouteX: 0.70, rearWheelRouteY: 0.85
    },
  },
}

const round = (value) => Number(value.toFixed(5))
const mirror = (points, side) => points.map(([x, y, z]) => [round(x * side), round(y), round(z)])

// The runtime root rotates every raw model π around Y. These authored, final-view
// coordinates are inverted here so the exported points remain in raw model-local space.
const toModelLocal = (points, scale, rawOrigin) => points.map(([x, y, z]) => [
  round(rawOrigin[0] - x / scale),
  round(rawOrigin[1] + y / scale),
  round(rawOrigin[2] - z / scale),
])

function createPaths(car) {
  const { width: w, height: h, length: l, tuning } = car
  const half = l / 2
  const left = -1
  const right = 1
  const path = (id, family, points, speed, phase, opacity, tone) => ({
    id,
    family,
    points: toModelLocal(points, car.scale, car.rawOrigin),
    speed,
    phase,
    opacity,
    tone,
  })

  // FRONT WHEEL ROUTING
  // Removed frontOuter and frontMid as they either clipped through tires or arced unrealistically wide
  const frontInner = [
    [w * 0.18, h * 0.27, -half - 0.03],
    [w * 0.25, h * 0.3, -half * 0.72],
    // Peak height over the suspension arms
    [w * 0.32, h * tuning.frontInnerRouteY, -half * 0.32],
    [w * 0.38, h * (tuning.frontInnerRouteY + 0.05), half * 0.04],
    [w * 0.4, h * (0.57 + tuning.frontLift * 0.26), half * 0.32],
    [w * 0.38, h * (0.68 + tuning.frontLift * 0.26), half * 0.55],
  ]
  
  // REAR WHEEL ROUTING
  const sidepod = [
    [w * 0.34, h * 0.54, -half * 0.58],
    [w * 0.4, h * (0.62 + tuning.sideLift * 0.08), -half * 0.26],
    [w * 0.47, h * (0.68 + tuning.sideLift * 0.18), half * 0.05],
    [w * 0.55, h * (0.66 + tuning.sideLift * 0.22), half * 0.38],
    // Peak bulge outside rear wheel
    [w * tuning.rearWheelRouteX, h * tuning.rearWheelRouteY, half * 0.65], 
    [w * 0.45, h * (tuning.rearWheelRouteY + 0.1), half * 0.85],
  ]
  
  const floor = [
    [w * 0.22, h * 0.18, -half * 0.62],
    [w * 0.28, h * 0.16, -half * 0.3],
    [w * 0.33, h * 0.17, -half * 0.02],
    [w * 0.34, h * 0.2, half * 0.25],
    [w * 0.31, h * 0.34, half * 0.48],
    [w * 0.26, h * tuning.floorExit, half * 0.7],
  ]
  
  const wake = [
    [w * 0.22, h * 0.8, half * 0.42],
    [w * 0.24, h * 0.82, half * 0.54],
    [w * 0.3, h * 0.84, half * 0.65],
    [w * (0.36 + tuning.wakeSpread * 0.25), h * 0.86, half + 0.08],
    [w * (0.43 + tuning.wakeSpread * 0.35), h * 0.89, half + 0.3],
  ]
  
  const frontCentre = frontInner.map(([, y, z], index) => [0, y + h * (0.075 + index * 0.012), z])
  const sidepodUpper = sidepod.map(([x, y, z], index) => [x * 0.92, y + h * (0.09 + index * 0.006), z])
  const floorOuter = floor.map(([x, y, z], index) => [x * 1.42, y + h * (0.012 + index * 0.008), z])
  const floorInner = floor.map(([x, y, z], index) => [x * 0.58, y + h * (0.018 + index * 0.012), z])
  const floorCentre = floor.map(([, y, z], index) => [0, y + h * (0.026 + index * 0.01), z])
  const wakeOuter = wake.map(([x, y, z], index) => [x * 1.44, y + h * (0.018 + index * 0.012), z])
  const wakeCentre = wake.map(([, y, z], index) => [0, y + h * (0.045 + index * 0.013), z])
  
  // HALO / COCKPIT ROUTING
  const chassisInner = [
    [w * 0.13, h * 0.65, -half * 0.36],
    [w * 0.18, h * 0.76, -half * 0.12],
    // Peak height over driver / halo
    [w * 0.22, h * tuning.haloRouteY, half * 0.14],
    [w * 0.2, h * (tuning.haloRouteY + 0.04), half * 0.4],
    [w * 0.15, h * 0.88, half * 0.62],
  ]
  const chassisOuter = chassisInner.map(([x, y, z], index) => [x * 2.08, y + h * (0.025 + index * 0.012), z])

  return [
    path('front-wing-left-inboard', 'front-wing', mirror(frontInner, left), 0.28, 0.2, 0.52, 'ice'),
    path('front-wing-right-inboard', 'front-wing', mirror(frontInner, right), 0.28, 0.62, 0.52, 'ice'),
    path('front-wing-centre', 'front-wing', frontCentre, 0.3, 0.82, 0.5, 'cyan'),
    path('body-sidepod-left', 'body-sidepod', mirror(sidepod, left), 0.19, 0.13, 0.62, 'cyan'),
    path('body-sidepod-right', 'body-sidepod', mirror(sidepod, right), 0.19, 0.55, 0.62, 'cyan'),
    path('body-sidepod-left-upper', 'body-sidepod', mirror(sidepodUpper, left), 0.17, 0.34, 0.54, 'ice'),
    path('body-sidepod-right-upper', 'body-sidepod', mirror(sidepodUpper, right), 0.17, 0.74, 0.54, 'ice'),
    path('underfloor-diffuser-left', 'underfloor-diffuser', mirror(floor, left), 0.32, 0.27, 0.7, 'ice'),
    path('underfloor-diffuser-right', 'underfloor-diffuser', mirror(floor, right), 0.32, 0.72, 0.7, 'ice'),
    path('underfloor-diffuser-left-outer', 'underfloor-diffuser', mirror(floorOuter, left), 0.28, 0.08, 0.62, 'cyan'),
    path('underfloor-diffuser-right-outer', 'underfloor-diffuser', mirror(floorOuter, right), 0.28, 0.45, 0.62, 'cyan'),
    path('underfloor-diffuser-left-inner', 'underfloor-diffuser', mirror(floorInner, left), 0.34, 0.42, 0.66, 'ice'),
    path('underfloor-diffuser-right-inner', 'underfloor-diffuser', mirror(floorInner, right), 0.34, 0.84, 0.66, 'ice'),
    path('underfloor-diffuser-centre', 'underfloor-diffuser', floorCentre, 0.36, 0.64, 0.58, 'cyan'),
    path('rear-wing-wake-left', 'rear-wing-wake', mirror(wake, left), 0.16, 0.36, 0.58, 'cyan'),
    path('rear-wing-wake-right', 'rear-wing-wake', mirror(wake, right), 0.16, 0.78, 0.58, 'cyan'),
    path('rear-wing-wake-left-outer', 'rear-wing-wake', mirror(wakeOuter, left), 0.14, 0.17, 0.5, 'ice'),
    path('rear-wing-wake-right-outer', 'rear-wing-wake', mirror(wakeOuter, right), 0.14, 0.58, 0.5, 'ice'),
    path('rear-wing-wake-centre', 'rear-wing-wake', wakeCentre, 0.18, 0.91, 0.48, 'cyan'),
    path('top-chassis-left-inner', 'top-chassis', mirror(chassisInner, left), 0.2, 0.06, 0.48, 'ice'),
    path('top-chassis-right-inner', 'top-chassis', mirror(chassisInner, right), 0.2, 0.43, 0.48, 'ice'),
    path('top-chassis-left-outer', 'top-chassis', mirror(chassisOuter, left), 0.18, 0.25, 0.44, 'cyan'),
    path('top-chassis-right-outer', 'top-chassis', mirror(chassisOuter, right), 0.18, 0.67, 0.44, 'cyan'),
  ]
}

await mkdir(outputDirectory, { recursive: true })
await Promise.all(Object.entries(cars).map(async ([carId, car]) => {
  const document = {
    version: 1,
    carId,
    coordinateSpace: 'model-local',
    sourceModel: car.sourceModel,
    paths: createPaths(car),
  }
  await writeFile(resolve(outputDirectory, `${carId}.json`), `${JSON.stringify(document, null, 2)}\n`)
}))
