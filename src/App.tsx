import ContextIntake from './components/ContextIntake'
import McpImportPanel from './components/McpImportPanel'
import ResultsBrief from './components/ResultsBrief'
import ScenarioSimulator from './components/ScenarioSimulator'
import StudioShell from './components/StudioShell'
import WorkflowEditor from './components/WorkflowEditor'
import WorkflowMap from './components/WorkflowMap'
import { useStudioState } from './hooks/useStudioState'
import './App.css'

function App() {
  const studio = useStudioState()

  const selectedAutomation = studio.selectedStrategyResult?.selectedAutomation ?? {}

  const renderStage = () => {
    if (studio.activeStage === 'context') {
      return (
        <div className="app-stageStack">
          <section className="app-introCard">
            <p className="app-eyebrow">Workflow first, model second</p>
            <h2>Map one real operating workflow and stress-test multiple AI transition paths.</h2>
            <p>
              This MVP turns current workflow structure, MCP evidence, and strategy assumptions into
              an explicit recommendation instead of a generic maturity score.
            </p>
          </section>
          <ContextIntake
            value={studio.organization}
            onChange={studio.setOrganization}
            onSubmit={studio.moveToNextStage}
          />
          <McpImportPanel
            artifacts={studio.availableArtifacts}
            selectedArtifactId={studio.selectedArtifactId}
            onSelectArtifact={studio.setSelectedArtifactId}
            normalizationResults={studio.normalizationResults}
            onImportSelected={studio.importSelectedArtifact}
          />
        </div>
      )
    }

    if (studio.activeStage === 'workflow') {
      return (
        <div className="app-stageStack">
          <WorkflowEditor steps={studio.workflow} onChange={studio.setWorkflow} />
          <WorkflowMap
            steps={studio.workflow}
            selectedAutomation={selectedAutomation}
            selectedStepId={studio.selectedStepId}
            strategyTitle={studio.selectedStrategyResult?.strategy.title ?? 'selected strategy'}
            onSelectStep={studio.setSelectedStepId}
            onOverrideStepMode={studio.updateSelectedStrategyStepMode}
          />
        </div>
      )
    }

    if (studio.activeStage === 'analysis') {
      return (
        <div className="app-stageStack">
          <WorkflowMap
            steps={studio.workflow}
            selectedAutomation={selectedAutomation}
            selectedStepId={studio.selectedStepId}
            strategyTitle={studio.selectedStrategyResult?.strategy.title ?? 'selected strategy'}
            onSelectStep={studio.setSelectedStepId}
            onOverrideStepMode={studio.updateSelectedStrategyStepMode}
          />
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
    if (studio.activeStage === 'workflow' || studio.activeStage === 'analysis') {
      return (
        <div className="app-sideStack">
          <section className="app-sideCard">
            <p className="app-sideLabel">Selected Step</p>
            <h3>{studio.selectedStep?.name ?? 'No step selected'}</h3>
            <p>
              {studio.selectedStep?.owner ?? 'Owner TBD'} |{' '}
              {studio.selectedStep?.reviewRequired ? 'Review required' : 'No default review'}
            </p>
            <p>{studio.selectedStep?.notes ?? 'Select a step to inspect caveats and controls.'}</p>
          </section>

          <section className="app-sideCard">
            <p className="app-sideLabel">Baseline KPI Stack</p>
            <div className="app-metricList">
              <p>Human effort: {studio.baseline.humanEffortHours}h</p>
              <p>Cycle time: {studio.baseline.cycleTimeHours}h</p>
              <p>Output volume: {studio.baseline.outputVolume}</p>
              <p>Quality score: {studio.baseline.qualityScore}</p>
              <p>Review burden: {studio.baseline.reviewBurdenHours}h</p>
            </div>
          </section>
        </div>
      )
    }

    if (studio.activeStage === 'brief') {
      return (
        <div className="app-sideStack">
          <section className="app-sideCard">
            <p className="app-sideLabel">Recommended Strategy</p>
            <h3>{studio.recommendedStrategyResult?.strategy.title ?? 'Unavailable'}</h3>
            <p>{studio.recommendedStrategyResult?.strategy.requiredChange ?? 'No recommendation yet.'}</p>
          </section>
          <section className="app-sideCard">
            <p className="app-sideLabel">Attached MCP Sources</p>
            <div className="app-listStack">
              {studio.attachedArtifacts.map((artifact) => (
                <p key={artifact.id}>
                  {artifact.source}: {artifact.title}
                </p>
              ))}
            </div>
          </section>
        </div>
      )
    }

    return (
      <div className="app-sideStack">
        <section className="app-sideCard">
          <p className="app-sideLabel">AI Asset Stack</p>
          <div className="app-listStack">
            {studio.assets.map((asset) => (
              <p key={asset.id}>
                {asset.name} | {asset.assetType} | {asset.readiness}
              </p>
            ))}
          </div>
        </section>

        <section className="app-sideCard">
          <p className="app-sideLabel">Primary Bottlenecks</p>
          <div className="app-listStack">
            {studio.bottlenecks.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
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
      >
        {renderStage()}
        <div className="app-navigation">
          <button
            type="button"
            className="app-navButton app-navSecondary"
            onClick={studio.moveToPreviousStage}
            disabled={studio.activeStage === 'context'}
          >
            Previous
          </button>
          <button
            type="button"
            className="app-navButton"
            onClick={studio.moveToNextStage}
            disabled={studio.activeStage === 'brief'}
          >
            {studio.activeStage === 'analysis' ? 'Generate Brief' : 'Continue'}
          </button>
        </div>
      </StudioShell>
    </div>
  )
}

export default App
