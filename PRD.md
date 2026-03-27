# AI Transition Studio MVP PRD v2

## 1. Reframed Product

### Working Positioning
AI Transition Studio is not just an AI maturity quiz. It is an MCP-first workflow analysis and transition design tool.

### One-Line Pitch
A web tool that ingests an organization's current workflow and agentic AI setup, visualizes how work actually moves, and simulates multiple AI automation strategies before a team commits to change.

### Why This Version Exists
The earlier MVP focused on diagnosis and strategy generation. That is useful, but too shallow for teams that already experimented with:

- Claude or OpenCode usage
- skills and prompt libraries
- MCP servers and tool bridges
- RAG pipelines
- internal AI copilots or agents

These teams no longer need a generic "should we use AI?" tool. They need a system that answers:

- what is our current workflow shape
- where exactly are the manual bottlenecks
- which parts are good candidates for partial, hybrid, or full AI automation
- what strategy creates the best output-input leverage with acceptable risk

## 2. Core Product Thesis

AI transition fails when organizations optimize the model layer while leaving the workflow layer implicit.

This product makes the workflow explicit, scores its readiness, visualizes current and future operating states, and simulates automation strategies using the team's real process structure and tool environment.

## 3. Product Goal

In one working session, help a user:

1. map the current workflow and process dependencies
2. import or describe the current AI stack, including MCP, skills, and RAG assets
3. identify which workflow steps are manual, AI-assisted, AI-ready, or blocked
4. simulate several automation strategies
5. compare partial, some, and near-full automation coverage
6. generate a transition strategy and shareable brief

## 4. Primary Users

### Primary ICP

- operators, founders, or consultants already experimenting with agentic AI
- teams that have AI assets already but no unified view of workflow impact
- internal transformation leads who need something more operational than a maturity survey

### Example User

An operator says:

"We already tried Claude, OpenCode, RAG, skills, and MCP-based tools. The problem is not whether AI works. The problem is that we do not know how much of the workflow should be automated, in what order, and with what risk."

## 5. Jobs To Be Done

- "Show me the current process, not just a score."
- "Help me see which steps can be partially automated versus fully automated."
- "Model several strategies before we rebuild the workflow."
- "Use our actual AI stack and tool access as part of the analysis."
- "Give me a clear output-input leverage view so we can choose a sane pilot."

## 6. MVP Scope

### In Scope

- web-based workflow/process analysis experience
- manual workflow mapping and editable process graph
- MCP-assisted import of relevant process context
- current-state workflow visualization
- scoring across workflow readiness, organizational clarity, interface readiness, and business leverage
- what-if simulation for multiple automation coverage strategies
- side-by-side comparison of at least three automation strategies
- shareable recommendation brief

### Explicit MVP Capabilities

- analyze one target workflow at a time
- show current state and future-state variants
- support partial, hybrid, and high-automation strategies
- expose assumptions behind recommendations
- model review gates and exception handling

### Out of Scope

- full enterprise process mining
- production-grade orchestration deployment
- automatic execution of business workflows from the browser
- universal connector coverage for every enterprise tool
- hard financial forecasting with accounting-grade precision

## 7. Product Principles

- Workflow first, model second.
- Visualization is not decoration. It is the product.
- Strategy must be comparable, not singular.
- AI automation must be shown as degrees of coverage, not a binary yes/no.
- All recommendations must reveal tradeoffs in throughput, quality, control, and complexity.

## 8. Core Product Objects

The MVP should revolve around these objects:

### Workflow

A sequence or graph of steps representing how work currently gets done.

Each step should support:

- name
- role owner
- input
- output
- tools used
- current mode: manual, AI-assisted, AI-automated
- error sensitivity
- review requirement
- estimated effort
- estimated output volume or throughput contribution

### AI Asset

Represents the current AI capabilities already available.

Examples:

- skill library
- MCP server
- prompt template
- agent flow
- RAG knowledge source
- internal API or CLI tool

### Strategy Scenario

A modeled future-state approach that changes automation coverage across workflow steps.

Examples:

- conservative copilot
- hybrid workflow redesign
- aggressive agentic pipeline

### Metric Set

The operating metrics used to compare scenarios.

