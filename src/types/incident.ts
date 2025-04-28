export type Severity = 'low' | 'medium' | 'high';

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  reported_at: string;
  status: 'open' | 'in-progress' | 'resolved';
  userReported?: boolean;
}

export type SortOrder = 'newest' | 'oldest';
