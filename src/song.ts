import type { Note } from "@openparachute/surface-client";

/** The #song schema, as declared on the vault's `song` tag. */
export type Status = "wishlist" | "learning" | "learned";
export type Difficulty = "easy" | "medium" | "hard";
export type PlayOn = "harmonium" | "guitar" | "both";

export interface Song {
  /** Underlying vault note id. */
  id: string;
  /** Vault path, e.g. "Trevor Hall/Unity". */
  path: string;
  /** Display title — the note's first `# ` heading, else the last path segment. */
  title: string;
  status: Status;
  difficulty: Difficulty;
  playOn: PlayOn;
  /** Whether the owner is also working on singing it. */
  sing: boolean;
  artist: string;
  /** Free-text musical key (may be empty). */
  key: string;
  /** Raw markdown note content, for the detail renderer. */
  content: string;
  /** The raw note, kept for `<NoteRenderer note=... />`. */
  note: Note;
}

const STATUS_VALUES: Status[] = ["wishlist", "learning", "learned"];
const DIFFICULTY_VALUES: Difficulty[] = ["easy", "medium", "hard"];
const PLAY_ON_VALUES: PlayOn[] = ["harmonium", "guitar", "both"];

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function oneOf<T extends string>(v: unknown, allowed: T[], fallback: T): T {
  return typeof v === "string" && (allowed as string[]).includes(v)
    ? (v as T)
    : fallback;
}

/** Pull a display title from the note's first markdown H1, else the path tail. */
export function titleOf(note: Note): string {
  const heading = note.content?.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (heading) return heading;
  const tail = note.path?.split("/").pop();
  return tail ?? note.id;
}

/** Project a raw vault note into the typed Song shape the UI works with. */
export function toSong(note: Note): Song {
  const m = note.metadata ?? {};
  return {
    id: note.id,
    path: note.path ?? note.id,
    title: titleOf(note),
    status: oneOf(m.status, STATUS_VALUES, "wishlist"),
    difficulty: oneOf(m.difficulty, DIFFICULTY_VALUES, "medium"),
    playOn: oneOf(m.play_on, PLAY_ON_VALUES, "guitar"),
    sing: m.sing === true,
    artist: str(m.artist),
    key: str(m.key),
    content: str(note.content),
    note,
  };
}

/** Display order for the status journey: in-progress first, done last. */
export const STATUS_ORDER: Status[] = ["learning", "wishlist", "learned"];

export const STATUS_LABEL: Record<Status, string> = {
  wishlist: "Wishlist",
  learning: "Learning",
  learned: "Learned",
};

export const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

export const PLAY_ON_ICON: Record<PlayOn, string> = {
  harmonium: "🪗",
  guitar: "🎸",
  both: "🪗🎸",
};

export const PLAY_ON_LABEL: Record<PlayOn, string> = {
  harmonium: "Harmonium",
  guitar: "Guitar",
  both: "Both",
};