## 9. Inputs

### A. Organization Context

- organization name
- industry
- function being analyzed
- team size
- current pain statement
- target outcome

### B. Workflow Inputs

Users can define or import:

- process steps
- decision points
- handoffs
- review gates
- tools used in each step
- known bottlenecks

### C. AI Stack Inputs

The MVP should capture:

- existing models used
- skills/prompts already in use
- MCP servers available
- RAG sources available
- tool access already wired
- current AI automation experiments

### D. Baseline Metrics

At minimum:

- current human effort per unit of work
- current cycle time
- current output volume
- current quality consistency or error rate
- current review burden

## 10. MCP Role In The MVP

MCP is not a side feature. It is a key analysis layer.

### MCP Use In MVP

The product should use MCP to pull structured context for process analysis, such as:

- workflow documents
- SOPs
- prompt or skill definitions
- MCP server manifests
- tool inventories
- existing RAG source metadata
- selected issue or task data when relevant

### MVP Constraint

The MVP does not need every connector. It needs a clean MCP contract and a few reference integrations.

### Recommended MVP MCP Coverage

- local filesystem or repo-based ingestion
- one documentation source
- one work-tracking or source-of-truth source

The goal is not breadth. The goal is proving that MCP-assisted process analysis is materially better than manual input alone.

## 11. Visualization Requirements

Visualization is central to the product value.

### Required Views

#### Current-State Workflow Map

Shows:

- process steps
- owners
- handoffs
- review gates
- AI touchpoints
- blocked or weakly-defined nodes

#### Automation Coverage Overlay

Lets the user see what changes under different strategies:

- partial automation
- some automation
- near-full automation

#### Strategy Comparison View

Shows at least three strategy cards side by side with key metrics and risks.

#### Metric Impact View

Shows estimated shifts in:

- cycle time
- human effort
- review burden
- quality risk
- output-input leverage

### Visual Tone

This should feel like a serious operating model tool, not a playful flowchart toy.

## 12. What-If Analysis

This is one of the defining MVP features.

### Core User Question

"If we automate only some of this workflow instead of all of it, what changes?"

### Required Scenario Levels

- Partial automation
  AI assists specific steps, but humans remain primary owners.

- Some automation
  AI handles selected subflows with human review at control points.

- Near-full automation
  AI handles most of the flow, with humans governing exceptions and approvals.

### Optional Per-Step Control

Each workflow step can be marked as:

- do not automate
- assist only
- automate with review
- automate by default

## 13. Output-Input Leverage Model

I am treating your "output/input rate" request as an `output-input leverage` model.

This should be one of the main comparison metrics in the MVP.

### Definition

Output-input leverage estimates how much useful output the workflow produces relative to the human and system input required to produce it.

### Simplified MVP Formula

The product can model leverage using a heuristic score based on:

- output volume
- output depth or richness
- output quality confidence
- human effort
- coordination overhead
- review overhead

### Why This Matters

Many AI projects reduce manual effort but also reduce trust or quality. Others increase output volume but create massive review burden. The leverage model should make these tradeoffs visible.

## 14. Strategy Modes To Compare

The MVP should generate and compare at least three strategy archetypes.

### 1. Copilot Strategy

- keep existing workflow mostly intact
- insert AI help into authoring, summarization, or retrieval steps
- lowest organizational disruption
- lower upside

### 2. Hybrid Workflow Strategy

- redesign the workflow around explicit AI-managed substeps
- add review gates and standard output formats
- medium disruption
- usually the most realistic first pilot

### 3. Agentic Service Strategy

- turn most of the workflow into an orchestrated AI-first pipeline
- humans govern exceptions, approvals, and quality control
- highest implementation complexity
- highest upside if the process is stable enough

## 15. Diagnostic Framework

The existing four dimensions remain, but they now apply to workflow analysis rather than a generic maturity survey.

### 1. Workflow Readiness

- Is the workflow decomposed into explicit steps and decision points?
- Are inputs and outputs clear?
- Are context sources identifiable?

### 2. Organization Readiness

- Are ownership, review gates, and escalation paths clear?
- Can humans govern exceptions?
- Is there a real process owner?

