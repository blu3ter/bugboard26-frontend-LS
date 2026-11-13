import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { IssueDto, UserSummaryDto } from '../../../types';
import { TagBadge } from '../../../components/tags/TagBadge';

export interface AssignmentSectionProps {
  issues: IssueDto[];
  users: UserSummaryDto[];
  loading: boolean;
  onAssign: (issueId: number, assigneeId: number) => Promise<void>;
  onOpenDetail: (issueId: number) => void;
}

export const AssignmentSection: React.FC<AssignmentSectionProps> = ({
  issues,
  users,
  loading,
  onAssign,
  onOpenDetail,
}) => {
  const [selectedUserMap, setSelectedUserMap] = useState<Record<number, number>>({});
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [openDropdownIssueId, setOpenDropdownIssueId] = useState<number | null>(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState<string>('');
  const dropdownContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownIssueId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortedUsersWithWorkload = useMemo(() => {
    return users
      .map((user) => {
        const displayName =
          `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
          user.fullName ||
          `User #${user.id}`;

        const activeIssuesCount = issues.filter((issue) => {
          const isActive = issue.state !== 'DONE' && issue.state !== 'CLOSED';
          if (!isActive) return false;
          if (issue.assigneeId != null) {
            return issue.assigneeId === user.id;
          }
          return (
            Boolean(issue.assigneeFullName) &&
            issue.assigneeFullName!.trim().toLowerCase() === displayName.toLowerCase()
          );
        }).length;

        return {
          ...user,
          displayName,
          activeIssuesCount,
        };
      })
      .sort((a, b) => {
        if (a.activeIssuesCount !== b.activeIssuesCount) {
          return a.activeIssuesCount - b.activeIssuesCount;
        }
        return a.displayName.localeCompare(b.displayName);
      });
  }, [users, issues]);

  const unassignedIssues = issues.filter(
    (i) => !i.assigneeId && !i.assigneeFullName && !i.assigneeEmail
  );

  const handleUserChange = (issueId: number, userId: number) => {
    setSelectedUserMap((prev) => ({ ...prev, [issueId]: userId }));
    setOpenDropdownIssueId(null);
    setMemberSearchQuery('');
  };

  const toggleDropdown = (issueId: number) => {
    if (openDropdownIssueId === issueId) {
      setOpenDropdownIssueId(null);
    } else {
      setOpenDropdownIssueId(issueId);
      setMemberSearchQuery('');
    }
  };

  const getWorkloadClass = (count: number) => {
    if (count === 0) return 'workload-zero';
    if (count <= 2) return 'workload-low';
    return 'workload-high';
  };

  const handleExecuteAssign = async (issueId: number) => {
    const userId = selectedUserMap[issueId];
    if (!userId) return;

    try {
      setAssigningId(issueId);
      await onAssign(issueId, userId);
    } finally {
      setAssigningId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
        Loading issues and team members...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Team Members Active Issues Summary (Sorted Ascending) */}
      <div className="team-workload-card">
        <div className="team-workload-header">
          <div className="team-workload-title">
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#3b82f6' }}>
              groups
            </span>
            <span>Team Members & Active Issues (Least to Most Busy)</span>
          </div>
          <span className="team-workload-subtitle">
            {sortedUsersWithWorkload.length} members
          </span>
        </div>

        {sortedUsersWithWorkload.length === 0 ? (
          <div style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
            No users available.
          </div>
        ) : (
          <div className="team-workload-list">
            {sortedUsersWithWorkload.map((u) => (
              <div key={u.id} className="team-workload-pill">
                <span className="team-workload-name">{u.displayName}</span>
                <span
                  className={`team-workload-badge ${
                    u.activeIssuesCount === 0
                      ? 'workload-zero'
                      : u.activeIssuesCount <= 2
                      ? 'workload-low'
                      : 'workload-high'
                  }`}
                >
                  {u.activeIssuesCount} {u.activeIssuesCount === 1 ? 'active issue' : 'active issues'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="management-table-card">
        <table className="management-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Type</th>
              <th>Tags</th>
              <th>New Assignment</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {unassignedIssues.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                  No unassigned issues found.
                </td>
              </tr>
            ) : (
              unassignedIssues.map((issue) => {
                const currentSelectedUserId = selectedUserMap[issue.id] || issue.assigneeId;
                const selectedMember = sortedUsersWithWorkload.find(
                  (u) => u.id === currentSelectedUserId
                );
                const isOpen = openDropdownIssueId === issue.id;

                const filteredMembers = sortedUsersWithWorkload.filter((u) => {
                  const q = memberSearchQuery.trim().toLowerCase();
                  if (!q) return true;
                  const searchableText = `${u.displayName} ${u.firstName ?? ''} ${u.lastName ?? ''} ${u.activeIssuesCount} ${
                    u.activeIssuesCount === 1 ? 'active issue' : 'active issues'
                  }`.toLowerCase();
                  return searchableText.includes(q);
                });

                return (
                  <tr key={issue.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#60a5fa' }}>
                        BB-{issue.id}
                      </span>
                    </td>
                    <td>
                      <strong
                        style={{ color: '#f1f5f9', cursor: 'pointer' }}
                        onClick={() => onOpenDetail(issue.id)}
                      >
                        {issue.title}
                      </strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#cbd5e1', fontWeight: 600 }}>
                        {issue.type}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {issue.tags && issue.tags.map((tag) => (
                          <TagBadge key={tag} name={tag} size="sm" />
                        ))}
                      </div>
                    </td>
                    <td>
                      <div
                        className="member-selector-wrapper"
                        ref={isOpen ? dropdownContainerRef : null}
                      >
                        <button
                          type="button"
                          className={`member-selector-trigger ${isOpen ? 'open' : ''} ${
                            selectedMember ? 'has-value' : ''
                          }`}
                          onClick={() => toggleDropdown(issue.id)}
                        >
                          {selectedMember ? (
                            <span className="member-selector-selected">
                              <span className="member-selector-name">
                                {selectedMember.displayName}
                              </span>
                              <span
                                className={`team-workload-badge ${getWorkloadClass(
                                  selectedMember.activeIssuesCount
                                )}`}
                              >
                                {selectedMember.activeIssuesCount}{' '}
                                {selectedMember.activeIssuesCount === 1
                                  ? 'active issue'
                                  : 'active issues'}
                              </span>
                            </span>
                          ) : (
                            <span className="member-selector-placeholder">
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: '16px', color: '#64748b' }}
                              >
                                person_search
                              </span>
                              <span>Select member...</span>
                            </span>
                          )}
                          <span className="material-symbols-outlined member-selector-chevron">
                            expand_more
                          </span>
                        </button>

                        {isOpen && (
                          <div className="member-selector-popover">
                            <div className="member-selector-search-box">
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: '16px', color: '#60a5fa' }}
                              >
                                search
                              </span>
                              <input
                                type="text"
                                className="member-selector-search-input"
                                placeholder="Filter by name, surname or number..."
                                value={memberSearchQuery}
                                onChange={(e) => setMemberSearchQuery(e.target.value)}
                                autoFocus
                              />
                              {memberSearchQuery && (
                                <button
                                  type="button"
                                  className="member-selector-clear-btn"
                                  onClick={() => setMemberSearchQuery('')}
                                  aria-label="Clear filter"
                                >
                                  <span
                                    className="material-symbols-outlined"
                                    style={{ fontSize: '15px' }}
                                  >
                                    close
                                  </span>
                                </button>
                              )}
                            </div>

                            <div className="member-selector-options-list">
                              {filteredMembers.length === 0 ? (
                                <div className="member-selector-empty">
                                  No matching members found
                                </div>
                              ) : (
                                filteredMembers.map((u) => {
                                  const isSelected = u.id === currentSelectedUserId;
                                  return (
                                    <button
                                      key={u.id}
                                      type="button"
                                      className={`member-selector-option ${
                                        isSelected ? 'selected' : ''
                                      }`}
                                      onClick={() => handleUserChange(issue.id, u.id)}
                                    >
                                      <span className="member-selector-option-name">
                                        {u.displayName}
                                      </span>
                                      <span
                                        className={`team-workload-badge ${getWorkloadClass(
                                          u.activeIssuesCount
                                        )}`}
                                      >
                                        {u.activeIssuesCount}{' '}
                                        {u.activeIssuesCount === 1
                                          ? 'active issue'
                                          : 'active issues'}
                                      </span>
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn-action-sm details"
                          onClick={() => onOpenDetail(issue.id)}
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          className="btn-action-sm details"
                          disabled={!selectedUserMap[issue.id] || assigningId === issue.id}
                          onClick={() => handleExecuteAssign(issue.id)}
                        >
                          {assigningId === issue.id ? 'Assigning...' : 'Assign'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
