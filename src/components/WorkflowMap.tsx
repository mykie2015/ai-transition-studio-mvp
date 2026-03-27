import type { AutomationMode, WorkflowStep } from '../types/studio'
import styles from './WorkflowMap.module.css'

interface WorkflowMapProps {
  steps: WorkflowStep[]
  selectedAutomation: Record<string, AutomationMode>
  selectedStepId: string | null
  strategyTitle: string
  onSelectStep: (stepId: string) => void
  onOverrideStepMode: (stepId: string, mode: AutomationMode) => void
}

const automationModes: AutomationMode[] = [
  'do-not-automate',
  'assist-only',
  'automate-with-review',
  'automate-by-default',
]

const toneClassByMode: Record<AutomationMode, string> = {
  manual: styles.manual,
  'ai-assisted': styles.assisted,
  'ai-automated': styles.automated,
  'do-not-automate': styles.blocked,
  'assist-only': styles.assisted,
  'automate-with-review': styles.review,
  'automate-by-default': styles.automated,
}

const formatMode = (mode: AutomationMode): string => mode.replaceAll('-', ' ')

const getStepHealth = (step: WorkflowStep): string => {
  if (step.errorSensitivity === 'high' && !step.reviewRequired) {
    return 'High sensitivity without an explicit review gate.'
  }
  if (step.tools.length === 0) {
    return 'Tooling context is incomplete.'
  }
  if (step.automationMode === 'manual') {
    return 'Manual step with clear automation headroom.'
  }
  return 'Control points are in place for this step.'
}

export default function WorkflowMap({
  steps,
  selectedAutomation,
  selectedStepId,
  strategyTitle,
  onSelectStep,
  onOverrideStepMode,
}: WorkflowMapProps) {
  return (
    <section className={styles.panel} aria-label="Workflow map">
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Current-State Workflow Map</h2>
          <p className={styles.subtitle}>
            Visualize owners, handoffs, review gates, and the automation overlay for{' '}
            {strategyTitle}.
          </p>
        </div>
        <div className={styles.legend}>
          <span className={`${styles.legendPill} ${styles.manual}`}>Manual</span>
          <span className={`${styles.legendPill} ${styles.assisted}`}>Assist</span>
          <span className={`${styles.legendPill} ${styles.review}`}>Review Gate</span>
          <span className={`${styles.legendPill} ${styles.automated}`}>Automated</span>
        </div>
      </header>

      <div className={styles.canvas}>
        {steps.map((step, index) => {
          const futureMode = selectedAutomation[step.id] ?? step.automationMode
          const isSelected = step.id === selectedStepId

          return (
            <div key={step.id} className={styles.segment}>
              <button
                type="button"
                className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
                onClick={() => onSelectStep(step.id)}
                aria-pressed={isSelected}
              >
                <div className={styles.cardTopline}>
                  <span className={styles.stepIndex}>Step {index + 1}</span>
                  <span className={styles.owner}>{step.owner}</span>
                </div>

                <h3 className={styles.stepTitle}>{step.name || 'Untitled workflow step'}</h3>
                <p className={styles.stepNarrative}>
                  {step.input || 'Input TBD'} {'->'} {step.output || 'Output TBD'}
                </p>

                <div className={styles.metaRow}>
                  <span className={`${styles.modePill} ${toneClassByMode[step.automationMode]}`}>
                    Current: {formatMode(step.automationMode)}
                  </span>
                  <span className={`${styles.modePill} ${toneClassByMode[futureMode]}`}>
                    Future: {formatMode(futureMode)}
                  </span>
                </div>

                <div className={styles.factGrid}>
                  <div>
                    <p className={styles.factLabel}>Tools</p>
                    <p className={styles.factValue}>{step.tools.join(', ') || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className={styles.factLabel}>Risk</p>
                    <p className={styles.factValue}>
                      {step.errorSensitivity} / {step.reviewRequired ? 'reviewed' : 'no review'}
                    </p>
                  </div>
                  <div>
                    <p className={styles.factLabel}>Effort</p>
                    <p className={styles.factValue}>{step.effortHours}h</p>
                  </div>
                  <div>
                    <p className={styles.factLabel}>Throughput</p>
                    <p className={styles.factValue}>{step.throughputContribution}</p>
                  </div>
                </div>

                <label className={styles.selectWrap}>
                  <span className={styles.factLabel}>Per-step control</span>
                  <select
                    value={futureMode}
                    onChange={(event) =>
                      onOverrideStepMode(step.id, event.target.value as AutomationMode)
                    }
                    onClick={(event) => event.stopPropagation()}
                  >
                    {automationModes.map((mode) => (
                      <option key={mode} value={mode}>
                        {formatMode(mode)}
                      </option>
                    ))}
                  </select>
                </label>

                <p className={styles.healthNote}>{getStepHealth(step)}</p>
              </button>

              {index < steps.length - 1 ? (
                <div className={styles.connector} aria-hidden="true">
                  <span className={styles.connectorLine} />
                  <span className={styles.connectorLabel}>handoff</span>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}
