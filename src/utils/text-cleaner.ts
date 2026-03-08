/**
 * Text cleaning utilities.
 * HTML entity decoding, tag stripping, and combined cleanup pipeline.
 */

import { ENTITY_MAP } from '@/config/constants';

/** Decode HTML entities using the centralized ENTITY_MAP + numeric entities */
export function decodeHtmlEntities(str: string): string {
    if (!str) return '';

    let result = str;

    // Decode numeric hex entities: &#x2019; → '
    result = result.replace(
        /&#x([0-9a-fA-F]+);/gi,
        (_, hex) => String.fromCharCode(parseInt(hex, 16)),
    );

    // Decode numeric decimal entities: &#8217; → '
    result = result.replace(
        /&#(\d+);/g,
        (_, dec) => String.fromCharCode(parseInt(dec, 10)),
    );

    // Decode named entities from ENTITY_MAP
    for (const [entity, char] of Object.entries(ENTITY_MAP)) {
        result = result.replaceAll(entity, char);
    }

    return result;
}

/** Strip all HTML tags from a string */
export function stripHtmlTags(str: string): string {
    if (!str) return '';
    return str.replace(/<[^>]*>?/gm, '');
}

/** Combined cleanup: decode entities → strip HTML → trim whitespace */
export function cleanText(str: string): string {
    if (!str) return '';
    return stripHtmlTags(decodeHtmlEntities(str)).trim();
}
