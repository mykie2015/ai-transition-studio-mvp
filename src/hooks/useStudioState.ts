import { useState } from 'react'
import type { HeroStat, StudioStage } from '../components/StudioShell'
import type { EvidenceDraftInput } from '../components/EvidenceIntake'
import { buildDefaultAgileWorkflow } from '../lib/defaultWorkflow'
import { generateBriefMarkdown } from '../lib/briefExport'
import {
  buildStrategyMetricsTable,
  recommendStrategyId,
  type ScenarioMetricResult,
} from '../lib/scenarioMetrics'
import { useAnalysisSession } from './useAnalysisSession'
import type {
  AiAsset,
  AnalysisDraft,
  AutomationMode,
  OrganizationContext,
  StageId,
  StrategyScenario,
} from '../types/studio'

const stageOrder: StageId[] = ['context', 'workflow', 'analysis', 'brief']
const defaultDraft = buildDefaultAgileWorkflow()

const defaultOrganization: OrganizationContext = {
  organizationName: 'Transition Studio Demo Team',
  industry: 'Software Delivery',
  functionName: 'Engineering',
  teamSize: 8,
  painStatement: 'Delivery flow is debated more than it is measured.',
  targetOutcome: 'Find the first automation path that improves speed without losing review control.',
}

const buildStrategies = (draft: AnalysisDraft): StrategyScenario[] => {
  const recommendedAutomation = (mode: 'copilot' | 'hybrid' | 'agentic') =>
    Object.fromEntries(
      draft.steps.map((step) => {
        let automationMode: AutomationMode = 'assist-only'

        if (mode === 'copilot') {
          automationMode =
            step.id === 'validation-gate' || step.id === 'review-remediation'
              ? 'automate-with-review'
              : 'assist-only'
        } else if (mode === 'hybrid') {
          automationMode =
            step.id === 'validation-gate' || step.id === 'review-remediation'
              ? 'automate-with-review'
              : step.id === 'pr-open'
                ? 'assist-only'
                : 'automate-with-review'
        } else {
          automationMode =
            step.id === 'jira-scope' || step.reviewRequired
              ? 'automate-with-review'
              : 'automate-by-default'
        }

        return [step.id, automationMode]
      }),
    ) as Record<string, AutomationMode>

  return [
    {
      id: 'copilot',
      title: 'Conservative Copilot',
      mode: 'copilot',
      summary: 'Draft faster, but keep humans explicitly steering every delivery checkpoint.',
      coverageLabel: 'assist-first',
      recommendedAutomation: recommendedAutomation('copilot'),
      risks: ['Speed gains can flatten if reviewers become the new bottleneck.'],
      prerequisites: ['Clear review ownership', 'Documented acceptance criteria'],
      requiredChange: 'Adopt AI drafting for planning, coding, and PR summaries without changing merge control.',
    },
    {
      id: 'hybrid',
      title: 'Hybrid Workflow Redesign',
      mode: 'hybrid',
      summary: 'Automate repeatable delivery steps while preserving guided review on risky gates.',
      coverageLabel: 'review-gated',
      recommendedAutomation: recommendedAutomation('hybrid'),
      risks: ['Validation and remediation loops still need careful exception handling.'],
      prerequisites: ['Stable validation stack', 'Clear blocking severity policy'],
      requiredChange: 'Move validation and remediation into guided automation with explicit reviewer checkpoints.',
    },
    {
      id: 'agentic',
      title: 'Agentic Service Pipeline',
      mode: 'agentic',
      summary: 'Push proven low-variance steps toward AI-first execution with escalations for risky work.',
      coverageLabel: 'automation-heavy',
      recommendedAutomation: recommendedAutomation('agentic'),
      risks: ['Over-automation can hide weak evidence or ambiguous requirements.'],
      prerequisites: ['Strong guardrails', 'Reliable rollback path', 'Tooling telemetry'],
      requiredChange: 'Promote stable validation and PR handoffs into AI-first defaults with human escalation paths.',
    },
  ]
}

