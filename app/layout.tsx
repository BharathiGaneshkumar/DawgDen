import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DawgDen — Student Housing, Protected",
  description:
    "DawgDen is the student housing platform that protects you. Browse verified listings, check leases with AI, and review landlords.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${quicksand.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex flex-col relative bg-background text-foreground overflow-x-hidden"
        style={{ fontFamily: 'var(--font-quicksand), sans-serif' }}
        suppressHydrationWarning
      >
        <Auth0Provider>
          <img 
            src="/cherry-branch-left.png" 
            alt="Cherry Branch" 
            className="pointer-events-none fixed top-0 left-0 z-0 w-64 md:w-96 opacity-80 mix-blend-multiply" 
          />
          <img 
            src="/cherry-branch-right.png" 
            alt="Cherry Branch" 
            className="pointer-events-none fixed top-0 right-0 z-0 w-64 md:w-96 opacity-80 mix-blend-multiply" 
          />
          <div className="relative z-10 flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </Auth0Provider>
      </body>
    </html>
  );
}
