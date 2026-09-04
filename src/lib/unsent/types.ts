export type UnsentVisibility = "private" | "unlock_on_date" | "unlock_on_read_request";

export type UnsentMessage = {
  id: string;
  coupleId: string;
  authorId: string;
  text: string;
  visibility: UnsentVisibility;
  unlockAt: string | null;
  revealed: boolean;
  createdAt: string;
};
