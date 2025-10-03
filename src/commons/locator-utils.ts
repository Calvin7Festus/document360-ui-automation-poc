/**
 * Locator Utilities - Helper functions for creating safe CSS selectors
 */

/**
 * Escape special characters in text for use in CSS selectors
 */
export function escapeTextForSelector(text: string): string {
  return text.replace(/['"\\]/g, '\\$&');
}

/**
 * Create a safe text selector that handles special characters
 */
export function createSafeTextSelector(text: string): string {
  const escapedText = escapeTextForSelector(text);
  return `text="${escapedText}"`;
}

/**
 * Create multiple selectors for better element matching
 */
export function createMultipleSelectors(text: string): string[] {
  const escapedText = escapeTextForSelector(text);
  return [
    `text="${escapedText}"`,
    `[aria-label="${escapedText}"]`,
    `[title="${escapedText}"]`,
    `*:has-text("${escapedText}")`
  ];
}
