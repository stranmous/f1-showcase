import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { CarFile } from './components/CarFile'
import { CreditsPanel } from './components/CreditsPanel'
import { ExploreToolbar } from './components/ExploreToolbar'
import { PartInfoCard } from './components/PartInfoCard'
import { carFactsById } from './content/car-facts'
import { loadAeroGuide, preloadAeroGuide } from './content/aero-guides'
import { runtimeCarById, runtimeCars } from './content/runtime-manifest'
import type { CarId } from './content/types'
import { w11OverviewPart, type ExplorePartGroup } from './content/w11-parts'
import { rb19PartGroups } from './content/rb19-parts'
import { f2002PartGroups } from './content/f2002-parts'
import { mp44PartGroups } from './content/mp44-parts'
import type { ModelLoadState } from './scene/CarModel'

/*
      =========================================================
      F1 Cars Showcase
      Designed and developed by Waqas Zafar
      GitHub: https://github.com/stranmous
      LinkedIn: https://linkedin.com/in/waqas75
      =========================================================
    */

type ExperienceMode = 'gallery' | 'explore' | 'aero'

type ExplorePointerPosition = {
  x: number
  y: number
}

const GalleryCanvas = lazy(async () => {
  const module = await import('./scene/GalleryCanvas')
  return { default: module.GalleryCanvas }
})

const titleLines: Record<CarId, readonly [string, string]> = {
  mp44: ['McLaren', 'MP4/4'],
  f2002: ['Ferrari', 'F2002'],
  w11: ['Mercedes', 'W11'],
  rb19: ['Red Bull', 'RB19'],
}

const reducedMotionStorageKey = 'f1-cars-showcase:reduce-motion'

function getOverviewPart(carId: CarId): ExplorePartGroup | null {
  if (carId === 'rb19') return rb19PartGroups[0]
  if (carId === 'f2002') return f2002PartGroups[0]
  if (carId === 'mp44') return mp44PartGroups[0]
  if (carId === 'w11') return w11OverviewPart
  return null
}

