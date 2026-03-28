import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { buildDefaultAgileWorkflow } from '../lib/defaultWorkflow'
import WorkflowCanvas from './WorkflowCanvas'

describe('WorkflowCanvas', () => {
  it('emits step selection when a node is clicked', async () => {
    const onSelectStep = vi.fn()
    const onSelectEdge = vi.fn()
    const user = userEvent.setup()

    render(
      <WorkflowCanvas
        draft={buildDefaultAgileWorkflow()}
        selectedStepId={null}
        selectedEdgeId={null}
        onSelectStep={onSelectStep}
        onSelectEdge={onSelectEdge}
      />,
    )

    await user.click(screen.getByRole('button', { name: /capture jira story scope/i }))

    expect(onSelectStep).toHaveBeenCalledWith('jira-scope')
    expect(onSelectEdge).not.toHaveBeenCalled()
  })
})
