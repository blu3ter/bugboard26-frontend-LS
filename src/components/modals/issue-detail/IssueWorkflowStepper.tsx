import React from 'react';
import type { IssueState } from '../../../types';

interface IssueWorkflowStepperProps {
  currentState: IssueState;
}

const WORKFLOW_STEPS = [
  { key: 'TODO', label: 'TODO' },
  { key: 'IN_PROGRESS', label: 'IN PROGRESS' },
  { key: 'IN_REVIEW', label: 'REVIEW' },
  { key: 'CLOSED', label: 'DONE' },
] as const;

function resolveStepIndex(state: IssueState): number {
  const normalized = state.toUpperCase();
  if (normalized === 'IN_PROGRESS') return 1;
  if (normalized === 'REVIEW' || normalized === 'IN_REVIEW') return 2;
  if (normalized === 'DONE' || normalized === 'CLOSED') return 3;
  return 0;
}

/**
 * Pipeline visuale a 4 fasi che mostra l'avanzamento della issue nel workflow.
 */
export const IssueWorkflowStepper: React.FC<IssueWorkflowStepperProps> = ({ currentState }) => {
  const activeIndex = resolveStepIndex(currentState);
  const isClosed = activeIndex === WORKFLOW_STEPS.length - 1;

  return (
    <section className="issue-workflow-card" aria-label="Avanzamento stato">
      <span className="workflow-card-title">Avanzamento stato:</span>

      <ol className="workflow-stepper">
        {WORKFLOW_STEPS.map((step, index) => {
          const isCompleted = index < activeIndex || (isClosed && index === activeIndex);
          const isCurrent = index === activeIndex && !isClosed;
          const isLineCompleted = index < activeIndex;

          const stepStatusClass = isCompleted
            ? 'is-completed'
            : isCurrent
              ? 'is-current'
              : 'is-upcoming';

          return (
            <React.Fragment key={step.key}>
              <li className={`workflow-step-item ${stepStatusClass}`}>
                <span className="workflow-step-node" aria-hidden="true">
                  {isCompleted ? (
                    <span className="material-symbols-outlined workflow-check-icon">check</span>
                  ) : (
                    <span className="workflow-step-dot" />
                  )}
                </span>
                <span className="workflow-step-label">{step.label}</span>
              </li>

              {index < WORKFLOW_STEPS.length - 1 && (
                <li
                  className={`workflow-step-connector ${isLineCompleted ? 'is-completed' : ''}`}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </section>
  );
};

