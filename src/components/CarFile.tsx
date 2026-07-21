import type { CarFacts } from '../content/types'

type CarFileProps = {
  facts: CarFacts
  isOpen: boolean
  onToggle: () => void
}

function formatSpeed(valueKph: number) {
  const value = Number.isInteger(valueKph) ? String(valueKph) : valueKph.toFixed(1)
  return `${value} km/h`
}

export function CarFile({ facts, isOpen, onToggle }: CarFileProps) {
  const speedPrefix = facts.speed.confidence === 'estimated' ? '~' : ''

  return (
    <aside className={isOpen ? 'car-file is-open' : 'car-file'} aria-label={`${facts.name} car file`}>
      <button
        aria-controls="car-file-panel"
        aria-expanded={isOpen}
        className="car-file__trigger"
        onClick={onToggle}
        type="button"
      >
        <span>{isOpen ? 'Close file' : 'Car file'}</span>
        <svg aria-hidden="true" className="car-file__trigger-mark" viewBox="0 0 16 16">
          <path d="M3.5 8h9" />
          {!isOpen ? <path d="M8 3.5v9" /> : null}
        </svg>
      </button>

      {isOpen ? (
        <section className="car-file__panel" id="car-file-panel">
          <header className="car-file__header">
            <p>Car file</p>
            <div>
              <span>{facts.year}</span>
              <h2>{facts.name}</h2>
            </div>
          </header>

          <dl className="car-file__specs">
            <div>
              <dt>Constructor</dt>
              <dd>{facts.constructor}</dd>
            </div>
            <div>
              <dt>Power unit</dt>
              <dd>{facts.powerUnit}</dd>
            </div>
            <div>
              <dt>Drivers</dt>
              <dd>{facts.drivers.join(' · ')}</dd>
            </div>
          </dl>

          <dl className="car-file__record">
            <div>
              <dt>Race wins</dt>
              <dd>{facts.raceWins.wins}<span> / {facts.raceWins.races}</span></dd>
            </div>
            <div>
              <dt>Poles</dt>
              <dd>{facts.poles}</dd>
            </div>
            <div>
              <dt>Podiums</dt>
              <dd>{facts.podiums}</dd>
            </div>
            <div>
              <dt>Fastest laps</dt>
              <dd>{facts.fastestLaps}</dd>
            </div>
          </dl>

          <dl className="car-file__titles">
            <div>
              <dt>WDC</dt>
              <dd><span>{facts.worldDriversChampionship.year}</span>{facts.worldDriversChampionship.winner}</dd>
            </div>
            <div>
              <dt>WCC</dt>
              <dd><span>{facts.worldConstructorsChampionship.year}</span>{facts.worldConstructorsChampionship.winner}</dd>
            </div>
          </dl>

          <div className="car-file__speed">
            <p>{facts.speed.label}</p>
            <strong>{speedPrefix}{formatSpeed(facts.speed.valueKph)}{facts.speed.qualifier ? ` (${facts.speed.qualifier})` : ''}</strong>
            <span>{facts.speed.context}</span>
          </div>
        </section>
      ) : null}
    </aside>
  )
}
