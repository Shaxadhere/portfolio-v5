import type { Metadata } from "next";
import { FounderView } from "@/components/founder/FounderView";
import "./founder.css";

export const metadata: Metadata = {
  title: "Shehzad Ahmed — Founder",
  description: "What I've built, what I can build, and book a call.",
};

export default function FounderPage() {
  return <FounderView />;
}
