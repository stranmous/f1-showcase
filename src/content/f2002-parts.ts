import type * as THREE from 'three'
import { type ExplorePartGroup } from './w11-parts'

export const f2002PartGroups: ExplorePartGroup[] = [
  {
    id: 'f2002-overview',
    displayName: '2002 Ferrari F2002',
    category: 'body',
    description: 'The F2002 is one of the most successful Formula One cars of all time. It featured revolutionary aerodynamics, a screaming 3.0L V10 engine, and an ultra-compact titanium gearbox that allowed Michael Schumacher and Rubens Barrichello to dominate the 2002 season.',
    technicalSpecs: [
      { label: 'Engine', value: '3.0L V10 (Tipo 051)' },
      { label: 'Gearbox', value: 'Titanium sequential' },
      { label: 'Max RPM', value: '19,000 RPM' }
    ],
    meshPatterns: ['f1_2002_ferrari'],
    gridPosition: [0, 0, 0],
    gridRotation: [0, 0, 0]
  }
]

export function findF2002PartGroup(mesh: THREE.Object3D | null) {
  if (!mesh || !mesh.name) return null
  return f2002PartGroups.find(group => group.meshPatterns.some(pattern => mesh.name.includes(pattern))) || null
}
