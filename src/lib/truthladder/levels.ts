export type LadderLevel = { level: number; title: string; question: string };

export const LADDER_LEVELS: LadderLevel[] = [
  {
    level: 1,
    title: "warm up",
    question: "what's your favorite memory of us so far?",
  },
  {
    level: 2,
    title: "getting closer",
    question: "what's something you've never told anyone else?",
  },
  {
    level: 3,
    title: "vulnerable",
    question: "what's a fear you have about us, or about the distance?",
  },
  {
    level: 4,
    title: "deep",
    question: "what's the hardest thing you've been through, and how did it shape you?",
  },
  {
    level: 5,
    title: "all the way",
    question: "what do you need from me that you haven't asked for yet?",
  },
];
