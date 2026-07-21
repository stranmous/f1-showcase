import { useEffect, useRef } from 'react'
import { assetAttributions } from '../content/attributions'

type CreditsPanelProps = {
  isOpen: boolean
  onClose: () => void
}

export function CreditsPanel({ isOpen, onClose }: CreditsPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return undefined

    closeButtonRef.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isOpen, onClose])

  return (
    isOpen ? (
      <section
        className="credits-dialog"
        id="credits-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="credits-title"
      >
        <button
          className="credits-dialog__backdrop"
          type="button"
          aria-label="Close source credits"
          onClick={onClose}
        />
        <div className="credits-dialog__panel">
          <div className="credits-dialog__header">
            <div>
              <p>Project Information</p>
              <h2 id="credits-title">Credits & Acknowledgements</h2>
            </div>
            <button className="credits-dialog__close" ref={closeButtonRef} type="button" onClick={onClose}>
              Close
            </button>
          </div>

          <div className="credits-dialog__creator">
            <h3>Project Creator</h3>
            <p>
              Designed and developed by <strong>Waqas Zafar</strong>.
            </p>
            <p>
              View more of my work on{' '}
              <a href="https://github.com/stranmous" target="_blank" rel="noreferrer">
                GitHub (@stranmous)
              </a>
              {' '}and connect with me on{' '}
              <a href="https://linkedin.com/in/waqas75" target="_blank" rel="noreferrer">
                LinkedIn (@waqas75)
              </a>.
            </p>
          </div>

          <div className="credits-dialog__assets">
            <h3>Asset acknowledgement</h3>
            <ul className="credits-dialog__list">
              {assetAttributions.map((asset) => (
                <li key={asset.id}>
                  <h4>{asset.carName}</h4>
                  <p>
                    <a href={asset.sourceUrl} rel="noreferrer" target="_blank">
                      {asset.modelName}
                    </a>{' '}
                    by {asset.creator}
                  </p>
                  <p>
                    <a href={asset.licenseUrl} rel="noreferrer" target="_blank">
                      {asset.licenseName}
                    </a>
                    {' — '}
                    {asset.handling}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    ) : null
  )
}
