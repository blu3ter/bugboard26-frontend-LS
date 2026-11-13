import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IssueDetailModal } from '../../components/modals/IssueDetailModal';
import { authService } from '../../service/authService';

/**
 * Pagina Routed per visualizzare i dettagli di una issue tramite URL (/dashboard/issue/:id).
 * Incapsula IssueDetailModal per garantire coerenza totale di UX sia da click che da link diretto.
 */
export const IssueDetailsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const issueId = id ? parseInt(id, 10) : null;
  const isAdmin = authService.getUser()?.role?.toUpperCase() === 'ADMIN';

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <IssueDetailModal
      issueId={issueId}
      onClose={handleClose}
      isAdmin={isAdmin}
    />
  );
};
