import type { AnalysisDraft } from '../types/studio'
import styles from './WorkflowInspectorPanel.module.css'

interface WorkflowInspectorPanelProps {
  draft: AnalysisDraft
  selectedStepId: string | null
  selectedEdgeId: string | null
}

const formatBoolean = (value: boolean | undefined): string => (value ? 'Required' : 'Not required')

const formatAutomationMode = (value: string): string =>
  value
    .split('-')
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ')

export default function WorkflowInspectorPanel({
  draft,
  selectedStepId,
  selectedEdgeId,
}: WorkflowInspectorPanelProps) {
  const step = selectedStepId ? draft.steps.find((item) => item.id === selectedStepId) ?? null : null
  const edge = selectedEdgeId ? draft.edges.find((item) => item.id === selectedEdgeId) ?? null : null

  if (step) {
    const traceLinks = draft.traceLinks[step.id] ?? []

    return (
      <section className={styles.panel} aria-label="Workflow inspector">
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Selected Step</p>
            <h2 className={styles.title}>{step.name}</h2>
          </div>
          <span className={styles.statePill}>{step.confirmationState ?? 'drafted'}</span>
        </div>

        <div className={styles.grid}>
          <article className={styles.card}>
            <p className={styles.label}>Owner</p>
            <p className={styles.value}>{step.owner}</p>
          </article>
          <article className={styles.card}>
            <p className={styles.label}>Automation</p>
            <p className={styles.value}>{formatAutomationMode(step.automationMode)}</p>
          </article>
          <article className={styles.card}>
            <p className={styles.label}>Review</p>
            <p className={styles.value}>{formatBoolean(step.reviewRequired)}</p>
          </article>
          <article className={styles.card}>
            <p className={styles.label}>Validation</p>
            <p className={styles.value}>{formatBoolean(step.validationRequired)}</p>
          </article>
          <article className={styles.card}>
            <p className={styles.label}>Story Points</p>
            <p className={styles.value}>{step.storyPoints ?? draft.storyPoints}</p>
          </article>
          <article className={styles.card}>
            <p className={styles.label}>Effort Hours</p>
            <p className={styles.value}>{step.effortHours}</p>
          </article>
        </div>

        <div className={styles.detailGrid}>
          <article className={styles.detailCard}>
            <p className={styles.label}>Input</p>
            <p className={styles.body}>{step.input}</p>
          </article>
          <article className={styles.detailCard}>
            <p className={styles.label}>Output</p>
            <p className={styles.body}>{step.output}</p>
          </article>
          <article className={styles.detailCard}>
            <p className={styles.label}>Tools</p>
            <p className={styles.body}>{step.tools.join(' | ')}</p>
          </article>
          <article className={styles.detailCard}>
            <p className={styles.label}>Operator Notes</p>
            <p className={styles.body}>{step.notes}</p>
          </article>
        </div>

        <article className={styles.traceCard}>
          <p className={styles.label}>Evidence Links</p>
          {traceLinks.length === 0 ? (
            <p className={styles.body}>No attached evidence links for this step yet.</p>
          ) : (
            <div className={styles.traceList}>
              {traceLinks.map((link) => (
                <div key={`${link.artifactId}-${link.inferredField}`} className={styles.traceItem}>
                  <p className={styles.traceTitle}>
                    {link.artifactTitle} | {link.confidence}
                  </p>
                  <p className={styles.body}>{link.excerpt}</p>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    )
  }

  if (edge) {
    const source = draft.steps.find((item) => item.id === edge.sourceStepId)
    const target = draft.steps.find((item) => item.id === edge.targetStepId)

    return (
      <section className={styles.panel} aria-label="Workflow inspector">
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Selected Edge</p>
            <h2 className={styles.title}>{edge.label}</h2>
          </div>
          <span className={styles.statePill}>{edge.type}</span>
        </div>

        <div className={styles.detailGrid}>
          <article className={styles.detailCard}>
            <p className={styles.label}>From</p>
            <p className={styles.body}>{source?.name ?? edge.sourceStepId}</p>
          </article>
          <article className={styles.detailCard}>
            <p className={styles.label}>To</p>
            <p className={styles.body}>{target?.name ?? edge.targetStepId}</p>
          </article>
          <article className={styles.detailCard}>
            <p className={styles.label}>Why this handoff exists</p>
            <p className={styles.body}>
              This connection shows how reviewed scope moves between owners and where automation or
              rework loops should be inspected before recommendations are trusted.
            </p>
          </article>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.panel} aria-label="Workflow inspector">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Workflow Inspector</p>
          <h2 className={styles.title}>Select a step or edge</h2>
        </div>
      </div>
      <p className={styles.body}>
        Click any workflow node or handoff line to inspect owners, gates, outputs, and evidence
        links in detail.
      </p>
    </section>
  )
}
