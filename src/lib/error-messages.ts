/**
 * Error Message Normalization
 *
 * Maps technical API / network errors to casual, user-friendly messages
 * for display in toast notifications and inline UI.
 */

type ErrorPattern = {
  /** Substring or regex to match against the error message */
  match: string | RegExp;
  /** The friendly replacement message */
  friendly: string;
};

const ERROR_PATTERNS: ErrorPattern[] = [
  // ── Network / connectivity ───────────────────────────────────────────
  { match: "Failed to fetch",              friendly: "Couldn't reach the server — check your connection and try again." },
  { match: "NetworkError",                 friendly: "Network error — please check your internet connection." },
  { match: "ERR_NETWORK",                  friendly: "Network error — please check your internet connection." },
  { match: "ECONNREFUSED",                 friendly: "Server is temporarily unavailable. Try again in a moment." },
  { match: "Load failed",                  friendly: "Request failed — check your connection and try again." },
  { match: /timeout/i,                     friendly: "The request took too long. Please try again." },

  // ── Auth ─────────────────────────────────────────────────────────────
  { match: "Unauthorized",                 friendly: "Your session may have expired. Please sign in again." },
  { match: "Forbidden",                    friendly: "You don't have permission to do that." },

  // ── Not found ────────────────────────────────────────────────────────
  { match: "not found",                    friendly: "That item couldn't be found — it may have been deleted." },
  { match: "Feedback not found",           friendly: "This feedback entry no longer exists." },
  { match: "Project not found",            friendly: "This project no longer exists." },

  // ── Validation ───────────────────────────────────────────────────────
  { match: "Invalid update payload",       friendly: "Something was off with that update. Please try again." },
  { match: "Invalid JSON",                 friendly: "Something went wrong with the request. Please try again." },
  { match: "already exists",              friendly: "That name is already taken — try a different one." },

  // ── Database / server ────────────────────────────────────────────────
  { match: "Database error",              friendly: "We hit a snag saving that. Please try again." },
  { match: "Database is busy",            friendly: "Things are a bit busy — try again in a few seconds." },
  { match: "Could not connect",           friendly: "Server is temporarily unavailable. Try again in a moment." },
  { match: "Internal Server Error",       friendly: "Something went wrong on our end. Try again in a bit." },
  { match: /^5\d{2}$/,                    friendly: "Something went wrong on our end. Try again in a bit." },

  // ── Generic catch-alls ───────────────────────────────────────────────
  { match: "Failed to update status",     friendly: "Couldn't update the status — please try again." },
  { match: "Failed to delete",            friendly: "Couldn't delete that item — please try again." },
  { match: "Failed to create",            friendly: "Couldn't create that — please try again." },
  { match: "Failed to update",            friendly: "Couldn't save those changes — please try again." },
  { match: "Failed to load",              friendly: "Couldn't load the data — try refreshing the page." },
  { match: "Failed to add note",          friendly: "Couldn't save your note — please try again." },
  { match: "Failed to perform bulk",      friendly: "The bulk action didn't go through — please try again." },
];

/**
 * Transforms a technical error into a user-friendly message.
 * Falls back to a generic message if no pattern matches.
 */
export function friendlyError(error: unknown): string {
  const message = error instanceof Error
    ? error.message
    : typeof error === "string"
      ? error
      : "";

  if (!message) return "Something unexpected happened. Please try again.";

  for (const pattern of ERROR_PATTERNS) {
    if (typeof pattern.match === "string") {
      if (message.includes(pattern.match)) return pattern.friendly;
    } else {
      if (pattern.match.test(message)) return pattern.friendly;
    }
  }

  // If the message itself is already short and readable (no stack trace), use it
  if (message.length < 100 && !message.includes("\n") && !message.includes("at ")) {
    return message;
  }

  return "Something unexpected happened. Please try again.";
}
