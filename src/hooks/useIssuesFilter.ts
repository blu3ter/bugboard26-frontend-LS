import { useState, useMemo } from 'react';
import type { IssueDto } from '../types/issue.types';

export const isReviewState = (s?: string): boolean => {
  if (!s) return false;
  const normalized = s.trim().toUpperCase();
  return normalized === 'REVIEW' || normalized === 'IN_REVIEW';
};

export const isClosedState = (s?: string): boolean => {
  if (!s) return false;
  const normalized = s.trim().toUpperCase();
  return normalized === 'DONE' || normalized === 'CLOSED';
};

export const useIssuesFilter = (issues: IssueDto[]) => {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [state, setState] = useState('');
  const [urgentOnly, setUrgentOnly] = useState(false);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchSearch =
        !search ||
        issue.title?.toLowerCase().includes(search.toLowerCase()) ||
        issue.id?.toString().includes(search);
      const matchType = !type || issue.type?.toUpperCase() === type.toUpperCase();
      const matchState = (() => {
        if (!state) return true;
        if (isReviewState(state)) {
          return isReviewState(issue.state);
        }
        if (isClosedState(state)) {
          return isClosedState(issue.state);
        }
        return (issue.state?.trim().toUpperCase() ?? '') === state.trim().toUpperCase();
      })();
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
