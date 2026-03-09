import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { BookOpen, Menu } from "lucide-react";
import SearchBar from "@/components/ui/SearchBar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Journal of Synthetic Synthesis",
  description: "Cross-disciplinary satirical academic discoveries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${merriweather.variable} antialiased bg-background text-foreground`}
      >
        <header className="border-b border-border bg-white sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-accent" />
              <span className="font-sans font-black text-xl tracking-tight text-accent uppercase">
                JSYS
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600 uppercase tracking-widest">
              <div className="relative group py-6">
                <Link href="/" className="hover:underline hover:text-accent">Current Issue</Link>
                {/* Category Dropdown */}
                <div className="absolute top-full left-0 w-48 bg-white border border-slate-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 rounded-sm">
                  <div className="flex flex-col py-2 border-t-2 border-accent text-xs">
                    <Link href="/search?q=Technology" className="px-4 py-3 hover:bg-slate-50 hover:text-accent border-b border-slate-100">Technology</Link>
                    <Link href="/search?q=Science" className="px-4 py-3 hover:bg-slate-50 hover:text-accent border-b border-slate-100">Science</Link>
                    <Link href="/search?q=Politics" className="px-4 py-3 hover:bg-slate-50 hover:text-accent border-b border-slate-100">Politics</Link>
                    <Link href="/search?q=Society" className="px-4 py-3 hover:bg-slate-50 hover:text-accent border-b border-slate-100">Society</Link>
                    <Link href="/search?q=Economics" className="px-4 py-3 hover:bg-slate-50 hover:text-accent">Economics</Link>
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
              <button className="md:hidden p-2 text-slate-400">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        <main>{children}</main>

        <footer className="bg-slate-50 border-t border-border mt-20 py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm text-slate-400 font-sans tracking-tight">
              © {new Date().getFullYear()} Journal of Synthetic Synthesis.
              Peer reviewed by Silicon.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

