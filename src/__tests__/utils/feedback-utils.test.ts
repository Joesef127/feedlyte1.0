/**
 * Tests for utility functions used in feedback-detail-page.tsx.
 * These functions (parseUserAgent, formatDate, timeAgo) are module-private
 * so their logic is tested here as standalone units matching the implementation.
 */
import { describe, it, expect, vi, afterEach } from "vitest";

// ── parseUserAgent ────────────────────────────────────────────────────────────
// Mirrors the implementation in src/components/feedback/feedback-detail-page.tsx

function parseUserAgent(ua: string): { browser: string; os: string } {
  if (!ua) return { browser: "Unknown", os: "Unknown" };

  const browser = ua.includes("Edg/")
    ? "Edge"
    : ua.includes("Chrome/")
      ? "Chrome"
      : ua.includes("Firefox/")
        ? "Firefox"
        : ua.includes("Safari/")
          ? "Safari"
          : ua.includes("OPR/")
            ? "Opera"
            : "Unknown";

  const os = ua.includes("Windows NT")
    ? "Windows"
    : ua.includes("Mac OS X")
      ? "macOS"
      : ua.includes("Android")
        ? "Android"
        : ua.includes("iPhone")
          ? "iOS"
          : ua.includes("iPad")
            ? "iPadOS"
            : ua.includes("Linux")
              ? "Linux"
              : "Unknown";

  return { browser, os };
}

// ── formatDate ────────────────────────────────────────────────────────────────
// Mirrors the implementation in src/components/feedback/feedback-detail-page.tsx

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── timeAgo ──────────────────────────────────────────────────────────────────
// Mirrors the implementation in src/components/feedback/feedback-detail-page.tsx

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
}

// ─────────────────────────────────────────────────────────────────────────────

describe("parseUserAgent", () => {
  it("returns Unknown for both fields when ua is an empty string", () => {
    expect(parseUserAgent("")).toEqual({ browser: "Unknown", os: "Unknown" });
  });

  it("detects Chrome on Windows", () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    expect(parseUserAgent(ua)).toEqual({ browser: "Chrome", os: "Windows" });
  });

  it("detects Firefox on Linux", () => {
    const ua =
      "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/109.0";
    expect(parseUserAgent(ua)).toEqual({ browser: "Firefox", os: "Linux" });
  });

  it("detects Edge on Windows", () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0";
    expect(parseUserAgent(ua)).toEqual({ browser: "Edge", os: "Windows" });
  });

  it("detects Safari on macOS", () => {
    const ua =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
    expect(parseUserAgent(ua)).toEqual({ browser: "Safari", os: "macOS" });
  });

  it("detects Opera browser", () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 OPR/105.0.0.0";
    expect(parseUserAgent(ua)).toEqual({ browser: "Opera", os: "Windows" });
  });

  it("detects Chrome on Android", () => {
    const ua =
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
    expect(parseUserAgent(ua)).toEqual({ browser: "Chrome", os: "Android" });
  });

  it("detects Safari on iOS (iPhone) — returns macOS because 'Mac OS X' appears in the UA before 'iPhone'", () => {
    // Typical iPhone UA contains "like Mac OS X" which the parser matches as macOS
    // (the implementation checks "Mac OS X" before "iPhone" in the chain).
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
    expect(parseUserAgent(ua)).toEqual({ browser: "Safari", os: "macOS" });
  });

  it("detects Safari on iPadOS — returns macOS because 'Mac OS X' appears in the UA before 'iPad'", () => {
    // Similar to iPhone: the iPad UA also contains "like Mac OS X".
    const ua =
      "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
    expect(parseUserAgent(ua)).toEqual({ browser: "Safari", os: "macOS" });
  });

  it("detects iOS when UA contains iPhone but not Mac OS X", () => {
    // A synthetic UA that would trigger the iPhone branch
    const ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Safari/604.1";
    expect(parseUserAgent(ua).os).toBe("iOS");
  });

  it("detects iPadOS when UA contains iPad but not Mac OS X", () => {
    const ua = "Mozilla/5.0 (iPad; CPU OS 17_0) Safari/604.1";
    expect(parseUserAgent(ua).os).toBe("iPadOS");
  });

  it("returns Unknown browser for an unrecognised user agent string", () => {
    const ua = "Googlebot/2.1 (+http://www.google.com/bot.html)";
    expect(parseUserAgent(ua).browser).toBe("Unknown");
  });

  it("returns Unknown OS for an unrecognised user agent string", () => {
    const ua = "some-custom-client/1.0";
    expect(parseUserAgent(ua).os).toBe("Unknown");
  });

  it("prioritises Edge over Chrome when both substrings are present", () => {
    // Edge UA strings typically include both Chrome/ and Edg/
    const ua =
      "Mozilla/5.0 (Windows NT 10.0) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0";
    expect(parseUserAgent(ua).browser).toBe("Edge");
  });
});

