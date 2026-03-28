import { useMemo, useState } from 'react'
import { buildWorkflowBundleTemplate, parseWorkflowBundleTemplate } from '../lib/workflowBundle'
import type { EvidenceArtifact } from '../types/studio'
import styles from './EvidenceIntake.module.css'

export interface EvidenceDraftInput {
  workflowName: string
  sections: {
    repoDocs: string
    trackerExport: string
    toolManifest: string
    reviewPolicy: string
    validationPolicy: string
    operatorNotes: string
  }
}

interface EvidenceIntakeProps {
  artifacts: EvidenceArtifact[]
  status: 'idle' | 'loading' | 'ready' | 'error'
  onGenerateDraft: (input: EvidenceDraftInput) => void | Promise<void>
}

const sectionCards = [
  {
    key: 'repoDocs',
    title: 'Repo Docs Summary',
    description: 'README, contribution guides, coding rules, and engineering conventions.',
  },
  {
    key: 'trackerExport',
    title: 'Tracker Export Summary',
    description: 'Story scope, acceptance criteria, owners, and story points from Jira.',
  },
  {
    key: 'toolManifest',
    title: 'Tool Manifest Summary',
    description: 'Tools, platforms, and automation surfaces available to the workflow.',
  },
  {
    key: 'reviewPolicy',
    title: 'Review Policy',
    description: 'PR review gate, severity threshold, and remediation expectation.',
  },
  {
    key: 'validationPolicy',
    title: 'Validation Policy',
    description: 'Required validation commands before PR and merge.',
  },
  {
    key: 'operatorNotes',
    title: 'Operator Notes',
    description: 'Optional notes that shape the first workflow draft.',
  },
] as const

const readBundleFile = async (file: File): Promise<string> => {
  if (typeof file.text === 'function') {
    return file.text()
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Failed to read bundle file'))
    reader.readAsText(file)
  })
}

export default function EvidenceIntake({
  artifacts,
  status,
  onGenerateDraft,
}: EvidenceIntakeProps) {
  const [parsedBundle, setParsedBundle] = useState<EvidenceDraftInput | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string>('')

  const templateSummary = useMemo(() => {
    const existingArtifactCount = artifacts.length

    return existingArtifactCount === 0
      ? 'Use the strict markdown template to capture the workflow evidence bundle.'
      : `Current session holds ${existingArtifactCount} draft artifact examples. The uploaded bundle will replace manual entry.`
  }, [artifacts])

  const downloadTemplate = () => {
    const template = buildWorkflowBundleTemplate()

    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }

    const blob = new Blob([template], { type: 'text/markdown;charset=utf-8' })
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = downloadUrl
    link.download = 'transition-studio-workflow-bundle.md'
    link.click()

    window.URL.revokeObjectURL(downloadUrl)
  }

  const handleBundleFile = async (file: File | null) => {
    setParseError(null)
    setParsedBundle(null)
    setUploadedFileName(file?.name ?? '')

    if (!file) {
      return
    }

    try {
      const content = await readBundleFile(file)
      const parsed = parseWorkflowBundleTemplate(content)

      setParsedBundle({
        workflowName: parsed.workflowName,
        sections: parsed.sections,
      })
    } catch (caughtError) {
      setParseError(caughtError instanceof Error ? caughtError.message : 'Failed to parse bundle file')
    }
  }

  const confirmBundle = () => {
    if (!parsedBundle || status === 'loading') {
      return
    }

    void onGenerateDraft(parsedBundle)
  }

  return (
    <section className={styles.panel} aria-label="Evidence intake">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Evidence Intake</p>
          <h2 className={styles.title}>Load one completed workflow bundle, then review the extracted sections.</h2>
          <p className={styles.description}>
            The MVP starts from a strict markdown template so the workflow draft can be traced back
            to repo docs, tracker exports, validation policy, and review rules without loose
            inference.
          </p>
        </div>

        <button type="button" className={styles.secondaryButton} onClick={downloadTemplate}>
          Download Template
        </button>
      </div>

      <section className={styles.uploadCard}>
        <div className={styles.uploadHeader}>
          <div>
            <p className={styles.cardLabel}>Single Bundle File</p>
            <h3 className={styles.cardTitle}>Upload completed bundle</h3>
          </div>
          <p className={styles.cardMeta}>{templateSummary}</p>
        </div>

        <label className={styles.fileField}>
          <span>Upload completed bundle</span>
          <input
            type="file"
            accept=".md,text/markdown"
            aria-label="Upload completed bundle"
            onChange={(event) => void handleBundleFile(event.target.files?.[0] ?? null)}
          />
        </label>

        <div className={styles.statusRow}>
          <p className={styles.fileMeta}>
            {uploadedFileName ? `Loaded: ${uploadedFileName}` : 'Use the app template and keep every section heading unchanged.'}
          </p>
          {parseError ? (
            <p className={styles.errorText} role="alert">
              {parseError}
            </p>
          ) : parsedBundle ? (
            <p className={styles.successText}>Parsed successfully. Review the extracted sections before drafting.</p>
          ) : (
            <p className={styles.helperText}>Draft generation stays locked until parsing succeeds and you confirm.</p>
          )}
        </div>
      </section>

      {parsedBundle ? (
        <section className={styles.reviewBlock} aria-label="Review extracted sections">
          <div className={styles.reviewHeader}>
            <div>
              <p className={styles.cardLabel}>Review extracted sections</p>
              <h3 className={styles.cardTitle}>{parsedBundle.workflowName || 'Untitled workflow bundle'}</h3>
            </div>
            <button
              type="button"
              className={styles.primaryButton}
              disabled={status === 'loading'}
              onClick={confirmBundle}
            >
              {status === 'loading' ? 'Generating draft...' : 'Confirm and generate draft'}
            </button>
          </div>

          <div className={styles.reviewGrid}>
            {sectionCards.map((section) => (
              <article key={section.key} className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <p className={styles.sectionTitle}>{section.title}</p>
                    <p className={styles.sectionDescription}>{section.description}</p>
                  </div>
                </div>
                <p className={styles.sectionContent}>
                  {parsedBundle.sections[section.key].trim().length > 0
                    ? parsedBundle.sections[section.key]
                    : 'No content provided.'}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  )
}
