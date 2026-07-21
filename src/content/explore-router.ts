import type * as THREE from 'three'
import { findW11PartGroup } from './w11-parts'
import { findMP44PartGroup } from './mp44-parts'
import { findF2002PartGroup } from './f2002-parts'
import { findRB19PartGroup } from './rb19-parts'
import { type ExplorePartGroup } from './w11-parts'

export function findExplorePartGroup(carId: string, mesh: THREE.Object3D | null): ExplorePartGroup | null {
  switch (carId) {
    case 'w11':
      return findW11PartGroup(mesh)
    case 'mp44':
      return findMP44PartGroup(mesh)
    case 'f2002':
      return findF2002PartGroup(mesh)
    case 'rb19':
      return findRB19PartGroup(mesh)
    default:
      return null
  }
}

export type { ExplorePartGroup }
