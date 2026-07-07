import type { Metadata } from "next";
import "./curious.css";

export const metadata: Metadata = {
  title: "Shehzad Ahmed — Just Curious",
  description: "Browse Shehzad Ahmed's work like a macOS desktop.",
};

export default function CuriousLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
