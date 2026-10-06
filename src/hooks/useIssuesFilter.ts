import { useState, useMemo } from 'react';
import type { IssueDto } from '../types/issue.types';

export const useIssuesFilter = (issues: IssueDto[]) => {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [state, setState] = useState('');
  const [urgentOnly, setUrgentOnly] = useState(false);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchSearch =
        !search ||
        issue.title.toLowerCase().includes(search.toLowerCase()) ||
        issue.id.toString().includes(search);
      const matchType = !type || issue.type === type;
      const matchState = !state || issue.state === state;
      const matchUrgent = !urgentOnly || issue.isUrgent === true;

      return matchSearch && matchType && matchState && matchUrgent;
    });
  }, [issues, search, type, state, urgentOnly]);

  const resetFilters = () => {
    setSearch('');
    setType('');
    setState('');
    setUrgentOnly(false);
  };

  return {
    search,
    setSearch,
    type,
    setType,
    state,
    setState,
    urgentOnly,
    setUrgentOnly,
    filteredIssues,
    resetFilters,
  };
};
