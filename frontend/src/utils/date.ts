export function formatDueDate(dueDate: string | null): { text: string; overdue: boolean } {
  if (!dueDate) return { text: '', overdue: false };

  const date = new Date(dueDate.split('T')[0] + 'T00:00:00');

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const overdue = diffDays < 0;

  let text: string;
  if (diffDays === 0) {
    text = 'Today';
  } else if (diffDays === 1) {
    text = 'Tomorrow';
  } else if (diffDays > 1 && diffDays <= 6) {
    text = date.toLocaleDateString('en-US', { weekday: 'long' });
  } else if (date.getFullYear() === now.getFullYear()) {
    text = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else {
    text = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return { text, overdue };
}

export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0];
}
