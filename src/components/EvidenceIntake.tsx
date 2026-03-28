import { useState } from 'react'
import type { EvidenceArtifact } from '../types/studio'
import styles from './EvidenceIntake.module.css'

export interface EvidenceDraftInput {
  workflowName: string
  notes: string
}

interface EvidenceIntakeProps {
  artifacts: EvidenceArtifact[]
  status: 'idle' | 'loading' | 'ready' | 'error'
  onGenerateDraft: (input: EvidenceDraftInput) => void | Promise<void>
}

export default function EvidenceIntake({
  artifacts,
  status,
  onGenerateDraft,
}: EvidenceIntakeProps) {
  const [workflowName, setWorkflowName] = useState('Agile Story Delivery')
  const [notes, setNotes] = useState('')

  return (
    <section className={styles.panel} aria-label="Evidence intake">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Evidence Intake</p>
          <h2 className={styles.title}>Upload or paste the workflow evidence you already have.</h2>
        </div>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={status === 'loading'}
          onClick={() => onGenerateDraft({ workflowName, notes })}
        >
          {status === 'loading' ? 'Generating draft...' : 'Generate Draft'}
        </button>
      </div>

      <div className={styles.grid}>
        <label className={styles.field}>
          <span>Workflow name</span>
          <input value={workflowName} onChange={(event) => setWorkflowName(event.target.value)} />
        </label>
        <label className={styles.field}>
          <span>Notes</span>
          <textarea
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Paste tracker context, repo notes, or review policy details."
          />
        </label>
      </div>

      <div className={styles.artifactList}>
        {artifacts.map((artifact) => (
          <article key={artifact.id} className={styles.artifactCard}>
            <p className={styles.artifactTitle}>{artifact.title}</p>
            <p className={styles.artifactMeta}>
              {artifact.source} | {artifact.artifactType}
            </p>
            <p className={styles.artifactSummary}>{artifact.summary}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
