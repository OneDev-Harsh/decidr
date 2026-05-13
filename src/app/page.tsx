"use client";

import { Navbar } from "@/components/landing/Navbar";
import { LandingHero } from "@/components/landing/LandingHero";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { CinematicBackground } from "@/components/landing/CinematicBackground";
import { Logo } from "@/components/shared/Logo";
import { 
  BarChart3, 
  ShieldAlert, 
  Share2, 
  GitMerge, 
  Users2, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen relative text-white selection:bg-brand-crimson/30">
      <CinematicBackground />
      <Navbar />
      
      <LandingHero />

      {/* Strategic Intelligence Section */}
      <FeatureShowcase 
        id="features"
        subtitle="Operational Intelligence"
        title="Command Your Strategic Landscape."
        description="Transform high-stakes uncertainty into auditable strategic clarity. Decidr provides a single intelligence operating system for your most complex decision workflows."
        screenshot="/Screenshot 2026-05-13 183014.jpg"
        icon={BarChart3}
        bullets={[
          { title: "Dynamic Logic Synthesis", text: "Multi-agent systems working in parallel to deconstruct complex briefs into structured, actionable vectors." },
          { title: "Real-time Operational Health", text: "Monitor project status, intelligence confidence, and decision readiness from a unified command center." }
        ]}
      />

      {/* Blindspot Audit Section */}
      <FeatureShowcase 
        subtitle="Cognitive Governance"
        title="Surgically Expose Hidden Risks."
        description="Our Contradiction Intelligence Engine identifies evidence gaps, logical inconsistencies, and unverified assumptions before they become failures."
        screenshot="/Screenshot 2026-05-13 183003.jpg"
        icon={ShieldAlert}
        reversed
        bullets={[
          { title: "Logical Divergence Detection", text: "Automatically flag when new evidence conflicts with existing strategic assumptions or historical data." },
          { title: "Defensible Audit Trails", text: "Maintain a high-fidelity record of every decision path, risk acceptance, and intelligence source." }
        ]}
      />

      {/* Knowledge Explorer Section */}
      <FeatureShowcase 
        id="intelligence"
        subtitle="Knowledge Topology"
        title="Visualize Every Strategic Path."
        description="Navigate the deep structure of your organizational intelligence. Understand exactly how every piece of evidence impacts your final outcome."
        screenshot="/Screenshot 2026-05-13 183101.jpg"
        icon={Share2}
        bullets={[
          { title: "Interactive Graph Explorer", text: "Visualizing the relationships between evidence, agents, and outcomes in an intuitive 3D topology." },
          { title: "Evidence Impact Mapping", text: "Instantly simulate how changes in source material ripple through your entire decision matrix." }
        ]}
      />

      {/* Scenario Matrix Section */}
      <FeatureShowcase 
        subtitle="Predictive Simulation"
        title="Master the Uncertainty."
        description="Simulate best, worst, and edge cases to understand the sensitivity and resilience of your strategic direction."
        screenshot="/Screenshot 2026-05-13 183111.jpg"
        icon={GitMerge}
        reversed
        bullets={[
          { title: "Outcome Forecasting", text: "Model the multi-timeline ripple effects of strategic choices using advanced Monte Carlo simulations." },
          { title: "Stress-Test Assumptions", text: "Identify critical dependencies to ensure your strategy remains robust under extreme conditions." }
        ]}
      />

      {/* Collaborative Governance Section */}
      <FeatureShowcase 
        id="governance"
        subtitle="Intelligence Governance"
        title="Unified Strategic Coordination."
        description="A high-fidelity workflow for proposals, reviews, and explicit approvals. Transform loose collaboration into rigorous strategic governance."
        screenshot="/Screenshot 2026-05-13 182952.jpg"
        icon={Users2}
        bullets={[
          { title: "Versioned Decision Objects", text: "Track the evolution of strategic projects with clear version history and change attribution." },
          { title: "Synchronized Intelligence", text: "Ensure every stakeholder is operating from a single, verified source of strategic truth." }
        ]}
      />

      {/* Recommendation Engine Section */}
      <FeatureShowcase 
        subtitle="Synthesis Engine"
        title="Act with Absolute Finality."
        description="Consolidate complex analysis into a single, high-confidence recommendation backed by verifiable evidence and simulated outcomes."
        screenshot="/Screenshot 2026-05-13 183144.jpg"
        icon={CheckCircle2}
        reversed
        bullets={[
          { title: "Probabilistic Success Scoring", text: "Quantitative assessment of recommendation viability based on evidence quality and scenario coverage." },
          { title: "Automated Executive Briefing", text: "Generate board-ready reports summarizing the entire intelligence lifecycle in seconds." }
        ]}
      />


      {/* Final CTA Section */}
      <section className="py-40 relative overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-none uppercase">
              Ready to Structure <br /> Your Intelligence?
            </h2>
            <p className="text-xl md:text-2xl text-zinc-400 leading-relaxed max-w-2xl mx-auto font-medium">
              Join elite organizations using Decidr to master complexity and act with strategic finality.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6">
              <Button size="lg" className="h-16 px-12 bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-widest rounded-full transition-all hover:scale-105 shadow-2xl" asChild>
                <Link href="/signup">
                  Deploy Decidr Now
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </Button>
              <Link href="/demo" className="text-sm font-bold uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors">
                Request Executive Briefing
              </Link>
            </div>
          </div>
        </div>
        
        {/* Subtle background atmosphere for CTA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-white/[0.02] blur-[150px] rounded-full z-[-1]" />
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/[0.05] relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <Logo className="h-6" />
              <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.3em] hidden sm:block">
                The Intelligence Operating System
              </p>
            </div>
            
            <div className="flex items-center gap-10">
              <div className="flex gap-8">
                {["Intelligence", "Governance", "Privacy"].map((link) => (
                  <Link key={link} href="#" className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                    {link}
                  </Link>
                ))}
              </div>
              
              <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
              
              <p className="text-[11px] text-zinc-600 font-bold tracking-widest uppercase">
                &copy; {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

