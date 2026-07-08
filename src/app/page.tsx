import type { Metadata } from "next";
import { RoleSelector } from "@/components/RoleSelector";

export const metadata: Metadata = {
  title: "Shehzad Ahmed — Portfolio",
  description: "Choose your path — recruiter, founder, or just curious.",
};

// add head with google analytics script
import Script from 'next/script';

export default function Home() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=G-0Q1Y0EKMQS`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-0Q1Y0EKMQS');
        `}
      </Script>
      <RoleSelector />
    </>
  );
}
