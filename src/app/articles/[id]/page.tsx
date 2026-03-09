import { getArticleById } from "@/services/storage/article-store";
import { getSourcesByIds } from "@/services/storage/source-store";
import { notFound } from "next/navigation";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import CommentSection from "@/components/comments/CommentSection";
import { Info, ExternalLink, Cpu, Hash, FileText } from "lucide-react";

interface ArticlePageProps {
    params: Promise<{ id: string }>;
}

/**
 * Article detail view.
 * 2-Column layout: Content on the left, AI Transparency Panel on the right.
 */
export default async function ArticlePage({ params }: ArticlePageProps) {
    const { id } = await params;
    const article = await getArticleById(id);

    if (!article) notFound();

    // Fetch rich source metadata for the sidebar and cover image
    const sources = await getSourcesByIds(article.sourceIds);
    const coverImage = article.coverImage || sources.find(s => s.imageUrl)?.imageUrl;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="lg:grid lg:grid-cols-3 lg:gap-16">

                {/* Main Content Area (Left/Wide) */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Header Metadata */}
                    <header className="space-y-6 pb-12 border-b border-border">
                        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 font-sans font-black text-xs uppercase tracking-widest rounded-sm">
                            Original Research
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-sans font-black text-accent leading-tight tracking-tighter">
                            {article.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-slate-400 font-sans font-medium uppercase tracking-widest">
                            <span>Published: {new Date(article.publishedAt!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            <span>DOI: 10.1598/JSYS.{article.id.slice(0, 8)}</span>
                            <span>Model: {article.aiModel || 'NVIDIA Llama'}</span>
                        </div>
                        {article.theme && (
                            <p className="text-xl text-slate-600 font-serif italic border-l-4 border-accent pl-6 py-2 leading-relaxed">
                                {article.abstract || article.theme}
                            </p>
                        )}
                        {coverImage && (
                            <div className="mt-8 aspect-video w-full overflow-hidden rounded-sm border border-slate-200 bg-slate-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={coverImage}
                                    alt={article.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </header>

                    {/* Article Body */}
                    <article className="font-serif max-w-none w-full">
                        <MarkdownRenderer content={article.content} />
                    </article>

                    {/* Comments / Peer Review Section */}
                    <section className="pt-20 border-t-2 border-slate-100">
                        <CommentSection articleId={article.id} />
                    </section>
                </div>

                {/* AI Transparency Panel (Right/Narrow Sidebar) */}
                <aside className="mt-16 lg:mt-0 space-y-8">
                    <div className="sticky top-24 space-y-8">
                        {/* Main AI Transparency Card */}
                        <div className="p-8 bg-slate-50 border border-slate-200 rounded-sm shadow-sm space-y-6">
                            <div className="flex items-center space-x-3 text-accent font-sans font-black text-xs uppercase tracking-widest border-b border-slate-200 pb-4 mb-2">
                                <Info className="w-5 h-5" />
                                <span>AI Transparency Panel</span>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h4 className="flex items-center text-xs font-black uppercase text-slate-400 tracking-widest">
                                        <Cpu className="w-4 h-4 mr-2" /> Rationale
                                    </h4>
                                    <p className="text-sm font-serif text-slate-600 italic leading-relaxed">
                                        {article.gatekeeperRationale || "This paper explores the cross-domain interactions identified within the synthetic knowledge stream."}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="flex items-center text-xs font-black uppercase text-slate-400 tracking-widest">
                                        <ExternalLink className="w-4 h-4 mr-2" /> Data Sources ({article.sourceIds.length})
                                    </h4>
                                    {/* Display actual source links instead of raw UUIDs */}
                                    <ul className="space-y-4">
                                        {sources.map((source, idx) => (
                                            <li key={source.id} className="flex flex-col space-y-1">
                                                <div className="flex items-start text-xs font-sans font-bold text-accent">
                                                    <span className="text-slate-300 mr-2">[{idx + 1}]</span>
                                                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:underline line-clamp-2">
                                                        {source.title}
                                                    </a>
                                                </div>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-widest pl-6">
                                                    {source.sourceName}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="space-y-2 pt-4 border-t border-slate-200">
                                    <div className="flex justify-between text-[10px] font-sans font-black uppercase text-slate-400 tracking-widest">
                                        <span className="flex items-center"><FileText className="w-3 h-3 mr-1" /> Words</span>
                                        <span>{article.wordCount}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-sans font-black uppercase text-slate-400 tracking-widest">
                                        <span className="flex items-center"><Hash className="w-3 h-3 mr-1" /> Volume</span>
                                        <span>2026.03.08</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Supplementary Info */}
                        <div className="p-8 bg-white border border-slate-100 rounded-sm space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Journal Metics</h4>
                            <p className="text-xs font-serif text-slate-500 italic">
                                This paper has passed the automated structural validation protocol for ethical synthetic generation.
                            </p>
                        </div>
                    </div>
                </aside>

            </div>
        </div>
    );
}
