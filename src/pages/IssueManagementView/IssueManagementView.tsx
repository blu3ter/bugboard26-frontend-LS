import React, { useState, useEffect, useCallback } from 'react';
import { issueService } from '../../service/issueService';
import { userService } from '../../service/userService';
import type { IssueDto, UserSummaryDto } from '../../types';
import { ReviewSection } from './components/ReviewSection';
import { AssignmentSection } from './components/AssignmentSection';
import { IssueDetailModal } from '../../components/modals/IssueDetailModal';
import './IssueManagementView.css';

export const IssueManagementView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'review' | 'assignment'>('review');

  const [reviewIssues, setReviewIssues] = useState<IssueDto[]>([]);
  const [allIssues, setAllIssues] = useState<IssueDto[]>([]);
  const [users, setUsers] = useState<UserSummaryDto[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [reviewData, allData, usersData] = await Promise.all([
        issueService.getReviewIssues(),
        issueService.getAllIssues(),
        userService.getAllUsers().catch(() => []),
      ]);
      setReviewIssues(reviewData);
      setAllIssues(allData);
      setUsers(usersData);
    } catch (err) {
      console.error('Error loading management data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load management data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const runAction = async (action: () => Promise<unknown>, fallbackError: string) => {
    try {
      setError(null);
      await action();
      await loadData();
    } catch (err) {
      console.error(fallbackError, err);
      setError(err instanceof Error ? err.message : fallbackError);
    }
  };

  const handleApprove = async (issueId: number) => {
    await runAction(() => issueService.updateIssueState(issueId, 'DONE'), 'Failed to approve issue.');
  };

  const handleReject = async (issueId: number) => {
    await runAction(() => issueService.updateIssueState(issueId, 'IN_PROGRESS'), 'Failed to reject issue.');
  };

  const handleAssign = async (issueId: number, assigneeId: number) => {
    await runAction(() => issueService.assignIssue(issueId, assigneeId), 'Failed to assign issue.');
  };

  return (
    <div className="management-container">
      {/* Management Panel Header */}
      <div className="management-header-card">
        <div className="management-title-group">
          <h1>Issue Management & Workflow</h1>
          <p>Supervise issues submitted for review and manage team assignments.</p>
        </div>
        <button
          type="button"
          className="btn-action-sm details"
          onClick={loadData}
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
          Refresh
        </button>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="management-error-banner" role="alert">
          <div className="management-error-content">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
            <span>{error}</span>
          </div>
          <button
            type="button"
            className="management-error-dismiss"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="management-tabs-bar">
        <button
          type="button"
          className={`management-tab-btn ${activeTab === 'review' ? 'active' : ''}`}
          onClick={() => setActiveTab('review')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>rate_review</span>
          <span>In Review (Workflow Review)</span>
          <span className="tab-badge-counter">{reviewIssues.length}</span>
        </button>

        <button
          type="button"
          className={`management-tab-btn ${activeTab === 'assignment' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignment')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group_add</span>
          <span>Team Member Assignment</span>
          <span className="tab-badge-counter">
            {allIssues.filter((i) => !i.assigneeId && !i.assigneeFullName && !i.assigneeEmail).length}
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'review' ? (
        <ReviewSection
          issues={reviewIssues}
          loading={loading}
          onApprove={handleApprove}
          onReject={handleReject}
          onOpenDetail={(id) => setSelectedIssueId(id)}
        />
      ) : (
        <AssignmentSection
          issues={allIssues}
          users={users}
          loading={loading}
          onAssign={handleAssign}
          onOpenDetail={(id) => setSelectedIssueId(id)}
        />
      )}

      {/* Modale Dettaglio Issue Integrata */}
      <IssueDetailModal
        issueId={selectedIssueId}
        onClose={() => setSelectedIssueId(null)}
        onIssueUpdated={loadData}
        isAdmin={true}
      />
    </div>
  );
};

