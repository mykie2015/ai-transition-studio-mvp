import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { buildDefaultAgileWorkflow } from './lib/defaultWorkflow'
import { buildWorkflowBundleTemplate } from './lib/workflowBundle'
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
    const user = userEvent.setup()

    render(<App />)

    const file = new File(
      [
        buildWorkflowBundleTemplate()
          .replace('[WORKFLOW_NAME]', 'Agile Story Delivery')
          .replace(
            '[REPO_DOCS_SUMMARY]',
            'README and CONTRIBUTING require TDD and validation gates.',
          )
          .replace(
            '[TRACKER_EXPORT_SUMMARY]',
            'Story points: 5. Scope approved in Jira. Raise PR after tests and lint.',
          )
          .replace('[TOOL_MANIFEST_SUMMARY]', 'Codex, Vitest, ESLint, TypeScript, GitHub.')
          .replace('[REVIEW_POLICY]', 'Critical and medium review findings must be fixed before merge.')
          .replace('[VALIDATION_POLICY]', 'Run test, lint, typecheck, and build before opening PR.')
          .replace('[OPERATOR_NOTES]', 'Use the agile story delivery default flow.'),
      ],
      'workflow-bundle.md',
      { type: 'text/markdown' },
    )

    await user.upload(screen.getByLabelText(/upload completed bundle/i), file)
    expect(await screen.findByText(/review extracted sections/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /confirm and generate draft/i }))

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
              type: 'review-artifact',
              content: 'Critical and medium review findings must be fixed before merge.',
            }),
          ]),
        }),
      ),
    )
    expect(await screen.findByRole('heading', { name: /review queue/i })).toBeInTheDocument()
    expect(await screen.findAllByText(/capture jira story scope/i)).not.toHaveLength(0)
  })
})
