import type * as THREE from 'three'
import type { Vector3 } from './types'

export type ExploreCategory = 'aero' | 'body' | 'wheels-tyres' | 'suspension' | 'interior' | 'ancillaries'

export type ExplorePartGroup = {
  id: string
  displayName: string
  category: ExploreCategory
  description: string
  technicalSpecs: readonly {
    label: string
    value: string
  }[]
  meshPatterns: readonly string[]
  meshIndices?: readonly number[]
  gridPosition: Vector3
  gridRotation: Vector3
}

export const w11OverviewPart: ExplorePartGroup = {
  id: 'w11-overview',
  displayName: '2020 Mercedes W11 EQ Performance',
  category: 'body',
  description: 'The Mercedes-AMG F1 W11 EQ Performance is widely regarded as one of the fastest F1 cars in history. It features Dual-Axis Steering (DAS), refined aerodynamics, and the dominant M11 EQ Performance power unit.',
  technicalSpecs: [
    { label: 'Aero Concept', value: 'High Downforce' },
    { label: 'Engine', value: 'Mercedes M11 1.6L V6 Hybrid' },
    { label: 'Win Rate', value: '76.5% (13/17)' }
  ],
  meshPatterns: [],
  gridPosition: [0, 0, 0],
  gridRotation: [0, 0, 0]
}

/**
 * Ordered from the most specific mesh-name pattern to the most general. The
 * supplied W11 GLB uses creator-authored `LOD_A_*` node names; this map keeps
 * the user-facing layer separate from those raw node identifiers.
 */
