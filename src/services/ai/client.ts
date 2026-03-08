/**
 * AI Client — wraps the unified AI backend with timeout and retry logic.
 * All AI stages use this single client for calls.
 */

import { AI_CONFIG } from '@/config/constants';

interface AIResponse {
    success: boolean;
    content: string;
    model: string;
    provider: string;
    timestamp: string;
}

export interface AICallOptions {
    systemPrompt?: string;
    retries?: number;
}

/**
 * Call the unified AI backend and return the raw content string.
 * Throws on network failure or non-success response.
 */
export async function callAI(
    userPrompt: string,
    options: AICallOptions = {},
): Promise<string> {
    const { systemPrompt, retries = AI_CONFIG.maxRetries } = options;

    const messages: Array<{ role: string; content: string }> = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: userPrompt });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_CONFIG.timeoutMs);

    try {
        const res = await fetch(`${AI_CONFIG.baseUrl}${AI_CONFIG.modelPath}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages }),
            signal: controller.signal,
        });

        if (!res.ok) {
            throw new Error(`AI backend responded with HTTP ${res.status}`);
        }

        const data: AIResponse = await res.json();
        if (!data.success) {
            throw new Error(`AI backend returned success=false`);
        }
        return data.content;
    } catch (err) {
        if (retries > 0) {
            return callAI(userPrompt, { ...options, retries: retries - 1 });
        }
        throw err;
    } finally {
        clearTimeout(timeout);
    }
}
