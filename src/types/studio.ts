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

export type ArtifactSource = 'filesystem' | 'docs' | 'tracker'

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
  tools: string[]
  automationMode: AutomationMode
  errorSensitivity: ErrorSensitivity
  reviewRequired: boolean
  effortHours: number
  throughputContribution: number
  notes: string
}

export interface AiAsset {
  id: string
  name: string
  assetType: 'skill' | 'mcp' | 'prompt' | 'agent-flow' | 'rag' | 'api'
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
}

export interface MetricSet {
  cycleTime: number
  humanEffort: number
  reviewBurden: number
  qualityRisk: number
  leverage: number
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
