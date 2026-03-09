"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            setQuery("");
        }
    };

    return (
        <form onSubmit={handleSearch} className="relative flex items-center">
            <input
                type="text"
                placeholder="Search JSYS..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full md:w-64 pl-4 pr-10 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all"
            />
            <button
                type="submit"
                className="absolute right-0 p-2 text-slate-400 hover:text-accent"
                aria-label="Search"
            >
                <Search className="w-4 h-4" />
            </button>
        </form>
    );
}
