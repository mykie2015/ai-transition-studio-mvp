# Workflow Canvas-First Layout Design

## Context

The current `Review` and `Scenarios` stages render the workflow graph as a secondary card inside a dashboard grid. The result is visually upside down: KPI cards, queue cards, and side summaries dominate the page while the actual workflow visualization feels small and incidental.

The product intent is the opposite. The drafted workflow should read as the primary object the user reviews, edits mentally, and compares across automation scenarios. Supporting metrics, traceability, and review controls should stay visible, but they should not compete with the graph for space.

## Goal

Make the workflow view canvas-first:

- the workflow graph owns the main visual space
- supporting metrics move into a compact right rail
- supporting detail moves into a bottom band
- the layout works for both `Review` and `Scenarios`
- the canvas remains a read-first draft visualization, not a full node editor

## Non-Goals

- building a true n8n-style workflow editor with drag-to-edit authoring
- adding persistence for node selection or custom layout positions
- changing the analysis pipeline, scenario math, or backend contract
- redesigning the `Evidence` and `Brief` stages beyond what is needed for consistency

## User Experience

### Review Stage

The `Review` stage becomes a visual workspace with three zones:

1. `Canvas stage`
   A large workflow canvas fills most of the page width and becomes the first thing the eye lands on.

2. `Right rail`
   A narrow rail stays visible beside the canvas and shows compact operational context:
   - compact KPI strip: `Story Points`, `Cycle / Point`, `Cost / Point`
   - `Review Queue`
   - `Traceability`
   - `Bottlenecks`
   - `Recommended Pilot`

3. `Bottom detail band`
   A hybrid inspector supports the workflow review process:
   - fixed panel: review summary and queue context
   - interactive inspector: selected node or edge details

### Scenarios Stage

The `Scenarios` stage keeps the same spatial hierarchy:

- same large top canvas
- same compact right rail
- bottom band shifts emphasis toward scenario interpretation rather than queue triage
- `ScenarioSimulator` becomes part of the bottom area instead of pushing the canvas downward

This keeps the visual model stable while the supporting panels change by stage.

## Layout Architecture

### Desktop

For `Review` and `Scenarios`, use a stage-local layout rather than relying on the shell's generic two-column dashboard split.

Structure:

- `top header`
  The existing shell header and stage rail stay unchanged.

- `hero stats`
  Hero stats remain, but they should be visually compressed so they do not dominate the first screenful.

- `workspace`
  The stage content becomes:
  - `canvas row`
    - main canvas region: `minmax(0, 1fr)`
    - right rail: `320px` to `360px`
  - `detail row`
    - fixed review/evidence panel
    - click-driven inspector panel

Recommended proportions:

- canvas row gets most of the vertical space
- workflow canvas target height: `68vh` on desktop, with a `min-height` of `560px`
- right rail remains scrollable inside its own column if content grows
- detail row uses two equal or slightly asymmetric columns

### Mobile / Narrow Width

On smaller screens:

- stack the canvas first
- move the right rail below the canvas
- stack the bottom detail panels vertically
- preserve canvas priority by keeping it above all supporting content

The canvas height should reduce appropriately, but still remain the dominant block in the stage.

## Component Changes

### `StudioShell`

Keep `StudioShell` responsible for:

- header
- stage rail
- hero stats
- page frame

Reduce the default visual weight of the shell around the main stage so stage-specific layouts can own the page.

Do not force every stage into the same `main + aside` dashboard ratio. `Review` and `Scenarios` need a wider main stage than `Evidence` and `Brief`.

### `WorkflowCanvas`

`WorkflowCanvas` becomes the primary stage element.

Required changes:

- larger frame and more generous spacing
- stronger background and border treatment
- graph occupies most of the component height
- legend and details move out of the canvas component into the bottom band

The component should expose selection events:

- `onSelectStep(stepId)`
- `onSelectEdge(edgeId)`
- `selectedStepId`
- `selectedEdgeId`

This keeps the graph visual while the inspector logic lives outside it.

### Right Rail

Create a compact rail component or stage-local composition that groups:

