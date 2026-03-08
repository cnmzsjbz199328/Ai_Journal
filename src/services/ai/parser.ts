/**
 * AI Response Parser.
 * Strips <think> reasoning blocks and extracts JSON from AI output.
 * Implements a dual-fallback strategy as learned from the nvidia.ts pattern.
 */

/** Strip <think>...</think> reasoning blocks from AI content */
export function stripThinkTags(content: string): string {
    return content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

/**
 * Extract and parse JSON from AI content.
 * Strategy:
 *  1. Strip think tags → attempt JSON.parse on the whole string
 *  2. Fallback: find the largest {...} block and parse that
 */
export function extractJSON<T>(content: string): T {
    const cleaned = stripThinkTags(content);

    // Attempt 1: parse cleaned content directly
    try {
        return JSON.parse(cleaned) as T;
    } catch {
        // fall through to attempt 2
    }

    // Attempt 2: find the largest {...} block
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[0]) as T;
        } catch {
            // fall through
        }
    }

    throw new Error(
        `Failed to extract JSON from AI response. Preview: ${cleaned.slice(0, 200)}`,
    );
}

/**
 * Parse AI response and validate it has a required set of keys.
 */
export function parseAIResponse<T extends object>(
    content: string,
    requiredKeys: (keyof T)[],
): T {
    const parsed = extractJSON<T>(content);

    for (const key of requiredKeys) {
        if (!(key in (parsed as object))) {
            throw new Error(`AI response missing required key: ${String(key)}`);
        }
    }

    return parsed;
}
