import type { ArtifactSource, ImportedArtifact } from '../types/studio'
import styles from './McpImportPanel.module.css'

type NormalizationStatus = 'ready' | 'needs-review' | 'failed'

export interface ArtifactNormalizationResult {
  artifactId: string
  status: NormalizationStatus
  normalizedFields: string[]
  warnings: string[]
  gaps: string[]
}

interface McpImportPanelProps {
  artifacts: ImportedArtifact[]
  selectedArtifactId: string | null
  onSelectArtifact: (artifactId: string) => void
  normalizationResults: ArtifactNormalizationResult[]
  onImportSelected?: (artifactId: string) => void
}

const sourceLabel: Record<ArtifactSource, string> = {
  filesystem: 'Filesystem',
  docs: 'Docs',
  tracker: 'Tracker',
}

const statusClass: Record<NormalizationStatus, string> = {
  ready: styles.ready,
  'needs-review': styles.needsReview,
  failed: styles.failed,
}

export default function McpImportPanel({
  artifacts,
  selectedArtifactId,
  onSelectArtifact,
  normalizationResults,
  onImportSelected,
}: McpImportPanelProps) {
  const selectedArtifact = selectedArtifactId ? artifacts.find((artifact) => artifact.id === selectedArtifactId) ?? null : null
  const selectedResult = selectedArtifactId
    ? normalizationResults.find((result) => result.artifactId === selectedArtifactId) ?? null
    : null

  return (
    <section className={styles.panel} aria-label="MCP import and normalization">
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>MCP Artifact Import</h2>
          <p className={styles.subtitle}>Review source artifacts and normalization readiness before attaching to scenario modeling.</p>
        </div>
      </header>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Artifact</th>
              <th>Source</th>
              <th>Summary</th>
              <th>Normalization</th>
            </tr>
          </thead>
          <tbody>
            {artifacts.map((artifact) => {
              const result = normalizationResults.find((item) => item.artifactId === artifact.id)
              const normalizedFieldCount = result?.normalizedFields.length ?? 0
              const isSelected = artifact.id === selectedArtifactId

              return (
                <tr key={artifact.id} className={isSelected ? styles.selectedRow : ''}>
                  <td>
                    <button type="button" className={styles.selectButton} onClick={() => onSelectArtifact(artifact.id)}>
                      <span className={styles.artifactTitle}>{artifact.title}</span>
                    </button>
                  </td>
                  <td>{sourceLabel[artifact.source]}</td>
                  <td className={styles.summaryCell}>{artifact.summary}</td>
                  <td>
                    {result ? (
                      <span className={`${styles.statusPill} ${statusClass[result.status]}`}>{normalizedFieldCount} fields</span>
                    ) : (
                      <span className={`${styles.statusPill} ${styles.unmapped}`}>Not run</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <section className={styles.resultPane} aria-live="polite">
        {selectedArtifact && selectedResult ? (
          <>
            <div className={styles.resultHeader}>
              <p className={styles.resultTitle}>{selectedArtifact.title}</p>
              <span className={`${styles.statusPill} ${statusClass[selectedResult.status]}`}>{selectedResult.status}</span>
            </div>

            <div className={styles.metaGrid}>
              <div>
                <p className={styles.metaLabel}>Normalized Fields</p>
                <p className={styles.metaValue}>{selectedResult.normalizedFields.join(', ') || 'None'}</p>
              </div>
              <div>
                <p className={styles.metaLabel}>Data Keys</p>
                <p className={styles.metaValue}>{Object.keys(selectedArtifact.payload).join(', ') || 'None'}</p>
              </div>
            </div>

            <div className={styles.calloutGrid}>
              <article className={styles.callout}>
                <p className={styles.calloutTitle}>Warnings</p>
                <p className={styles.calloutBody}>{selectedResult.warnings.join(' | ') || 'No warnings detected.'}</p>
              </article>
              <article className={styles.callout}>
                <p className={styles.calloutTitle}>Gaps</p>
                <p className={styles.calloutBody}>{selectedResult.gaps.join(' | ') || 'No known gaps.'}</p>
              </article>
            </div>

            {onImportSelected ? (
              <div className={styles.actions}>
                <button type="button" className={styles.importButton} onClick={() => onImportSelected(selectedArtifact.id)}>
                  Import Selected Artifact
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <p className={styles.emptyState}>Select an artifact to inspect normalized fields, warnings, and import readiness.</p>
        )}
      </section>
    </section>
  )
}
