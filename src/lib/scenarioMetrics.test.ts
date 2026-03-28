import { describe, expect, it } from 'vitest'
import { buildDefaultAgileWorkflow } from './defaultWorkflow'
import { calculateScenarioMetrics } from './scenarioMetrics'
import type { StrategyScenario } from '../types/studio'

const hybridStrategy: StrategyScenario = {
  id: 'hybrid',
  title: 'Hybrid workflow redesign',
  mode: 'hybrid',
  summary: 'Keep humans in the review loop while automating repeatable delivery steps.',
  coverageLabel: 'review-gated automation',
  recommendedAutomation: {},
  risks: ['Review queues can still bottleneck merge readiness.'],
  prerequisites: ['Stable validation suite', 'Review ownership'],
  requiredChange: 'Adopt guided review and structured validation evidence.',
}

describe('calculateScenarioMetrics', () => {
  it('returns story-point-normalized speed and cost metrics', () => {
    const reviewedWorkflow = buildDefaultAgileWorkflow().steps

    const result = calculateScenarioMetrics({
      baseline: {
        humanEffortHours: 18,
        cycleTimeHours: 30,
        outputVolume: 1,
        qualityScore: 88,
        reviewBurdenHours: 6,
        storyPoints: 5,
        costPerHourUsd: 140,
      },
      workflow: reviewedWorkflow,
      strategy: hybridStrategy,
    })

    expect(result.metrics.cycleTimePerStoryPoint).toBeCloseTo(result.metrics.cycleTime / 5, 2)
    expect(result.metrics.estimatedCostPerStoryPoint).toBeCloseTo(
      ((result.metrics.humanEffort + result.metrics.reviewBurden) * 140) / 5,
      2,
    )
  })
})
