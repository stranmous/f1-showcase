import type * as THREE from 'three'
import { type ExplorePartGroup } from './w11-parts'

export const rb19PartGroups: ExplorePartGroup[] = [
  {
    id: 'rb19-overview',
    displayName: '2023 Red Bull RB19',
    category: 'body',
    description: 'The RB19 utilizes complex ground-effect aerodynamics. Its heavily sculpted front wing, aggressive sidepod undercut, and highly potent Honda RBPTH001 hybrid power unit made it the most aerodynamically efficient and dominant car of the 2023 grid.',
    technicalSpecs: [
      { label: 'Aero Concept', value: 'Ground Effect' },
      { label: 'Engine', value: '1.6L V6 Turbo Hybrid' },
      { label: 'Win Rate', value: '95.4% (21/22)' }
    ],
    meshIndices: [0, 1, 2, 3, 4, 5, 6],
    meshPatterns: [],
    gridPosition: [0, 0, 0],
    gridRotation: [0, 0, 0]
  }
]

export function findRB19PartGroup(mesh: THREE.Object3D | null) {
  if (!mesh || !mesh.name) return null
  const match = mesh.name.match(/Object_(\d+)/)
  if (!match) return null
  
  const index = parseInt(match[1], 10)
  return rb19PartGroups.find(group => group.meshIndices?.includes(index)) || null
}
