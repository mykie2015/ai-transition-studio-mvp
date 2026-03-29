import type { ReviewItem } from '../types/studio'
import styles from './ReviewQueue.module.css'

interface ReviewQueueProps {
  items: ReviewItem[]
}

const weight = {
  low: 0,
  medium: 1,
  high: 2,
} as const

export default function ReviewQueue({ items }: ReviewQueueProps) {
  const sorted = [...items].sort((left, right) => weight[left.confidence] - weight[right.confidence])

  return (
    <section className={styles.panel} aria-label="Review queue">
      <header className={styles.header}>
        <h2 className={styles.title}>Review Queue</h2>
        <p className={styles.subtitle}>
          Confirm the lowest-confidence inferences before trusting scenario recommendations.
        </p>
      </header>

      <div className={styles.items}>
        {sorted.map((item) => (
          <article key={item.id} className={styles.item}>
            <div className={styles.itemTopline}>
              <strong>{item.label}</strong>
              <span className={`${styles.pill} ${styles[item.confidence]}`}>{item.confidence}</span>
            </div>
            <p className={styles.reason}>{item.reason}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
