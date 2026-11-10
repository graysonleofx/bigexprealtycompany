import { Link } from "react-router-dom";
import { ArrowUpRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-mansion.jpg";

const commitments = [
  "Personal guidance at every step",
  "A thoughtful approach to every property",
  "Support built around your next move",
];

const CompanyIntro = () => (
  <section className="overflow-hidden bg-slate-dark py-20 text-primary-foreground sm:py-24">
    <div className="site-container">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.95fr] lg:gap-20">
        <div className="relative min-h-[340px] sm:min-h-[450px]">
          <div className="absolute inset-0 overflow-hidden">
            <img src={heroImage} alt="Contemporary home at dusk" className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-dark/45 via-transparent to-transparent" />
          <div className="absolute -bottom-4 -right-4 h-2/3 w-2/3 border-b border-r border-gold/60" />
          <div className="absolute bottom-6 left-6 border-l-2 border-gold bg-slate-dark/80 px-5 py-4 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/65">Prestige Estates</p>
            <p className="mt-1 text-lg font-bold text-primary-foreground">A place to move forward.</p>
          </div>
        </div>

        <div className="max-w-xl">
          <span className="section-eyebrow">A more considered approach</span>
          <h2 className="mt-4 text-3xl font-bold leading-tight text-primary-foreground sm:text-4xl lg:text-5xl">
            Every move deserves the right partner.
          </h2>
          <p className="mt-5 text-base leading-7 text-primary-foreground/65">
            Finding the right property is personal. We take the time to understand what matters to you, so every conversation and every next step feels clear.
          </p>
          <div className="mt-7 space-y-4">
            {commitments.map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-primary-foreground/85">
                <span className="flex h-6 w-6 items-center justify-center border border-gold/35 bg-gold/10 text-gold">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {item}
              </div>
            ))}
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link to="/about">
              <Button variant="gold" size="lg">Get to know us <ArrowUpRight className="h-4 w-4" /></Button>
            </Link>
            <Link to="/contact" className="text-sm font-semibold text-primary-foreground/75 transition-smooth hover:text-gold">
              Talk to our team
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default CompanyIntro;
