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
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [reviewData, allData, usersData] = await Promise.all([
        issueService.getReviewIssues(),
        issueService.getAllIssues(),
        userService.getAllUsers().catch(() => []),
      ]);
      setReviewIssues(reviewData);
      setAllIssues(allData);
      setUsers(usersData);
    } catch (err) {
      console.error('Errore nel caricamento dei dati di gestione:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (issueId: number) => {
    await issueService.updateIssueState(issueId, 'DONE');
    await loadData();
  };

  const handleReject = async (issueId: number) => {
    await issueService.updateIssueState(issueId, 'IN_PROGRESS');
    await loadData();
  };

  const handleAssign = async (issueId: number, assigneeId: number) => {
    await issueService.assignIssue(issueId, assigneeId);
    await loadData();
  };

  return (
    <div className="management-container">
      {/* Header Pannello Gestionale */}
      <div className="management-header-card">
        <div className="management-title-group">
          <h1>Pannello di Gestione Issue & Workflow</h1>
          <p>Supervisiona le issue inviate in revisione e gestisci le assegnazioni operative del team.</p>
        </div>
        <button
          type="button"
          className="btn-action-sm details"
          onClick={loadData}
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
          Aggiorna
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="management-tabs-bar">
        <button
          type="button"
          className={`management-tab-btn ${activeTab === 'review' ? 'active' : ''}`}
          onClick={() => setActiveTab('review')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>rate_review</span>
          <span>In Revisione (Workflow Review)</span>
          <span className="tab-badge-counter">{reviewIssues.length}</span>
        </button>

        <button
          type="button"
          className={`management-tab-btn ${activeTab === 'assignment' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignment')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group_add</span>
          <span>Assegnazione Membri Team</span>
          <span className="tab-badge-counter">
            {allIssues.filter((i) => !i.assigneeId).length}
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
