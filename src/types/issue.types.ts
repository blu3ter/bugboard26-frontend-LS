export type IssueType = 'QUESTION' | 'BUG' | 'DOCUMENTATION' | 'FEATURE' | string;
export type IssueState = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | string;

export interface IssueAssignDto {
  assigneeId: number;
}

export interface IssueCreateDto {
  title: string;
  description?: string;
  isUrgent?: boolean;
  type: IssueType;
  assigneeId?: number;
  tagNames?: string[];
}

export interface IssueDto {
  id: number;
  title: string;
  description: string;
  isUrgent: boolean;
  creationDate: string; // ISO 8601 Date string
  type: IssueType;
  state: IssueState;
  reporterId: number;
  reporterEmail: string;
  reporterFullName: string;
  assigneeId?: number;
  assigneeEmail?: string;
  assigneeFullName?: string;
  tags: string[];
}
