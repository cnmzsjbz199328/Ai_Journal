import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import SiteHeader from "@/components/ui/SiteHeader";

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
        <SiteHeader />

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

