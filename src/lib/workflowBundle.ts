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

const sectionDefinitions = [
  { key: 'workflowName', heading: '## Workflow Name' },
  { key: 'repoDocs', heading: '## Repo Docs Summary' },
  { key: 'trackerExport', heading: '## Tracker Export Summary' },
  { key: 'toolManifest', heading: '## Tool Manifest Summary' },
  { key: 'reviewPolicy', heading: '## Review Policy' },
  { key: 'validationPolicy', heading: '## Validation Policy' },
  { key: 'operatorNotes', heading: '## Operator Notes' },
] as const

export function buildWorkflowBundleTemplate(): string {
  return `# AI Transition Studio Workflow Bundle

Fill every section below, keep the section headings unchanged, then upload this file back into the app.

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

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const normalizeSectionValue = (value: string): string => {
  const trimmed = value.trim()
  return /^\[[A-Z0-9_]+\]$/.test(trimmed) ? '' : trimmed
}

export function parseWorkflowBundleTemplate(source: string): ParsedWorkflowBundle {
  const content = source.trim()

  if (!content.startsWith('# AI Transition Studio Workflow Bundle')) {
    throw new Error('Missing required section: # AI Transition Studio Workflow Bundle')
  }

  const extracted = sectionDefinitions.reduce<Record<string, string>>((result, section, index) => {
    const nextHeading = sectionDefinitions[index + 1]?.heading
    const pattern = nextHeading
      ? `${escapeRegExp(section.heading)}\\s*\\n([\\s\\S]*?)\\n(?=${escapeRegExp(nextHeading)})`
      : `${escapeRegExp(section.heading)}\\s*\\n([\\s\\S]*)$`
    const match = content.match(new RegExp(pattern))

    if (!match) {
      throw new Error(`Missing required section: ${section.heading}`)
    }

    result[section.key] = normalizeSectionValue(match[1] ?? '')
    return result
  }, {})

  return {
    workflowName: extracted.workflowName,
    sections: {
      repoDocs: extracted.repoDocs,
      trackerExport: extracted.trackerExport,
      toolManifest: extracted.toolManifest,
      reviewPolicy: extracted.reviewPolicy,
      validationPolicy: extracted.validationPolicy,
      operatorNotes: extracted.operatorNotes,
    },
  }
}
