import type { Metadata } from "next";
import { RecruiterView } from "@/components/recruiter/RecruiterView";
import "./recruiter.css";

export const metadata: Metadata = {
  title: "Shehzad Ahmed — Recruiter",
  description: "Skills, experience, education, and resume for hiring managers.",
};

export default function RecruiterPage() {
  return <RecruiterView />;
}