function App() {
  const [selectedCarId, setSelectedCarId] = useState<CarId>('mp44')
  const [displayedCarId, setDisplayedCarId] = useState<CarId>('mp44')
  const [loadState, setLoadState] = useState<ModelLoadState>({ status: 'loading', progress: 0 })
  const [resetViewSignal, setResetViewSignal] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCarFileOpen, setIsCarFileOpen] = useState(false)
  const [isCreditsOpen, setIsCreditsOpen] = useState(false)
  const [experienceMode, setExperienceMode] = useState<ExperienceMode>('gallery')
  const [exploreHoveredPart, setExploreHoveredPart] = useState<ExplorePartGroup | null>(null)
  const [exploreSelectedPart, setExploreSelectedPart] = useState<ExplorePartGroup | null>(null)
  const [explorePointerPosition, setExplorePointerPosition] = useState<ExplorePointerPosition | null>(null)
  const [isExploded, setIsExploded] = useState(false)
  const [isReducedMotion, setIsReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(reducedMotionStorageKey) === 'true'
  })

  const menuTriggerRef = useRef<HTMLButtonElement>(null)
  const selectedCar = runtimeCarById[selectedCarId]
  const displayedCar = runtimeCarById[displayedCarId]
  const displayedFacts = carFactsById[displayedCarId]
  const [title, model] = titleLines[displayedCarId]

  const resetExplore = useCallback(() => {
    setExploreHoveredPart(null)
    setExploreSelectedPart(null)
    setExplorePointerPosition(null)
    setIsExploded(false)
  }, [])

  const handleExploreHover = useCallback((part: ExplorePartGroup | null, pointer: ExplorePointerPosition | null) => {
    setExploreHoveredPart((current) => current?.id === part?.id ? current : part)
    setExplorePointerPosition(pointer)
  }, [])

  const handleExploreSelect = useCallback((part: ExplorePartGroup) => {
    setExploreSelectedPart(part)
    setExploreHoveredPart(part)
    setExplorePointerPosition(null)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(reducedMotionStorageKey, String(isReducedMotion))
  }, [isReducedMotion])

  useEffect(() => {
    preloadAeroGuide(selectedCarId)
  }, [selectedCarId])

  useEffect(() => {
    // Preload all cars into browser cache in the background for instant switching
    runtimeCars.forEach(car => {
      if (car.id !== selectedCarId) {
        fetch(car.runtimeModelUrl, { priority: 'low' } as RequestInit).catch(() => {})
      }
    })
  }, [selectedCarId])



  const handleLoadState = useCallback((state: ModelLoadState) => {
    setLoadState(state)
  }, [])

  const handlePresentedCar = useCallback((carId: CarId) => {
    setDisplayedCarId(carId)
  }, [])

  const selectCar = useCallback((id: CarId) => {
    if (id === selectedCarId) return
    setLoadState({ status: 'loading', progress: 0 })
    preloadAeroGuide(id)
    setSelectedCarId(id)
    resetExplore()
    setResetViewSignal((signal) => signal + 1)
    setIsMenuOpen(false)
  }, [resetExplore, selectedCarId])

  const resetView = useCallback(() => {
    if (experienceMode === 'explore') resetExplore()
    setResetViewSignal((signal) => signal + 1)
    setIsMenuOpen(false)
  }, [experienceMode, resetExplore])

  const selectExperienceMode = useCallback((nextMode: ExperienceMode) => {
    if (nextMode === experienceMode) return
    if (nextMode === 'aero') {
      void loadAeroGuide(selectedCarId).then(
        () => {
          setExperienceMode('aero')
          setIsCarFileOpen(false)
          setIsMenuOpen(false)
          setResetViewSignal((signal) => signal + 1)
        },
        () => setLoadState({ status: 'error', message: 'The selected car aero guide could not be loaded.' }),
      )
      return
    }
    setExperienceMode(nextMode)
    if (nextMode === 'explore') resetExplore()
    setIsCarFileOpen(false)
    setIsMenuOpen(false)
    setResetViewSignal((signal) => signal + 1)
  }, [experienceMode, resetExplore, selectedCarId])

  useEffect(() => {
    if (isCreditsOpen || isMenuOpen) return undefined

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (experienceMode === 'explore') resetExplore()
        else if (isCarFileOpen) setIsCarFileOpen(false)
        else setIsMenuOpen(false)
        return
      }

      if (event.key === 'ArrowLeft') {
        const currentIndex = runtimeCars.findIndex(c => c.id === selectedCarId)
        if (currentIndex === -1) return
        const nextIndex = (currentIndex - 1 + runtimeCars.length) % runtimeCars.length
        selectCar(runtimeCars[nextIndex].id)
      }

      if (event.key === 'ArrowRight') {
        const currentIndex = runtimeCars.findIndex(c => c.id === selectedCarId)
        if (currentIndex === -1) return
        const nextIndex = (currentIndex + 1) % runtimeCars.length
        selectCar(runtimeCars[nextIndex].id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [experienceMode, isCarFileOpen, isCreditsOpen, isMenuOpen, resetExplore, selectedCarId, selectCar])

  const isLoading = loadState.status === 'loading'
  const loadingLabel = loadState.status === 'error'
    ? loadState.message
    : loadState.progress > 0
      ? `Preparing ${selectedCar.displayName} — ${loadState.progress}%`
      : `Preparing ${selectedCar.displayName}`

  return (
    <main
      className={`gallery-shell${experienceMode === 'aero' ? ' is-aero' : ''}${experienceMode === 'explore' ? ' is-explore' : ''}`}
      data-reduced-motion={isReducedMotion || undefined}
    >
      <div className="gallery-shell__grain" aria-hidden="true" />
      <header className="gallery-header">
        <a className="gallery-header__brand" href="#gallery" aria-label="Formula Cars Showcase home">
          <span aria-hidden="true">F</span>
          <span>Formula Cars</span>
        </a>
        <nav className="gallery-header__nav" aria-label="Exhibit mode">
          <button
            aria-pressed={experienceMode === 'gallery'}
            className={experienceMode === 'gallery' ? 'is-active' : undefined}
            onClick={() => selectExperienceMode('gallery')}
            type="button"
          >
            Gallery
          </button>
          <button
            aria-pressed={experienceMode === 'explore'}
            className={experienceMode === 'explore' ? 'is-active' : undefined}
            onClick={() => selectExperienceMode('explore')}
            type="button"
          >
            Explore
          </button>
          <button
            aria-pressed={experienceMode === 'aero'}
            className={experienceMode === 'aero' ? 'is-active' : undefined}
            onClick={() => selectExperienceMode('aero')}
            type="button"
          >
            <span>Aero visualisation</span>
            <span className="gallery-header__aero-clarifier">Interpretive · not CFD</span>
          </button>
        </nav>
        <div className="gallery-header__controls">
          <button
            aria-expanded={isMenuOpen}
            aria-controls="gallery-controls-menu"
            aria-label={isMenuOpen ? 'Close gallery controls' : 'Open gallery controls'}
            className={isMenuOpen ? 'gallery-menu-trigger is-open' : 'gallery-menu-trigger'}
            onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
            ref={menuTriggerRef}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
          {isMenuOpen ? (
            <div className="gallery-menu" id="gallery-controls-menu">
              <button onClick={resetView} type="button">{experienceMode === 'aero' ? 'Reset aero view' : experienceMode === 'explore' ? 'Reset explore view' : 'Reset view'}</button>
              <button
                aria-controls="credits-dialog"
                aria-haspopup="dialog"
                className="credits-trigger"
                onClick={() => { setIsMenuOpen(false); setIsCreditsOpen(true) }}
                type="button"
              >
                Source credits
              </button>
              <label className="gallery-menu__motion">
                <span>Reduce motion</span>
                <input
                  checked={isReducedMotion}
                  className="gallery-menu__motion-input"
                  onChange={(event) => setIsReducedMotion(event.target.checked)}
                  type="checkbox"
                />
                <span aria-hidden="true" className="gallery-menu__motion-track" />
              </label>
            </div>
          ) : null}
        </div>
      </header>

      <CreditsPanel
        isOpen={isCreditsOpen}
        onClose={() => {
          setIsCreditsOpen(false)
          menuTriggerRef.current?.focus()
        }}
      />

      <section className="gallery-layout" id="gallery" aria-label={`${displayedCar.displayName} exhibit`}>
        <section
          className={`${isLoading ? 'gallery-hero is-loading' : 'gallery-hero'}${isCarFileOpen ? ' has-car-file' : ''}${experienceMode === 'aero' ? ' is-aero' : experienceMode === 'explore' ? ' is-explore' : ''}`}
          aria-label={`${displayedCar.displayName} ${experienceMode === 'aero' ? 'aero visualisation' : experienceMode === 'explore' ? 'explore inspection' : 'gallery stage'}`}
        >
          {experienceMode === 'gallery' ? (
            <div className="gallery-hero__year" key={`year-${displayedCarId}`} aria-hidden="true">{displayedCar.year}</div>
          ) : null}
          <Suspense fallback={<div className="gallery-hero__canvas-fallback" aria-hidden="true" />}>
            <GalleryCanvas
              car={selectedCar}
              explore={{
                isExploded,
                hoveredPart: exploreHoveredPart,
                onClearSelection: resetExplore,
                onHoverPart: handleExploreHover,
                onSelectPart: handleExploreSelect,
                selectedPart: exploreSelectedPart,
              }}
              mode={experienceMode}
              onLoadState={handleLoadState}
              onPresentedCar={handlePresentedCar}
              reducedMotion={isReducedMotion}
              resetViewSignal={resetViewSignal}
            />
          </Suspense>
          {experienceMode !== 'explore' ? (
            <div className={experienceMode === 'aero' ? 'gallery-hero__identity is-aero' : 'gallery-hero__identity'} key={`identity-${displayedCarId}`}>
              <span className="gallery-hero__identity-year">{displayedCar.year}</span>
              <h1 id="car-title">{title}<br /><em>{model}</em></h1>
            </div>
          ) : null}
          {experienceMode === 'gallery' ? (
            <>
              <CarFile facts={displayedFacts} isOpen={isCarFileOpen} onToggle={() => setIsCarFileOpen((isOpen) => !isOpen)} />
              {isCarFileOpen ? (
                <PartInfoCard hoveredPart={null} pointerPosition={null} selectedPart={getOverviewPart(displayedCarId)} isGalleryMode />
              ) : null}
            </>
          ) : null}
          {experienceMode === 'explore' && displayedCarId === 'w11' ? (
            <>
              <PartInfoCard
                hoveredPart={exploreHoveredPart}
                onReset={resetView}
                pointerPosition={explorePointerPosition}
                selectedPart={exploreSelectedPart}
              />
              <ExploreToolbar
                isExploded={isExploded}
                isPartIsolated={Boolean(exploreSelectedPart)}
                onReset={resetView}
                onToggleExplode={() => setIsExploded((exploded) => !exploded)}
              />
            </>
          ) : null}
          {experienceMode === 'explore' && displayedCarId !== 'w11' ? (
            <section className="explore-unavailable" role="status">
              <p>Explore mode is available for the Mercedes W11</p>
              <button onClick={() => selectCar('w11')} type="button">Load Mercedes W11</button>
            </section>
          ) : null}
          {isLoading || loadState.status === 'error' ? (
            <div className={loadState.status === 'error' ? 'gallery-hero__load-state is-error' : 'gallery-hero__load-state'} role="status">
              <span className="gallery-hero__load-orbit" aria-hidden="true" />
              <span>{loadingLabel}</span>
            </div>
          ) : null}
        </section>
      </section>

      {!isCarFileOpen && experienceMode !== 'explore' ? (
        <>
          <button 
            className="gallery-nav-arrow gallery-nav-arrow--left" 
            onClick={() => {
              const currentIndex = runtimeCars.findIndex(c => c.id === selectedCarId)
              if (currentIndex === -1) return
              const nextIndex = (currentIndex - 1 + runtimeCars.length) % runtimeCars.length
              selectCar(runtimeCars[nextIndex].id)
            }}
            aria-label="Previous car"
          >
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>

          <button 
            className="gallery-nav-arrow gallery-nav-arrow--right" 
            onClick={() => {
              const currentIndex = runtimeCars.findIndex(c => c.id === selectedCarId)
              if (currentIndex === -1) return
              const nextIndex = (currentIndex + 1) % runtimeCars.length
              selectCar(runtimeCars[nextIndex].id)
            }}
            aria-label="Next car"
          >
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </>
      ) : null}
    </main>
  )
}

export default App
