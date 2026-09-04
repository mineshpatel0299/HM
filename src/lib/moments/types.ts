export type MomentEvent = {
  id: string;
  coupleId: string;
  authorId: string;
  text: string;
  mood: string | null;
  createdAt: string;
};

export const MOOD_TAGS = [
  { value: "happy", emoji: "😊", label: "happy" },
  { value: "loving", emoji: "🥰", label: "loving" },
  { value: "tired", emoji: "🥱", label: "tired" },
  { value: "missing", emoji: "🥺", label: "missing you" },
  { value: "stressed", emoji: "😤", label: "stressed" },
  { value: "calm", emoji: "😌", label: "calm" },
] as const;
