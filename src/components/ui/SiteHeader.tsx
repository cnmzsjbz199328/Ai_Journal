"use client";

import Link from "next/link";
import { BookOpen, Menu, X } from "lucide-react";
import SearchBar from "@/components/ui/SearchBar";
import { useState } from "react";

export default function SiteHeader() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header className="border-b border-border bg-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <BookOpen className="w-6 h-6 text-accent" />
                    <span className="font-sans font-black text-xl tracking-tight text-accent uppercase">
                        JSYS
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600 uppercase tracking-widest">
                    <div className="relative group py-6">
                        <Link href="/" className="hover:underline hover:text-accent">Current Issue</Link>
                        {/* Category Dropdown */}
                        <div className="absolute top-full left-0 w-48 bg-white border border-slate-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 rounded-sm">
                            <div className="flex flex-col py-2 border-t-2 border-accent text-xs">
                                <Link href="/search?category=Technology" className="px-4 py-3 hover:bg-slate-50 hover:text-accent border-b border-slate-100">Technology</Link>
                                <Link href="/search?category=Science" className="px-4 py-3 hover:bg-slate-50 hover:text-accent border-b border-slate-100">Science</Link>
                                <Link href="/search?category=Politics" className="px-4 py-3 hover:bg-slate-50 hover:text-accent border-b border-slate-100">Politics</Link>
                                <Link href="/search?category=Society" className="px-4 py-3 hover:bg-slate-50 hover:text-accent border-b border-slate-100">Society</Link>
                                <Link href="/search?category=Economics" className="px-4 py-3 hover:bg-slate-50 hover:text-accent">Economics</Link>
                            </div>
                        </div>
                    </div>
                    <Link href="/archive" className="hover:underline hover:text-accent">Archive</Link>
                    <Link href="/about" className="hover:underline hover:text-accent">About</Link>
                    <Link href="/admin" className="hover:underline hover:text-accent">Admin</Link>
                </nav>

                <div className="flex items-center space-x-4">
                    <div className="hidden md:block">
                        <SearchBar />
                    </div>
                    {/* Mobile Hamburger Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-400 hover:text-accent transition-colors"
                        onClick={toggleMobileMenu}
                        aria-label="Toggle Menu"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white shadow-lg absolute w-full left-0 origin-top animate-in slide-in-from-top-2">
                    <div className="px-4 pt-4 pb-6 space-y-4">
                        <div className="pb-4 border-b border-slate-100">
                            <SearchBar />
                        </div>
                        <div className="flex flex-col space-y-4 font-sans text-sm font-medium text-slate-700 tracking-widest uppercase">
                            <Link href="/" onClick={toggleMobileMenu} className="hover:text-accent">Current Issue</Link>

                            {/* Mobile Categories - Indented manually */}
                            <div className="flex flex-col pl-4 border-l-2 border-accent/20 space-y-3 text-xs text-slate-500">
                                <Link href="/search?category=Technology" onClick={toggleMobileMenu}>Technology</Link>
                                <Link href="/search?category=Science" onClick={toggleMobileMenu}>Science</Link>
                                <Link href="/search?category=Politics" onClick={toggleMobileMenu}>Politics</Link>
                                <Link href="/search?category=Society" onClick={toggleMobileMenu}>Society</Link>
                                <Link href="/search?category=Economics" onClick={toggleMobileMenu}>Economics</Link>
                            </div>

                            <Link href="/archive" onClick={toggleMobileMenu} className="hover:text-accent">Archive</Link>
                            <Link href="/about" onClick={toggleMobileMenu} className="hover:text-accent">About</Link>
                            <Link href="/admin" onClick={toggleMobileMenu} className="hover:text-accent">Admin</Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
