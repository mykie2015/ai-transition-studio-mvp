# AI Transition Studio Workflow Bundle

Fill every section below, keep the section headings unchanged, then upload this file back into the app.

## Workflow Name
Agile Story Delivery

## Repo Docs Summary
README and CONTRIBUTING require TDD, passing validation gates, and explicit PR evidence before merge.

## Tracker Export Summary
Jira story starts from scoped requirements and story points. Engineers implement through TDD, validate test/lint/typecheck/build, then raise a PR for review and remediation of critical and medium issues before merge.

## Tool Manifest Summary
Jira, Codex, editor, Vitest, ESLint, TypeScript, Vite, GitHub pull requests, and Codex PR review are available in the current delivery loop.

## Review Policy
Pull requests must be reviewed after validation passes. Codex PR review plus human review can surface findings, and all critical and medium issues must be fixed before merge approval.

## Validation Policy
After coding, run targeted tests during TDD and finish with full test, lint, typecheck, and build checks before the pull request is opened or updated for final review.

## Operator Notes
Use story points as the speed and cost baseline. Keep the workflow human-guided at review checkpoints while drafting automation candidates from the evidence.
