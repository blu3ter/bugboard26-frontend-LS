export interface CommentDto {
  id: number;
  text: string;
  authorName: string;
  authorLastName: string;
  creationDate: string; // ISO 8601 Date string (ex. "2026-07-27T12:00:00")
}

export interface CreateCommentDto {
  text: string;
}
