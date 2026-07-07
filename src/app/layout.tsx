import type { Metadata } from "next";
import { Bricolage_Grotesque, Newsreader, Space_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shehzad Ahmed — Senior Software Engineer",
  description:
    "Portfolio of Shehzad Ahmed — Senior Software Engineer specializing in React, TypeScript, AWS, and full-stack development. Based in Karachi, Pakistan.",
  openGraph: {
    title: "Shehzad Ahmed — Senior Software Engineer",
    description:
      "Building scalable web and mobile applications with React, TypeScript, and AWS.",
    url: "https://shehzadahmed.me",
    siteName: "Shehzad Ahmed",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${newsreader.variable} ${spaceMono.variable} h-full`}
    >
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
