import { useState } from 'react'
import type { HeroStat, StudioStage } from '../components/StudioShell'
import type { ArtifactNormalizationResult } from '../components/McpImportPanel'
import {
  demoAssets,
  demoBaseline,
  demoBottlenecks,
  demoMcpImportSamples,
  demoOrganization,
  demoSelectedStrategyId,
  demoStrategies,
  demoWorkflow,
} from '../data/demoStudio'
import { generateBriefMarkdown } from '../lib/briefExport'
import { normalizeMcpArtifacts } from '../lib/mcpImport'
import {
  buildStrategyMetricsTable,
  recommendStrategyId,
  type ScenarioMetricResult,
  type StrategyOverrides,
} from '../lib/scenarioMetrics'
import type {
  ArtifactSource,
  AutomationMode,
  ImportedArtifact,
  OrganizationContext,
  StageId,
  WorkflowContextBundle,
  WorkflowStep,
} from '../types/studio'

const stageOrder: StageId[] = ['context', 'workflow', 'analysis', 'brief']

const initialArtifacts = normalizeMcpArtifacts(demoMcpImportSamples)
const initiallyAttachedArtifactIds = initialArtifacts.slice(0, 3).map((artifact) => artifact.id)

const expectedPayloadFields: Record<ArtifactSource, string[]> = {
  filesystem: ['path', 'tags', 'metadata'],
  docs: ['docId', 'url', 'author', 'updatedAt'],
  tracker: ['key', 'status', 'priority', 'assignee', 'labels'],
}

const pct = (value: number): number => Math.round(value * 100)

const clamp = (value: number, min: number, max: number): number => {
  if (value < min) {
    return min
  }
  if (value > max) {
    return max
  }
  return value
}

const getContextScore = (context: OrganizationContext): number => {
  const checks = [
    context.organizationName.trim().length > 0,
    context.industry.trim().length > 0,
    context.functionName.trim().length > 0,
    context.teamSize > 0,
    context.painStatement.trim().length > 0,
    context.targetOutcome.trim().length > 0,
  ]
  return pct(checks.filter(Boolean).length / checks.length)
}

const getWorkflowReadiness = (workflow: WorkflowStep[]): number => {
  if (workflow.length === 0) {
    return 0
  }

  const totalScore = workflow.reduce((sum, step) => {
    const fields = [
      step.name.trim().length > 0,
      step.owner.trim().length > 0,
      step.input.trim().length > 0,
      step.output.trim().length > 0,
      step.tools.length > 0,
      step.effortHours > 0,
      step.throughputContribution > 0,
    ]
    return sum + fields.filter(Boolean).length / fields.length
  }, 0)

  return pct(totalScore / workflow.length)
}

const getOrganizationReadiness = (contextScore: number, workflow: WorkflowStep[]): number => {
  if (workflow.length === 0) {
    return contextScore
  }
  const governedSteps = workflow.filter(
    (step) => step.reviewRequired || step.errorSensitivity === 'high',
  ).length
  const governanceCoverage = governedSteps / workflow.length
  return Math.round(contextScore * 0.55 + pct(governanceCoverage) * 0.45)
}

const getInterfaceReadiness = (
  attachedArtifacts: ImportedArtifact[],
  totalAssets: number,
): number => {
  const distinctSources = new Set(attachedArtifacts.map((artifact) => artifact.source)).size
  const sourceCoverage = distinctSources / 3
  const assetCoverage = totalAssets === 0 ? 0 : attachedArtifacts.length / totalAssets
  return Math.round(clamp(sourceCoverage * 70 + assetCoverage * 30, 0, 100))
}

const formatMetricDelta = (next: number, baseline: number, inverse = false): string => {
  const diff = next - baseline
  if (diff === 0) {
    return 'flat'
  }
  const normalized = baseline === 0 ? 0 : Math.abs((diff / baseline) * 100)
  const directionIsPositive = inverse ? diff <= 0 : diff >= 0
  return `${directionIsPositive ? 'improves' : 'worsens'} ${normalized.toFixed(0)}%`
}

