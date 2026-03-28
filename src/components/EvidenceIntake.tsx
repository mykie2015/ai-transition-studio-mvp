import { useState } from 'react'
import type { EvidenceArtifact, EvidenceArtifactType } from '../types/studio'
import styles from './EvidenceIntake.module.css'

interface EvidenceDraftArtifact {
  id: string
  type: EvidenceArtifactType
  title: string
  content: string
}

export interface EvidenceDraftInput {
  workflowName: string
  notes: string
  artifacts: EvidenceDraftArtifact[]
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
  const buildDraftArtifacts = (): EvidenceDraftArtifact[] => {
    const findArtifact = (type: EvidenceArtifactType, fallbackTitle: string) => {
      const artifact = artifacts.find((item) => item.artifactType === type)

      return {
        id: artifact?.id ?? `draft-${type}`,
        type,
        title: artifact?.title ?? fallbackTitle,
        content: artifact?.rawText ?? '',
      }
    }

    return [
      findArtifact('repo-doc', 'Repository Docs'),
      findArtifact('tracker-export', 'Tracker Export'),
      findArtifact('tool-manifest', 'Tool Manifest'),
    ]
  }

  const [workflowName, setWorkflowName] = useState('Agile Story Delivery')
  const [notes, setNotes] = useState('')
  const [draftArtifacts, setDraftArtifacts] = useState<EvidenceDraftArtifact[]>(buildDraftArtifacts)

  const updateArtifact = (artifactId: string, field: 'title' | 'content', value: string) => {
    setDraftArtifacts((current) =>
      current.map((artifact) =>
        artifact.id === artifactId
          ? {
              ...artifact,
              [field]: value,
            }
          : artifact,
      ),
    )
  }

  const loadArtifactFile = async (artifactId: string, file: File | null) => {
    if (!file) {
      return
    }

    const content = await file.text()

    setDraftArtifacts((current) =>
      current.map((artifact) =>
        artifact.id === artifactId
          ? {
              ...artifact,
              title: file.name,
              content,
            }
          : artifact,
      ),
    )
  }

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
          onClick={() =>
            onGenerateDraft({
              workflowName,
              notes,
              artifacts: draftArtifacts,
            })
          }
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

      <div className={styles.sourceGrid}>
        {draftArtifacts.map((artifact) => {
          const sourceLabel =
            artifact.type === 'repo-doc'
              ? 'Repo Docs'
              : artifact.type === 'tracker-export'
                ? 'Tracker Export'
                : 'Tool Manifest'

          return (
            <article key={artifact.id} className={styles.sourceCard}>
              <div className={styles.sourceHeader}>
                <div>
                  <p className={styles.artifactTitle}>{sourceLabel}</p>
                  <p className={styles.artifactMeta}>{artifact.type}</p>
                </div>
                <label className={styles.fileField}>
                  <span>{sourceLabel} file</span>
                  <input
                    type="file"
                    accept=".txt,.md,.json,.yaml,.yml,.csv"
                    onChange={(event) => loadArtifactFile(artifact.id, event.target.files?.[0] ?? null)}
                  />
                </label>
              </div>

              <label className={styles.field}>
                <span>{sourceLabel} title</span>
                <input
                  value={artifact.title}
                  onChange={(event) => updateArtifact(artifact.id, 'title', event.target.value)}
                />
              </label>

              <label className={styles.field}>
                <span>{sourceLabel} content</span>
                <textarea
                  rows={7}
                  value={artifact.content}
                  onChange={(event) => updateArtifact(artifact.id, 'content', event.target.value)}
                  placeholder={`Paste ${sourceLabel.toLowerCase()} evidence here.`}
                />
              </label>
            </article>
          )
        })}
      </div>

      <div className={styles.artifactList}>
        {draftArtifacts.map((artifact) => (
          <article key={`summary-${artifact.id}`} className={styles.artifactCard}>
            <p className={styles.artifactTitle}>{artifact.title}</p>
            <p className={styles.artifactMeta}>{artifact.type}</p>
            <p className={styles.artifactSummary}>
              {artifact.content.trim().length === 0
                ? 'No evidence loaded yet.'
                : artifact.content.replace(/\s+/g, ' ').trim().slice(0, 160)}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
