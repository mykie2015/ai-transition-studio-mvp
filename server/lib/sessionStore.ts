import type { AnalysisDraft } from '../../src/types/studio.js'

class SessionStore {
  private readonly drafts = new Map<string, AnalysisDraft>()

  saveDraft(draft: AnalysisDraft) {
    this.drafts.set(draft.workflowName, draft)
    return draft
  }

  getDraft(workflowName: string) {
    return this.drafts.get(workflowName) ?? null
  }
}

export const sessionStore = new SessionStore()
