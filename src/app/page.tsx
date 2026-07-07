import type { Metadata } from "next";
import { RoleSelector } from "@/components/RoleSelector";

export const metadata: Metadata = {
  title: "Shehzad Ahmed — Portfolio",
  description: "Choose your path — recruiter, founder, or just curious.",
};

export default function Home() {
  return <RoleSelector />;
}
