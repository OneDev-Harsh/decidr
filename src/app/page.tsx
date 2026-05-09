import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <Hero />
      
      {/* Features Section Placeholder */}
      <section id="features" className="py-24 bg-[#050505]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-brand-crimson">Decision Intelligence</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything you need to decide better.
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-400">
              Decidr combines advanced RAG, multi-agent reasoning, and scenario simulation to give you a complete picture of your options.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {[
                {
                  name: "Multi-Agent Reasoning",
                  description: "Specialized AI agents work together to analyze context, critique assumptions, and identify blind spots."
                },
                {
                  name: "Scenario Simulation",
                  description: "Model best, worst, and custom cases to understand sensitivity and risk across every decision path."
                },
                {
                  name: "Evidence-Backing",
                  description: "Every recommendation is linked to sourced facts and documents, ensuring traceable and trustworthy outputs."
                }
              ].map((feature) => (
                <div key={feature.name} className="flex flex-col bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-brand-maroon/50 transition-colors">
                  <dt className="text-lg font-semibold leading-7 text-white">
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/5 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Decidr. Built for global intelligence.
          </p>
        </div>
      </footer>
    </main>
  );
}
