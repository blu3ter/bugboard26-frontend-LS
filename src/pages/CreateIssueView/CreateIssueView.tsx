import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateIssueModal } from '../../components/modals/CreateIssueModal';

/**
 * Vista di pagina CreateIssueView:
 * Incapsula CreateIssueModal per gli accessi da routing diretto (/dashboard/create-issue).
 */
export const CreateIssueView: React.FC = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/dashboard/my-issues');
  };

  const handleCreated = () => {
    navigate('/dashboard/my-issues');
  };

  return (
    <CreateIssueModal
      isOpen={true}
      onClose={handleClose}
      onCreated={handleCreated}
    />
  );
};
