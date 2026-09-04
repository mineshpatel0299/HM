export type TimeCapsule = {
  id: string;
  coupleId: string;
  authorId: string;
  // Both null while locked — never sent to the client until unlocked,
  // enforced server-side in the query, not just hidden in the UI.
  content: string | null;
  publicUrl: string | null;
  unlockAt: string;
  unlocked: boolean;
  /** True only on the exact query call that flipped this capsule from
   * locked to unlocked — drives the one-time seal-breaking animation. */
  justUnlocked: boolean;
  createdAt: string;
};
