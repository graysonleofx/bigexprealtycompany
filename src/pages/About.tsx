import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import { Award, Users, Building, Globe } from "lucide-react";

const stats = [
  { icon: Building, value: "500+", label: "Properties Sold" },
  { icon: Users, value: "1200+", label: "Happy Clients" },
  { icon: Globe, value: "25+", label: "Cities Covered" },
  { icon: Award, value: "15+", label: "Years Experience" },
];

const team = [
  {
    name: "Alexandra Sterling",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
    bio: "With over 20 years in luxury real estate, Alexandra founded BIG EXP REALTY COMPANY to redefine the property buying experience.",
  },
  {
    name: "James Morrison",
    role: "Head of Sales",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    bio: "James brings 15 years of expertise in closing high-value transactions and building lasting client relationships.",
  },
  {
    name: "Victoria Chen",
    role: "Lead Property Consultant",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
    bio: "Victoria's eye for detail and deep market knowledge helps clients find properties that perfectly match their vision.",
  },
  {
    name: "Robert Williams",
    role: "Investment Advisor",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    bio: "Robert specializes in property investment strategies, helping clients build wealth through smart real estate decisions.",
  },
];

const About = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-primary pb-20 pt-32 text-primary-foreground">
        <div className="site-container">
          <div className="max-w-3xl mx-auto text-center">
            <span className="section-eyebrow">
              About Us
            </span>
            <h1 className="mt-2 text-4xl font-bold text-primary-foreground md:text-5xl">
              A more considered way to find your place
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-primary-foreground/70">
              At BIG EXP REALTY COMPANY, we believe finding your next property should feel clear, personal, and considered. We connect people with places that feel right for their next chapter.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-background">
        <div className="site-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border border-gold/25 bg-gold/10">
                  <stat.icon className="h-8 w-8 text-gold" />
                </div>
                <p className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="bg-secondary py-20">
        <div className="site-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="section-eyebrow">
                Our Story
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-2">
                Built on Trust, Driven by Excellence
              </h2>
              <div className="space-y-4 mt-6 text-muted-foreground">
                <p>
                  What started as a small boutique agency in Beverly Hills has
                  grown into one of the most respected luxury real estate firms
                  in the country. Our journey has been defined by an unwavering
                  commitment to our clients and a passion for exceptional
                  properties.
                </p>
                <p>
                  We understand that purchasing a luxury home is more than a
                  transaction—it's a life-changing decision. That's why we take
                  the time to understand your unique needs, preferences, and
                  aspirations.
                </p>
                <p>
                  Our curated portfolio features only the finest properties,
                  each handpicked for its exceptional quality, prime location,
                  and investment potential. We pride ourselves on providing
                  access to exclusive off-market listings that you won't find
                  anywhere else.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop"
                alt="Luxury interior"
                className="aspect-[4/3] w-full object-cover shadow-card-hover"
              />
              <div className="absolute -bottom-5 left-5 border border-white/20 bg-primary px-6 py-5 text-primary-foreground shadow-gold sm:-left-5">
                <p className="text-4xl font-heading font-bold">15+</p>
                <p className="text-sm">Years of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-background">
        <div className="site-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="section-eyebrow">
              Our Team
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-2">
              Meet the Experts
            </h2>
            <p className="text-muted-foreground mt-4">
              Our team of seasoned professionals brings decades of combined
              experience in luxury real estate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={member.name}
                className="group overflow-hidden border border-border bg-card shadow-card transition-smooth hover:-translate-y-1 hover:shadow-card-hover animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-smooth duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-heading font-semibold text-foreground">
                    {member.name}
                  </h3>
                  <p className="text-gold text-sm font-medium mt-1">
                    {member.role}
                  </p>
                  <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
};

export default About;
