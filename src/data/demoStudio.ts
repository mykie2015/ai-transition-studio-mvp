import type {
  AiAsset,
  BaselineMetrics,
  OrganizationContext,
  StrategyScenario,
  WorkflowContextBundle,
  WorkflowStep,
} from '../types/studio'
import type { SampleMcpImportInput } from '../lib/mcpImport'

export const demoOrganization: OrganizationContext = {
  organizationName: 'Northstar Advisory',
  industry: 'Professional Services',
  functionName: 'Client Insight Reporting',
  teamSize: 12,
  painStatement:
    'The reporting workflow relies on manual synthesis across docs, trackers, and repository context.',
  targetOutcome:
    'Deliver faster client-ready insight briefs with lower effort and controlled quality risk.',
}

export const demoWorkflow: WorkflowStep[] = [
  {
    id: 'intake-request',
    name: 'Intake request and scope',
    owner: 'Engagement Lead',
    input: 'Client request and business goal',
    output: 'Approved scope statement',
    tools: ['Notion', 'Email'],
    automationMode: 'manual',
    errorSensitivity: 'high',
    reviewRequired: true,
    effortHours: 3.5,
    throughputContribution: 1.1,
    notes: 'Scope drift causes downstream rework.',
  },
  {
    id: 'source-collection',
    name: 'Collect workflow artifacts',
    owner: 'Ops Analyst',
    input: 'Project links and repositories',
    output: 'Artifact inventory',
    tools: ['GitHub', 'Drive', 'Confluence'],
    automationMode: 'ai-assisted',
    errorSensitivity: 'medium',
    reviewRequired: false,
    effortHours: 4,
    throughputContribution: 1.2,
    notes: 'Manual searching across sources remains slow.',
  },
  {
    id: 'process-decomposition',
    name: 'Decompose process into steps',
    owner: 'Transformation Consultant',
    input: 'Inventory and SOP references',
    output: 'Workflow map draft',
    tools: ['Miro', 'Notion'],
    automationMode: 'manual',
    errorSensitivity: 'high',
    reviewRequired: true,
    effortHours: 5.5,
    throughputContribution: 1.3,
    notes: 'Critical step for downstream scenario modeling.',
  },
  {
    id: 'tooling-readiness',
    name: 'Assess MCP and tooling readiness',
    owner: 'AI Engineer',
    input: 'MCP manifests and tool access notes',
    output: 'Readiness checklist',
    tools: ['MCP Inspector', 'GitHub'],
    automationMode: 'ai-assisted',
    errorSensitivity: 'medium',
    reviewRequired: true,
    effortHours: 3,
    throughputContribution: 0.9,
    notes: 'Inconsistent manifests slow validation.',
  },
  {
    id: 'baseline-scoring',
    name: 'Score baseline workflow metrics',
    owner: 'Ops Analyst',
    input: 'Workflow map and historical delivery data',
    output: 'Baseline KPI set',
    tools: ['Sheets', 'SQL'],
    automationMode: 'manual',
    errorSensitivity: 'medium',
    reviewRequired: true,
    effortHours: 4.5,
    throughputContribution: 1.4,
    notes: 'Manual rollups are repetitive and error-prone.',
  },
  {
    id: 'scenario-design',
    name: 'Draft strategy scenarios',
    owner: 'Transformation Consultant',
    input: 'Workflow map, readiness checklist, KPI baseline',
    output: 'Copilot, hybrid, and agentic scenario drafts',
    tools: ['Notion', 'Whiteboard'],
    automationMode: 'manual',
    errorSensitivity: 'medium',
    reviewRequired: true,
    effortHours: 4,
    throughputContribution: 1,
    notes: 'Scenario assumptions are often undocumented.',
  },
  {
    id: 'simulation-pass',
    name: 'Run metric impact simulation',
    owner: 'AI Engineer',
    input: 'Scenario assumptions and workflow steps',
    output: 'Scenario metric comparison',
    tools: ['Spreadsheet', 'Internal script'],
    automationMode: 'ai-assisted',
    errorSensitivity: 'medium',
    reviewRequired: true,
    effortHours: 3.5,
    throughputContribution: 1.1,
    notes: 'Sensitivity analysis is currently ad hoc.',
  },
  {
    id: 'brief-drafting',
    name: 'Draft recommendation brief',
    owner: 'Engagement Lead',
    input: 'Simulation output and risk notes',
    output: 'Planning brief draft',
    tools: ['Docs', 'Claude'],
    automationMode: 'ai-assisted',
    errorSensitivity: 'low',
    reviewRequired: true,
    effortHours: 3,
    throughputContribution: 0.8,
    notes: 'Narrative quality varies by reviewer availability.',
  },
  {
    id: 'stakeholder-review',
    name: 'Run stakeholder review',
    owner: 'Director',
    input: 'Draft brief and roadmap proposal',
    output: 'Approved strategy and pilot scope',
    tools: ['Slides', 'Meet'],
    automationMode: 'do-not-automate',
    errorSensitivity: 'high',
    reviewRequired: true,
    effortHours: 2.5,
    throughputContribution: 0.9,
    notes: 'Decision authority remains human-owned.',
  },
  {
    id: 'pilot-handoff',
    name: 'Handoff pilot execution plan',
    owner: 'Program Manager',
    input: 'Approved recommendation',
    output: '0-90 day transition plan',
    tools: ['Jira', 'Notion'],
    automationMode: 'manual',
    errorSensitivity: 'medium',
    reviewRequired: true,
    effortHours: 2.5,
    throughputContribution: 0.9,
    notes: 'Tracking risks and dependencies is inconsistent.',
  },
]

