import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { buildDefaultAgileWorkflow } from './lib/defaultWorkflow'
import App from './App'

vi.mock('./lib/api', () => ({
  createAnalysisDraft: vi.fn(async () => ({
    ok: true,
    draft: buildDefaultAgileWorkflow(),
  })),
}))

describe('App', () => {
  it('moves from evidence intake into guided review', async () => {
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: /generate draft/i }))

    expect(await screen.findByRole('heading', { name: /review queue/i })).toBeInTheDocument()
    expect(screen.getByText(/capture jira story scope/i)).toBeInTheDocument()
  })
})
