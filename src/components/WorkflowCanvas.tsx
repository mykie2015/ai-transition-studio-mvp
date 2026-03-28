import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react'
import type { AnalysisDraft } from '../types/studio'
import styles from './WorkflowCanvas.module.css'

interface WorkflowCanvasProps {
  draft: AnalysisDraft
}

export default function WorkflowCanvas({ draft }: WorkflowCanvasProps) {
  const nodes: Node[] = draft.steps.map((step, index) => ({
    id: step.id,
    position: {
      x: 220 * index,
      y: step.validationRequired ? 80 : 0,
    },
    data: {
      label: step.name,
    },
    draggable: false,
    selectable: false,
  }))

  const edges: Edge[] = draft.edges.map((edge) => ({
    id: edge.id,
    source: edge.sourceStepId,
    target: edge.targetStepId,
    label: edge.label,
    animated: edge.type === 'rework-loop',
  }))

  return (
    <section className={styles.panel} aria-label="Workflow canvas">
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Workflow Canvas</h2>
          <p className={styles.subtitle}>Trace the reviewed workflow before comparing automation strategies.</p>
        </div>
      </header>

      <div className={styles.canvasShell}>
        <ReactFlow nodes={nodes} edges={edges} fitView nodesDraggable={false} elementsSelectable={false}>
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      <div className={styles.legendGrid}>
        <article className={styles.legendCard}>
          <h3 className={styles.legendTitle}>Steps</h3>
          <ul className={styles.list}>
            {draft.steps.map((step) => (
              <li key={step.id}>
                {step.id} | {step.owner}
              </li>
            ))}
          </ul>
        </article>
        <article className={styles.legendCard}>
          <h3 className={styles.legendTitle}>Edges</h3>
          <ul className={styles.list}>
            {draft.edges.map((edge) => (
              <li key={edge.id}>
                {edge.type}: {edge.label}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  )
}
