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
        subtitle="Smart Tracking"
        title="Manage Your Projects."
        description="A clear view of your team's goals and progress. Decidr helps you organize all your strategic work in one place."
        screenshot="/Screenshot 2026-05-13 183014.jpg"
        icon={BarChart3}
        bullets={[
          { title: "Project Overview", text: "Track the status of every task and see exactly how your project is progressing." },
          { title: "Team Alignment", text: "Keep everyone on the same page with shared goals and real-time updates." }
        ]}
      />

      {/* Blindspot Audit Section */}
      <FeatureShowcase 
        subtitle="Risk Analysis"
        title="Spot Hidden Problems Early."
        description="Our analysis tools find gaps in your research and highlight where your team might have conflicting ideas."
        screenshot="/Screenshot 2026-05-13 183003.jpg"
        icon={ShieldAlert}
        reversed
        bullets={[
          { title: "Flag Conflicts", text: "Automatically get notified when new information contradicts your current plan." },
          { title: "Audit History", text: "See exactly how decisions were made with a full history of your project." }
        ]}
      />

      {/* Knowledge Explorer Section */}
      <FeatureShowcase 
        id="intelligence"
        subtitle="Data Mapping"
        title="See How Everything Connects."
        description="Visualize the links between your evidence and your final choices. Understand the 'why' behind every decision."
        screenshot="/Screenshot 2026-05-13 183101.jpg"
        icon={Share2}
        bullets={[
          { title: "Visual Connections", text: "View your project data as an interactive map to see how ideas link together." },
          { title: "Impact Analysis", text: "See how changing one piece of information affects your whole strategy." }
        ]}
      />

      {/* Scenario Matrix Section */}
      <FeatureShowcase 
        subtitle="Future Planning"
        title="Test Different Scenarios."
        description="Run 'what-if' simulations to see how your plan holds up in different situations, from best-case to worst-case."
        screenshot="/Screenshot 2026-05-13 183111.jpg"
        icon={GitMerge}
        reversed
        bullets={[
          { title: "Scenario Testing", text: "Compare different paths to find the most reliable way forward." },
          { title: "Stress Tests", text: "Find the weak points in your plan before they become real problems." }
        ]}
      />

      {/* Collaborative Governance Section */}
      <FeatureShowcase 
        id="governance"
        subtitle="Better Collaboration"
        title="Work Together, Better."
        description="A structured way to propose changes and get reviews. Move from messy emails to clear strategic coordination."
        screenshot="/Screenshot 2026-05-13 182952.jpg"
        icon={Users2}
        bullets={[
          { title: "Change Tracking", text: "See who changed what and when, making collaboration easy to manage." },
          { title: "Shared Truth", text: "Ensure everyone is working from the latest, verified version of your strategy." }
        ]}
      />

      {/* Recommendation Engine Section */}
      <FeatureShowcase 
        subtitle="Decision Finality"
        title="Move Forward with Confidence."
        description="Get a clear, evidence-backed recommendation to help you make the right choice every time."
        screenshot="/Screenshot 2026-05-13 183144.jpg"
        icon={CheckCircle2}
        reversed
        bullets={[
          { title: "Confidence Scoring", text: "See how well-supported each option is based on your data." },
          { title: "Summary Reports", text: "Instantly create clear reports that summarize your entire project." }
        ]}
      />


      {/* Final CTA Section */}
      <section className="py-40 relative overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-none uppercase">
              Ready to <br /> get started?
            </h2>
            <p className="text-xl md:text-2xl text-zinc-400 leading-relaxed max-w-2xl mx-auto font-medium">
              Join teams using Decidr to make better decisions faster.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6">
              <Button size="lg" className="h-16 px-12 bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-widest rounded-full transition-all hover:scale-105 shadow-2xl" asChild>
                <Link href="/signup">
                  Start Your Project
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </Button>
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
                {[
                  { name: "Intelligence", href: "/intelligence" },
                  { name: "Governance", href: "/governance" },
                  { name: "Privacy", href: "/privacy" }
                ].map((link) => (
                  <Link key={link.name} href={link.href} className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                    {link.name}
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

