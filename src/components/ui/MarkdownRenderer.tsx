"use client";

import ReactMarkdown from "react-markdown";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

/**
 * Academic-style Markdown renderer.
 * Uses tailwind/typography (prose) with custom overrides for a paper feel.
 */
export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    return (
        <div className={cn(
            "prose prose-slate prose-lg max-w-none",
            "prose-headings:font-sans prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-accent",
            "prose-p:font-serif prose-p:leading-relaxed prose-p:text-slate-800",
            "prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-slate-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic",
            "prose-a:text-accent prose-a:no-underline hover:prose-a:underline",
            "prose-img:rounded-lg prose-img:border prose-img:border-border",
            className
        )}>
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );
}
