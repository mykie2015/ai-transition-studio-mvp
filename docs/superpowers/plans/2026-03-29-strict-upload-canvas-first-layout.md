# Strict Upload And Canvas-First Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace freeform evidence entry with a single strict uploaded template flow, then redesign the `Review` and `Scenarios` stages so the workflow canvas owns the page and the supporting context moves into a right rail plus lower inspector band.

**Architecture:** Keep the existing Vite + React client and Express draft-generation API. Add a strict markdown template generator/parser on the client, feed reviewed extracted sections into the existing analysis draft endpoint, and refactor the stage layout so `StudioShell` provides the outer frame while `App.tsx` owns stage-specific workspace composition. Extend `WorkflowCanvas` with selection events and move queue/trace/detail content into dedicated side and bottom panels.

**Tech Stack:** React 19, TypeScript, Vite, Express, Vitest, Testing Library, React Flow

---

### Task 1: Strict Bundle Template And Parser

**Files:**
- Create: `src/lib/workflowBundle.ts`
- Test: `src/lib/workflowBundle.test.ts`
- Modify: `src/types/studio.ts`

- [ ] **Step 1: Write the failing parser tests**

```ts
import { describe, expect, it } from 'vitest'
import {
  buildWorkflowBundleTemplate,
  parseWorkflowBundleTemplate,
} from './workflowBundle'

describe('workflow bundle template', () => {
  it('parses a valid strict template file', () => {
    const template = buildWorkflowBundleTemplate()
    const filled = template
      .replace('[WORKFLOW_NAME]', 'Agile Story Delivery')
      .replace('[REPO_DOCS_SUMMARY]', 'README and CONTRIBUTING require TDD and validation gates.')
      .replace('[TRACKER_EXPORT_SUMMARY]', 'JIRA-902 | Story points: 5 | Acceptance criteria agreed.')
      .replace('[TOOL_MANIFEST_SUMMARY]', 'Codex, Vitest, ESLint, TypeScript, GitHub.')
      .replace('[REVIEW_POLICY]', 'Critical and medium issues must be fixed before merge.')
      .replace('[VALIDATION_POLICY]', 'Run test, lint, typecheck, and build before opening PR.')
      .replace('[OPERATOR_NOTES]', 'Use the agile story delivery default flow.')

    const parsed = parseWorkflowBundleTemplate(filled)

    expect(parsed.workflowName).toBe('Agile Story Delivery')
    expect(parsed.sections.trackerExport).toContain('Story points: 5')
    expect(parsed.sections.reviewPolicy).toContain('critical and medium')
  })

  it('rejects malformed template content', () => {
    expect(() => parseWorkflowBundleTemplate('# random note')).toThrow(
      /missing required section/i,
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/lib/workflowBundle.test.ts`
Expected: FAIL because `src/lib/workflowBundle.ts` does not exist yet

- [ ] **Step 3: Write the minimal template and parser**

```ts
export interface WorkflowBundleSections {
  repoDocs: string
  trackerExport: string
  toolManifest: string
  reviewPolicy: string
  validationPolicy: string
  operatorNotes: string
}

export interface ParsedWorkflowBundle {
  workflowName: string
  sections: WorkflowBundleSections
}

export function buildWorkflowBundleTemplate(): string {
  return `# AI Transition Studio Workflow Bundle

## Workflow Name
[WORKFLOW_NAME]

## Repo Docs Summary
[REPO_DOCS_SUMMARY]

## Tracker Export Summary
[TRACKER_EXPORT_SUMMARY]

## Tool Manifest Summary
[TOOL_MANIFEST_SUMMARY]

## Review Policy
[REVIEW_POLICY]

## Validation Policy
[VALIDATION_POLICY]

## Operator Notes
[OPERATOR_NOTES]
`
}
```

- [ ] **Step 4: Implement strict section extraction and required-field validation**

```ts
const requiredSections = [
  ['workflowName', '## Workflow Name'],
  ['repoDocs', '## Repo Docs Summary'],
  ['trackerExport', '## Tracker Export Summary'],
  ['toolManifest', '## Tool Manifest Summary'],
  ['reviewPolicy', '## Review Policy'],
  ['validationPolicy', '## Validation Policy'],
  ['operatorNotes', '## Operator Notes'],
] as const
```

- [ ] **Step 5: Run the parser test to verify it passes**

Run: `npm run test -- src/lib/workflowBundle.test.ts`
Expected: PASS

---

### Task 2: Upload-Review Evidence Intake Flow

**Files:**
- Modify: `src/components/EvidenceIntake.tsx`
- Modify: `src/components/EvidenceIntake.module.css`
- Modify: `src/hooks/useStudioState.ts`
- Modify: `src/App.test.tsx`
- Test: `src/components/EvidenceIntake.test.tsx`

