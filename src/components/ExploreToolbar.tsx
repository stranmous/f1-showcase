type ExploreToolbarProps = {
  isExploded: boolean
  isPartIsolated: boolean
  onReset: () => void
  onToggleExplode: () => void
}

type IconName = 'hover' | 'isolate' | 'explode' | 'cutaway' | 'reset'

function ExploreIcon({ name }: { name: IconName }) {
  if (name === 'hover') {
    return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7.5 2.8v9.4M4.5 6l3-3.2 3 3.2M13.2 13.2l6.4 6.4-2.5 2.5-6.4-6.4-2.8 1.7-1.7-10 10 1.7-1.7 2.8Z" /></svg>
  }
  if (name === 'isolate') {
    return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M8.5 3.5h-5v5M15.5 3.5h5v5M20.5 15.5v5h-5M3.5 15.5v5h5M9 9h6v6H9z" /></svg>
  }
  if (name === 'explode') {
    return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m8.8 8.8-5-5M5.2 3.8H3.8v1.4M15.2 8.8l5-5M18.8 3.8h1.4v1.4M8.8 15.2l-5 5M3.8 18.8v1.4h1.4M15.2 15.2l5 5M18.8 20.2h1.4v-1.4M9 9h6v6H9z" /></svg>
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 1-2.3-5.7M20 4v7h-7" /></svg>
}

function ToolButton({ active, disabled, icon, label, onClick }: {
  active: boolean
  disabled?: boolean
  icon: IconName
  label: string
  onClick: () => void
}) {
  return (
    <button aria-pressed={active} className={active ? 'is-active' : undefined} disabled={disabled} onClick={onClick} type="button">
      <ExploreIcon name={icon} />
      <span>{label}</span>
    </button>
  )
}

export function ExploreToolbar({
  isExploded,
  isPartIsolated,
  onReset,
  onToggleExplode,
}: ExploreToolbarProps) {
  return (
    <section className="explore-toolbar" aria-label="Explore tools">
      <div className="explore-toolbar__tools">
        <ToolButton active={!isPartIsolated && !isExploded} icon="hover" label="Hover" onClick={onReset} />
        <ToolButton active={isPartIsolated} icon="isolate" label="Isolate" onClick={onReset} />
        <ToolButton active={isExploded} icon="explode" label={isExploded ? "Restore" : "Explode"} onClick={onToggleExplode} />
      </div>
      <button className="explore-toolbar__reset" onClick={onReset} type="button"><ExploreIcon name="reset" /><span>Reset</span></button>
    </section>
  )
}
