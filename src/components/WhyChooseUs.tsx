import { Link } from "react-router-dom";
import { ArrowUpRight, Building2, KeyRound, Tag, TrendingUp } from "lucide-react";

const services = [
  {
    icon: Building2,
    number: "01",
    title: "Buy a property",
    description: "Explore considered homes and find the right place for your next chapter.",
    href: "/properties",
  },
  {
    icon: KeyRound,
    number: "02",
    title: "Rent a property",
    description: "Discover a place that fits the way you want to live, now and next.",
    href: "/properties",
  },
  {
    icon: Tag,
    number: "03",
    title: "Sell your property",
    description: "Get in touch with our team to discuss your property and selling goals.",
    href: "/contact",
  },
  {
    icon: TrendingUp,
    number: "04",
    title: "Invest in real estate",
    description: "Talk with our team about property opportunities and your investment plans.",
    href: "/contact",
  },
];

const WhyChooseUs = () => (
  <section className="bg-secondary py-20 sm:py-24">
    <div className="site-container">
      <div className="mb-12 grid gap-5 md:mb-14 md:grid-cols-[1fr_0.7fr] md:items-end">
        <div>
          <span className="section-eyebrow">Ways we can help</span>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Make your next move with confidence.
          </h2>
        </div>
        <p className="max-w-lg text-base leading-7 text-muted-foreground md:justify-self-end">
          Whether you&apos;re searching for a home, ready for a change, or looking at your next investment, we&apos;re here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
        {services.map((service) => (
          <Link
            key={service.number}
            to={service.href}
            className="group relative flex min-h-[250px] flex-col bg-card p-7 transition-smooth hover:bg-slate-dark hover:text-primary-foreground sm:p-8"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center border border-gold/25 bg-gold/10 text-gold transition-smooth group-hover:border-gold/45 group-hover:bg-gold/15">
                <service.icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground transition-smooth group-hover:text-primary-foreground/45">
                {service.number}
              </span>
            </div>
            <h3 className="mt-8 text-xl font-bold text-foreground transition-smooth group-hover:text-primary-foreground">
              {service.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground transition-smooth group-hover:text-primary-foreground/65">
              {service.description}
            </p>
            <ArrowUpRight className="absolute bottom-8 right-7 h-5 w-5 text-gold transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 sm:right-8" />
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default WhyChooseUs;
