import Link from "next/link";
import { getArticles } from "@/services/storage/article-store";
import { ArrowRight, Calendar, Clock, BookOpen } from "lucide-react";

/**
 * Homepage ("Current Issue").
 * Shows the featured paper and a table of contents for the latest issues.
 */
export default async function HomePage() {
  let publishedArticles: any[] = [];
  try {
    const res = await getArticles({ status: "published", limit: 6 });
    publishedArticles = res.rows;
  } catch (error) {
    // Graceful fallback during static build when DB is unavailable
    console.warn("Could not fetch articles during build:", error);
  }

  const featured = publishedArticles[0];
  const others = publishedArticles.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Editorial Header */}
      <section className="mb-16 text-center border-y border-border py-4 bg-slate-50 flex items-center justify-between px-8 text-xs font-sans tracking-[0.2em] font-bold uppercase text-slate-500">
        <span>Volume {new Date().getFullYear()}</span>
        <span className="text-accent">Peer-Reviewed Artificial Intelligence</span>
        <span>Issue {Math.ceil(new Date().getMonth() / 3) + 1}</span>
      </section>

      {/* Featured Paper (Hero) */}
      {featured ? (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20 items-center">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-2 text-accent font-sans font-black text-xs uppercase tracking-widest">
              <span>Featured Discovery</span>
              <BookOpen className="w-4 h-4" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-black leading-[1.1] text-accent tracking-tighter">
              {featured.title}
            </h1>
            <p className="text-xl text-slate-600 font-serif leading-relaxed max-w-2xl">
              {featured.theme}
            </p>
            <div className="flex items-center space-x-6 text-sm text-slate-400 font-sans font-medium uppercase tracking-widest">
              <span className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> {new Date(featured.publishedAt!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span className="flex items-center"><Clock className="w-4 h-4 mr-2" /> {Math.ceil(featured.wordCount! / 200)} min read</span>
            </div>
            <Link
              href={`/articles/${featured.id}`}
              className="inline-flex items-center px-8 py-4 bg-accent text-white font-sans font-bold text-sm tracking-widest uppercase hover:bg-slate-800 transition-colors"
            >
              Read Full Paper <ArrowRight className="ml-3 w-5 h-5" />
            </Link>
          </div>
          <div className="hidden lg:block bg-accent aspect-[3/4] rounded-sm group relative overflow-hidden">
            {/* Abstract Panel overlay */}
            <div className="absolute inset-x-0 bottom-0 p-8 bg-black/60 backdrop-blur-md border-t border-white/20 text-white space-y-4">
              <span className="text-xs font-black uppercase tracking-widest text-blue-300">Abstract Preview</span>
              <p className="text-sm font-serif line-clamp-4 leading-relaxed opacity-90 italic">
                "{featured.theme}" is a multi-modal investigation into the synthetic connections across heterogeneous data silos.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <section className="text-center py-20 bg-slate-50 border border-dashed border-border rounded">
          <p className="text-slate-400 font-serif italic">The journal is currently in editorial review. No papers published yet.</p>
        </section>
      )}

      {/* Table of Contents (Rest of Latest) */}
      {others.length > 0 && (
        <section>
          <div className="border-b-2 border-accent mb-8 pb-2">
            <h2 className="text-2xl font-sans font-black tracking-tight text-accent uppercase italic">Latest Research</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {others.map((article) => (
              <article key={article.id} className="group space-y-4">
                <span className="block text-xs font-sans font-black uppercase tracking-widest text-slate-400 group-hover:text-accent transition-colors">
                  {article.category || 'Miscellaneous'}
                </span>
                <Link href={`/articles/${article.id}`}>
                  <h3 className="text-xl font-sans font-bold leading-snug text-accent hover:underline">
                    {article.title}
                  </h3>
                </Link>
                <p className="text-slate-500 font-serif text-base line-clamp-3 italic">
                  {article.theme}
                </p>
                <div className="text-xs font-sans font-medium text-slate-400 flex items-center">
                  {new Date(article.publishedAt!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {article.wordCount} words
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
