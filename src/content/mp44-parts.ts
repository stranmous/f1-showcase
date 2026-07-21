import type * as THREE from 'three'
import { type ExplorePartGroup } from './w11-parts'

export const mp44PartGroups: ExplorePartGroup[] = [
  {
    id: 'mp44-overview',
    displayName: '1988 McLaren MP4/4',
    category: 'body',
    description: 'The MP4/4 is arguably the most dominant F1 car ever built. Designed by Steve Nichols and Gordon Murray, its ultra-low monocoque and perfectly integrated Honda V6 Turbo allowed Senna and Prost to win 15 of 16 races.',
    technicalSpecs: [
      { label: 'Chassis', value: 'Carbon-Kevlar' },
      { label: 'Engine', value: 'Honda 1.5L V6 Turbo' },
      { label: 'Designers', value: 'Nichols & Murray' }
    ],
    meshPatterns: ['mp44'],
    gridPosition: [0, 0, 0],
    gridRotation: [0, 0, 0]
  }
]

export function findMP44PartGroup(mesh: THREE.Object3D | null) {
  if (!mesh || !mesh.name) return null
  return mp44PartGroups.find(group => group.meshPatterns.some(pattern => mesh.name.includes(pattern))) || null
}
