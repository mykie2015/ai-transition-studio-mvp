import type { AnalysisDraft, EvidenceArtifactType } from '../types/studio'

export interface AnalysisArtifactRequest {
  id: string
  type: EvidenceArtifactType
  title: string
  content: string
}

export interface CreateAnalysisDraftRequest {
  workflowName: string
  artifacts: AnalysisArtifactRequest[]
}

export interface CreateAnalysisDraftResponse {
  ok: true
  draft: AnalysisDraft
}

export async function createAnalysisDraft(
  payload: CreateAnalysisDraftRequest,
): Promise<CreateAnalysisDraftResponse> {
  const response = await fetch('/api/analyses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to create analysis draft')
  }

  return (await response.json()) as CreateAnalysisDraftResponse
}
