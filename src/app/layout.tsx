import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { BookOpen, Search, Menu } from "lucide-react";

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
              <Link href="/" className="hover:underline hover:text-accent">Current Issue</Link>
              <Link href="/archive" className="hover:underline hover:text-accent">Archive</Link>
              <Link href="/about" className="hover:underline hover:text-accent">About</Link>
              <Link href="/admin" className="hover:underline hover:text-accent">Admin</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-400 hover:text-accent">
                <Search className="w-5 h-5" />
              </button>
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

