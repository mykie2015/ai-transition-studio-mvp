import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { buildWorkflowBundleTemplate } from '../lib/workflowBundle'
import EvidenceIntake from './EvidenceIntake'

describe('EvidenceIntake', () => {
  it('parses an uploaded template file and waits for confirmation before generating', async () => {
    const onGenerateDraft = vi.fn()
    const user = userEvent.setup()

    render(<EvidenceIntake artifacts={[]} status="idle" onGenerateDraft={onGenerateDraft} />)

    const file = new File(
      [
        buildWorkflowBundleTemplate()
          .replace('[WORKFLOW_NAME]', 'Agile Story Delivery')
          .replace('[REPO_DOCS_SUMMARY]', 'README summary')
          .replace('[TRACKER_EXPORT_SUMMARY]', 'Story points: 5')
          .replace('[TOOL_MANIFEST_SUMMARY]', 'Codex manifest')
          .replace('[REVIEW_POLICY]', 'Fix medium findings')
          .replace('[VALIDATION_POLICY]', 'Run test lint typecheck build')
          .replace('[OPERATOR_NOTES]', 'Operator note'),
      ],
      'workflow-bundle.md',
      { type: 'text/markdown' },
    )

    await user.upload(screen.getByLabelText(/upload completed bundle/i), file)

    expect(await screen.findByText(/review extracted sections/i)).toBeInTheDocument()
    expect(onGenerateDraft).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /confirm and generate draft/i }))

    expect(onGenerateDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        workflowName: 'Agile Story Delivery',
        sections: expect.objectContaining({
          trackerExport: 'Story points: 5',
        }),
      }),
    )
  })
})
