import React, { useEffect, useState } from 'react';
import type { TutorialStep } from './tutorialSteps';
import './TutorialOverlay.css';

interface TutorialOverlayProps {
  steps: TutorialStep[];
  onClose: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ steps, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLast = currentIndex === steps.length - 1;
  const step = steps[currentIndex];

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  if (!step) return null;

  return (
    <div
      className="tutorial-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Tutorial"
      onClick={onClose}
    >
      <div className="tutorial-stage" onClick={(e) => e.stopPropagation()}>
        <img
          src={step.image}
          alt="BugBoard26 mascot"
          className="tutorial-mascot"
          key={`mascot-${currentIndex}`}
        />
        <div className="tutorial-bubble" key={`bubble-${currentIndex}`}>
          <button
            type="button"
            className="tutorial-btn-close"
            onClick={onClose}
            aria-label="Close tutorial"
          >
            ×
          </button>
          <div className="tutorial-bubble-content">
            <p className="tutorial-text">{step.text}</p>
          </div>

          <div className="tutorial-footer">
            <span className="tutorial-progress">
              {currentIndex + 1} / {steps.length}
            </span>
            <div className="tutorial-actions">
              <button
                type="button"
                className="tutorial-btn tutorial-btn-skip"
                onClick={onClose}
              >
                Skip
              </button>
              <button
                type="button"
                className="tutorial-btn tutorial-btn-next"
                onClick={handleNext}
              >
                {isLast ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;

