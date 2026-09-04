export type RewindItem =
  | { kind: "moment"; id: string; text: string; mood: string | null; authorId: string; date: string }
  | { kind: "photo"; id: string; publicUrl: string; caption: string | null; date: string }
  | {
      kind: "spark";
      id: string;
      promptText: string;
      answers: { authorId: string; text: string }[];
      date: string;
    };
