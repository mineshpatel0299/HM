import { formatInTimeZone } from "date-fns-tz";

export type SparkPrompt = { id: string; text: string };

// Cycles deterministically by date — the same date always yields the same
// prompt for everyone, no per-couple randomness.
const PROMPTS: string[] = [
  "what's a small thing that made you smile today?",
  "if we could teleport anywhere for one hour right now, where would you pick?",
  "what's a song that's been stuck in your head lately?",
  "what's something you're looking forward to this week?",
  "what's a smell that instantly takes you back somewhere?",
  "if today had a color, what would it be?",
  "what's the last thing that made you laugh out loud?",
  "what's a small comfort you've been leaning on lately?",
  "what's something you learned recently, even something tiny?",
  "if you could nap anywhere right now, where would it be?",
  "what's a food you're craving that we haven't had in a while?",
  "what's something about today you'd want to remember in five years?",
  "what's a fictional place you'd love to actually visit?",
  "what's the most-used app on your phone this week, honestly?",
  "what's a compliment you got (or gave) recently?",
  "what's something you're proud of yourself for this week?",
  "if we had a free day together right now, what would we do first?",
  "what's a sound that instantly calms you down?",
  "what's something small you wish I knew about your day today?",
  "what's a memory of us that randomly popped into your head recently?",
  "what's your energy level today, and why?",
  "what's something you'd want to learn together someday?",
  "what's a tiny inconvenience you dealt with today?",
  "what's something you're grateful for right now?",
  "if you could send me one photo from today, what would it be of?",
  "what's a habit you're trying to build or break lately?",
  "what's something that surprised you this week?",
  "what's a place near you that you think I'd like?",
  "what's the weather like where you are, and how does it feel?",
  "what's one word for how today went?",
];

export function getPromptForDate(date: Date): SparkPrompt {
  const dateKey = formatInTimeZone(date, "UTC", "yyyy-MM-dd");
  const dayOfYear = Math.floor(
    (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) -
      Date.UTC(date.getUTCFullYear(), 0, 0)) /
      86_400_000,
  );
  const index = dayOfYear % PROMPTS.length;
  return { id: dateKey, text: PROMPTS[index] };
}
