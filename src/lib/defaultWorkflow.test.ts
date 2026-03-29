import { describe, expect, it } from 'vitest'
import { buildDefaultAgileWorkflow } from './defaultWorkflow'

describe('buildDefaultAgileWorkflow', () => {
  it('returns the Jira-to-PR loop with story point context', () => {
    const draft = buildDefaultAgileWorkflow()

    expect(draft.workflowName).toBe('Agile Story Delivery')
    expect(draft.storyPoints).toBe(3)
    expect(draft.steps.map((step) => step.id)).toEqual([
      'jira-scope',
      'acceptance-alignment',
      'tdd-implementation',
      'validation-gate',
      'pr-open',
      'review-remediation',
    ])
    expect(draft.edges.some((edge) => edge.type === 'rework-loop')).toBe(true)
  })
})
