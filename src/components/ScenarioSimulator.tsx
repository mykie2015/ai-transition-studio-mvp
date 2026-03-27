import type { ScenarioMetricResult } from '../lib/scenarioMetrics'
import type { BaselineMetrics } from '../types/studio'
import styles from './ScenarioSimulator.module.css'

interface ScenarioSimulatorProps {
  baseline: BaselineMetrics
  results: ScenarioMetricResult[]
  selectedStrategyId: string
  recommendedStrategyId: string | null
  onSelectStrategy: (strategyId: string) => void
}

const metricLabelMap = {
  cycleTime: 'Cycle Time',
  humanEffort: 'Human Effort',
  reviewBurden: 'Review Burden',
  qualityRisk: 'Quality Risk',
  leverage: 'Leverage',
} as const

const roundPct = (value: number): string => `${Math.round(value * 100)}%`

const deltaLabel = (value: number, baseline: number, inverse = false): string => {
  const diff = value - baseline
  if (diff === 0) {
    return 'flat'
  }
  const change = Math.abs((diff / baseline) * 100)
  const improved = inverse ? diff <= 0 : diff >= 0
  return `${improved ? 'better' : 'worse'} ${change.toFixed(0)}%`
}

const getMetricTone = (metric: string, value: number, baseline: BaselineMetrics): string => {
  if (metric === 'leverage') {
    return value >= 0.28 ? styles.goodMetric : styles.riskMetric
  }
  if (metric === 'qualityRisk') {
    return value <= 18 ? styles.goodMetric : styles.riskMetric
  }
  if (metric === 'cycleTime') {
    return value <= baseline.cycleTimeHours ? styles.goodMetric : styles.riskMetric
  }
  if (metric === 'humanEffort') {
    return value <= baseline.humanEffortHours ? styles.goodMetric : styles.riskMetric
  }
  return value <= baseline.reviewBurdenHours ? styles.goodMetric : styles.warnMetric
}

export default function ScenarioSimulator({
  baseline,
  results,
  selectedStrategyId,
  recommendedStrategyId,
  onSelectStrategy,
}: ScenarioSimulatorProps) {
  const recommended = results.find((result) => result.strategy.id === recommendedStrategyId) ?? null

  return (
    <section className={styles.panel} aria-label="Scenario simulator">
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Scenario Simulator</h2>
          <p className={styles.subtitle}>
            Compare partial, hybrid, and near-full automation strategies with explicit metric and
            risk tradeoffs.
          </p>
        </div>
        {recommended ? (
          <div className={styles.recommendation}>
            <p className={styles.recommendationLabel}>Recommended First Move</p>
            <p className={styles.recommendationValue}>{recommended.strategy.title}</p>
            <p className={styles.recommendationBody}>
              Highest leverage under the current workflow and MCP coverage assumptions.
            </p>
          </div>
        ) : null}
      </header>

      <div className={styles.cardGrid}>
        {results.map((result) => {
          const isSelected = result.strategy.id === selectedStrategyId
          const isRecommended = result.strategy.id === recommendedStrategyId
          return (
            <article
              key={result.strategy.id}
              className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
            >
              <div className={styles.cardTopline}>
                <div>
                  <p className={styles.cardLabel}>{result.strategy.coverageLabel}</p>
                  <h3 className={styles.cardTitle}>{result.strategy.title}</h3>
                </div>
                {isRecommended ? <span className={styles.recommendedPill}>Recommended</span> : null}
              </div>

              <p className={styles.cardSummary}>{result.strategy.summary}</p>

              <div className={styles.metricGrid}>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>Coverage</p>
                  <p className={styles.metricValue}>{roundPct(result.automationCoverage)}</p>
                </div>
                {Object.entries(result.metrics).map(([metric, value]) => {
                  const baselineValue =
                    metric === 'cycleTime'
                      ? baseline.cycleTimeHours
                      : metric === 'humanEffort'
                        ? baseline.humanEffortHours
                        : metric === 'reviewBurden'
                          ? baseline.reviewBurdenHours
                          : metric === 'qualityRisk'
                            ? 100 - baseline.qualityScore
                            : baseline.outputVolume /
                              Math.max(
                                1,
                                baseline.humanEffortHours + baseline.reviewBurdenHours,
                              )

                  return (
                    <div key={metric} className={`${styles.metricCard} ${getMetricTone(metric, value, baseline)}`}>
                      <p className={styles.metricLabel}>
                        {metricLabelMap[metric as keyof typeof metricLabelMap]}
                      </p>
                      <p className={styles.metricValue}>{value}</p>
                      <p className={styles.metricDelta}>
                        {deltaLabel(value, baselineValue, metric !== 'leverage')}
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className={styles.detailGrid}>
                <div>
                  <p className={styles.detailLabel}>Required Change</p>
                  <p className={styles.detailText}>{result.strategy.requiredChange}</p>
                </div>
                <div>
                  <p className={styles.detailLabel}>Assumptions</p>
                  <p className={styles.detailText}>{result.assumptions.join(' | ')}</p>
                </div>
                <div>
                  <p className={styles.detailLabel}>Risks</p>
                  <p className={styles.detailText}>{result.strategy.risks.join(' | ')}</p>
                </div>
                <div>
                  <p className={styles.detailLabel}>Prerequisites</p>
                  <p className={styles.detailText}>{result.strategy.prerequisites.join(' | ')}</p>
                </div>
              </div>

              <button
                type="button"
                className={styles.selectButton}
                onClick={() => onSelectStrategy(result.strategy.id)}
              >
                {isSelected ? 'Selected Strategy' : 'Select Strategy'}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}
