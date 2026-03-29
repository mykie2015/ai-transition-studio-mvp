import type {
  AutomationMode,
  BaselineMetrics,
  MetricSet,
  StrategyMode,
  StrategyScenario,
  WorkflowStep,
} from '../types/studio'

const AUTOMATION_INTENSITY: Record<AutomationMode, number> = {
  manual: 0,
  'ai-assisted': 0.35,
  'ai-automated': 0.78,
  'do-not-automate': 0,
  'assist-only': 0.35,
  'automate-with-review': 0.72,
  'automate-by-default': 0.95,
}

const SENSITIVITY_WEIGHT: Record<WorkflowStep['errorSensitivity'], number> = {
  low: 0.8,
  medium: 1,
  high: 1.28,
}

const STRATEGY_PROFILE: Record<
  StrategyMode,
  {
    effortGain: number
    cycleGain: number
    outputGain: number
    reviewTuning: number
    complexityPenalty: number
  }
> = {
  copilot: {
    effortGain: 0.22,
    cycleGain: 0.2,
    outputGain: 0.18,
    reviewTuning: 0.2,
    complexityPenalty: 0.1,
  },
  hybrid: {
    effortGain: 0.42,
    cycleGain: 0.38,
    outputGain: 0.32,
    reviewTuning: 0.1,
    complexityPenalty: 0.16,
  },
  agentic: {
    effortGain: 0.58,
    cycleGain: 0.52,
    outputGain: 0.46,
    reviewTuning: -0.04,
    complexityPenalty: 0.24,
  },
}

const round = (value: number, decimals = 2): number => {
  const precision = 10 ** decimals
  return Math.round(value * precision) / precision
}

const clamp = (value: number, min: number, max: number): number => {
  if (value < min) {
    return min
  }
  if (value > max) {
    return max
  }
  return value
}

const defaultModeForStrategy = (
  step: WorkflowStep,
  strategyMode: StrategyMode,
): AutomationMode => {
  if (strategyMode === 'copilot') {
    if (step.automationMode === 'ai-automated') {
      return 'automate-with-review'
    }
    if (step.automationMode === 'manual') {
      return 'assist-only'
    }
    if (step.automationMode === 'do-not-automate') {
      return 'do-not-automate'
    }
    return 'assist-only'
  }

  if (strategyMode === 'hybrid') {
    if (step.reviewRequired || step.errorSensitivity === 'high') {
      return 'automate-with-review'
    }
    if (step.automationMode === 'do-not-automate') {
      return 'assist-only'
    }
    return 'automate-with-review'
  }

  if (step.errorSensitivity === 'high' || step.reviewRequired) {
    return 'automate-with-review'
  }
  if (step.automationMode === 'do-not-automate') {
    return 'assist-only'
  }
  return 'automate-by-default'
}

const baselineLeverage = (baseline: BaselineMetrics): number => {
  const effectiveInput =
    baseline.humanEffortHours +
    baseline.reviewBurdenHours * 0.6 +
    baseline.cycleTimeHours * 0.2
  const effectiveOutput = baseline.outputVolume * (baseline.qualityScore / 100)
  return effectiveOutput / Math.max(1, effectiveInput)
}

export type StrategyOverrides = Record<string, Record<string, AutomationMode>>

export interface ScenarioMetricResult {
  strategy: StrategyScenario
  selectedAutomation: Record<string, AutomationMode>
  automationCoverage: number
  metrics: MetricSet
  assumptions: string[]
}

export interface ScenarioMetricsInput {
  baseline: BaselineMetrics
  workflow: WorkflowStep[]
  strategy: StrategyScenario
  overrides?: Record<string, AutomationMode>
}

export interface StrategyMetricsInput {
  baseline: BaselineMetrics
  workflow: WorkflowStep[]
  strategies: StrategyScenario[]
  overridesByStrategy?: StrategyOverrides
}

const resolveStepMode = (
  step: WorkflowStep,
  strategy: StrategyScenario,
  overrides?: Record<string, AutomationMode>,
): AutomationMode => {
  const override = overrides?.[step.id]
  if (override) {
    return override
  }
  const recommended = strategy.recommendedAutomation[step.id]
  if (recommended) {
    return recommended
  }
  return defaultModeForStrategy(step, strategy.mode)
}

