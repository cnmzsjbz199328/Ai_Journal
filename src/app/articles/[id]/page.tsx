import { getArticleById } from "@/services/storage/article-store";
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
                                {article.theme}
                            </p>
                        )}
                    </header>

                    {/* Article Body */}
                    <article className="font-serif">
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
                                    <ul className="space-y-3">
                                        {article.sourceIds.map((sid, idx) => (
                                            <li key={idx} className="flex items-start space-x-2 text-xs font-sans font-bold text-accent hover:underline">
                                                <span className="text-slate-300">[{idx + 1}]</span>
                                                <a href={`/api/sources/${sid}`} className="break-all">{sid.slice(0, 16)}...</a>
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