### 3. Interface Readiness

- Can end users interact through simple triggers instead of promptcraft?
- Can outputs be standardized?
- Is feedback captured?

### 4. Business Leverage

- Is there a meaningful business outcome?
- Can value be measured?
- Does automation increase output-input leverage?

## 16. Core Outputs

The report should include:

### A. Current-State Diagnosis

- maturity stage
- bottleneck dimension
- leverage point
- current workflow map summary

### B. Strategy Comparison

For each strategy:

- automation coverage level
- expected impact
- risk level
- required organizational change
- required MCP and tool support

### C. Recommended Pilot

- best-fit strategy
- target workflow slice
- why this is the right first move

### D. Transition Roadmap

- 0-30 days
- 31-60 days
- 61-90 days

### E. Shareable Brief

A markdown output that includes:

- current state
- future-state options
- chosen strategy
- KPI stack
- risk notes
- implementation prerequisites

## 17. MVP Screens

### 1. Landing and Context

Short framing and workflow selection.

### 2. Workflow Capture

Manual process entry plus optional MCP import.

### 3. Current-State Visualization

Interactive process view showing human and AI work allocation.

### 4. Scenario Simulator

Controls for automation coverage and strategy selection.

### 5. Results and Recommendation

Comparison table, recommended path, and exportable brief.

## 18. Functional Requirements

### Workflow Modeling

- users can add, edit, and reorder workflow steps
- users can assign owner, tools, effort, and review requirements to each step
- users can mark current automation state per step

### MCP-Assisted Context Ingestion

- users can trigger an MCP import flow
- the app can ingest structured workflow-relevant artifacts
- imported artifacts can be translated into workflow nodes or supporting context

### Visualization

- app renders a current-state workflow graph
- app renders automation overlays for future-state scenarios
- app distinguishes manual, assisted, and automated steps visually

### Scenario Simulation

- users can compare at least three automation strategies
- users can adjust step-level automation levels
- the app recalculates projected metrics in real time

### Recommendation Output

- app recommends one strategy as the default first move
- app explains why that strategy wins
- app outputs a markdown brief suitable for sharing

## 19. Non-Functional Requirements

- must feel responsive during workflow editing and simulation
- must work well on desktop first
- must be visually credible in client or leadership settings
- must expose assumptions clearly enough that users do not treat the output as magic

## 20. Revised MVP Architecture

The original static-only approach is now too limited.

### Recommended Build Shape

- web frontend for workflow editing, visualization, and simulation
- lightweight backend or local companion service
- MCP integration layer or bridge
- deterministic scoring and scenario engine
- optional LLM layer for narrative refinement only

### Why

If MCP-assisted analysis is part of the MVP, the product needs a place to coordinate imports, normalize artifacts, and feed the scenario engine.

## 21. Success Metrics

### Product Success

- user can map one real workflow in under 20 minutes
- user can compare three automation strategies in one session
- user can identify a preferred transition strategy with explicit tradeoffs
- user can export a credible brief for internal alignment

### Quality Signals

- users accept the workflow map as directionally accurate
- users believe the strategy comparison is useful, not generic
- users change their automation plan after seeing the simulation

## 22. Risks

- the MVP may become too broad if workflow capture is over-engineered
- MCP ingestion may introduce noisy or inconsistent context
- scenario math may feel arbitrary if assumptions are hidden
- visualization may look impressive but fail to drive decisions
- users may expect the tool to be a complete process mining platform

## 23. Recommended Cut For A Realistic MVP

To keep this buildable, the first release should focus on:

- one workflow at a time
- one workflow map view
- one scenario simulator
- three strategy archetypes
- two or three MCP reference integrations
- markdown export

That is enough to validate the real question:

Can this tool help advanced AI adopters choose how far to automate, and in what sequence, with more confidence than a normal consulting memo?

## 24. Acceptance Criteria

The MVP is complete when:

- a user can model a real workflow with at least 8-15 steps
- the app can incorporate some MCP-provided context into the analysis
- the app can visualize current and future automation states
- the app can compare at least three strategies
- the app can show output-input leverage differences between those strategies
- the app can produce a brief strong enough to drive a real planning discussion
