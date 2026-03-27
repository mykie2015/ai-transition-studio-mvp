import type { ArtifactSource, ImportedArtifact } from '../types/studio'

type UnknownRecord = Record<string, unknown>

export interface SampleMcpImportInput {
  filesystem?: unknown[]
  docs?: unknown[]
  tracker?: unknown[]
}

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const readString = (record: UnknownRecord, keys: string[]): string => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }
  return ''
}

const readStringArray = (record: UnknownRecord, keys: string[]): string[] => {
  for (const key of keys) {
    const value = record[key]
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string')
    }
  }
  return []
}

const collapseWhitespace = (value: string): string =>
  value.replace(/\s+/g, ' ').trim()

const summarize = (value: string, maxWords = 24): string => {
  const normalized = collapseWhitespace(value)
  if (!normalized) {
    return 'No summary provided.'
  }
  const words = normalized.split(' ')
  if (words.length <= maxWords) {
    return normalized
  }
  return `${words.slice(0, maxWords).join(' ')}...`
}

const stableHash = (value: string): string => {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

const artifactId = (source: ArtifactSource, seed: string): string =>
  `${source}-${stableHash(seed)}`

const normalizeFilesystemItem = (
  item: unknown,
  index: number,
): ImportedArtifact => {
  const record = isRecord(item) ? item : {}
  const path = readString(record, ['path', 'filePath', 'uri'])
  const name = readString(record, ['name', 'title'])
  const content = readString(record, ['content', 'text', 'snippet', 'summary'])
  const title =
    name || (path ? path.split('/').filter(Boolean).pop() ?? '' : '') || `File ${index + 1}`
  const summary = summarize(content || `Filesystem context from ${title}.`)

  return {
    id: artifactId('filesystem', `${path}|${title}|${summary}`),
    source: 'filesystem',
    title,
    summary,
    payload: {
      path,
      tags: readStringArray(record, ['tags', 'labels']),
      metadata: isRecord(record.metadata) ? record.metadata : {},
      raw: record,
    },
  }
}

const normalizeDocsItem = (item: unknown, index: number): ImportedArtifact => {
  const record = isRecord(item) ? item : {}
  const title =
    readString(record, ['title', 'name', 'docTitle']) || `Document ${index + 1}`
  const summary = summarize(
    readString(record, ['summary', 'excerpt', 'abstract', 'content', 'body']) ||
      `Documentation context from ${title}.`,
  )
  const url = readString(record, ['url', 'link'])

  return {
    id: artifactId('docs', `${title}|${url}|${summary}`),
    source: 'docs',
    title,
    summary,
    payload: {
      docId: readString(record, ['docId', 'id', 'key']),
      url,
      tags: readStringArray(record, ['tags', 'labels']),
      author: readString(record, ['author', 'owner']),
      updatedAt: readString(record, ['updatedAt', 'lastUpdated']),
      raw: record,
    },
  }
}

const normalizeTrackerItem = (
  item: unknown,
  index: number,
): ImportedArtifact => {
  const record = isRecord(item) ? item : {}
  const key = readString(record, ['key', 'ticketId', 'id', 'issue'])
  const title =
    readString(record, ['title', 'name']) || key || `Tracker Item ${index + 1}`
  const summary = summarize(
    readString(record, [
      'summary',
      'description',
      'acceptanceCriteria',
      'comment',
      'notes',
    ]) || `Tracker context from ${title}.`,
  )

  return {
    id: artifactId('tracker', `${key}|${title}|${summary}`),
    source: 'tracker',
    title,
    summary,
    payload: {
      key,
      status: readString(record, ['status', 'state']),
      priority: readString(record, ['priority', 'severity']),
      assignee: readString(record, ['assignee', 'owner']),
      labels: readStringArray(record, ['labels', 'tags']),
      sprint: readString(record, ['sprint', 'milestone']),
      link: readString(record, ['url', 'link']),
      raw: record,
    },
  }
}

export const normalizeMcpArtifacts = (
  input: SampleMcpImportInput,
): ImportedArtifact[] => {
  const normalized = [
    ...(input.filesystem ?? []).map(normalizeFilesystemItem),
    ...(input.docs ?? []).map(normalizeDocsItem),
    ...(input.tracker ?? []).map(normalizeTrackerItem),
  ]

  const seenIds = new Set<string>()
  const deduped: ImportedArtifact[] = []
  for (const artifact of normalized) {
    if (!seenIds.has(artifact.id)) {
      seenIds.add(artifact.id)
      deduped.push(artifact)
    }
  }
  return deduped
}

export const mergeImportedArtifacts = (
  current: ImportedArtifact[],
  incoming: ImportedArtifact[],
): ImportedArtifact[] => {
  const merged = [...current]
  const existingById = new Map(current.map((artifact) => [artifact.id, artifact]))

  for (const artifact of incoming) {
    if (existingById.has(artifact.id)) {
      continue
    }
    merged.push(artifact)
    existingById.set(artifact.id, artifact)
  }

  return merged
}
