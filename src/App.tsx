import DraftSummary from './components/DraftSummary'
import EvidenceIntake from './components/EvidenceIntake'
import ResultsBrief from './components/ResultsBrief'
import ReviewQueue from './components/ReviewQueue'
import ScenarioSimulator from './components/ScenarioSimulator'
import StudioShell from './components/StudioShell'
import WorkflowCanvas from './components/WorkflowCanvas'
import { useStudioState } from './hooks/useStudioState'
import './App.css'

function App() {
  const studio = useStudioState()

  const renderStage = () => {
    if (studio.activeStage === 'context') {
      return (
        <div className="app-stageStack">
          <section className="app-introCard">
            <p className="app-eyebrow">Workflow Draft Studio</p>
            <h2>Turn evidence into a draft delivery workflow before debating automation.</h2>
            <p>
              Start from repo docs, tracker exports, and review policy evidence. The app drafts the
              agile delivery flow, then pushes you into guided review before it recommends an
              automation path.
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
          <DraftSummary draft={studio.currentDraft} />
          <div className="app-reviewGrid">
            <ReviewQueue items={studio.reviewQueue} />
            <WorkflowCanvas draft={studio.currentDraft} />
          </div>
        </div>
      )
    }

    if (studio.activeStage === 'analysis') {
      return (
        <div className="app-stageStack">
          <DraftSummary draft={studio.currentDraft} />
          <WorkflowCanvas draft={studio.currentDraft} />
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
              <p>Review and validation policy notes</p>
            </div>
          </section>
          <section className="app-sideCard">
            <p className="app-sideLabel">Operator Note</p>
            <p>{studio.analysisNotes || 'Add pasted notes if your review policy differs from the default example.'}</p>
          </section>
        </div>
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
