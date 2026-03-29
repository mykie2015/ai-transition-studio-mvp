import { buildDefaultAgileWorkflow } from '../../src/lib/defaultWorkflow.js'
import type { AnalysisDraft, ReviewItem, TraceLink, WorkflowStep } from '../../src/types/studio.js'
import {
  detectSignals,
  extractStoryPoints,
  normalizeArtifacts,
  type AnalysisDraftRequest,
} from './parseEvidence.js'

function buildTraceLinks(input: AnalysisDraftRequest): Record<string, TraceLink[]> {
  const links: Record<string, TraceLink[]> = {}

  for (const artifact of input.artifacts) {
    const signals = detectSignals(artifact.content)
    const excerpt = artifact.content.replace(/\s+/g, ' ').trim()
    const clipped = excerpt.length <= 100 ? excerpt : `${excerpt.slice(0, 97)}...`

    if (extractStoryPoints(artifact.content) !== undefined) {
      links['jira-scope'] = [
        ...(links['jira-scope'] ?? []),
        {
          artifactId: artifact.id,
          artifactTitle: artifact.title,
          excerpt: clipped,
          inferredField: 'story points',
          confidence: 'high',
        },
      ]
    }

    if (signals.mentionsValidation || signals.mentionsTdd) {
      links['validation-gate'] = [
        ...(links['validation-gate'] ?? []),
        {
          artifactId: artifact.id,
          artifactTitle: artifact.title,
          excerpt: clipped,
          inferredField: 'validation gate',
          confidence: 'medium',
        },
      ]
    }

    if (signals.mentionsBlockingReviewLoop || signals.mentionsPullRequest) {
      links['review-remediation'] = [
        ...(links['review-remediation'] ?? []),
        {
          artifactId: artifact.id,
          artifactTitle: artifact.title,
          excerpt: clipped,
          inferredField: 'review remediation loop',
          confidence: 'medium',
        },
      ]
    }
  }

  return links
}

export function draftWorkflowFromEvidence(input: AnalysisDraftRequest): AnalysisDraft {
  const baseDraft = buildDefaultAgileWorkflow()
  const artifacts = normalizeArtifacts(input.artifacts)
  const inferredStoryPoints =
    input.artifacts
      .map((artifact) => extractStoryPoints(artifact.content))
      .find((value): value is number => value !== undefined) ?? 3

  const steps = baseDraft.steps.map((step: WorkflowStep) => ({
    ...step,
    storyPoints: inferredStoryPoints,
    confirmationState:
      step.id === 'jira-scope' && inferredStoryPoints !== baseDraft.storyPoints
        ? 'edited'
        : step.confirmationState,
  }))

  const traceLinks = {
    ...baseDraft.traceLinks,
    ...buildTraceLinks(input),
  }

  return {
    ...baseDraft,
    workflowName: input.workflowName || baseDraft.workflowName,
    storyPoints: inferredStoryPoints,
    steps,
    artifacts,
    traceLinks,
    baseline: {
      ...baseDraft.baseline,
      storyPoints: inferredStoryPoints,
    },
    reviewQueue: baseDraft.reviewQueue.map((item: ReviewItem) =>
      item.field === 'storyPoints'
        ? {
            ...item,
            confidence: inferredStoryPoints === 3 ? item.confidence : 'medium',
          }
        : item,
    ),
  }
}
