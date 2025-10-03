/**
 * Locator Utilities - Helper functions for robust element selection
 */

/**
 * Escape special characters in text for CSS selectors
 */
export function escapeTextForSelector(text: string): string {
  if (!text) return '';
  
  // Escape special characters that break CSS selectors
  return text
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\t/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Truncate long text for selectors while preserving uniqueness
 */
export function truncateTextForSelector(text: string, maxLength: number = 50): string {
  if (!text || text.length <= maxLength) return text;
  
  // Find a good breaking point (space, punctuation)
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  const lastPunctuation = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf(','),
    truncated.lastIndexOf(';')
  );
  
  const breakPoint = Math.max(lastSpace, lastPunctuation);
  
  if (breakPoint > maxLength * 0.7) {
    return text.substring(0, breakPoint).trim();
  }
  
  return truncated.trim();
}

/**
 * Create a safe text selector that works with special characters
 */
export function createSafeTextSelector(text: string, selectorType: 'has-text' | 'text' = 'has-text'): string {
  if (!text) return '';
  
  const truncatedText = truncateTextForSelector(text, 100);
  const escapedText = escapeTextForSelector(truncatedText);
  
  if (selectorType === 'has-text') {
    return `:has-text("${escapedText}")`;
  } else {
    return `text="${escapedText}"`;
  }
}

/**
 * Create multiple selector strategies for robust element finding
 */
export function createMultipleSelectors(text: string, elementType?: string): string[] {
  if (!text) return [];
  
  const selectors: string[] = [];
  const truncatedText = truncateTextForSelector(text, 100);
  const escapedText = escapeTextForSelector(truncatedText);
  
  // Strategy 1: Exact text match
  if (elementType) {
    selectors.push(`${elementType}:has-text("${escapedText}")`);
  }
  
  // Strategy 2: Contains text
  selectors.push(`text="${escapedText}"`);
  
  // Strategy 3: Partial text match for long descriptions
  if (text.length > 50) {
    const firstPart = truncateTextForSelector(text, 30);
    const escapedFirstPart = escapeTextForSelector(firstPart);
    selectors.push(`text="${escapedFirstPart}"`);
  }
  
  // Strategy 4: Title attribute
  selectors.push(`[title*="${escapedText}"]`);
  
  // Strategy 5: Alt attribute for images
  selectors.push(`[alt*="${escapedText}"]`);
  
  return selectors;
}

/**
 * Validate if a selector is safe to use
 */
export function isSelectorSafe(selector: string): boolean {
  try {
    // Try to parse the selector - if it throws, it's not safe
    document.querySelector(selector);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get the first working selector from a list
 */
export function getWorkingSelector(selectors: string[]): string | null {
  for (const selector of selectors) {
    if (isSelectorSafe(selector)) {
      return selector;
    }
  }
  return null;
}
