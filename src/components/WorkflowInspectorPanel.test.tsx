import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { buildDefaultAgileWorkflow } from '../lib/defaultWorkflow'
import WorkflowInspectorPanel from './WorkflowInspectorPanel'

describe('WorkflowInspectorPanel', () => {
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
    expect(screen.getByText(/Passing test, lint, typecheck, and build evidence/i)).toBeInTheDocument()
  })
})
