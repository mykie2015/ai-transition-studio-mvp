import type { ScenarioMetricResult } from '../lib/scenarioMetrics'
import type { AnalysisDraft, ReviewItem, TraceLink } from '../types/studio'
import styles from './ReviewSummaryPanel.module.css'

interface ReviewSummaryPanelProps {
  draft: AnalysisDraft
  reviewQueue: ReviewItem[]
  mode?: 'workflow' | 'analysis'
  selectedResult?: ScenarioMetricResult | null
}

const confidencePriority = {
  low: 0,
  medium: 1,
  high: 2,
} as const

const tracePriority = {
  low: 0,
  medium: 1,
  high: 2,
} as const

const flattenTraceLinks = (traceLinks: Record<string, TraceLink[]>): TraceLink[] =>
  Object.values(traceLinks).flat()

export default function ReviewSummaryPanel({
  draft,
  reviewQueue,
  mode = 'workflow',
  selectedResult = null,
}: ReviewSummaryPanelProps) {
  const sortedQueue = [...reviewQueue].sort(
    (left, right) => confidencePriority[left.confidence] - confidencePriority[right.confidence],
  )
  const traceLinks = flattenTraceLinks(draft.traceLinks).sort(
    (left, right) => tracePriority[right.confidence] - tracePriority[left.confidence],
  )
  const strongestTrace = traceLinks[0] ?? null
  const weakestQueueItem = sortedQueue[0] ?? null

  return (
    <section className={styles.panel} aria-label={mode === 'analysis' ? 'Scenario summary' : 'Review summary'}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{mode === 'analysis' ? 'Scenario Readout' : 'Review Summary'}</p>
          <h2 className={styles.title}>
            {mode === 'analysis' ? 'Interpret the selected automation path' : 'Why this workflow still needs review'}
          </h2>
        </div>
      </div>

      <div className={styles.grid}>
        <article className={styles.card}>
          <p className={styles.label}>Priority checkpoint</p>
          <p className={styles.body}>{weakestQueueItem?.label ?? 'No review item is currently blocking the workflow.'}</p>
          {weakestQueueItem ? <p className={styles.meta}>{weakestQueueItem.reason}</p> : null}
        </article>

        <article className={styles.card}>
          <p className={styles.label}>Strongest evidence signal</p>
          <p className={styles.body}>{strongestTrace?.artifactTitle ?? 'No evidence trace has been attached yet.'}</p>
          {strongestTrace ? <p className={styles.meta}>{strongestTrace.excerpt}</p> : null}
        </article>

        <article className={styles.card}>
          <p className={styles.label}>{mode === 'analysis' ? 'Selected strategy' : 'Workflow confidence'}</p>
          <p className={styles.body}>
            {mode === 'analysis'
              ? selectedResult?.strategy.title ?? 'Select a scenario to inspect its tradeoffs.'
              : `${sortedQueue.length} review item${sortedQueue.length === 1 ? '' : 's'} still need confirmation.`}
          </p>
          <p className={styles.meta}>
            {mode === 'analysis'
              ? selectedResult?.strategy.summary ?? 'Scenario coverage and risk will appear here once selected.'
              : 'The workflow draft is evidence-first, but the review loop remains intentionally human-guided.'}
          </p>
        </article>

        <article className={styles.card}>
          <p className={styles.label}>Story-point baseline</p>
          <p className={styles.body}>{draft.storyPoints} points anchor the current speed and cost comparison.</p>
          <p className={styles.meta}>
            Use this baseline to decide whether automation reduces cycle time or just reshapes review burden.
          </p>
        </article>
      </div>
    </section>
  )
}
