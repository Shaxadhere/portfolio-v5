import { Metadata } from "next";
import { getSuSession } from "@/lib/su-auth";
import SuClientWrapper from "./SuClientWrapper";

export const metadata: Metadata = {
  title: "Super User Admin | Resume Telemetry & Analytics",
  description: "Administrative dashboard for resume download metrics, telemetry, and analytics.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SuPage() {
  const session = await getSuSession();

  return (
    <SuClientWrapper
      initialAuthenticated={session.authenticated}
      initialUsername={session.username}
    />
  );
}
