import { Router } from 'express'
import { z } from 'zod'
import { draftWorkflowFromEvidence } from '../lib/draftWorkflow.js'
import { sessionStore } from '../lib/sessionStore.js'

const analysisRequestSchema = z.object({
  workflowName: z.string().min(1),
  artifacts: z.array(
    z.object({
      id: z.string(),
      type: z.enum([
        'repo-doc',
        'tracker-export',
        'tool-manifest',
        'validation-artifact',
        'review-artifact',
        'pasted-note',
      ]),
      title: z.string(),
      content: z.string(),
    }),
  ),
})

export const analysisRouter = Router()

analysisRouter.post('/', (request, response) => {
  const parsed = analysisRequestSchema.safeParse(request.body)

  if (!parsed.success) {
    return response.status(400).json({ ok: false, issues: parsed.error.issues })
  }

  const draft = draftWorkflowFromEvidence(parsed.data)
  sessionStore.saveDraft(draft)

  return response.json({
    ok: true,
    draft,
  })
})
