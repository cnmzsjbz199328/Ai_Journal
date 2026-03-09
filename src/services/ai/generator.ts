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
Respond with ONLY valid JSON containing "title", "abstract" (2-3 sentences), and "content" (Markdown) fields.`;

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
Include at least one fabricated-but-plausible citation.
End with a thought-provoking (but absurd) conclusion.
Also write a concise, compelling 2-3 sentence abstract summarizing the core mechanism or argument.

Respond in JSON:
{"title": "Your Article Title", "abstract": "Your compelling 2-3 sentence abstract...", "content": "# Title\\n\\n## Section 1\\n..."}`;
}

function buildFallback(input: GeneratorInput): GeneratorOutput {
    const content = [
        `# ${input.theme}`,
        '',
        input.outline.map((section, i) => {
            const src = input.sources[i % input.sources.length];
            return `## ${section}\n\n${src?.curatedSummary ?? 'Content forthcoming.'}`;
        }).join('\n\n'),
    ].join('\n');

    return { title: input.theme, abstract: 'An unexpected connection across disciplines.', content, wordCount: content.split(/\s+/).length };
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
            ) as { title: string; abstract: string; content: string };

            if (!parsed.title || !parsed.content || parsed.content.length < 200) {
                throw new Error('Generator: article content too short');
            }
            const wordCount = parsed.content.split(/\s+/).length;
            return { ...parsed, wordCount };
        } catch {
            // Fallback: treat the whole cleaned text as Markdown content
            if (cleaned.length > 200) {
                const firstLine = cleaned.split('\n')[0].replace(/^#+\s*/, '');
                return { title: firstLine || input.theme, abstract: 'Abstract extracted from fallback generation.', content: cleaned, wordCount: cleaned.split(/\s+/).length };
            }
            throw new Error('Generator: response too short to use');
        }
    } catch (err) {
        console.error('Generator failed, using fallback:', err);
        return buildFallback(input);
    }
}
