import {
  Background,
  Controls,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react'
import type { MouseEvent, ReactNode } from 'react'
import type { AnalysisDraft } from '../types/studio'
import styles from './WorkflowCanvas.module.css'

interface WorkflowCanvasProps {
  draft: AnalysisDraft
  selectedStepId?: string | null
  selectedEdgeId?: string | null
  onSelectStep?: (stepId: string) => void
  onSelectEdge?: (edgeId: string) => void
}

const stepPositions: Record<string, { x: number; y: number }> = {
  'jira-scope': { x: 40, y: 120 },
  'acceptance-alignment': { x: 310, y: 120 },
  'tdd-implementation': { x: 580, y: 120 },
  'validation-gate': { x: 580, y: 360 },
  'pr-open': { x: 310, y: 360 },
  'review-remediation': { x: 40, y: 360 },
}

const formatAutomationMode = (value: string): string =>
  value
    .split('-')
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ')

const buildStepLabel = (
  step: AnalysisDraft['steps'][number],
  selectedStepId: string | null | undefined,
  onSelectStep?: (stepId: string) => void,
): ReactNode => {
  const stopFlowEvent = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <button
      type="button"
      className={`nodrag nopan ${styles.nodeButton} ${selectedStepId === step.id ? styles.nodeButtonSelected : ''}`}
      aria-pressed={selectedStepId === step.id}
      onMouseDown={stopFlowEvent}
      onClick={(event) => {
        stopFlowEvent(event)
        onSelectStep?.(step.id)
      }}
    >
      <span className={styles.nodeEyebrow}>{step.owner}</span>
      <span className={styles.nodeLabel}>{step.name}</span>
      <span className={styles.nodeMeta}>
        {formatAutomationMode(step.automationMode)} | {step.reviewRequired ? 'Review gate' : 'No review gate'}
      </span>
    </button>
  )
}

export default function WorkflowCanvas({
  draft,
  selectedStepId = null,
  selectedEdgeId = null,
  onSelectStep,
  onSelectEdge,
}: WorkflowCanvasProps) {
  const nodes: Node[] = draft.steps.map((step, index) => {
    const position = stepPositions[step.id] ?? {
      x: 40 + index * 260,
      y: index % 2 === 0 ? 120 : 320,
    }

    return {
      id: step.id,
      position,
      sourcePosition:
        step.id === 'tdd-implementation'
          ? Position.Bottom
          : step.id === 'review-remediation'
            ? Position.Top
            : Position.Right,
      targetPosition:
        step.id === 'validation-gate'
          ? Position.Top
          : step.id === 'review-remediation'
            ? Position.Right
            : Position.Left,
      data: {
        label: buildStepLabel(step, selectedStepId, onSelectStep),
      },
      draggable: false,
      selectable: true,
      focusable: true,
      connectable: false,
      width: 220,
      height: 110,
      style: {
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        padding: 0,
        width: 220,
      },
    }
  })

  const edges: Edge[] = draft.edges.map((edge) => ({
    id: edge.id,
    source: edge.sourceStepId,
    target: edge.targetStepId,
    label: edge.label,
    type: edge.type === 'rework-loop' ? 'smoothstep' : 'default',
    animated: edge.type === 'rework-loop',
    interactionWidth: 28,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: selectedEdgeId === edge.id ? '#b45309' : '#64748b',
      width: 18,
      height: 18,
    },
    style: {
      stroke: selectedEdgeId === edge.id ? '#b45309' : '#64748b',
      strokeWidth: selectedEdgeId === edge.id ? 3 : 2,
    },
    labelStyle: {
      fill: selectedEdgeId === edge.id ? '#8c4c15' : '#475569',
      fontSize: 12,
      fontWeight: selectedEdgeId === edge.id ? 700 : 600,
    },
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 999,
    labelBgStyle: {
      fill: selectedEdgeId === edge.id ? '#fff3e0' : '#f8fafc',
      fillOpacity: 1,
    },
  }))

  return (
    <section className={styles.panel} aria-label="Workflow canvas">
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Workflow Draft</p>
          <h2 className={styles.title}>{draft.workflowName}</h2>
          <p className={styles.subtitle}>
            Inspect the drafted delivery path first. Click any node or edge to review the controls,
            evidence links, and automation posture behind it.
          </p>
        </div>
      </header>

      <div className={styles.canvasShell}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.08 }}
          minZoom={0.45}
          maxZoom={1.4}
          nodesDraggable={false}
          elementsSelectable
          onNodeClick={(_, node) => onSelectStep?.(node.id)}
          onEdgeClick={(_, edge) => onSelectEdge?.(edge.id)}
          proOptions={{ hideAttribution: true }}
        >
          <Controls showInteractive={false} />
          <Background gap={28} size={1.2} color="#d8dee9" />
        </ReactFlow>
      </div>
    </section>
  )
}
