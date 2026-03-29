import type {
  ImportedArtifact,
  MetricSet,
  StrategyMode,
  StrategyScenario,
  WorkflowContextBundle,
} from '../types/studio'

export interface BriefStrategyResult {
  scenario: StrategyScenario
  metrics: MetricSet
  automationCoverage: number
}

export interface BriefExportInput {
  workflowContext: WorkflowContextBundle
  importedArtifacts: ImportedArtifact[]
  strategyResults: BriefStrategyResult[]
  selectedStrategyId: string
  generatedAt?: string
}

const round = (value: number, decimals = 2): number => {
  const precision = 10 ** decimals
  return Math.round(value * precision) / precision
}

const pct = (value: number): string => `${round(value * 100)}%`

const baselineLeverage = (bundle: WorkflowContextBundle): number => {
  const effectiveInput =
    bundle.baseline.humanEffortHours +
    bundle.baseline.reviewBurdenHours * 0.6 +
    bundle.baseline.cycleTimeHours * 0.2
  const effectiveOutput =
    bundle.baseline.outputVolume * (bundle.baseline.qualityScore / 100)
  return round(effectiveOutput / Math.max(1, effectiveInput))
}

const roadmapByMode = (
  mode: StrategyMode,
): { days0to30: string[]; days31to60: string[]; days61to90: string[] } => {
  if (mode === 'copilot') {
    return {
      days0to30: [
        'Lock workflow definitions and baseline KPI tracking.',
        'Deploy assist-only prompts for drafting and retrieval tasks.',
        'Create a lightweight review checklist per output type.',
      ],
      days31to60: [
        'Expand copilot coverage to recurring low-risk steps.',
        'Standardize output templates and handoff format.',
        'Measure changes in effort, cycle time, and review burden weekly.',
      ],
      days61to90: [
        'Promote successful assist flows to automate-with-review candidates.',
        'Formalize exception routing and escalation ownership.',
        'Finalize pilot recommendation for hybrid transition.',
      ],
    }
  }

  if (mode === 'hybrid') {
    return {
      days0to30: [
        'Split the workflow into human-governed and AI-managed subflows.',
        'Define review gates for high-sensitivity outputs.',
        'Standardize evidence intake for repo files, tracker exports, and tool manifests.',
      ],
      days31to60: [
        'Automate recurring transformation steps with structured outputs.',
        'Run weekly calibration using quality and review burden drift.',
        'Publish operating playbook with owner and escalation mapping.',
      ],
      days61to90: [
        'Increase automation coverage on proven low-risk nodes.',
        'Harden exception handling and rollback criteria.',
        'Prepare next-pilot candidate workflow with reusable patterns.',
      ],
    }
  }

  return {
    days0to30: [
      'Define guardrails, approval boundaries, and exception classes.',
      'Convert stable steps to orchestrated AI-first execution paths.',
      'Instrument reliability metrics for every automated handoff.',
    ],
    days31to60: [
      'Roll out automate-by-default on low-variance subflows.',
      'Stress test incident response and fallback procedures.',
      'Audit model/tool dependencies and resiliency assumptions.',
    ],
    days61to90: [
      'Tighten governance for approvals and policy exceptions.',
      'Tune throughput and quality controls using production telemetry.',
      'Document criteria for broad rollout or controlled rollback.',
    ],
  }
}

const sourceOrder: ImportedArtifact['source'][] = [
  'filesystem',
  'docs',
  'tracker',
  'tool-manifest',
  'validation',
  'review',
  'note',
]

const summarizeImports = (artifacts: ImportedArtifact[]): string[] => {
  const lines: string[] = []
  for (const source of sourceOrder) {
    const sourceItems = artifacts
      .filter((artifact) => artifact.source === source)
      .sort((left, right) => left.title.localeCompare(right.title))
    if (sourceItems.length === 0) {
      continue
    }
    lines.push(`- ${source}: ${sourceItems.length} artifact(s)`)
    for (const artifact of sourceItems.slice(0, 3)) {
      lines.push(`- ${source} -> ${artifact.title}: ${artifact.summary}`)
    }
  }
  if (lines.length === 0) {
    return ['- No evidence artifacts were imported for this session.']
  }
  return lines
}

