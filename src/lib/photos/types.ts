export type Photo = {
  id: string;
  coupleId: string;
  authorId: string;
  publicUrl: string;
  caption: string | null;
  takenAt: string | null;
  createdAt: string;
};