export const demoAssets: AiAsset[] = [
  {
    id: 'asset-skill-pack',
    name: 'Reporting Skill Pack',
    assetType: 'skill',
    description: 'Prompt and rubric pack for structured reporting.',
    source: 'docs',
    readiness: 'available',
  },
  {
    id: 'asset-mcp-fs',
    name: 'Filesystem MCP Gateway',
    assetType: 'mcp',
    description: 'Reads workflow folders and SOP markdown files.',
    source: 'filesystem',
    readiness: 'available',
  },
  {
    id: 'asset-tracker-bridge',
    name: 'Tracker MCP Bridge',
    assetType: 'mcp',
    description: 'Pulls issue and task metadata from work tracker.',
    source: 'tracker',
    readiness: 'partial',
  },
  {
    id: 'asset-rag-kb',
    name: 'Operations Knowledge RAG',
    assetType: 'rag',
    description: 'Indexes SOPs and prior client engagement notes.',
    source: 'docs',
    readiness: 'partial',
  },
  {
    id: 'asset-brief-flow',
    name: 'Recommendation Brief Flow',
    assetType: 'agent-flow',
    description: 'Drafts and validates recommendation narratives.',
    source: 'docs',
    readiness: 'available',
  },
  {
    id: 'asset-delivery-api',
    name: 'Delivery Metrics API',
    assetType: 'api',
    description: 'Exposes cycle time and throughput trends per engagement.',
    source: 'tracker',
    readiness: 'blocked',
  },
]

export const demoBaseline: BaselineMetrics = {
  humanEffortHours: 42,
  cycleTimeHours: 66,
  outputVolume: 14,
  qualityScore: 84,
  reviewBurdenHours: 13,
}

export const demoBottlenecks: string[] = [
  'Process decomposition and baseline scoring are manual and consume >20% of cycle time.',
  'MCP and tool readiness evidence is fragmented across repositories and docs.',
  'Stakeholder review often starts with inconsistent assumptions between scenarios.',
]

