export type AutomationMode =
  | 'manual'
  | 'ai-assisted'
  | 'ai-automated'
  | 'do-not-automate'
  | 'assist-only'
  | 'automate-with-review'
  | 'automate-by-default'

export type StrategyMode = 'copilot' | 'hybrid' | 'agentic'

export type ErrorSensitivity = 'low' | 'medium' | 'high'

export type ArtifactSource =
  | 'filesystem'
  | 'docs'
  | 'tracker'
  | 'tool-manifest'
  | 'validation'
  | 'review'
  | 'note'

export type EvidenceArtifactType =
  | 'repo-doc'
  | 'tracker-export'
  | 'tool-manifest'
  | 'validation-artifact'
  | 'review-artifact'
  | 'pasted-note'

export type WorkflowEdgeType =
  | 'handoff'
  | 'branch'
  | 'feedback-loop'
  | 'rework-loop'
  | 'escalation'

export type ConfirmationState = 'drafted' | 'reviewed' | 'edited'

export type ReviewConfidence = 'low' | 'medium' | 'high'

export type StageId = 'context' | 'workflow' | 'analysis' | 'brief'

export interface OrganizationContext {
  organizationName: string
  industry: string
  functionName: string
  teamSize: number
  painStatement: string
  targetOutcome: string
}

export interface WorkflowStep {
  id: string
  name: string
  owner: string
  input: string
  output: string
  storyPoints?: number
  tools: string[]
  automationMode: AutomationMode
  errorSensitivity: ErrorSensitivity
  reviewRequired: boolean
  validationRequired?: boolean
  effortHours: number
  throughputContribution: number
  notes: string
  confirmationState?: ConfirmationState
}

export interface AiAsset {
  id: string
  name: string
  assetType: 'skill' | 'tool' | 'prompt' | 'agent-flow' | 'rag' | 'api'
  description: string
  source: ArtifactSource
  readiness: 'available' | 'partial' | 'blocked'
}

export interface BaselineMetrics {
  humanEffortHours: number
  cycleTimeHours: number
  outputVolume: number
  qualityScore: number
  reviewBurdenHours: number
  storyPoints?: number
  costPerHourUsd?: number
}

export interface MetricSet {
  cycleTime: number
  humanEffort: number
  reviewBurden: number
  qualityRisk: number
  leverage: number
  cycleTimePerStoryPoint?: number
  humanEffortPerStoryPoint?: number
  estimatedCostPerStoryPoint?: number
}

export interface StrategyProjection extends MetricSet {
  mode: StrategyMode
}

export interface StrategyScenario {
  id: string
  title: string
  mode: StrategyMode
  summary: string
  coverageLabel: string
  recommendedAutomation: Record<string, AutomationMode>
  risks: string[]
  prerequisites: string[]
  requiredChange: string
}

export interface StrategyComparison {
  scenario: StrategyScenario
  projection: StrategyProjection
}

export interface ImportedArtifact {
  id: string
  source: ArtifactSource
  title: string
  summary: string
  payload: Record<string, unknown>
}

export interface EvidenceArtifact extends ImportedArtifact {
  artifactType: EvidenceArtifactType
  rawText: string
  extractionStatus: 'ready' | 'needs-review' | 'failed'
  warnings: string[]
}

export interface TraceLink {
  artifactId: string
  artifactTitle: string
  excerpt: string
  inferredField: string
  confidence: ReviewConfidence
}

export interface WorkflowEdge {
  id: string
  sourceStepId: string
  targetStepId: string
  type: WorkflowEdgeType
  label: string
}

export interface ReviewItem {
  id: string
  label: string
  field: string
  stepId?: string
  confidence: ReviewConfidence
  reason: string
}

export interface AutomationCandidate {
  stepId: string
  label: string
  opportunity: 'assist-only' | 'review-gated' | 'default-automation'
  rationale: string
}

export interface AnalysisDraft {
  workflowName: string
  storyPoints: number
  steps: WorkflowStep[]
  edges: WorkflowEdge[]
  artifacts: EvidenceArtifact[]
  reviewQueue: ReviewItem[]
  bottlenecks: string[]
  automationCandidates: AutomationCandidate[]
  traceLinks: Record<string, TraceLink[]>
  baseline: BaselineMetrics
}

export interface WorkflowContextBundle {
  organization: OrganizationContext
  workflow: WorkflowStep[]
  assets: AiAsset[]
  baseline: BaselineMetrics
  bottlenecks: string[]
}

export interface RoadmapPhase {
  window: string
  items: string[]
}
