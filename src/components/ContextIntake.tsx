import type { ChangeEvent } from 'react'
import type { OrganizationContext } from '../types/studio'
import styles from './ContextIntake.module.css'

interface ContextIntakeProps {
  value: OrganizationContext
  onChange: (next: OrganizationContext) => void
  onSubmit?: () => void
  disabled?: boolean
}

const completenessScore = (context: OrganizationContext): number => {
  const checks = [
    context.organizationName.trim().length > 0,
    context.industry.trim().length > 0,
    context.functionName.trim().length > 0,
    context.teamSize > 0,
    context.painStatement.trim().length > 0,
    context.targetOutcome.trim().length > 0,
  ]
  const hits = checks.filter(Boolean).length
  return Math.round((hits / checks.length) * 100)
}

export default function ContextIntake({ value, onChange, onSubmit, disabled = false }: ContextIntakeProps) {
  const setField = <K extends keyof OrganizationContext>(field: K, fieldValue: OrganizationContext[K]): void => {
    onChange({ ...value, [field]: fieldValue })
  }

  const handleText =
    <K extends keyof OrganizationContext>(field: K) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      setField(field, event.target.value as OrganizationContext[K])
    }

  const handleTeamSize = (event: ChangeEvent<HTMLInputElement>): void => {
    const parsed = Number(event.target.value)
    setField('teamSize', Number.isFinite(parsed) && parsed > 0 ? parsed : 0)
  }

  const score = completenessScore(value)

  return (
    <section className={styles.panel} aria-label="Organization intake">
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Operating Context Intake</h2>
          <p className={styles.subtitle}>Capture the business conditions used for transition strategy and guardrail settings.</p>
        </div>
        <div className={styles.scoreWrap}>
          <p className={styles.scoreLabel}>Context Quality</p>
          <p className={styles.scoreValue}>{score}%</p>
        </div>
      </header>

      <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
        <label className={styles.field}>
          <span>Organization</span>
          <input
            value={value.organizationName}
            onChange={handleText('organizationName')}
            disabled={disabled}
            placeholder="Northwind Manufacturing"
          />
        </label>

        <label className={styles.field}>
          <span>Industry</span>
          <input value={value.industry} onChange={handleText('industry')} disabled={disabled} placeholder="Industrial Equipment" />
        </label>

        <label className={styles.field}>
          <span>Function</span>
          <input value={value.functionName} onChange={handleText('functionName')} disabled={disabled} placeholder="Revenue Operations" />
        </label>

        <label className={styles.field}>
          <span>Team Size</span>
          <input type="number" min={0} value={value.teamSize} onChange={handleTeamSize} disabled={disabled} />
        </label>

        <label className={`${styles.field} ${styles.textareaField}`}>
          <span>Pain Statement</span>
          <textarea
            value={value.painStatement}
            onChange={handleText('painStatement')}
            disabled={disabled}
            rows={4}
            placeholder="Where execution breaks down today."
          />
        </label>

        <label className={`${styles.field} ${styles.textareaField}`}>
          <span>Target Outcome</span>
          <textarea
            value={value.targetOutcome}
            onChange={handleText('targetOutcome')}
            disabled={disabled}
            rows={4}
            placeholder="What measurable operating state should exist after transition."
          />
        </label>
      </form>

      {onSubmit ? (
        <div className={styles.actions}>
          <button type="button" onClick={onSubmit} disabled={disabled} className={styles.submitButton}>
            Save Context
          </button>
        </div>
      ) : null}
    </section>
  )
}
