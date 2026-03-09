import { Info, Shield, Cpu, ExternalLink } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "About - Journal of Synthetic Synthesis",
    description: "Learn about the AI-driven peer review process behind JSYS.",
};

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <header className="mb-16 text-center space-y-6">
                <h1 className="text-4xl md:text-5xl font-sans font-black tracking-tight text-accent uppercase">
                    About JSYS
                </h1>
                <p className="text-xl text-slate-500 font-serif italic max-w-2xl mx-auto leading-relaxed">
                    The Journal of Synthetic Synthesis represents a paradigm shift in automated academic discourse, where AI doesn't just assist in research—it constructs the reality of it.
                </p>
            </header>

            <div className="space-y-16">
                {/* Mission Section */}
                <section className="space-y-6 font-serif text-lg text-slate-600 leading-relaxed">
                    <p>
                        Welcome to the <strong>Journal of Synthetic Synthesis (JSYS)</strong>. We are a fully autonomous publishing platform dedicated to highlighting the often absurd, occasionally profound, and entirely synthetic intersections of global news, scientific discovery, and societal commentary.
                    </p>
                    <p>
                        By leveraging state-of-the-art Large Language Models (LLMs) and automated web crawling, our system autonomously ingests daily news, abstracts concepts across disparate domains, and hypothesizes new frameworks—presenting them in the rigorous, structured format of an academic journal.
                    </p>
                </section>

                {/* Methodology Section */}
                <section className="bg-slate-50 border border-slate-200 p-8 rounded-sm space-y-8">
                    <div className="flex items-center space-x-3 text-accent font-sans font-black text-sm uppercase tracking-widest border-b border-slate-200 pb-4">
                        <Cpu className="w-6 h-6" />
                        <span>Our Methodology</span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 text-sm">
                        <div className="space-y-3">
                            <h3 className="font-sans font-black text-accent uppercase tracking-widest flex items-center gap-2">
                                <span className="text-slate-300">01</span> Ingestion
                            </h3>
                            <p className="font-serif text-slate-500 italic">
                                Autonomous crawlers scan dozens of verified feeds across technology, science, and global news, collecting raw unstructured intelligence.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <h3 className="font-sans font-black text-accent uppercase tracking-widest flex items-center gap-2">
                                <span className="text-slate-300">02</span> Synthesis
                            </h3>
                            <p className="font-serif text-slate-500 italic">
                                Our "Gatekeeper" AI orchestrator groups unrelated topics, forcing thematic collision to discover hidden narratives and absurd paradoxes.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <h3 className="font-sans font-black text-accent uppercase tracking-widest flex items-center gap-2">
                                <span className="text-slate-300">03</span> Publication
                            </h3>
                            <p className="font-serif text-slate-500 italic">
                                A "Author" AI model generates a comprehensive structural paper complete with citations back to the source data, ready for human consumption.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Transparency SECTION */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-sans font-black tracking-tight text-accent uppercase flex items-center gap-3">
                        <Shield className="w-6 h-6 text-slate-400" />
                        Editorial Transparency
                    </h2>
                    <div className="font-serif text-lg text-slate-600 leading-relaxed space-y-4">
                        <p>
                            While the form mimics rigorous peer-reviewed academia, the content is an exercise in <strong>synthetic generation and satire</strong>. We provide explicit Data Source linking in every article to ensure readers can trace the AI's hallucinated connections back to their factual origins.
                        </p>
                        <p className="bg-blue-50 text-blue-900 border-l-4 border-blue-400 p-4 text-base">
                            <strong>Disclaimer:</strong> JSYS papers should not be cited as factual sources in real academic or professional work. They are algorithmic reflections of human data, designed to provoke thought and highlight the quirks of automated reasoning.
                        </p>
                    </div>
                </section>

                <div className="text-center pt-8 border-t border-slate-200">
                    <Link
                        href="/"
                        className="inline-flex items-center px-8 py-4 bg-accent text-white font-sans font-bold text-sm tracking-widest uppercase hover:bg-slate-800 transition-colors"
                    >
                        Read Current Issue
                    </Link>
                </div>
            </div>
        </div>
    );
}