- [ ] **Step 1: Write the failing intake tests**

```tsx
it('parses an uploaded template file and waits for confirmation before generating', async () => {
  const onGenerateDraft = vi.fn()
  render(<EvidenceIntake artifacts={[]} status="idle" onGenerateDraft={onGenerateDraft} />)

  const file = new File(
    [buildWorkflowBundleTemplate()
      .replace('[WORKFLOW_NAME]', 'Agile Story Delivery')
      .replace('[REPO_DOCS_SUMMARY]', 'README summary')
      .replace('[TRACKER_EXPORT_SUMMARY]', 'Story points: 5')
      .replace('[TOOL_MANIFEST_SUMMARY]', 'Codex manifest')
      .replace('[REVIEW_POLICY]', 'Fix medium findings')
      .replace('[VALIDATION_POLICY]', 'Run test lint typecheck build')
      .replace('[OPERATOR_NOTES]', 'Operator note')],
    'workflow-bundle.md',
    { type: 'text/markdown' },
  )

  await user.upload(screen.getByLabelText(/upload completed bundle/i), file)

  expect(screen.getByText(/review extracted sections/i)).toBeInTheDocument()
  expect(onGenerateDraft).not.toHaveBeenCalled()

  await user.click(screen.getByRole('button', { name: /confirm and generate draft/i }))

  expect(onGenerateDraft).toHaveBeenCalled()
})
```

- [ ] **Step 2: Run focused intake tests to verify RED**

Run: `npm run test -- src/components/EvidenceIntake.test.tsx src/App.test.tsx`
Expected: FAIL because upload parsing and confirmation flow do not exist yet

- [ ] **Step 3: Replace freeform intake with strict upload + extracted review**

```tsx
<button type="button" onClick={downloadTemplate}>Download Template</button>
<input
  type="file"
  accept=".md,text/markdown"
  aria-label="Upload completed bundle"
  onChange={(event) => void handleBundleFile(event.target.files?.[0] ?? null)}
/>
```

- [ ] **Step 4: Keep generation blocked until the user confirms parsed sections**

```ts
const [parsedBundle, setParsedBundle] = useState<ParsedWorkflowBundle | null>(null)
const [parseError, setParseError] = useState<string | null>(null)

const confirmBundle = () => {
  if (!parsedBundle) return
  onGenerateDraft({
    workflowName: parsedBundle.workflowName,
    sections: parsedBundle.sections,
  })
}
```

- [ ] **Step 5: Update studio state to map parsed sections into analysis artifacts**

```ts
const artifacts = [
  { id: 'artifact-repo-docs', type: 'repo-doc', title: 'Repo Docs Summary', content: input.sections.repoDocs },
  { id: 'artifact-tracker-export', type: 'tracker-export', title: 'Tracker Export Summary', content: input.sections.trackerExport },
  { id: 'artifact-tool-manifest', type: 'tool-manifest', title: 'Tool Manifest Summary', content: input.sections.toolManifest },
  { id: 'artifact-review-policy', type: 'review-artifact', title: 'Review Policy', content: input.sections.reviewPolicy },
  { id: 'artifact-validation-policy', type: 'validation-artifact', title: 'Validation Policy', content: input.sections.validationPolicy },
]
```

- [ ] **Step 6: Re-run intake tests to verify GREEN**

Run: `npm run test -- src/components/EvidenceIntake.test.tsx src/App.test.tsx`
Expected: PASS

---