export const calculateScenarioMetrics = ({
  baseline,
  workflow,
  strategy,
  overrides,
}: ScenarioMetricsInput): ScenarioMetricResult => {
  if (workflow.length === 0) {
    return {
      strategy,
      selectedAutomation: {},
      automationCoverage: 0,
      metrics: {
        cycleTime: baseline.cycleTimeHours,
        humanEffort: baseline.humanEffortHours,
        reviewBurden: baseline.reviewBurdenHours,
        qualityRisk: round(clamp(100 - baseline.qualityScore, 1, 99)),
        leverage: round(baselineLeverage(baseline)),
        cycleTimePerStoryPoint:
          baseline.storyPoints === undefined
            ? undefined
            : round(baseline.cycleTimeHours / Math.max(1, baseline.storyPoints)),
        humanEffortPerStoryPoint:
          baseline.storyPoints === undefined
            ? undefined
            : round(baseline.humanEffortHours / Math.max(1, baseline.storyPoints)),
        estimatedCostPerStoryPoint:
          baseline.storyPoints === undefined || baseline.costPerHourUsd === undefined
            ? undefined
            : round(
                ((baseline.humanEffortHours + baseline.reviewBurdenHours) *
                  baseline.costPerHourUsd) /
                  Math.max(1, baseline.storyPoints),
              ),
      },
      assumptions: [
        'No workflow steps were provided; scenario remains at baseline metrics.',
      ],
    }
  }

  const profile = STRATEGY_PROFILE[strategy.mode]
  let totalWeight = 0
  let weightedAutomation = 0
  let weightedRiskSurface = 0
  let weightedReviewSurface = 0
  let weightedOutputLift = 0
  const selectedAutomation: Record<string, AutomationMode> = {}

  for (const step of workflow) {
    const mode = resolveStepMode(step, strategy, overrides)
    const intensity = AUTOMATION_INTENSITY[mode]
    const sensitivity = SENSITIVITY_WEIGHT[step.errorSensitivity]
    const stepWeight =
      Math.max(0.5, step.effortHours) * Math.max(0.4, step.throughputContribution)
    const reviewShield = step.reviewRequired ? 0.78 : 1
    const reviewDemandBase = step.reviewRequired ? 1 : 0.5
    const stepOutputLift = 1 + intensity * profile.outputGain

    totalWeight += stepWeight
    weightedAutomation += intensity * stepWeight
    weightedRiskSurface += intensity * sensitivity * reviewShield * stepWeight
    weightedReviewSurface +=
      (reviewDemandBase + intensity * 0.55 * sensitivity) * stepWeight
    weightedOutputLift += stepOutputLift * stepWeight
    selectedAutomation[step.id] = mode
  }

  const automationCoverage = clamp(weightedAutomation / totalWeight, 0, 1)
  const normalizedRisk = weightedRiskSurface / totalWeight
  const normalizedReviewDemand = clamp(
    weightedReviewSurface / (totalWeight * 1.65),
    0.45,
    1.55,
  )
  const normalizedOutputLift = clamp(weightedOutputLift / totalWeight, 0.7, 1.85)

  const effortReduction = automationCoverage * profile.effortGain
  const coordinationTax = profile.complexityPenalty * automationCoverage
  const humanEffort = round(
    baseline.humanEffortHours * (1 - effortReduction) +
      baseline.humanEffortHours * coordinationTax * 0.16,
  )

  const cycleReduction = automationCoverage * profile.cycleGain
  const cycleTime = round(
    baseline.cycleTimeHours * (1 - cycleReduction) +
      baseline.cycleTimeHours * coordinationTax * 0.12,
  )

  const reviewMultiplier =
    normalizedReviewDemand * (1 + automationCoverage * profile.reviewTuning)
  const reviewBurden = round(baseline.reviewBurdenHours * reviewMultiplier)

  const baselineQualityRisk = clamp(100 - baseline.qualityScore, 2, 70)
  const riskFromAutomation = normalizedRisk * (18 + profile.complexityPenalty * 10)
  const riskFromCoverage = Math.max(0, (automationCoverage - 0.75) * 22)
  const riskReductionFromControl = Math.max(0, normalizedReviewDemand - 0.7) * 7
  const qualityRisk = round(
    clamp(
      baselineQualityRisk +
        riskFromAutomation +
        riskFromCoverage -
        riskReductionFromControl,
      1,
      95,
    ),
  )

  const projectedOutput = baseline.outputVolume * normalizedOutputLift
  const qualityConfidence = clamp((100 - qualityRisk) / 100, 0.35, 0.99)
  const effectiveOutput = projectedOutput * qualityConfidence
  const effectiveInput = humanEffort + reviewBurden * 0.75 + cycleTime * 0.15
  const leverage = round(clamp(effectiveOutput / Math.max(1, effectiveInput), 0.2, 12))
  const storySize = Math.max(1, baseline.storyPoints ?? 0)
  const costPerHour = baseline.costPerHourUsd ?? 0
  const estimatedCost =
    costPerHour === 0 ? undefined : (humanEffort + reviewBurden) * costPerHour

  const assumptions = [
    `${strategy.title} applies ${round(automationCoverage * 100)}% weighted automation coverage.`,
    'Quality risk increases with automation intensity and high-sensitivity steps lacking explicit controls.',
    'Leverage balances projected output against human effort, review burden, and coordination overhead.',
  ]

  return {
    strategy,
    selectedAutomation,
    automationCoverage: round(automationCoverage, 4),
    metrics: {
      cycleTime,
      humanEffort,
      reviewBurden,
      qualityRisk,
      leverage,
      cycleTimePerStoryPoint: round(cycleTime / storySize),
      humanEffortPerStoryPoint: round(humanEffort / storySize),
      estimatedCostPerStoryPoint:
        estimatedCost === undefined ? undefined : round(estimatedCost / storySize),
    },
    assumptions,
  }
}

export const buildStrategyMetricsTable = ({
  baseline,
  workflow,
  strategies,
  overridesByStrategy,
}: StrategyMetricsInput): ScenarioMetricResult[] =>
  strategies.map((strategy) =>
    calculateScenarioMetrics({
      baseline,
      workflow,
      strategy,
      overrides: overridesByStrategy?.[strategy.id],
    }),
  )

export const buildMetricSetByStrategyId = (
  results: ScenarioMetricResult[],
): Record<string, MetricSet> => {
  const metricsById: Record<string, MetricSet> = {}
  for (const result of results) {
    metricsById[result.strategy.id] = result.metrics
  }
  return metricsById
}

export const recommendStrategyId = (results: ScenarioMetricResult[]): string | null => {
  if (results.length === 0) {
    return null
  }

  const winner = [...results].sort((left, right) => {
    if (right.metrics.leverage !== left.metrics.leverage) {
      return right.metrics.leverage - left.metrics.leverage
    }
    if (left.metrics.qualityRisk !== right.metrics.qualityRisk) {
      return left.metrics.qualityRisk - right.metrics.qualityRisk
    }
    return left.metrics.reviewBurden - right.metrics.reviewBurden
  })[0]

  return winner.strategy.id
}