const buildNormalizationResults = (
  artifacts: ImportedArtifact[],
): ArtifactNormalizationResult[] =>
  artifacts.map((artifact) => {
    const normalizedFields = Object.entries(artifact.payload)
      .filter(([key, value]) => {
        if (key === 'raw') {
          return false
        }
        if (typeof value === 'string') {
          return value.trim().length > 0
        }
        if (Array.isArray(value)) {
          return value.length > 0
        }
        if (typeof value === 'object' && value !== null) {
          return Object.keys(value).length > 0
        }
        return Boolean(value)
      })
      .map(([key]) => key)

    const gaps = expectedPayloadFields[artifact.source].filter(
      (field) => !normalizedFields.includes(field),
    )
    const warnings: string[] = []

    if (artifact.summary.length < 36) {
      warnings.push('Summary is thin and may need human context.')
    }
    if (artifact.source === 'tracker' && gaps.includes('status')) {
      warnings.push('Execution status is missing from the tracker artifact.')
    }
    if (artifact.source === 'filesystem' && gaps.includes('path')) {
      warnings.push('Source path is missing, reducing traceability.')
    }
    if (artifact.source === 'docs' && gaps.includes('url')) {
      warnings.push('Document source URL is missing.')
    }

    const status =
      gaps.length === 0
        ? 'ready'
        : normalizedFields.length >= 2
          ? 'needs-review'
          : 'failed'

    return {
      artifactId: artifact.id,
      status,
      normalizedFields,
      warnings,
      gaps,
    }
  })

const getStageStatus = (
  stageId: StageId,
  activeStage: StageId,
  contextScore: number,
  workflowReadiness: number,
  attachedArtifactCount: number,
): StudioStage['status'] => {
  if (stageId === activeStage) {
    return 'active'
  }

  if (stageId === 'context') {
    return contextScore >= 80 ? 'complete' : 'pending'
  }

  if (stageId === 'workflow') {
    return workflowReadiness >= 70 ? 'complete' : 'pending'
  }

  if (stageId === 'analysis') {
    return attachedArtifactCount > 0 ? 'complete' : 'pending'
  }

  return activeStage === 'brief' ? 'active' : 'pending'
}

const getBottleneckDimension = (
  workflowReadiness: number,
  organizationReadiness: number,
  interfaceReadiness: number,
): string => {
  if (workflowReadiness <= organizationReadiness && workflowReadiness <= interfaceReadiness) {
    return 'Workflow readiness'
  }
  if (organizationReadiness <= interfaceReadiness) {
    return 'Organization readiness'
  }
  return 'Interface readiness'
}

const getLeveragePoint = (workflow: WorkflowStep[]): string => {
  if (workflow.length === 0) {
    return 'No leverage point available'
  }

  const winner = [...workflow].sort((left, right) => {
    const rightWeight = right.effortHours * right.throughputContribution
    const leftWeight = left.effortHours * left.throughputContribution
    return rightWeight - leftWeight
  })[0]

  return `${winner.name} owned by ${winner.owner}`
}

const getPilotSlice = (result: ScenarioMetricResult | null, workflow: WorkflowStep[]): string => {
  if (!result) {
    return 'No pilot slice selected'
  }

  const candidate = workflow.find((step) => {
    const mode = result.selectedAutomation[step.id]
    return mode === 'automate-with-review' || mode === 'automate-by-default'
  })

  if (!candidate) {
    return 'Keep the current workflow intact and start with assist-only drafting.'
  }

  return `${candidate.name} with ${result.selectedAutomation[candidate.id]} controls`
}

