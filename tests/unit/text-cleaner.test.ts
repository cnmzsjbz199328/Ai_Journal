/**
 * Verification: Text cleaning utilities.
 */

import { describe, it, expect } from 'vitest';
import {
    decodeHtmlEntities,
    stripHtmlTags,
    cleanText,
} from '../../src/utils/text-cleaner';

describe('decodeHtmlEntities', () => {
    it('decodes named entities', () => {
        expect(decodeHtmlEntities('Tom &amp; Jerry')).toBe('Tom & Jerry');
        expect(decodeHtmlEntities('&lt;div&gt;')).toBe('<div>');
        expect(decodeHtmlEntities('&quot;hello&quot;')).toBe('"hello"');
    });

    it('decodes numeric hex entities', () => {
        expect(decodeHtmlEntities('&#x2019;')).toBe('\u2019'); // right single quote
        expect(decodeHtmlEntities('&#x41;')).toBe('A');
    });

    it('decodes numeric decimal entities', () => {
        expect(decodeHtmlEntities('&#8217;')).toBe('\u2019');
        expect(decodeHtmlEntities('&#65;')).toBe('A');
    });

    it('handles empty and null-like inputs', () => {
        expect(decodeHtmlEntities('')).toBe('');
    });

    it('passes through clean text unchanged', () => {
        expect(decodeHtmlEntities('Hello World')).toBe('Hello World');
    });
});

describe('stripHtmlTags', () => {
    it('removes simple tags', () => {
        expect(stripHtmlTags('<p>Hello</p>')).toBe('Hello');
    });

    it('removes self-closing tags', () => {
        expect(stripHtmlTags('Line1<br/>Line2')).toBe('Line1Line2');
    });

    it('removes tags with attributes', () => {
        expect(stripHtmlTags('<a href="https://x.com">Link</a>')).toBe('Link');
    });

    it('handles empty input', () => {
        expect(stripHtmlTags('')).toBe('');
    });
});

describe('cleanText', () => {
    it('combines decode + strip + trim', () => {
        const input = '  <b>Tom &amp; Jerry</b>  ';
        expect(cleanText(input)).toBe('Tom & Jerry');
    });

    it('handles complex nested HTML with entities', () => {
        const input = '<p>Scientists say &quot;discovery&quot; is &amp; remains key</p>';
        expect(cleanText(input)).toBe('Scientists say "discovery" is & remains key');
    });
});