### Task 3: Canvas-First Workspace And Selection State

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.css`
- Modify: `src/components/StudioShell.tsx`
- Modify: `src/components/StudioShell.module.css`
- Modify: `src/components/WorkflowCanvas.tsx`
- Modify: `src/components/WorkflowCanvas.module.css`
- Modify: `src/hooks/useStudioState.ts`
- Create: `src/components/WorkflowRightRail.tsx`
- Create: `src/components/WorkflowRightRail.module.css`
- Create: `src/components/ReviewSummaryPanel.tsx`
- Create: `src/components/ReviewSummaryPanel.module.css`
- Create: `src/components/WorkflowInspectorPanel.tsx`
- Create: `src/components/WorkflowInspectorPanel.module.css`
- Test: `src/components/WorkflowCanvas.test.tsx`
- Test: `src/components/WorkflowInspectorPanel.test.tsx`

- [ ] **Step 1: Write the failing canvas-selection and inspector tests**

```tsx
it('emits step selection when a node is clicked', async () => {
  const onSelectStep = vi.fn()
  render(<WorkflowCanvas draft={buildDefaultAgileWorkflow()} onSelectStep={onSelectStep} onSelectEdge={() => {}} />)

  await user.click(screen.getByText(/capture jira story scope/i))

  expect(onSelectStep).toHaveBeenCalledWith('jira-scope')
})
```

```tsx
it('shows selected step details in the inspector', () => {
  render(
    <WorkflowInspectorPanel
      draft={buildDefaultAgileWorkflow()}
      selectedStepId="validation-gate"
      selectedEdgeId={null}
    />,
  )

  expect(screen.getByText(/run validation gate/i)).toBeInTheDocument()
  expect(screen.getByText(/Vitest/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run focused component tests to verify RED**

Run: `npm run test -- src/components/WorkflowCanvas.test.tsx src/components/WorkflowInspectorPanel.test.tsx`
Expected: FAIL because selection callbacks and inspector component do not exist yet

- [ ] **Step 3: Add selection state to the studio hook**

```ts
const [selectedStepId, setSelectedStepId] = useState<string | null>(null)
const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
```

- [ ] **Step 4: Extend `WorkflowCanvas` to support click selection and visual focus**

```tsx
<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodeClick={(_, node) => onSelectStep(node.id)}
  onEdgeClick={(_, edge) => onSelectEdge(edge.id)}
  fitView
>
```

- [ ] **Step 5: Refactor `App.tsx` into stage-local layouts**

```tsx
<div className="app-canvasWorkspace">
  <div className="app-canvasRow">
    <WorkflowCanvas ... />
    <WorkflowRightRail ... />
  </div>
  <div className="app-detailRow">
    <ReviewSummaryPanel ... />
    <WorkflowInspectorPanel ... />
  </div>
</div>
```

- [ ] **Step 6: Compress shell stats and loosen shell framing so the stage layout owns the page**

Run: `npm run test -- src/components/WorkflowCanvas.test.tsx src/components/WorkflowInspectorPanel.test.tsx`
Expected: PASS

---

### Task 4: Scenario Lower Band, App Regression, And Full Verification

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.css`
- Modify: `src/App.test.tsx`
- Test: `src/components/ReviewQueue.test.tsx`

- [ ] **Step 1: Write the failing app regression test for the full flow**

```tsx
expect(await screen.findByRole('heading', { name: /workflow canvas/i })).toBeInTheDocument()
expect(screen.getByRole('button', { name: /confirm and generate draft/i })).not.toBeInTheDocument()
```

- [ ] **Step 2: Run the app test to verify RED if needed**

Run: `npm run test -- src/App.test.tsx`
Expected: FAIL until the upload-review flow and canvas-first layout are connected

- [ ] **Step 3: Integrate `ScenarioSimulator` into the `Scenarios` lower band beside the inspector**

```tsx
<div className="app-detailRow">
  <ScenarioSimulator ... />
  <WorkflowInspectorPanel ... />
</div>
```

- [ ] **Step 4: Re-run the app test to verify GREEN**

Run: `npm run test -- src/App.test.tsx`
Expected: PASS

- [ ] **Step 5: Run the full repo verification**

Run: `npm run test`
Expected: PASS

Run: `npm run lint`
Expected: PASS

Run: `npm run typecheck`
Expected: PASS

Run: `npm run build`
Expected: PASS

- [ ] **Step 6: Sync the session copy and reopen with Playwright**

Run:

```bash
rsync -a --delete --exclude '.git' --exclude 'node_modules' --exclude 'dist' \
  /Users/mykielee/.config/superpowers/worktrees/ai-transition-studio-mvp/evidence-draft-studio/ \
  /Users/mykielee/GitHub/my_projects/harness_engineering/sessions/transition-studio-mvp/20260328-075045-evidence-draft-studio/macbook-app/
```

Expected: session copy matches the implemented worktree

---

## Self-Review

### Spec Coverage

- strict single uploaded template file: covered by Tasks 1 and 2
- extracted-section review before generation: covered by Task 2
- canvas-first `Review` stage: covered by Task 3
- canvas-first `Scenarios` stage: covered by Task 4
- compact right rail: covered by Task 3
- hybrid bottom band with fixed panel + interactive inspector: covered by Task 3
- no n8n-style editing behavior: covered by Task 3 via selection-only `WorkflowCanvas`

### Placeholder Scan

- No `TBD`, `TODO`, or deferred implementation placeholders remain.

### Type Consistency

- `EvidenceDraftInput` is expected to carry parsed `sections`, not raw textarea artifacts.
- `WorkflowCanvas` exposes `onSelectStep`, `onSelectEdge`, `selectedStepId`, and `selectedEdgeId`.
- `WorkflowInspectorPanel` reads from `AnalysisDraft`, `selectedStepId`, and `selectedEdgeId`.
