import type { ArtifactSource, EvidenceArtifact, EvidenceArtifactType } from '../../src/types/studio.js'

export interface AnalysisArtifactInput {
  id: string
  type: EvidenceArtifactType
  title: string
  content: string
}

export interface AnalysisDraftRequest {
  workflowName: string
  artifacts: AnalysisArtifactInput[]
}

const STORY_POINTS_PATTERN = /story points?\s*[:=]\s*(\d+)/i
const TDD_PATTERN = /\b(tdd|test[- ]driven|write tests first)\b/i
const PR_PATTERN = /\b(open|raise|create)\s+(a\s+)?(pull request|pr)\b/i
const REVIEW_PATTERN = /\b(fix|clear|resolve).*(critical|medium).*(review|comment|finding)/i
const VALIDATION_PATTERN = /\b(test|lint|typecheck|build|validation)\b/i

const artifactSourceByType: Record<EvidenceArtifactType, ArtifactSource> = {
  'repo-doc': 'filesystem',
  'tracker-export': 'tracker',
  'tool-manifest': 'tool-manifest',
  'validation-artifact': 'validation',
  'review-artifact': 'review',
  'pasted-note': 'note',
}

export function extractStoryPoints(content: string): number | undefined {
  const match = content.match(STORY_POINTS_PATTERN)
  return match ? Number(match[1]) : undefined
}

export function summarizeEvidence(content: string): string {
  const summary = content.replace(/\s+/g, ' ').trim()
  return summary.length <= 120 ? summary : `${summary.slice(0, 117)}...`
}

export function detectSignals(content: string) {
  return {
    mentionsTdd: TDD_PATTERN.test(content),
    mentionsPullRequest: PR_PATTERN.test(content),
    mentionsBlockingReviewLoop: REVIEW_PATTERN.test(content),
    mentionsValidation: VALIDATION_PATTERN.test(content),
  }
}

export function normalizeArtifacts(artifacts: AnalysisArtifactInput[]): EvidenceArtifact[] {
  return artifacts.map((artifact) => ({
    id: artifact.id,
    artifactType: artifact.type,
    source: artifactSourceByType[artifact.type],
    title: artifact.title,
    summary: summarizeEvidence(artifact.content),
    rawText: artifact.content,
    extractionStatus: 'ready',
    warnings: [],
    payload: {
      content: artifact.content,
    },
  }))
}
