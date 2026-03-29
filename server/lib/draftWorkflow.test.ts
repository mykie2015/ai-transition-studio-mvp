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

  it('preserves zero-valued story points from evidence', () => {
    const result = draftWorkflowFromEvidence({
      workflowName: 'Maintenance chore',
      artifacts: [
        {
          id: 'jira-2',
          type: 'tracker-export',
          title: 'PLAT-9',
          content: 'Story: rotate secrets. Story Points: 0. Validation: run lint and tests.',
        },
      ],
    })

    expect(result.storyPoints).toBe(0)
    expect(result.baseline.storyPoints).toBe(0)
    expect(result.steps.every((step) => step.storyPoints === 0)).toBe(true)
  })
})
