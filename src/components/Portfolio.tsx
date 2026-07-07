"use client";

import { Navigation } from "./Navigation";
import { Hero } from "./Hero";
import { About } from "./About";
import { Skills } from "./Skills";
import { Experience } from "./Experience";
import { Projects } from "./Projects";
import { Contact, Footer } from "./Contact";
import { ScrollProgressProvider } from "@/components/three/ScrollProgress";
import { ScrollAmbientScene } from "@/components/three/ScrollAmbientScene";

export function Portfolio() {
  return (
    <ScrollProgressProvider>
      <div className="grain" aria-hidden />
      <ScrollAmbientScene />
      <div className="relative z-10">
        <Navigation />
        <main>
          <Hero />
          <About />
          <Skills />
          <Experience />
          <Projects />
          <Contact />
        </main>
        <Footer />
      </div>
    </ScrollProgressProvider>
  );
}