export function useStudioState() {
  const [organization, setOrganization] = useState(demoOrganization)
  const [workflow, setWorkflow] = useState(demoWorkflow)
  const [activeStage, setActiveStage] = useState<StageId>('context')
  const [selectedStrategyId, setSelectedStrategyId] = useState(demoSelectedStrategyId)
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(
    initialArtifacts[0]?.id ?? null,
  )
  const [selectedStepId, setSelectedStepId] = useState<string | null>(demoWorkflow[0]?.id ?? null)
  const [attachedArtifactIds, setAttachedArtifactIds] = useState(initiallyAttachedArtifactIds)
  const [strategyOverridesById, setStrategyOverridesById] = useState<StrategyOverrides>({})
  const [generatedAt] = useState(() =>
    new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date()),
  )

  const attachedArtifacts = initialArtifacts.filter((artifact) =>
    attachedArtifactIds.includes(artifact.id),
  )
  const selectedStep = workflow.find((step) => step.id === selectedStepId) ?? workflow[0] ?? null

  const workflowContext: WorkflowContextBundle = {
    organization,
    workflow,
    assets: demoAssets,
    baseline: demoBaseline,
    bottlenecks: demoBottlenecks,
  }

  const strategyResults = buildStrategyMetricsTable({
    baseline: demoBaseline,
    workflow,
    strategies: demoStrategies,
    overridesByStrategy: strategyOverridesById,
  })
  const recommendedStrategyId = recommendStrategyId(strategyResults)
  const selectedStrategyResult =
    strategyResults.find((result) => result.strategy.id === selectedStrategyId) ??
    strategyResults[0] ??
    null
  const recommendedStrategyResult =
    strategyResults.find((result) => result.strategy.id === recommendedStrategyId) ?? null

  const normalizationResults = buildNormalizationResults(initialArtifacts)
  const contextScore = getContextScore(organization)
  const workflowReadiness = getWorkflowReadiness(workflow)
  const organizationReadiness = getOrganizationReadiness(contextScore, workflow)
  const interfaceReadiness = getInterfaceReadiness(attachedArtifacts, demoAssets.length)
  const businessLeverage = selectedStrategyResult?.metrics.leverage ?? 0

  const stages: StudioStage[] = [
    {
      id: 'context',
      label: 'Context',
      description: 'Capture the operating context and import MCP evidence.',
      status: getStageStatus(
        'context',
        activeStage,
        contextScore,
        workflowReadiness,
        attachedArtifacts.length,
      ),
    },
    {
      id: 'workflow',
      label: 'Workflow',
      description: 'Map the current process, owners, and review gates.',
      status: getStageStatus(
        'workflow',
        activeStage,
        contextScore,
        workflowReadiness,
        attachedArtifacts.length,
      ),
    },
    {
      id: 'analysis',
      label: 'Simulation',
      description: 'Compare strategies, controls, and leverage tradeoffs.',
      status: getStageStatus(
        'analysis',
        activeStage,
        contextScore,
        workflowReadiness,
        attachedArtifacts.length,
      ),
    },
    {
      id: 'brief',
      label: 'Brief',
      description: 'Produce a shareable recommendation and roadmap.',
      status: getStageStatus(
        'brief',
        activeStage,
        contextScore,
        workflowReadiness,
        attachedArtifacts.length,
      ),
    },
  ]

  const heroStats: HeroStat[] = [
    {
      id: 'workflow-readiness',
      label: 'Workflow Readiness',
      value: `${workflowReadiness}%`,
      delta: `${workflow.length} modeled steps`,
      tone: workflowReadiness >= 75 ? 'positive' : 'warning',
    },
    {
      id: 'org-readiness',
      label: 'Organization Readiness',
      value: `${organizationReadiness}%`,
      delta: `${workflow.filter((step) => step.reviewRequired).length} review gates`,
      tone: organizationReadiness >= 75 ? 'positive' : 'warning',
    },
    {
      id: 'interface-readiness',
      label: 'Interface Readiness',
      value: `${interfaceReadiness}%`,
      delta: `${attachedArtifacts.length} MCP artifacts attached`,
      tone: interfaceReadiness >= 70 ? 'positive' : 'warning',
    },
    {
      id: 'business-leverage',
      label: 'Output-Input Leverage',
      value: businessLeverage,
      delta:
        selectedStrategyResult === null
          ? 'No strategy selected'
          : formatMetricDelta(
              selectedStrategyResult.metrics.leverage,
              demoBaseline.outputVolume /
                Math.max(1, demoBaseline.humanEffortHours + demoBaseline.reviewBurdenHours),
            ),
      tone: businessLeverage >= 0.28 ? 'positive' : 'risk',
    },
    {
      id: 'recommended-path',
      label: 'Recommended Path',
      value: recommendedStrategyResult?.strategy.title ?? 'Unavailable',
      delta:
        recommendedStrategyResult === null
          ? undefined
          : formatMetricDelta(
              recommendedStrategyResult.metrics.cycleTime,
              demoBaseline.cycleTimeHours,
              true,
            ),
      tone: 'neutral',
    },
  ]

  const briefMarkdown = generateBriefMarkdown({
    workflowContext,
    importedArtifacts: attachedArtifacts,
    strategyResults: strategyResults.map((result) => ({
      scenario: result.strategy,
      metrics: result.metrics,
      automationCoverage: result.automationCoverage,
    })),
    selectedStrategyId: selectedStrategyResult?.strategy.id ?? demoSelectedStrategyId,
    generatedAt,
  })

  const diagnosis = {
    maturityStage:
      workflowReadiness >= 80 && interfaceReadiness >= 70
        ? 'Workflow-visible, AI-calibrating'
        : 'Workflow partly explicit, controls still forming',
    bottleneckDimension: getBottleneckDimension(
      workflowReadiness,
      organizationReadiness,
      interfaceReadiness,
    ),
    leveragePoint: getLeveragePoint(workflow),
    recommendedPilot: getPilotSlice(selectedStrategyResult, workflow),
  }

  const moveToStage = (direction: 'next' | 'previous') => {
    const index = stageOrder.indexOf(activeStage)
    const nextIndex =
      direction === 'next'
        ? clamp(index + 1, 0, stageOrder.length - 1)
        : clamp(index - 1, 0, stageOrder.length - 1)
    setActiveStage(stageOrder[nextIndex])
  }

  const importSelectedArtifact = (artifactId: string) => {
    setAttachedArtifactIds((current) =>
      current.includes(artifactId) ? current : [...current, artifactId],
    )
  }

  const updateSelectedStrategyStepMode = (stepId: string, mode: AutomationMode) => {
    setStrategyOverridesById((current) => ({
      ...current,
      [selectedStrategyId]: {
        ...current[selectedStrategyId],
        [stepId]: mode,
      },
    }))
  }

  return {
    activeStage,
    setActiveStage,
    stages,
    heroStats,
    organization,
    setOrganization,
    workflow,
    setWorkflow,
    workflowContext,
    baseline: demoBaseline,
    assets: demoAssets,
    bottlenecks: demoBottlenecks,
    availableArtifacts: initialArtifacts,
    attachedArtifacts,
    selectedArtifactId,
    setSelectedArtifactId,
    normalizationResults,
    importSelectedArtifact,
    selectedStepId,
    setSelectedStepId,
    selectedStep,
    strategyResults,
    selectedStrategyId,
    setSelectedStrategyId,
    selectedStrategyResult,
    recommendedStrategyId,
    recommendedStrategyResult,
    updateSelectedStrategyStepMode,
    briefMarkdown,
    diagnosis,
    contextScore,
    workflowReadiness,
    organizationReadiness,
    interfaceReadiness,
    moveToNextStage: () => moveToStage('next'),
    moveToPreviousStage: () => moveToStage('previous'),
  }
}
