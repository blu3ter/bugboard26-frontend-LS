import React, { useState } from 'react';
import type { IssueDto, UserSummaryDto } from '../../../types';

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
  const [onlyUnassigned, setOnlyUnassigned] = useState(true);
  const [selectedUserMap, setSelectedUserMap] = useState<Record<number, number>>({});
  const [assigningId, setAssigningId] = useState<number | null>(null);

  const displayedIssues = onlyUnassigned
    ? issues.filter((i) => !i.assigneeId)
    : issues;

  const handleUserChange = (issueId: number, userId: number) => {
    setSelectedUserMap((prev) => ({ ...prev, [issueId]: userId }));
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
        Caricamento issue e membri del team...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Filtro Rapido */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
          <input
            type="checkbox"
            checked={onlyUnassigned}
            onChange={(e) => setOnlyUnassigned(e.target.checked)}
          />
          <span>Mostra solo issue non assegnate ({issues.filter((i) => !i.assigneeId).length})</span>
        </label>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Totale mostrate: {displayedIssues.length}
        </span>
      </div>

      <div className="management-table-card">
        <table className="management-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Titolo</th>
              <th>Stato</th>
              <th>Assegnatario Attuale</th>
              <th>Nuova Assegnazione</th>
              <th>Azione</th>
            </tr>
          </thead>
          <tbody>
            {displayedIssues.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                  Nessuna issue trovata con i filtri correnti.
                </td>
              </tr>
            ) : (
              displayedIssues.map((issue) => {
                const currentSelectedUser = selectedUserMap[issue.id] || (issue.assigneeId ?? '');

                return (
                  <tr key={issue.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#38bdf8' }}>
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
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{issue.state}</span>
                    </td>
                    <td>
                      {issue.assigneeFullName || issue.assigneeEmail ? (
                        <span style={{ color: '#38bdf8' }}>{issue.assigneeFullName || issue.assigneeEmail}</span>
                      ) : (
                        <span style={{ color: '#f59e0b', fontSize: '0.78rem' }}>Non assegnata</span>
                      )}
                    </td>
                    <td>
                      <select
                        className="user-select-dropdown"
                        value={currentSelectedUser}
                        onChange={(e) => handleUserChange(issue.id, Number(e.target.value))}
                      >
                        <option value="">Seleziona membro...</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.firstName} {u.lastName} ({u.role})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-action-sm details"
                        disabled={!selectedUserMap[issue.id] || assigningId === issue.id}
                        onClick={() => handleExecuteAssign(issue.id)}
                      >
                        {assigningId === issue.id ? 'Assegnazione...' : 'Assegna'}
                      </button>
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