const buildAssets = (draft: AnalysisDraft): AiAsset[] =>
  draft.automationCandidates.map((candidate) => ({
    id: `asset-${candidate.stepId}`,
    name: candidate.label,
    assetType: candidate.opportunity === 'default-automation' ? 'agent-flow' : 'skill',
    description: candidate.rationale,
    source: 'filesystem',
    readiness: candidate.opportunity === 'assist-only' ? 'available' : 'partial',
  }))

const buildDiagnosis = (
  draft: AnalysisDraft,
  selectedResult: ScenarioMetricResult | null,
): {
  maturityStage: string
  bottleneckDimension: string
  leveragePoint: string
  recommendedPilot: string
} => ({
  maturityStage: draft.reviewQueue.some((item) => item.confidence === 'low')
    ? 'Evidence review in progress'
    : 'Reviewed workflow ready',
  bottleneckDimension: draft.bottlenecks[0] ?? 'No bottleneck identified',
  leveragePoint: draft.automationCandidates[0]?.label ?? 'No leverage point selected',
  recommendedPilot:
    selectedResult?.strategy.title ?? 'Generate a draft to compare automation strategies',
})

export function useStudioState() {
  const { draft, status, generateDraft } = useAnalysisSession()
  const [activeStage, setActiveStage] = useState<StageId>('context')
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null)
  const [analysisNotes, setAnalysisNotes] = useState('')

  const currentDraft = draft
  const visibleArtifacts = currentDraft?.artifacts ?? defaultDraft.artifacts
  const strategies = currentDraft ? buildStrategies(currentDraft) : []
  const strategyResults = currentDraft
    ? buildStrategyMetricsTable({
        baseline: currentDraft.baseline,
        workflow: currentDraft.steps,
        strategies,
      })
    : []
  const recommendedStrategyId = recommendStrategyId(strategyResults)
  const resolvedStrategyId =
    selectedStrategyId ?? recommendedStrategyId ?? strategyResults[0]?.strategy.id ?? null
  const selectedStrategyResult =
    strategyResults.find((result) => result.strategy.id === resolvedStrategyId) ?? null
  const assets = currentDraft ? buildAssets(currentDraft) : buildAssets(defaultDraft)
  const diagnosis = buildDiagnosis(currentDraft ?? defaultDraft, selectedStrategyResult)

  const briefMarkdown =
    currentDraft && selectedStrategyResult
      ? generateBriefMarkdown({
          workflowContext: {
            organization: defaultOrganization,
            workflow: currentDraft.steps,
            assets,
            baseline: currentDraft.baseline,
            bottlenecks: currentDraft.bottlenecks,
          },
          importedArtifacts: currentDraft.artifacts,
          strategyResults: strategyResults.map((result) => ({
            scenario: result.strategy,
            metrics: result.metrics,
            automationCoverage: result.automationCoverage,
          })),
          selectedStrategyId: resolvedStrategyId ?? selectedStrategyResult.strategy.id,
        })
      : ''

  const stages: StudioStage[] = stageOrder.map((stageId) => {
    const labels: Record<StageId, { label: string; description: string }> = {
      context: {
        label: 'Evidence',
        description: 'Load repo docs, tracker exports, and review notes.',
      },
      workflow: {
        label: 'Review',
        description: 'Confirm the drafted workflow, bottlenecks, and review gates.',
      },
      analysis: {
        label: 'Scenarios',
        description: 'Compare copilot, hybrid, and agentic options.',
      },
      brief: {
        label: 'Brief',
        description: 'Export a shareable recommendation and roadmap.',
      },
    }

    const activeIndex = stageOrder.indexOf(activeStage)
    const stageIndex = stageOrder.indexOf(stageId)
    const statusLabel =
      stageId === activeStage
        ? 'active'
        : stageIndex < activeIndex
          ? 'complete'
          : stageId !== 'context' && !currentDraft
            ? 'pending'
            : 'pending'

    return {
      id: stageId,
      label: labels[stageId].label,
      description: labels[stageId].description,
      status: statusLabel,
    }
  })

  const heroStats: HeroStat[] = [
    {
      id: 'story-points',
      label: 'Story Points',
      value: currentDraft?.storyPoints ?? defaultDraft.storyPoints,
      delta: `${visibleArtifacts.length} evidence artifacts`,
      tone: 'warning',
    },
    {
      id: 'review-items',
      label: 'Review Queue',
      value: currentDraft?.reviewQueue.length ?? defaultDraft.reviewQueue.length,
      delta: `${(currentDraft ?? defaultDraft).reviewQueue.filter((item) => item.confidence === 'low').length} low-confidence items`,
      tone: 'risk',
    },
    {
      id: 'cycle-point',
      label: 'Cycle / Point',
      value: selectedStrategyResult?.metrics.cycleTimePerStoryPoint ?? 'pending',
      delta: selectedStrategyResult ? selectedStrategyResult.strategy.title : 'Generate a draft',
      tone: 'positive',
    },
    {
      id: 'cost-point',
      label: 'Cost / Point',
      value:
        selectedStrategyResult?.metrics.estimatedCostPerStoryPoint === undefined
          ? 'pending'
          : `$${selectedStrategyResult.metrics.estimatedCostPerStoryPoint}`,
      delta: currentDraft ? 'Scenario-normalized estimate' : 'Needs draft workflow',
      tone: 'neutral',
    },
  ]

  const generateDraftFromEvidence = async (input: EvidenceDraftInput) => {
    setAnalysisNotes(input.notes)

    const artifacts = input.artifacts
      .filter((artifact) => artifact.content.trim().length > 0)
      .map((artifact) => ({
        id: artifact.id,
        type: artifact.type,
        title: artifact.title,
        content: artifact.content,
      }))

    if (input.notes.trim().length > 0) {
      artifacts.push({
        id: 'artifact-pasted-note',
        type: 'pasted-note',
        title: 'Pasted Notes',
        content: input.notes.trim(),
      })
    }

    await generateDraft({
      workflowName: input.workflowName,
      artifacts,
    })

    setActiveStage('workflow')
    setSelectedStrategyId(null)
  }

  const moveToNextStage = () => {
    const currentIndex = stageOrder.indexOf(activeStage)
    if (currentIndex === -1 || currentIndex === stageOrder.length - 1) {
      return
    }
    if (!currentDraft && currentIndex >= 0) {
      return
    }
    setActiveStage(stageOrder[currentIndex + 1])
  }

  const moveToPreviousStage = () => {
    const currentIndex = stageOrder.indexOf(activeStage)
    if (currentIndex <= 0) {
      return
    }
    setActiveStage(stageOrder[currentIndex - 1])
  }

  return {
    activeStage,
    analysisNotes,
    analysisStatus: status,
    artifacts: visibleArtifacts,
    assets,
    attachedArtifacts: currentDraft?.artifacts ?? [],
    baseline: currentDraft?.baseline ?? defaultDraft.baseline,
    bottlenecks: currentDraft?.bottlenecks ?? defaultDraft.bottlenecks,
    briefMarkdown,
    canMoveNext: Boolean(currentDraft) && activeStage !== 'brief',
    canMovePrevious: activeStage !== 'context',
    currentDraft,
    diagnosis,
    generateDraft: generateDraftFromEvidence,
    heroStats,
    moveToNextStage,
    moveToPreviousStage,
    recommendedStrategyId,
    reviewQueue: currentDraft?.reviewQueue ?? defaultDraft.reviewQueue,
    selectedStrategyId: resolvedStrategyId ?? '',
    selectedStrategyResult,
    setActiveStage,
    setSelectedStrategyId,
    stages,
    strategyResults,
    traceLinks: currentDraft?.traceLinks ?? defaultDraft.traceLinks,
  }
}