- compact metric cards
- queue summary
- traceability summary
- bottlenecks
- recommended pilot

The rail should be denser and quieter than the main canvas. It is supporting context, not the headline.

### Bottom Detail Band

Create two panels:

1. `ReviewSummaryPanel`
   Fixed content, always visible.
   It summarizes:
   - current queue priorities
   - why the workflow still needs review
   - the highest-confidence / lowest-confidence evidence signals

2. `WorkflowInspectorPanel`
   Interactive content driven by current selection.

For a selected step, show:

- step name
- owner
- input / output
- tools
- automation mode
- review required / validation required
- effort hours
- story point context
- evidence links
- automation opportunity, if present

For a selected edge, show:

- source and target
- handoff type
- label
- why the handoff matters
- related trace links when available

If nothing is selected, show a default guidance state telling the user to click a step or edge.

### Stage Composition

`App.tsx` should use stage-specific composition:

- `Evidence`: keep current intake-focused layout
- `Review`: canvas-first workspace
- `Scenarios`: canvas-first workspace with simulator integrated into the lower band
- `Brief`: keep current output-first layout

This avoids over-generalizing very different stages into one layout pattern.

## Interaction Model

### Selection

The graph supports lightweight selection only:

- click node -> select step
- click edge -> select edge
- selection updates inspector panel
- selected item gets a visible highlight in the graph

No drag editing, no inline label editing, no connection editing.

### Review Queue Relationship

The right-rail queue remains visible even when an item is selected in the graph.

The fixed review panel in the bottom row should help the user connect:

- what still needs confirmation
- which step is affected
- which evidence links support or weaken that inference

### Scenario Relationship

In the `Scenarios` stage, the lower area should visually connect strategy comparison to the same workflow graph rather than looking like a separate dashboard. The simulator remains important, but it becomes subordinate to the canvas.

## Visual Direction

The new layout should feel more like a workflow studio and less like a KPI dashboard.

Guidelines:

- minimize the height and visual aggression of stat cards
- increase the canvas frame size significantly
- keep the right rail narrow and information-dense
- move verbose legends out of the canvas
- use spacing and contrast to make the graph the obvious focal point

The graph area should feel intentional and central, even though it is still a draft visualization rather than a production node editor.

## Data Flow

No backend changes are required.

Client-side state additions:

- selected step id
- selected edge id
- helper selector for current inspector content
- optional derived view model for step detail and edge detail

Existing analysis draft data already contains what the inspector needs:

- steps
- edges
- review queue
- bottlenecks
- trace links
- automation candidates

## Error Handling

The redesign must handle incomplete or sparse draft data cleanly.

Cases:

- no selection
  show empty-state guidance in the inspector

- missing trace links for a selected item
  show a neutral "no direct evidence link recorded" message

- stage without a generated draft
  keep current guards and never render the workspace

- mobile overflow
  ensure the canvas does not clip surrounding panels or become unusable

## Testing

Required coverage:

- stage renders canvas-first layout in `Review`
- stage renders canvas-first layout in `Scenarios`
- selecting a node updates the inspector
- no-selection state renders correctly
- right rail still shows review queue and traceability
- responsive layout classes do not collapse the canvas below supporting panels unexpectedly

Test levels:

- component tests for `WorkflowCanvas` selection callbacks
- component tests for new inspector and review summary panels
- app-level test for `Generate Draft -> Review stage -> canvas-first content visible`

## Implementation Notes

- prefer stage-local layout wrappers instead of expanding the generic shell abstraction too far
- keep new React state minimal and derived where possible
- avoid unnecessary memoization; use straightforward derived render state unless profiling suggests otherwise
- preserve current backend contracts and current scenario calculations

## Acceptance Criteria

- the `Workflow Canvas` is the largest and most visually dominant element in `Review`
- the `Workflow Canvas` is also visually dominant in `Scenarios`
- right rail contains compact KPIs plus review/traceability context
- bottom band contains one fixed panel and one interactive inspector panel
- clicking a step or edge updates the interactive inspector
- no n8n-style editing behaviors are introduced
- the layout remains usable on narrow screens
