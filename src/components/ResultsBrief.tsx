import { useState } from 'react'
import type { AiAsset, ImportedArtifact } from '../types/studio'
import type { ScenarioMetricResult } from '../lib/scenarioMetrics'
import styles from './ResultsBrief.module.css'

interface ResultsBriefProps {
  markdown: string
  selectedResult: ScenarioMetricResult | null
  recommendedStrategyId: string | null
  attachedArtifacts: ImportedArtifact[]
  assets: AiAsset[]
  diagnosis: {
    maturityStage: string
    bottleneckDimension: string
    leveragePoint: string
    recommendedPilot: string
  }
}

const readinessTone: Record<AiAsset['readiness'], string> = {
  available: styles.ready,
  partial: styles.partial,
  blocked: styles.blocked,
}

export default function ResultsBrief({
  markdown,
  selectedResult,
  recommendedStrategyId,
  attachedArtifacts,
  assets,
  diagnosis,
}: ResultsBriefProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
  }

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'ai-transition-brief.md'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className={styles.panel} aria-label="Results and recommendation brief">
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Results and Recommendation</h2>
          <p className={styles.subtitle}>
            Export a shareable brief with the current-state diagnosis, future-state options, and
            90-day plan.
          </p>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.actionButton} onClick={handleCopy}>
            {copyState === 'copied'
              ? 'Copied Markdown'
              : copyState === 'failed'
                ? 'Copy Failed'
                : 'Copy Markdown'}
          </button>
          <button type="button" className={styles.secondaryButton} onClick={handleDownload}>
            Download .md
          </button>
        </div>
      </header>

      <div className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Maturity Stage</p>
          <p className={styles.summaryValue}>{diagnosis.maturityStage}</p>
        </article>
        <article className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Bottleneck Dimension</p>
          <p className={styles.summaryValue}>{diagnosis.bottleneckDimension}</p>
        </article>
        <article className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Leverage Point</p>
          <p className={styles.summaryValue}>{diagnosis.leveragePoint}</p>
        </article>
        <article className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Recommended Pilot</p>
          <p className={styles.summaryValue}>{diagnosis.recommendedPilot}</p>
        </article>
      </div>

      <div className={styles.sectionGrid}>
        <article className={styles.sectionCard}>
          <p className={styles.sectionLabel}>Chosen Strategy</p>
          <p className={styles.sectionValue}>
            {selectedResult?.strategy.title ?? 'No strategy selected'}
          </p>
          <p className={styles.sectionBody}>
            {selectedResult?.strategy.summary ?? 'Select a scenario to generate the recommendation.'}
          </p>
          {selectedResult ? (
            <div className={styles.metricStack}>
              <p className={styles.sectionHint}>
                Cycle / point: {selectedResult.metrics.cycleTimePerStoryPoint ?? 'n/a'}h
              </p>
              <p className={styles.sectionHint}>
                Cost / point:{' '}
                {selectedResult.metrics.estimatedCostPerStoryPoint === undefined
                  ? 'n/a'
                  : `$${selectedResult.metrics.estimatedCostPerStoryPoint}`}
              </p>
            </div>
          ) : null}
          <p className={styles.sectionHint}>
            {selectedResult?.strategy.id === recommendedStrategyId
              ? 'This matches the current recommended first move.'
              : 'This is a user-selected path that differs from the current recommendation.'}
          </p>
        </article>

        <article className={styles.sectionCard}>
          <p className={styles.sectionLabel}>Attached Evidence</p>
          <div className={styles.listStack}>
            {attachedArtifacts.map((artifact) => (
              <div key={artifact.id} className={styles.listItem}>
                <p className={styles.listTitle}>{artifact.title}</p>
                <p className={styles.listBody}>
                  {artifact.source} | {artifact.summary}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.sectionCard}>
          <p className={styles.sectionLabel}>AI Asset Readiness</p>
          <div className={styles.listStack}>
            {assets.map((asset) => (
              <div key={asset.id} className={styles.assetRow}>
                <div>
                  <p className={styles.listTitle}>{asset.name}</p>
                  <p className={styles.listBody}>{asset.description}</p>
                </div>
                <span className={`${styles.readinessPill} ${readinessTone[asset.readiness]}`}>
                  {asset.readiness}
                </span>
              </div>
            ))}
          </div>
        </article>
      </div>

      <section className={styles.previewWrap}>
        <div className={styles.previewHeader}>
          <p className={styles.previewTitle}>Shareable Brief Preview</p>
          <p className={styles.previewHint}>Markdown output generated from the current session.</p>
        </div>
        <pre className={styles.preview}>{markdown}</pre>
      </section>
    </section>
  )
}
