import { useState } from 'react'
import { createAnalysisDraft, type CreateAnalysisDraftRequest } from '../lib/api'
import type { AnalysisDraft } from '../types/studio'

export function useAnalysisSession() {
  const [draft, setDraft] = useState<AnalysisDraft | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const generateDraft = async (payload: CreateAnalysisDraftRequest) => {
    setStatus('loading')
    setError(null)

    try {
      const response = await createAnalysisDraft(payload)
      setDraft(response.draft)
      setStatus('ready')
      return response.draft
    } catch (caughtError) {
      setStatus('error')
      setError(caughtError instanceof Error ? caughtError.message : 'Unknown analysis error')
      throw caughtError
    }
  }

  return {
    draft,
    status,
    error,
    generateDraft,
  }
}
