import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { buildDefaultAgileWorkflow } from '../lib/defaultWorkflow'
import WorkflowCanvas from './WorkflowCanvas'

describe('WorkflowCanvas', () => {
  it('renders the validation and review loop labels', () => {
    render(<WorkflowCanvas draft={buildDefaultAgileWorkflow()} />)

    expect(screen.getByText(/validation gate/i)).toBeInTheDocument()
    expect(screen.getByText(/rework loop/i)).toBeInTheDocument()
  })
})
