import { exploreCategoryLabels, type ExplorePartGroup } from '../content/w11-parts'

type PointerPosition = { x: number; y: number }

type PartInfoCardProps = {
  hoveredPart: ExplorePartGroup | null
  pointerPosition: PointerPosition | null
  selectedPart: ExplorePartGroup | null
  onReset?: () => void
  isGalleryMode?: boolean
}

export function PartInfoCard({ hoveredPart, pointerPosition, selectedPart, onReset, isGalleryMode }: PartInfoCardProps) {
  if (selectedPart) {
    return (
      <section className={`part-info-card part-info-card--detail ${isGalleryMode ? 'part-info-card--gallery' : ''}`} aria-live="polite">
        <p>Technical overview</p>
        <h2>{selectedPart.displayName}</h2>
        <span className="part-info-card__badge">{exploreCategoryLabels[selectedPart.category]}</span>
        <p className="part-info-card__description">{selectedPart.description}</p>
        <dl className="part-info-card__specs">
          {selectedPart.technicalSpecs.map((spec) => (
            <div key={spec.label}>
              <dt>{spec.label}</dt>
              <dd>{spec.value}</dd>
            </div>
          ))}
        </dl>
        {onReset ? <button onClick={onReset} type="button">Restore full car</button> : null}
      </section>
    )
  }

  if (!hoveredPart || !pointerPosition) return null

  return (
    <p className="part-info-card part-info-card--tooltip" role="status" style={{ left: pointerPosition.x + 18, top: pointerPosition.y + 18 }}>
      {hoveredPart.displayName}
    </p>
  )
}
