import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { buildDefaultAgileWorkflow } from './lib/defaultWorkflow'
import App from './App'

const { createAnalysisDraftMock } = vi.hoisted(() => ({
  createAnalysisDraftMock: vi.fn(async () => ({
    ok: true,
    draft: buildDefaultAgileWorkflow(),
  })),
}))

vi.mock('./lib/api', () => ({
  createAnalysisDraft: createAnalysisDraftMock,
}))

describe('App', () => {
  it('moves from evidence intake into guided review', async () => {
    render(<App />)

    await userEvent.clear(screen.getByLabelText(/tracker export content/i))
    await userEvent.type(
      screen.getByLabelText(/tracker export content/i),
      'Story points: 5. Scope approved in Jira. Raise PR after tests and lint.',
    )
    await userEvent.type(
      screen.getByLabelText(/^notes$/i),
      'Critical and medium review findings must be fixed before merge.',
    )

    await userEvent.click(screen.getByRole('button', { name: /generate draft/i }))

    await waitFor(() =>
      expect(createAnalysisDraftMock).toHaveBeenCalledWith(
        expect.objectContaining({
          workflowName: 'Agile Story Delivery',
          artifacts: expect.arrayContaining([
            expect.objectContaining({
              type: 'tracker-export',
              content: 'Story points: 5. Scope approved in Jira. Raise PR after tests and lint.',
            }),
            expect.objectContaining({
              type: 'pasted-note',
              content: 'Critical and medium review findings must be fixed before merge.',
            }),
          ]),
        }),
      ),
    )
    expect(await screen.findByRole('heading', { name: /review queue/i })).toBeInTheDocument()
    expect(screen.getByText(/capture jira story scope/i)).toBeInTheDocument()
  })
})