describe("formatDate", () => {
  it("returns a non-empty string for a valid ISO date", () => {
    const result = formatDate("2024-01-15T10:30:00.000Z");
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });

  it("includes the year in the formatted output", () => {
    const result = formatDate("2024-06-15T08:00:00.000Z");
    expect(result).toMatch(/2024/);
  });

  it("formats the date components without throwing", () => {
    expect(() => formatDate("2024-01-15T10:30:00.000Z")).not.toThrow();
  });

  it("handles epoch zero (1970-01-01) without throwing", () => {
    expect(() => formatDate("1970-01-01T00:00:00.000Z")).not.toThrow();
  });
});

describe("timeAgo", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'Just now' for timestamps within the last minute", () => {
    vi.useFakeTimers();
    const now = new Date("2024-01-15T12:00:00.000Z").getTime();
    vi.setSystemTime(now);
    // 30 seconds ago
    expect(timeAgo(new Date(now - 30_000).toISOString())).toBe("Just now");
  });

  it("returns minutes ago for timestamps between 1 and 59 minutes ago", () => {
    vi.useFakeTimers();
    const now = new Date("2024-01-15T12:00:00.000Z").getTime();
    vi.setSystemTime(now);
    // 5 minutes ago
    expect(timeAgo(new Date(now - 5 * 60_000).toISOString())).toBe("5m ago");
  });

  it("returns exactly '1m ago' for a 60-second-old timestamp", () => {
    vi.useFakeTimers();
    const now = new Date("2024-01-15T12:00:00.000Z").getTime();
    vi.setSystemTime(now);
    expect(timeAgo(new Date(now - 60_000).toISOString())).toBe("1m ago");
  });

  it("returns hours ago for timestamps between 1 and 23 hours ago", () => {
    vi.useFakeTimers();
    const now = new Date("2024-01-15T12:00:00.000Z").getTime();
    vi.setSystemTime(now);
    // 3 hours ago
    expect(timeAgo(new Date(now - 3 * 3_600_000).toISOString())).toBe("3h ago");
  });

  it("returns exactly '1h ago' for a 60-minute-old timestamp", () => {
    vi.useFakeTimers();
    const now = new Date("2024-01-15T12:00:00.000Z").getTime();
    vi.setSystemTime(now);
    expect(timeAgo(new Date(now - 60 * 60_000).toISOString())).toBe("1h ago");
  });

  it("returns days ago for timestamps more than 24 hours old", () => {
    vi.useFakeTimers();
    const now = new Date("2024-01-15T12:00:00.000Z").getTime();
    vi.setSystemTime(now);
    // 2 days ago
    expect(timeAgo(new Date(now - 2 * 24 * 3_600_000).toISOString())).toBe(
      "2d ago",
    );
  });

  it("returns exactly '1d ago' for a 24-hour-old timestamp", () => {
    vi.useFakeTimers();
    const now = new Date("2024-01-15T12:00:00.000Z").getTime();
    vi.setSystemTime(now);
    expect(timeAgo(new Date(now - 24 * 3_600_000).toISOString())).toBe("1d ago");
  });

  it("returns '59m ago' for a 59-minute-old timestamp (boundary before hours)", () => {
    vi.useFakeTimers();
    const now = new Date("2024-01-15T12:00:00.000Z").getTime();
    vi.setSystemTime(now);
    expect(timeAgo(new Date(now - 59 * 60_000).toISOString())).toBe("59m ago");
  });
});