export const demoStrategies: StrategyScenario[] = [
  {
    id: 'copilot-strategy',
    title: 'Conservative Copilot',
    mode: 'copilot',
    summary:
      'Keep current workflow structure and layer AI assist into drafting and retrieval tasks.',
    coverageLabel: 'Partial automation',
    recommendedAutomation: {
      'intake-request': 'assist-only',
      'source-collection': 'assist-only',
      'process-decomposition': 'assist-only',
      'tooling-readiness': 'assist-only',
      'baseline-scoring': 'assist-only',
      'scenario-design': 'assist-only',
      'simulation-pass': 'automate-with-review',
      'brief-drafting': 'assist-only',
      'stakeholder-review': 'do-not-automate',
      'pilot-handoff': 'assist-only',
    },
    risks: [
      'May preserve existing bottlenecks if assist coverage stays shallow.',
      'Benefits can plateau without standard output contracts.',
    ],
    prerequisites: [
      'Define prompt and output standards for assist-only steps.',
      'Assign reviewer ownership for all high-sensitivity outputs.',
    ],
    requiredChange: 'Low disruption to org design; moderate process discipline required.',
  },
  {
    id: 'hybrid-strategy',
    title: 'Hybrid Workflow Redesign',
    mode: 'hybrid',
    summary:
      'Redesign selected workflow slices around automate-with-review subflows and explicit control points.',
    coverageLabel: 'Some automation',
    recommendedAutomation: {
      'intake-request': 'assist-only',
      'source-collection': 'automate-with-review',
      'process-decomposition': 'automate-with-review',
      'tooling-readiness': 'automate-with-review',
      'baseline-scoring': 'automate-with-review',
      'scenario-design': 'assist-only',
      'simulation-pass': 'automate-with-review',
      'brief-drafting': 'automate-with-review',
      'stakeholder-review': 'do-not-automate',
      'pilot-handoff': 'assist-only',
    },
    risks: [
      'Requires tighter governance and escalation definition.',
      'Initial implementation complexity is higher than copilot mode.',
    ],
    prerequisites: [
      'Publish approval gates and exception handling policy.',
      'Normalize MCP imports for docs, tracker, and filesystem context.',
      'Define scenario-level success and rollback criteria.',
    ],
    requiredChange: 'Medium disruption with structured operating model updates.',
  },
  {
    id: 'agentic-strategy',
    title: 'Agentic Service Pipeline',
    mode: 'agentic',
    summary:
      'Shift most stable workflow nodes to automate-by-default with human governance of exceptions and approvals.',
    coverageLabel: 'Near-full automation',
    recommendedAutomation: {
      'intake-request': 'assist-only',
      'source-collection': 'automate-by-default',
      'process-decomposition': 'automate-with-review',
      'tooling-readiness': 'automate-by-default',
      'baseline-scoring': 'automate-by-default',
      'scenario-design': 'automate-with-review',
      'simulation-pass': 'automate-by-default',
      'brief-drafting': 'automate-by-default',
      'stakeholder-review': 'do-not-automate',
      'pilot-handoff': 'automate-with-review',
    },
    risks: [
      'Higher sensitivity to process instability and upstream data quality.',
      'Operational failure modes widen without strong fallback plans.',
    ],
    prerequisites: [
      'Production-grade exception routing and observability.',
      'Clear policy boundaries for automated decisions.',
      'Reliable MCP connectors and contract-tested payload normalization.',
    ],
    requiredChange: 'High disruption; requires explicit governance and resilience design.',
  },
]

export const demoSelectedStrategyId = 'hybrid-strategy'

export const demoMcpImportSamples: SampleMcpImportInput = {
  filesystem: [
    {
      path: '/ops/workflows/client-insight/sop.md',
      content:
        'Current SOP defines intake, decomposition, scoring, and stakeholder review flow for weekly client insight reports.',
      tags: ['sop', 'workflow'],
    },
    {
      path: '/ops/prompts/brief-template.md',
      content:
        'Template enforces sections for current state, options, recommendation, risks, and 90-day roadmap.',
      tags: ['prompt', 'template'],
    },
  ],
  docs: [
    {
      docId: 'DOC-142',
      title: 'Quality Review Rubric',
      excerpt:
        'All client-facing briefs must validate source evidence, confidence level, and reviewer sign-off.',
      url: 'https://docs.internal/quality-rubric',
      tags: ['quality', 'review'],
    },
    {
      docId: 'DOC-188',
      title: 'MCP Connector Guidelines',
      excerpt:
        'Connector implementations should normalize payloads into stable fields before scenario analysis.',
      url: 'https://docs.internal/mcp-guidelines',
      tags: ['mcp', 'integration'],
    },
  ],
  tracker: [
    {
      key: 'OPS-118',
      title: 'Automate baseline scoring rollups',
      description:
        'Implement deterministic scoring pipeline that updates cycle time, effort, and review burden snapshots weekly.',
      status: 'In Progress',
      priority: 'High',
      assignee: 'AI Engineer',
      labels: ['automation', 'metrics'],
      url: 'https://tracker.internal/OPS-118',
    },
    {
      key: 'OPS-126',
      title: 'Add exception routing for scenario simulation',
      description:
        'Add error sensitivity-based routing for high-risk steps and escalation ownership in roadmap outputs.',
      status: 'Todo',
      priority: 'Medium',
      assignee: 'Program Manager',
      labels: ['governance', 'risk'],
      url: 'https://tracker.internal/OPS-126',
    },
  ],
}

export const demoWorkflowContextBundle: WorkflowContextBundle = {
  organization: demoOrganization,
  workflow: demoWorkflow,
  assets: demoAssets,
  baseline: demoBaseline,
  bottlenecks: demoBottlenecks,
}