export const w11PartGroups = [
  {
    id: 'wheel-fl',
    displayName: 'Front Left Wheel',
    category: 'wheels-tyres',
    description: '13-inch magnesium alloy front wheel with Pirelli tyre retention.',
    technicalSpecs: [
      { label: 'System', value: 'Front corner assembly' },
      { label: 'Wheel', value: '13-inch magnesium alloy' },
      { label: 'Role', value: 'Steering and braking loads' },
    ],
    meshPatterns: ['WHEEL_mm_wheel.001'],
    gridPosition: [-3.5, 0, 4.0],
    gridRotation: [Math.PI / 2, 0, 0],
  },
  {
    id: 'wheel-rl',
    displayName: 'Rear Left Wheel',
    category: 'wheels-tyres',
    description: 'Wider rear wheel assembly for increased traction under acceleration.',
    technicalSpecs: [
      { label: 'System', value: 'Rear corner assembly' },
      { label: 'Wheel', value: '13-inch magnesium alloy' },
      { label: 'Role', value: 'Drive and traction loads' },
    ],
    meshPatterns: ['WHEEL_REAR_mm_wheel.001'],
    gridPosition: [-3.5, 0, 5.0],
    gridRotation: [Math.PI / 2, 0, 0],
  },
  {
    id: 'wheel-fr',
    displayName: 'Front Right Wheel',
    category: 'wheels-tyres',
    description: '13-inch front-right wheel assembly for steering and braking loads.',
    technicalSpecs: [
      { label: 'System', value: 'Front corner assembly' },
      { label: 'Wheel', value: '13-inch magnesium alloy' },
      { label: 'Role', value: 'Steering and braking loads' },
    ],
    meshPatterns: ['WHEEL_mm_wheel'],
    gridPosition: [3.5, 0, 5.5],
    gridRotation: [Math.PI / 2, 0, 0],
  },
  {
    id: 'wheel-rr',
    displayName: 'Rear Right Wheel',
    category: 'wheels-tyres',
    description: 'Wider rear-right wheel assembly for traction under acceleration.',
    technicalSpecs: [
      { label: 'System', value: 'Rear corner assembly' },
      { label: 'Wheel', value: '13-inch magnesium alloy' },
      { label: 'Role', value: 'Drive and traction loads' },
    ],
    meshPatterns: ['WHEEL_REAR_mm_wheel'],
    gridPosition: [3.5, 0, 6.5],
    gridRotation: [Math.PI / 2, 0, 0],
  },
  {
    id: 'tyre-rear',
    displayName: 'Rear Tyres',
    category: 'wheels-tyres',
    description: 'Pirelli 405/670 R13 rear compounds, wider for maximum traction.',
    technicalSpecs: [
      { label: 'Tyre size', value: '405/670 R13' },
      { label: 'Supplier', value: 'Pirelli' },
      { label: 'Axle', value: 'Rear' },
    ],
    meshPatterns: ['TYRE_REAR'],
    gridPosition: [-3.5, 0, 2.0],
    gridRotation: [Math.PI / 2, 0, 0],
  },
  {
    id: 'tyre-front',
    displayName: 'Front Tyres',
    category: 'wheels-tyres',
    description: 'Pirelli 305/670 R13 front compounds for steering response and reduced drag.',
    technicalSpecs: [
      { label: 'Tyre size', value: '305/670 R13' },
      { label: 'Supplier', value: 'Pirelli' },
      { label: 'Axle', value: 'Front' },
    ],
    meshPatterns: ['TYRE_mm_tyre'],
    gridPosition: [-3.5, 0, 0.0],
    gridRotation: [Math.PI / 2, 0, 0],
  },
  {
    id: 'front-wing',
    displayName: 'Front Wing',
    category: 'aero',
    description: 'Generates downforce at the front axle. Its elements and endplates fine-tune airflow distribution.',
    technicalSpecs: [
      { label: 'Material', value: 'Carbon-fibre composite' },
      { label: 'System', value: 'Front aerodynamics' },
      { label: 'Role', value: 'Front balance and downforce' },
    ],
    meshPatterns: ['FRONTBUMPER'],
    gridPosition: [-3.5, 0, -4.0],
    gridRotation: [0, 0, 0],
  },
  {
    id: 'rear-wing',
    displayName: 'Rear Wing',
    category: 'aero',
    description: 'Primary rear downforce generator. The DRS flap reduces drag on straights by opening the upper element.',
    technicalSpecs: [
      { label: 'Material', value: 'Carbon-fibre composite' },
      { label: 'System', value: 'Rear aerodynamics' },
      { label: 'Feature', value: 'Drag Reduction System' },
    ],
    meshPatterns: ['REARBUMPER'],
    gridPosition: [3.5, 0, -4.0],
    gridRotation: [0, 0, 0],
  },
  {
    id: 'halo',
    displayName: 'Halo',
    category: 'body',
    description: 'Titanium safety device introduced in 2018 and designed to withstand substantial overhead loads.',
    technicalSpecs: [
      { label: 'Material', value: 'Titanium' },
      { label: 'System', value: 'Driver protection' },
      { label: 'Introduced', value: 'Formula 1, 2018' },
    ],
    meshPatterns: ['GLASS_FRONT'],
    gridPosition: [0, 0, 4.0],
    gridRotation: [0, -Math.PI / 2, 0],
  },
  {
    id: 'chassis',
    displayName: 'Chassis / Monocoque',
    category: 'body',
    description: 'Carbon-fibre survival cell that houses the driver and fuel cell and provides the car’s structural backbone.',
    technicalSpecs: [
      { label: 'Material', value: 'Carbon-fibre composite' },
      { label: 'System', value: 'Survival cell' },
      { label: 'Role', value: 'Primary structure' },
    ],
    meshPatterns: ['CHASSIS'],
    gridPosition: [0, 0, -2.5],
    gridRotation: [0, 0, 0],
  },
  {
    id: 'body',
    displayName: 'Engine Cover & Bodywork',
    category: 'body',
    description: 'Outer aerodynamic shell covering the power unit, gearbox, and cooling systems.',
    technicalSpecs: [
      { label: 'Material', value: 'Carbon-fibre composite' },
      { label: 'System', value: 'Bodywork and cooling' },
      { label: 'Role', value: 'Aero surface and enclosure' },
    ],
    meshPatterns: ['BODY'],
    gridPosition: [0, 0, 1.5],
    gridRotation: [0, 0, 0],
  },
  {
    id: 'sidepod-left',
    displayName: 'Left Sidepod',
    category: 'body',
    description: 'Houses the left radiator and cooling ductwork while managing airflow toward the rear.',
    technicalSpecs: [
      { label: 'Material', value: 'Carbon-fibre composite' },
      { label: 'System', value: 'Cooling and aerodynamics' },
      { label: 'Role', value: 'Radiator airflow management' },
    ],
    meshPatterns: ['WHEELGUARD_FRONT_LEFT'],
    gridPosition: [-3.5, 0, -2.0],
    gridRotation: [0, 0, 0],
  },
  {
    id: 'suspension',
    displayName: 'Suspension',
    category: 'suspension',
    description: 'Multi-link pushrod and pullrod suspension with torsion bars and hydraulic dampers.',
    technicalSpecs: [
      { label: 'Layout', value: 'Pushrod / pullrod links' },
      { label: 'Springing', value: 'Torsion bars' },
      { label: 'Damping', value: 'Hydraulic dampers' },
    ],
    meshPatterns: ['STRUT'],
    gridPosition: [3.5, 0, -1.0],
    gridRotation: [0, 0, 0],
  },
  {
    id: 'mirrors',
    displayName: 'Mirrors',
    category: 'ancillaries',
    description: 'FIA-mandated side mirrors integrated into the aerodynamic bodywork.',
    technicalSpecs: [
      { label: 'System', value: 'Driver visibility' },
      { label: 'Requirement', value: 'FIA-mandated mirrors' },
      { label: 'Integration', value: 'Aero bodywork mounting' },
    ],
    meshPatterns: ['MIRROR'],
    gridPosition: [3.5, 0, 4.5],
    gridRotation: [0, 0, 0],
  },
  {
    id: 'exhaust',
    displayName: 'Exhaust System',
    category: 'ancillaries',
    description: 'Directs exhaust gases from the Mercedes M11 power unit toward the rear diffuser region.',
    technicalSpecs: [
      { label: 'Power unit', value: 'Mercedes M11' },
      { label: 'System', value: 'Exhaust routing' },
      { label: 'Exit', value: 'Rear diffuser region' },
    ],
    meshPatterns: ['EXHAUST'],
    gridPosition: [2.0, 0, 6.5],
    gridRotation: [0, 0, 0],
  },
  {
    id: 'brakes',
    displayName: 'Brake Assemblies',
    category: 'ancillaries',
    description: 'Carbon-carbon disc brake assemblies designed for extreme braking temperatures and loads.',
    technicalSpecs: [
      { label: 'Material', value: 'Carbon-carbon discs' },
      { label: 'System', value: 'Brake assembly' },
      { label: 'Role', value: 'High-temperature deceleration' },
    ],
    meshPatterns: ['BRAKES'],
    gridPosition: [3.5, 0, 2.0],
    gridRotation: [0, 0, 0],
  },
  {
    id: 'steering-wheel',
    displayName: 'Steering Wheel',
    category: 'interior',
    description: 'Control interface with buttons, rotary dials, clutch paddles, and an integrated display.',
    technicalSpecs: [
      { label: 'System', value: 'Driver controls' },
      { label: 'Interface', value: 'Buttons, dials and paddles' },
      { label: 'Display', value: 'Integrated steering display' },
    ],
    meshPatterns: ['STEERING_WHEEL'],
    gridPosition: [2.0, 0, 5.5],
    gridRotation: [0, -Math.PI / 2, 0],
  },
  {
    id: 'cockpit',
    displayName: 'Cockpit Interior',
    category: 'interior',
    description: 'The driver workspace with moulded carbon-fibre seating, harness, and control surfaces.',
    technicalSpecs: [
      { label: 'Structure', value: 'Moulded carbon-fibre seat' },
      { label: 'Safety', value: 'Harness and survival cell' },
      { label: 'System', value: 'Driver workspace' },
    ],
    meshPatterns: ['INTERIOR'],
    gridPosition: [0, 0, 5.0],
    gridRotation: [0, 0, 0],
  },
] as const satisfies readonly ExplorePartGroup[]

export const exploreCategoryLabels: Readonly<Record<ExploreCategory, string>> = {
  aero: 'Aero',
  body: 'Body',
  'wheels-tyres': 'Wheels & tyres',
  suspension: 'Suspension',
  interior: 'Interior',
  ancillaries: 'Ancillaries',
}

export function findW11PartGroup(mesh: THREE.Object3D | null) {
  let current = mesh

  while (current) {
    const node = current
    const match = w11PartGroups.find((part) => part.meshPatterns.some((pattern) => node.name.includes(pattern)))
    if (match) return match
    current = node.parent
  }

  return null
}
