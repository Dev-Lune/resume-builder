import type { Metadata, Viewport } from "next";
import { DM_Sans, Figtree, Geist_Mono, JetBrains_Mono, Plus_Jakarta_Sans, Sora } from "next/font/google";
import { ManualExchange } from "@/components/ui/ManualExchange";
import "./globals.css";

/* Two type voices, one per theme. Light (Cloud): Plus Jakarta + Figtree.
   Dark (Night Bench): Sora + DM Sans. JetBrains Mono for data in both. */
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

const fontVars = [jakarta, figtree, sora, dmSans, jetbrains, geistMono].map((f) => f.variable).join(" ");

export const metadata: Metadata = {
  title: { default: "Bespoke", template: "%s | Bespoke" },
  description:
    "An AI resume builder that interviews you, drafts a parser-safe resume, lets you edit it live, tailors it to any posting, and scans it against a job like an ATS.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0e" },
  ],
};

// Set the saved theme before paint so there is no flash of the wrong palette.
const themeBoot = `try{var t=localStorage.getItem("bespoke:theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:shadow-float"
        >
          Skip to content
        </a>
        {children}
        <ManualExchange />
      </body>
    </html>
  );
}
