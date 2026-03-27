import type { ChangeEvent } from 'react'
import type { AutomationMode, ErrorSensitivity, WorkflowStep } from '../types/studio'
import styles from './WorkflowEditor.module.css'

interface WorkflowEditorProps {
  steps: WorkflowStep[]
  onChange: (steps: WorkflowStep[]) => void
}

const automationModes: AutomationMode[] = [
  'manual',
  'ai-assisted',
  'ai-automated',
  'do-not-automate',
  'assist-only',
  'automate-with-review',
  'automate-by-default',
]

const sensitivityLevels: ErrorSensitivity[] = ['low', 'medium', 'high']

const createEmptyStep = (): WorkflowStep => ({
  id: `step-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
  name: '',
  owner: '',
  input: '',
  output: '',
  tools: [],
  automationMode: 'manual',
  errorSensitivity: 'medium',
  reviewRequired: true,
  effortHours: 0,
  throughputContribution: 0,
  notes: '',
})

export default function WorkflowEditor({ steps, onChange }: WorkflowEditorProps) {
  const updateStep = <K extends keyof WorkflowStep>(index: number, key: K, value: WorkflowStep[K]): void => {
    const next = [...steps]
    next[index] = { ...next[index], [key]: value }
    onChange(next)
  }

  const handleText =
    <K extends keyof WorkflowStep>(index: number, key: K) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      updateStep(index, key, event.target.value as WorkflowStep[K])
    }

  const handleNumber =
    <K extends keyof WorkflowStep>(index: number, key: K) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      const parsed = Number(event.target.value)
      updateStep(index, key, (Number.isFinite(parsed) ? parsed : 0) as WorkflowStep[K])
    }

  const addStep = (): void => onChange([...steps, createEmptyStep()])

  const removeStep = (index: number): void => onChange(steps.filter((_, currentIndex) => currentIndex !== index))

  return (
    <section className={styles.panel} aria-label="Workflow editor">
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Workflow Design Surface</h2>
          <p className={styles.subtitle}>Map each operating step with automation mode, risk controls, and throughput leverage.</p>
        </div>
        <button type="button" className={styles.addButton} onClick={addStep}>
          Add Step
        </button>
      </header>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Step</th>
              <th>Owner</th>
              <th>Input</th>
              <th>Output</th>
              <th>Tools</th>
              <th>Automation</th>
              <th>Sensitivity</th>
              <th>Review</th>
              <th>Effort (h)</th>
              <th>Throughput %</th>
              <th>Notes</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {steps.map((step, index) => (
              <tr key={step.id}>
                <td>
                  <input value={step.name} onChange={handleText(index, 'name')} placeholder="Lead qualification" />
                </td>
                <td>
                  <input value={step.owner} onChange={handleText(index, 'owner')} placeholder="RevOps analyst" />
                </td>
                <td>
                  <input value={step.input} onChange={handleText(index, 'input')} placeholder="CRM activity feed" />
                </td>
                <td>
                  <input value={step.output} onChange={handleText(index, 'output')} placeholder="Prioritized follow-up queue" />
                </td>
                <td>
                  <input
                    value={step.tools.join(', ')}
                    onChange={(event) =>
                      updateStep(
                        index,
                        'tools',
                        event.target.value
                          .split(',')
                          .map((item) => item.trim())
                          .filter(Boolean),
                      )
                    }
                    placeholder="HubSpot, Notion, Slack"
                  />
                </td>
                <td>
                  <select
                    value={step.automationMode}
                    onChange={(event) => updateStep(index, 'automationMode', event.target.value as WorkflowStep['automationMode'])}
                  >
                    {automationModes.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={step.errorSensitivity}
                    onChange={(event) => updateStep(index, 'errorSensitivity', event.target.value as WorkflowStep['errorSensitivity'])}
                  >
                    {sensitivityLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </td>
                <td className={styles.centeredCell}>
                  <input
                    type="checkbox"
                    checked={step.reviewRequired}
                    onChange={(event) => updateStep(index, 'reviewRequired', event.target.checked)}
                    aria-label={`Review required for step ${index + 1}`}
                  />
                </td>
                <td>
                  <input type="number" min={0} step={0.5} value={step.effortHours} onChange={handleNumber(index, 'effortHours')} />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={step.throughputContribution}
                    onChange={handleNumber(index, 'throughputContribution')}
                  />
                </td>
                <td>
                  <textarea value={step.notes} rows={2} onChange={handleText(index, 'notes')} placeholder="Risk controls and caveats." />
                </td>
                <td className={styles.centeredCell}>
                  <button type="button" className={styles.removeButton} onClick={() => removeStep(index)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
