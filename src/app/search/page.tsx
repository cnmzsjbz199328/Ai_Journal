import { getArticles } from "@/services/storage/article-store";
import Link from "next/link";
import { Search, Calendar, Clock } from "lucide-react";

export const metadata = {
    title: "Search Results - Journal of Synthetic Synthesis",
};

interface SearchPageProps {
    searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const params = await searchParams;
    const query = params.q || "";

    let articles: any[] = [];
    if (query) {
        try {
            const res = await getArticles({ status: "published", search: query, limit: 50 });
            articles = res.rows;
        } catch (error) {
            console.warn("Could not fetch search results:", error);
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <header className="mb-16 border-b-2 border-accent pb-6">
                <h1 className="text-3xl font-sans font-black tracking-tight text-accent uppercase flex items-center gap-4">
                    <Search className="w-8 h-8" />
                    Search Results
                </h1>
                <p className="mt-4 text-xl text-slate-500 font-serif italic">
                    {query ? `Showing results for "${query}"` : "Enter a search term to find articles."}
                </p>
            </header>

            {!query ? null : articles.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 border border-dashed border-border rounded">
                    <p className="text-slate-400 font-serif italic">No matching academic papers found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                    {articles.map((article) => (
                        <article key={article.id} className="group space-y-4">
                            <span className="block text-xs font-sans font-black uppercase tracking-widest text-slate-400 group-hover:text-accent transition-colors">
                                {article.category || 'Miscellaneous'}
                            </span>
                            <Link href={`/articles/${article.id}`}>
                                <h3 className="text-2xl font-sans font-bold leading-snug text-accent hover:underline">
                                    {article.title}
                                </h3>
                            </Link>
                            <p className="text-slate-500 font-serif text-base line-clamp-3 italic">
                                {article.theme}
                            </p>
                            <div className="flex items-center gap-4 text-xs font-sans font-medium text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1.5" />
                                    {new Date(article.publishedAt!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1.5" />
                                    {article.wordCount} words
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
