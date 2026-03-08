"use client";

import { useEffect, useState } from "react";
import { Send, User, MessageCircle } from "lucide-react";

interface Comment {
    id: string;
    authorName: string;
    content: string;
    createdAt: string;
}

/**
 * Peer Review / Comment section.
 * Client-side interacting with /api/articles/[id]/comments.
 */
export default function CommentSection({ articleId }: { articleId: string }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [authorName, setAuthorName] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchComments() {
            try {
                const res = await fetch(`/api/articles/${articleId}/comments`);
                const data = await res.json();
                if (data.comments) setComments(data.comments);
            } catch (err) {
                console.error("Failed to load comments:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchComments();
    }, [articleId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/articles/${articleId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ authorName, content }),
            });

            if (res.ok) {
                setContent("");
                setAuthorName("");
                // Reload comments
                const data = await fetch(`/api/articles/${articleId}/comments`).then(r => r.json());
                if (data.comments) setComments(data.comments);
            }
        } catch (err) {
            console.error("Failed to post comment:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
                <h2 className="flex items-center text-2xl font-sans font-black tracking-tight text-accent uppercase italic">
                    <MessageCircle className="w-7 h-7 mr-3 text-accent" /> Peer Reviews
                </h2>
                <span className="bg-slate-100 px-3 py-1 rounded text-xs font-sans font-black text-slate-400 uppercase tracking-widest leading-none">
                    {comments.length} Open Discussions
                </span>
            </div>

            {/* Review Submission Form */}
            <form onSubmit={handleSubmit} className="p-8 bg-slate-50 border border-slate-200 rounded-sm space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center space-x-4 border-b border-slate-200 pb-2">
                        <User className="w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Full Name / Affiliation (Optional)"
                            className="bg-transparent flex-grow outline-none text-sm font-sans font-bold text-accent placeholder:text-slate-300 uppercase tracking-[0.1em]"
                            value={authorName}
                            onChange={e => setAuthorName(e.target.value)}
                        />
                    </div>
                    <textarea
                        placeholder="Type your review or critique..."
                        className="w-full h-32 bg-transparent outline-none text-sm font-serif leading-relaxed text-slate-600 placeholder:text-slate-300 resize-none border-none p-0 focus:ring-0"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        required
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting || !content.trim()}
                        className="inline-flex items-center px-8 py-3 bg-accent text-white font-sans font-black text-xs tracking-widest uppercase hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Review"} <Send className="ml-3 w-4 h-4" />
                    </button>
                </div>
            </form>

            {/* Reviews List */}
            <div className="space-y-12 pl-4">
                {isLoading ? (
                    <p className="text-slate-400 font-serif italic py-10">Authenticating peer history...</p>
                ) : comments.length === 0 ? (
                    <p className="text-slate-400 font-serif italic py-10">No peer reviews recorded for this paper yet.</p>
                ) : (
                    comments.map(comment => (
                        <article key={comment.id} className="space-y-4 pt-12 first:pt-0 border-t border-slate-100 first:border-0">
                            <div className="flex items-center space-x-3 text-xs font-sans font-black uppercase tracking-widest text-slate-400">
                                <span className="text-accent">{comment.authorName}</span>
                                <span className="text-slate-200">•</span>
                                <span>{new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                            <p className="font-serif text-slate-700 leading-relaxed italic max-w-prose">
                                "{comment.content}"
                            </p>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
}
