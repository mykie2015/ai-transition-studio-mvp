import { describe, expect, it } from 'vitest'
import { draftWorkflowFromEvidence } from './draftWorkflow.js'

describe('draftWorkflowFromEvidence', () => {
  it('extracts story points and review loops from agile evidence', () => {
    const result = draftWorkflowFromEvidence({
      workflowName: 'Story delivery',
      artifacts: [
        {
          id: 'jira-1',
          type: 'tracker-export',
          title: 'AUTH-123',
          content:
            'Story: Add SSO. Story Points: 5. Acceptance Criteria: use TDD. Open PR and fix all medium review comments.',
        },
      ],
    })

    expect(result.storyPoints).toBe(5)
    expect(result.steps.some((step) => step.name.toLowerCase().includes('pull request'))).toBe(
      true,
    )
    expect(result.edges.some((edge) => edge.type === 'rework-loop')).toBe(true)
  })
})
