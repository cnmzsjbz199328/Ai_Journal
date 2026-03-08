/**
 * Verification: AI response parser utilities.
 */

import { describe, it, expect } from 'vitest';
import { stripThinkTags, extractJSON, parseAIResponse } from '../../src/services/ai/parser';

describe('stripThinkTags', () => {
    it('removes <think> blocks', () => {
        const input = '<think>\nSome reasoning here.\n</think>\n\n{"key": "value"}';
        expect(stripThinkTags(input)).toBe('{"key": "value"}');
    });

    it('handles multiple think blocks', () => {
        const input = '<think>step 1</think>\nMiddle\n<think>step 2</think>\nEnd';
        const result = stripThinkTags(input);
        expect(result).toContain('Middle');
        expect(result).toContain('End');
        expect(result).not.toContain('<think>');
    });

    it('is case-insensitive', () => {
        const input = '<THINK>reasoning</THINK>\n{"a": 1}';
        expect(stripThinkTags(input)).toBe('{"a": 1}');
    });

    it('returns unchanged text with no think tags', () => {
        expect(stripThinkTags('{"a": 1}')).toBe('{"a": 1}');
    });
});

describe('extractJSON', () => {
    it('parses clean JSON', () => {
        const result = extractJSON<{ key: string }>('{"key": "value"}');
        expect(result.key).toBe('value');
    });

    it('strips think tags then parses', () => {
        const input = '<think>reasoning</think>\n\n{"status": "ok"}';
        const result = extractJSON<{ status: string }>(input);
        expect(result.status).toBe('ok');
    });

    it('extracts JSON from prose (fallback)', () => {
        const input = 'Here is my response: {"name": "test", "value": 42} as you can see.';
        const result = extractJSON<{ name: string; value: number }>(input);
        expect(result.name).toBe('test');
        expect(result.value).toBe(42);
    });

    it('throws on unparseable content', () => {
        expect(() => extractJSON('This is not JSON at all.')).toThrow();
    });
});

describe('parseAIResponse', () => {
    it('parses and validates required keys', () => {
        const input = '{"selectedIds": ["1", "2"], "theme": "test"}';
        const result = parseAIResponse<{ selectedIds: string[]; theme: string }>(
            input, ['selectedIds', 'theme'],
        );
        expect(result.theme).toBe('test');
    });

    it('throws when required key is missing', () => {
        expect(() =>
            parseAIResponse<{ required: string }>('{"other": "field"}', ['required']),
        ).toThrow();
    });
});
