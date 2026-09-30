import type { ClaimCategory, ClaimEntry } from "./types";

/** Lowercase, strip punctuation, collapse whitespace. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Two values are considered "the same fact" if they're equal once normalized,
 * or one contains the other (e.g. "the gym" vs "gym on 5th street" both
 * mention the gym, so we don't want to flag that as a contradiction).
 */
function sameFact(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return true;
  if (na === nb) return true;
  return na.includes(nb) || nb.includes(na);
}

export interface ContradictionCheckResult {
  contradicts: boolean;
  original_quote: string;
  original_timestamp: number;
}

/**
 * The first claim recorded for a category becomes the "established fact" for
 * that category. Any later claim in the same category that doesn't match it
 * is a contradiction. This keeps the logic simple and predictable for a demo:
 * the detective only calls this when it suspects the new claim is about the
 * same thing it already pinned down.
 */
export function checkContradiction(
  ledger: ClaimEntry[],
  category: ClaimCategory,
  value: string
): ContradictionCheckResult | null {
  const established = ledger.find((c) => c.category === category);
  if (!established) return null;
  if (sameFact(established.value, value)) return null;
  return {
    contradicts: true,
    original_quote: established.quote,
    original_timestamp: established.timestamp,
  };
}

export interface ExtractedClaim {
  category: ClaimCategory;
  value: string;
}

const TIME_PATTERNS = [
  /\baround\s+\d{1,2}(:\d{2})?\s?(am|pm)?\b/i,
  /\b\d{1,2}:\d{2}\s?(am|pm)?\b/i,
  /\b\d{1,2}\s?(am|pm)\b/i,
  /\bmidnight\b/i,
  /\bnoon\b/i,
  /\b(this morning|this afternoon|this evening|last night|morning|afternoon|evening|night)\b/i,
];

const RELATION_WORDS = new Set([
  "manager",
  "roommate",
  "friend",
  "wife",
  "husband",
  "partner",
  "boss",
  "colleague",
  "sister",
  "brother",
  "mother",
  "father",
  "mom",
  "dad",
  "coworker",
  "neighbor",
  "lawyer",
  "girlfriend",
  "boyfriend",
]);

/** Common capitalized words that show up mid-sentence but aren't names. */
const NAME_STOPWORDS = new Set([
  "i", "we", "they", "he", "she", "you", "it", "so", "well", "oh", "yeah",
  "okay", "alright", "no", "yes", "also", "then", "but", "and", "just",
  "only", "the", "a", "an", "my", "is", "are", "was", "were", "who", "what",
  "where", "when", "why", "how", "did", "do", "does", "can", "could",
  "would", "sir", "mr", "mrs", "ms", "dr", "lets", "tell", "please", "good",
  "fine", "sure", "right", "great", "hello", "hi", "that", "this", "those",
  "these",
]);

/** Capitalized tokens in a sentence that look like proper names, minus common false positives. */
function extractNames(text: string): string[] {
  const matches = text.match(/\b[A-Z][a-z]{1,15}\b/g) ?? [];
  return matches.filter((word) => !NAME_STOPWORDS.has(word.toLowerCase()));
}

const OBJECT_WORDS = new Set([
  "phone",
  "car",
  "keys",
  "key",
  "bag",
  "wallet",
  "laptop",
  "necklace",
  "money",
  "gun",
  "knife",
  "receipt",
  "badge",
  "jacket",
  "coat",
  "purse",
  "backpack",
  "watch",
  "ring",
  "camera",
  "computer",
  "vehicle",
  "bike",
  "bicycle",
  "truck",
]);

/**
 * Best-effort rule-based claim spotter for a single utterance. Not NLP-grade
 * — it's a pragmatic pass that catches the vocabulary alibis are usually made
 * of (times, "at/in <place>", "with <person>"/"my <relation>", common
 * objects), good enough to drive the ledger without an extra network call
 * per utterance.
 */
export function extractClaims(text: string): ExtractedClaim[] {
  const claims: ExtractedClaim[] = [];

  for (const pattern of TIME_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      claims.push({ category: "time", value: match[0].trim() });
      break;
    }
  }

  const placeMatch = text.match(
    /\b(?:at|in|near)\s+([a-z][a-z0-9' ]{2,30}?)(?=[.,!?;]|\s+\b(?:and|with|from|around|at|on)\b|$)/i
  );
  if (placeMatch) {
    const candidate = placeMatch[1].trim();
    if (!/^\d/.test(candidate) && !/\b(am|pm)\b/i.test(candidate)) {
      claims.push({ category: "place", value: candidate });
    }
  }

  if (/\balone\b/i.test(text)) {
    claims.push({ category: "person", value: "alone" });
  } else {
    const relationMatch = text.match(new RegExp(`\\bmy\\s+(${[...RELATION_WORDS].join("|")})\\b`, "i"));
    if (relationMatch) {
      claims.push({ category: "person", value: relationMatch[0].trim() });
    } else {
      // "with <Name>[, <Name> and <Name>]" — captures multi-name lists, and
      // stops before a trailing correction like ", not Mac" since "not" is
      // lowercase and breaks the repeating capitalized-name group.
      const withMatch = text.match(/\bwith\s+([A-Z][a-z]+(?:\s*(?:,|and)\s*[A-Z][a-z]+)*)/);
      if (withMatch) {
        claims.push({ category: "person", value: withMatch[1].trim() });
      } else {
        // Fallback: a bare list of names with no "with" ("Jimmy and Jack.",
        // "It was Jimmy and Mac.") — common when answering "who was there?".
        const names = extractNames(text);
        if (names.length > 0) {
          claims.push({ category: "person", value: names.join(" and ") });
        }
      }
    }
  }

  const objectMatch = text.match(
    new RegExp(`\\b(?:my|the|a)\\s+(${[...OBJECT_WORDS].join("|")})\\b`, "i")
  );
  if (objectMatch) {
    claims.push({ category: "object", value: objectMatch[1].toLowerCase() });
  }

  return claims;
}

export function createClaim(
  category: ClaimCategory,
  value: string,
  quote: string,
  timestamp: number,
  contradicts?: ClaimEntry["contradicts"]
): ClaimEntry {
  return {
    id: `claim-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
    category,
    value,
    quote,
    timestamp,
    contradicts,
  };
}
