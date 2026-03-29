import { useMemo, useState } from 'react'
import EvidenceIntake from './components/EvidenceIntake'
import ResultsBrief from './components/ResultsBrief'
import ReviewSummaryPanel from './components/ReviewSummaryPanel'
import ScenarioSimulator from './components/ScenarioSimulator'
import StudioShell from './components/StudioShell'
import WorkflowCanvas from './components/WorkflowCanvas'
import WorkflowInspectorPanel from './components/WorkflowInspectorPanel'
import WorkflowRightRail from './components/WorkflowRightRail'
import { useStudioState } from './hooks/useStudioState'
import './App.css'

function App() {
  const studio = useStudioState()
  const [selection, setSelection] = useState<{ kind: 'step' | 'edge'; id: string } | null>(null)

  const compactRailMetrics = useMemo(
    () =>
      studio.heroStats.filter((stat) =>
        ['story-points', 'cycle-point', 'cost-point'].includes(stat.id),
      ),
    [studio.heroStats],
  )

  const defaultStepId =
    studio.currentDraft
      ? studio.reviewQueue.find((item) => item.stepId)?.stepId ?? studio.currentDraft.steps[0]?.id ?? null
      : null

  const selectionIsValid =
    selection && studio.currentDraft
      ? selection.kind === 'step'
        ? studio.currentDraft.steps.some((step) => step.id === selection.id)
        : studio.currentDraft.edges.some((edge) => edge.id === selection.id)
      : false

  const selectedStepId =
    !studio.currentDraft
      ? null
      : selectionIsValid
        ? selection?.kind === 'step'
          ? selection.id
          : null
        : defaultStepId

  const selectedEdgeId =
    !studio.currentDraft
      ? null
      : selectionIsValid && selection?.kind === 'edge'
        ? selection.id
        : null

  const handleSelectStep = (stepId: string) => {
    setSelection({ kind: 'step', id: stepId })
  }

  const handleSelectEdge = (edgeId: string) => {
    setSelection({ kind: 'edge', id: edgeId })
  }

  const renderStage = () => {
    if (studio.activeStage === 'context') {
      return (
        <div className="app-stageStack">
          <section className="app-introCard">
            <p className="app-eyebrow">Workflow Draft Studio</p>
            <h2>Turn one reviewed evidence bundle into a draft delivery workflow.</h2>
            <p>
              Start from the strict markdown template. Upload repo docs, tracker summary, tool
              manifest, review policy, and validation policy as one controlled bundle, then confirm
              the extracted sections before any workflow draft is generated.
            </p>
          </section>

          <EvidenceIntake
            artifacts={studio.artifacts}
            status={studio.analysisStatus}
            onGenerateDraft={studio.generateDraft}
          />
        </div>
      )
    }

    if (!studio.currentDraft) {
      return null
    }

    if (studio.activeStage === 'workflow') {
      return (
        <div className="app-stageStack">
          <WorkflowCanvas
            draft={studio.currentDraft}
            selectedStepId={selectedStepId}
            selectedEdgeId={selectedEdgeId}
            onSelectStep={handleSelectStep}
            onSelectEdge={handleSelectEdge}
          />

          <div className="app-detailBand">
            <ReviewSummaryPanel draft={studio.currentDraft} reviewQueue={studio.reviewQueue} />
            <WorkflowInspectorPanel
              draft={studio.currentDraft}
              selectedStepId={selectedStepId}
              selectedEdgeId={selectedEdgeId}
            />
          </div>
        </div>
      )
    }

    if (studio.activeStage === 'analysis') {
      return (
        <div className="app-stageStack">
          <WorkflowCanvas
            draft={studio.currentDraft}
            selectedStepId={selectedStepId}
            selectedEdgeId={selectedEdgeId}
            onSelectStep={handleSelectStep}
            onSelectEdge={handleSelectEdge}
          />

          <div className="app-detailBand">
            <ReviewSummaryPanel
              draft={studio.currentDraft}
              reviewQueue={studio.reviewQueue}
              mode="analysis"
              selectedResult={studio.selectedStrategyResult}
            />
            <WorkflowInspectorPanel
              draft={studio.currentDraft}
              selectedStepId={selectedStepId}
              selectedEdgeId={selectedEdgeId}
            />
          </div>

          <ScenarioSimulator
            baseline={studio.baseline}
            results={studio.strategyResults}
            selectedStrategyId={studio.selectedStrategyId}
            recommendedStrategyId={studio.recommendedStrategyId}
            onSelectStrategy={studio.setSelectedStrategyId}
          />
        </div>
      )
    }

    return (
      <ResultsBrief
        markdown={studio.briefMarkdown}
        selectedResult={studio.selectedStrategyResult}
        recommendedStrategyId={studio.recommendedStrategyId}
        attachedArtifacts={studio.attachedArtifacts}
        assets={studio.assets}
        diagnosis={studio.diagnosis}
      />
    )
  }

  const renderAside = () => {
    if (studio.activeStage === 'context') {
      return (
        <div className="app-sideStack">
          <section className="app-sideCard">
            <p className="app-sideLabel">Primary Inputs</p>
            <div className="app-listStack">
              <p>Repo docs and contribution guides</p>
              <p>Tracker exports with story points</p>
              <p>Tool manifests, review policy, and validation policy</p>
            </div>
          </section>
          <section className="app-sideCard">
            <p className="app-sideLabel">Operator Note</p>
            <p>{studio.analysisNotes || 'The uploaded bundle can carry optional operator notes for the first draft.'}</p>
          </section>
        </div>
      )
    }

    if (studio.currentDraft && (studio.activeStage === 'workflow' || studio.activeStage === 'analysis')) {
      return (
        <WorkflowRightRail
          workflowName={studio.currentDraft.workflowName}
          metrics={compactRailMetrics}
          reviewQueue={studio.reviewQueue}
          traceLinks={studio.traceLinks}
          bottlenecks={studio.bottlenecks}
          recommendedPilot={studio.diagnosis.recommendedPilot}
        />
      )
    }

    return (
      <div className="app-sideStack">
        <section className="app-sideCard">
          <p className="app-sideLabel">Bottlenecks</p>
          <div className="app-listStack">
            {studio.bottlenecks.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </section>

        <section className="app-sideCard">
          <p className="app-sideLabel">Traceability</p>
          <div className="app-listStack">
            {Object.entries(studio.traceLinks).map(([stepId, links]) => (
              <p key={stepId}>
                {stepId}: {links.length} evidence link{links.length === 1 ? '' : 's'}
              </p>
            ))}
          </div>
        </section>

        <section className="app-sideCard">
          <p className="app-sideLabel">Recommended Pilot</p>
          <p>{studio.diagnosis.recommendedPilot}</p>
        </section>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <StudioShell
        stages={studio.stages}
        activeStage={studio.activeStage}
        onStageChange={studio.setActiveStage}
        heroStats={studio.heroStats}
        aside={renderAside()}
        subtitle="Evidence-first workflow review, scenario comparison, and planning brief generation"
      >
        {renderStage()}
        <div className="app-navigation">
          <button
            type="button"
            className="app-navButton app-navSecondary"
            onClick={studio.moveToPreviousStage}
            disabled={!studio.canMovePrevious}
          >
            Previous
          </button>
          <button
            type="button"
            className="app-navButton"
            onClick={studio.moveToNextStage}
            disabled={!studio.canMoveNext}
          >
            {studio.activeStage === 'analysis' ? 'Generate Brief' : 'Continue'}
          </button>
        </div>
      </StudioShell>
    </div>
  )
}

export default App