export const generateBriefMarkdown = ({
  workflowContext,
  importedArtifacts,
  strategyResults,
  selectedStrategyId,
  generatedAt,
}: BriefExportInput): string => {
  const selected =
    strategyResults.find((result) => result.scenario.id === selectedStrategyId) ??
    strategyResults[0]

  const comparisonTableLines = [
    '| Strategy | Coverage | Cycle Time | Human Effort | Review Burden | Quality Risk | Leverage |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...strategyResults.map((result) => {
      const { scenario, metrics, automationCoverage } = result
      return `| ${scenario.title} | ${pct(automationCoverage)} | ${metrics.cycleTime}h | ${metrics.humanEffort}h | ${metrics.reviewBurden}h | ${metrics.qualityRisk} | ${metrics.leverage} |`
    }),
  ]

  const roadmap = roadmapByMode(selected.scenario.mode)
  const selectedKpis = selected.metrics
  const baseline = workflowContext.baseline
  const baselineQualityRisk = round(100 - baseline.qualityScore)
  const selectedCoverage = pct(selected.automationCoverage)
  const generatedLabel = generatedAt ?? 'deterministic-mvp'
  const workflowSteps = workflowContext.workflow
    .map(
      (step, index) =>
        `| ${index + 1} | ${step.name} | ${step.owner} | ${step.automationMode} | ${step.effortHours} | ${step.reviewRequired ? 'Yes' : 'No'} |`,
    )
    .join('\n')

  const riskNotes = [
    ...selected.scenario.risks,
    ...(selectedKpis.qualityRisk > baselineQualityRisk
      ? ['Projected quality risk rises versus baseline; increase review rigor during rollout.']
      : ['Projected quality risk is stable or improved versus baseline.']),
    ...(selectedKpis.reviewBurden > baseline.reviewBurdenHours
      ? ['Review burden increases; allocate explicit reviewer capacity.']
      : ['Review burden decreases; repurpose saved reviewer time to exception handling.']),
  ]

  return `# AI Transition Studio Brief
Generated: ${generatedLabel}

## Current State
- Organization: ${workflowContext.organization.organizationName}
- Industry: ${workflowContext.organization.industry}
- Function: ${workflowContext.organization.functionName}
- Team size: ${workflowContext.organization.teamSize}
- Pain statement: ${workflowContext.organization.painStatement}
- Target outcome: ${workflowContext.organization.targetOutcome}

### Workflow Map Summary
| # | Step | Owner | Current Mode | Effort (h) | Review Gate |
| --- | --- | --- | --- | --- | --- |
${workflowSteps}

### Baseline KPI Stack
- Human effort: ${baseline.humanEffortHours}h
- Cycle time: ${baseline.cycleTimeHours}h
- Output volume: ${baseline.outputVolume}
- Quality risk: ${baselineQualityRisk}
- Review burden: ${baseline.reviewBurdenHours}h
- Baseline leverage: ${baselineLeverage(workflowContext)}

### Bottlenecks
${workflowContext.bottlenecks.map((item) => `- ${item}`).join('\n')}

## Future-State Options
${comparisonTableLines.join('\n')}

## Chosen Strategy
- Strategy: ${selected.scenario.title}
- Mode: ${selected.scenario.mode}
- Coverage: ${selectedCoverage}
- Summary: ${selected.scenario.summary}
- Required change: ${selected.scenario.requiredChange}

## KPI Stack For Chosen Strategy
- Cycle time: ${selectedKpis.cycleTime}h
- Human effort: ${selectedKpis.humanEffort}h
- Review burden: ${selectedKpis.reviewBurden}h
- Quality risk: ${selectedKpis.qualityRisk}
- Output-input leverage: ${selectedKpis.leverage}
${selectedKpis.cycleTimePerStoryPoint !== undefined ? `- Cycle time per story point: ${selectedKpis.cycleTimePerStoryPoint}h` : ''}
${selectedKpis.humanEffortPerStoryPoint !== undefined ? `- Human effort per story point: ${selectedKpis.humanEffortPerStoryPoint}h` : ''}
${selectedKpis.estimatedCostPerStoryPoint !== undefined ? `- Estimated cost per story point: $${selectedKpis.estimatedCostPerStoryPoint}` : ''}

## Risk Notes
${riskNotes.map((note) => `- ${note}`).join('\n')}

## Implementation Prerequisites
${selected.scenario.prerequisites.map((item) => `- ${item}`).join('\n')}

## Transition Roadmap
### 0-30 Days
${roadmap.days0to30.map((item) => `- ${item}`).join('\n')}

### 31-60 Days
${roadmap.days31to60.map((item) => `- ${item}`).join('\n')}

### 61-90 Days
${roadmap.days61to90.map((item) => `- ${item}`).join('\n')}

## Evidence Used
${summarizeImports(importedArtifacts).join('\n')}
`
}
