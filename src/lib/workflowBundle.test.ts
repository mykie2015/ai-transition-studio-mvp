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
      .replace(
        '[REPO_DOCS_SUMMARY]',
        'README and CONTRIBUTING require TDD and validation gates.',
      )
      .replace(
        '[TRACKER_EXPORT_SUMMARY]',
        'JIRA-902 | Story points: 5 | Acceptance criteria agreed.',
      )
      .replace('[TOOL_MANIFEST_SUMMARY]', 'Codex, Vitest, ESLint, TypeScript, GitHub.')
      .replace('[REVIEW_POLICY]', 'Critical and medium issues must be fixed before merge.')
      .replace(
        '[VALIDATION_POLICY]',
        'Run test, lint, typecheck, and build before opening PR.',
      )
      .replace('[OPERATOR_NOTES]', 'Use the agile story delivery default flow.')

    const parsed = parseWorkflowBundleTemplate(filled)

    expect(parsed.workflowName).toBe('Agile Story Delivery')
    expect(parsed.sections.trackerExport).toContain('Story points: 5')
    expect(parsed.sections.reviewPolicy).toContain(
      'Critical and medium issues must be fixed before merge.',
    )
  })

  it('rejects malformed template content', () => {
    expect(() => parseWorkflowBundleTemplate('# random note')).toThrow(
      /missing required section/i,
    )
  })
})
