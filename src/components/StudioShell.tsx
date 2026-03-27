import type { ReactNode } from 'react'
import type { StageId } from '../types/studio'
import styles from './StudioShell.module.css'

type StageStatus = 'pending' | 'active' | 'complete' | 'blocked'
type StatTone = 'neutral' | 'positive' | 'warning' | 'risk'

export interface StudioStage {
  id: StageId
  label: string
  description?: string
  status?: StageStatus
}

export interface HeroStat {
  id: string
  label: string
  value: string | number
  delta?: string
  tone?: StatTone
}

interface StudioShellProps {
  stages: StudioStage[]
  activeStage: StageId
  onStageChange: (stageId: StageId) => void
  heroStats: HeroStat[]
  children: ReactNode
  aside?: ReactNode
  title?: string
  subtitle?: string
}

const formatStatValue = (value: string | number): string => {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)
  }
  return value
}

const stageStatusClass: Record<StageStatus, string> = {
  pending: styles.stagePending,
  active: styles.stageActive,
  complete: styles.stageComplete,
  blocked: styles.stageBlocked,
}

const statToneClass: Record<StatTone, string> = {
  neutral: styles.statNeutral,
  positive: styles.statPositive,
  warning: styles.statWarning,
  risk: styles.statRisk,
}

export default function StudioShell({
  stages,
  activeStage,
  onStageChange,
  heroStats,
  children,
  aside,
  title = 'AI Transition Studio',
  subtitle = 'Operating-model calibration across workflow, assets, and risk controls',
}: StudioShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <nav className={styles.stageRail} aria-label="Transition stages">
          {stages.map((stage) => {
            const isActive = stage.id === activeStage
            const statusClass = stage.status ? stageStatusClass[stage.status] : styles.stagePending
            return (
              <button
                key={stage.id}
                type="button"
                className={`${styles.stageButton} ${statusClass} ${isActive ? styles.stageSelected : ''}`}
                onClick={() => onStageChange(stage.id)}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className={styles.stageLabel}>{stage.label}</span>
                {stage.description ? <span className={styles.stageDescription}>{stage.description}</span> : null}
              </button>
            )
          })}
        </nav>
      </header>

      <section className={styles.heroGrid} aria-label="Program summary">
        {heroStats.map((stat) => {
          const tone = stat.tone ?? 'neutral'
          return (
            <article key={stat.id} className={`${styles.statCard} ${statToneClass[tone]}`}>
              <p className={styles.statLabel}>{stat.label}</p>
              <p className={styles.statValue}>{formatStatValue(stat.value)}</p>
              {stat.delta ? <p className={styles.statDelta}>{stat.delta}</p> : null}
            </article>
          )
        })}
      </section>

      <div className={styles.workspace}>
        <main className={styles.mainPane}>{children}</main>
        <aside className={styles.sidePane}>
          {aside ?? <p className={styles.sidePlaceholder}>Select a record to review details and control points.</p>}
        </aside>
      </div>
    </div>
  )
}
