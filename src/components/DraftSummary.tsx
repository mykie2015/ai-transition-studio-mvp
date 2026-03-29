import type { AnalysisDraft } from '../types/studio'
import styles from './DraftSummary.module.css'

interface DraftSummaryProps {
  draft: AnalysisDraft
}

export default function DraftSummary({ draft }: DraftSummaryProps) {
  return (
    <section className={styles.panel} aria-label="Draft summary">
      <div className={styles.metric}>
        <span className={styles.label}>Workflow</span>
        <strong className={styles.value}>{draft.workflowName}</strong>
      </div>
      <div className={styles.metric}>
        <span className={styles.label}>Story points</span>
        <strong className={styles.value}>{draft.storyPoints}</strong>
      </div>
      <div className={styles.metric}>
        <span className={styles.label}>Steps</span>
        <strong className={styles.value}>{draft.steps.length}</strong>
      </div>
      <div className={styles.metric}>
        <span className={styles.label}>Artifacts</span>
        <strong className={styles.value}>{draft.artifacts.length}</strong>
      </div>
    </section>
  )
}
