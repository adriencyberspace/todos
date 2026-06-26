import { useState } from 'react';
import type { PriorityFilter, StatusFilter } from '../types/todo';

function getInitialFilters(): { status: StatusFilter; priority: PriorityFilter } {
  const params = new URLSearchParams(window.location.search);
  return {
    status: (params.get('status') as StatusFilter) ?? 'all',
    priority: (params.get('priority') as PriorityFilter) ?? 'all',
  };
}

function updateUrl(status: StatusFilter, priority: PriorityFilter) {
  const params = new URLSearchParams();
  if (status !== 'all') params.set('status', status);
  if (priority !== 'all') params.set('priority', priority);
  const qs = params.toString();
  window.history.replaceState({}, '', qs ? `?${qs}` : window.location.pathname);
}

export function useFilterState() {
  const initial = getInitialFilters();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initial.status);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>(initial.priority);

  function handleStatusChange(s: StatusFilter) {
    setStatusFilter(s);
    updateUrl(s, priorityFilter);
  }

  function handlePriorityChange(p: PriorityFilter) {
    setPriorityFilter(p);
    updateUrl(statusFilter, p);
  }

  function handleClearFilters() {
    setStatusFilter('all');
    setPriorityFilter('all');
    updateUrl('all', 'all');
  }

  return { statusFilter, priorityFilter, handleStatusChange, handlePriorityChange, handleClearFilters };
}
