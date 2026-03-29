import type { HeroStat } from './StudioShell'
import type { ReviewItem, TraceLink } from '../types/studio'
import styles from './WorkflowRightRail.module.css'

interface WorkflowRightRailProps {
  workflowName: string
  metrics: HeroStat[]
  reviewQueue: ReviewItem[]
  traceLinks: Record<string, TraceLink[]>
  bottlenecks: string[]
  recommendedPilot: string
}

const confidencePriority = {
  low: 0,
  medium: 1,
  high: 2,
} as const

export default function WorkflowRightRail({
  workflowName,
  metrics,
  reviewQueue,
  traceLinks,
  bottlenecks,
  recommendedPilot,
}: WorkflowRightRailProps) {
  const sortedQueue = [...reviewQueue].sort(
    (left, right) => confidencePriority[left.confidence] - confidencePriority[right.confidence],
  )

  return (
    <div className={styles.stack}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Workflow Context</p>
        <h2 className={styles.title}>{workflowName}</h2>

        <div className={styles.metricGrid}>
          {metrics.map((metric) => (
            <article key={metric.id} className={styles.metricCard}>
              <p className={styles.metricLabel}>{metric.label}</p>
              <p className={styles.metricValue}>{metric.value}</p>
              {metric.delta ? <p className={styles.metricDelta}>{metric.delta}</p> : null}
            </article>
          ))}
        </div>
      </section>

      <section className={styles.card} aria-label="Review queue">
        <h2 className={styles.sectionTitle}>Review Queue</h2>
        <div className={styles.queueList}>
          {sortedQueue.map((item) => (
            <article key={item.id} className={styles.queueItem}>
              <div className={styles.queueTopline}>
                <p className={styles.queueLabel}>{item.label}</p>
                <span className={`${styles.pill} ${styles[item.confidence]}`}>{item.confidence}</span>
              </div>
              <p className={styles.queueReason}>{item.reason}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Traceability</h2>
        <div className={styles.traceList}>
          {Object.entries(traceLinks).map(([stepId, links]) => (
            <div key={stepId} className={styles.traceRow}>
              <span>{stepId}</span>
              <strong>{links.length}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Bottlenecks</h2>
        <div className={styles.listStack}>
          {bottlenecks.map((item) => (
            <p key={item} className={styles.body}>
              {item}
            </p>
          ))}
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Recommended Pilot</h2>
        <p className={styles.body}>{recommendedPilot}</p>
      </section>
    </div>
  )
}
