import { Html } from '@react-three/drei/web/Html'
import { exploreCategoryLabels, type ExploreCategory } from '../content/w11-parts'
import type { Vector3 } from '../content/types'

export type ExploreCategoryLabel = {
  category: ExploreCategory
  explodeDirection: Vector3
  position: Vector3
}

export function ExploreLabels({ explodeAmount, labels, visible }: { explodeAmount: number; labels: readonly ExploreCategoryLabel[]; visible: boolean }) {
  if (!visible) return null

  return (
    <group>
      {labels.map((label) => {
        const [x, y, z] = label.position
        const [offsetX, offsetY, offsetZ] = label.explodeDirection
        return (
          <Html center className="explore-label" key={label.category} position={[x + offsetX * explodeAmount, y + offsetY * explodeAmount, z + offsetZ * explodeAmount]}>
            <span>{exploreCategoryLabels[label.category]}</span>
          </Html>
        )
      })}
    </group>
  )
}
