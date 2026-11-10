import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="bg-background py-20 sm:py-24">
      <div className="site-container">
        <div className="relative overflow-hidden border border-primary-foreground/10 bg-gradient-hero p-8 sm:p-12 lg:p-16">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-gold blur-3xl" />
            <div className="absolute bottom-0 left-0 h-96 w-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-gold blur-3xl" />
          </div>

          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            {/* Content */}
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary-foreground leading-tight">
                Ready to Find Your
                <span className="block text-gold">Dream Property?</span>
              </h2>
              <p className="text-primary-foreground/70 mt-4 text-lg max-w-md">
                Let our expert team guide you through the process of finding and
                acquiring your perfect luxury home.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 sm:flex-row md:justify-end">
              <Link to="/contact">
                <Button variant="gold" size="xl" className="w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="tel:+1234567890">
                <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                  <Phone className="mr-2 h-5 w-5" />
                  Call Us Now
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
