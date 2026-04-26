import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import FallingBlossoms from "@/components/FallingBlossoms";

const nunito = Nunito({
  variable: "--font-nunito",
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
      className={`${nunito.variable} h-full antialiased font-nunito`}
    >
      <body className="min-h-full flex flex-col relative bg-background text-foreground overflow-x-hidden">
        <FallingBlossoms />
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
      </body>
    </html>
  );
}
