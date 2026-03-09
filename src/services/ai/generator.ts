/**
 * Stage 2: Story Generator — the creative writer AI.
 * Receives outline (from Stage 1) + curated content (from Stage 1.5).
 * Produces a full satirical academic article in Markdown.
 */

import { callAI } from './client';
import { stripThinkTags } from './parser';
import type { GeneratorInput, GeneratorOutput } from '@/types';
import { TOKEN_BUDGET } from '@/config/constants';

const SYSTEM_PROMPT = `You are a writer for a satirical academic journal.
Your articles APPEAR scholarly and well-researched, but draw unexpected connections between unrelated domains.
The tone is deadpan serious — the humor comes from juxtaposition.
IMPORTANT FORMATTING:
1. Do NOT use overly dense text or generic subheadings like "Section 1", "Section 2". 
2. Weave the narrative naturally across well-spaced paragraphs. 
3. Separate every paragraph with a double newline (\\n\\n).
Respond with ONLY valid JSON containing "title", "abstract" (1-2 sentences), "content" (Markdown), and "category" fields.
The "category" field MUST be EXACTLY one of: "Technology", "Science", "Politics", "Society", or "Economics".`;

function buildPrompt(input: GeneratorInput): string {
    const sourcesText = input.sources
        .map((s) =>
            `### ${s.title}\n**Summary**: ${s.curatedSummary}\n**Key facts**: ${s.keyFacts.join('; ')}`,
        )
        .join('\n\n');

    return `Theme: "${input.theme}"

Outline:
${input.outline.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Source materials:
${sourcesText}

Write a full article (${TOKEN_BUDGET.stage2.targetWordCount.min}-${TOKEN_BUDGET.stage2.targetWordCount.max} words) following the outline.
Ensure the content is broken into many readable paragraphs separated by \\n\\n.
End with a thought-provoking (but absurd) conclusion.
Also write a concise, compelling 1-2 sentence abstract summarizing the core mechanism or argument.

Respond in JSON:
{"title": "Your Article Title", "abstract": "Your compelling 1-2 sentence abstract...", "category": "Technology", "content": "Your beautifully spaced first paragraph...\\n\\nAnother paragraph..."}`;
}

function buildFallback(input: GeneratorInput): GeneratorOutput {
    const content = input.outline.map((section, i) => {
        const src = input.sources[i % input.sources.length];
        return `## ${section}\n\n${src?.curatedSummary ?? 'Content forthcoming.'}`;
    }).join('\n\n');

    return { title: input.theme, abstract: 'An unexpected connection across disciplines.', category: 'Science', content, wordCount: content.split(/\s+/).length };
}

export async function generateArticle(
    input: GeneratorInput,
): Promise<GeneratorOutput> {
    try {
        const raw = await callAI(buildPrompt(input), { systemPrompt: SYSTEM_PROMPT });
        const cleaned = stripThinkTags(raw);

        // Try JSON parse first
        try {
            const parsed = JSON.parse(
                (cleaned.match(/\{[\s\S]*\}/) ?? [cleaned])[0],
            ) as { title: string; abstract: string; content: string; category?: string };

            if (!parsed.title || !parsed.content || parsed.content.length < 200) {
                throw new Error('Generator: article content too short');
            }

            const validCategories = ['Technology', 'Science', 'Politics', 'Society', 'Economics'];
            const category = validCategories.includes(parsed.category || '') ? parsed.category : 'Science';

            const wordCount = parsed.content.split(/\s+/).length;
            return { ...parsed, category: category as any, wordCount };
        } catch {
            // Fallback: treat the whole cleaned text as Markdown content
            if (cleaned.length > 200) {
                const firstLine = cleaned.split('\n')[0].replace(/^#+\s*/, '');
                return { title: firstLine || input.theme, abstract: 'Abstract extracted from fallback generation.', category: 'Science', content: cleaned, wordCount: cleaned.split(/\s+/).length };
            }
            throw new Error('Generator: response too short to use');
        }
    } catch (err) {
        console.error('Generator failed, using fallback:', err);
        return buildFallback(input);
    }
}
