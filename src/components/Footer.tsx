import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter, Linkedin, Building2, ArrowUpRight } from "lucide-react";

const Footer = () => {
  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Properties", href: "/properties" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Support", href: "/support" },
  ];

  return (
    <footer className="bg-slate-dark text-primary-foreground">
      <div className="site-container py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.9fr_1.1fr] lg:gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center border border-gold/40 bg-gold/10 text-gold">
                <Building2 className="h-5 w-5" />
              </span>
              <span className="text-xl font-bold tracking-tight">
                Prestige<span className="text-gold"> Estates</span>
              </span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Your trusted partner in real estate. We help you find the
              perfect property that matches your lifestyle and aspirations.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center border border-primary-foreground/15 text-primary-foreground/70 transition-smooth hover:border-gold hover:bg-gold hover:text-accent-foreground"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center border border-primary-foreground/15 text-primary-foreground/70 transition-smooth hover:border-gold hover:bg-gold hover:text-accent-foreground"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center border border-primary-foreground/15 text-primary-foreground/70 transition-smooth hover:border-gold hover:bg-gold hover:text-accent-foreground"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center border border-primary-foreground/15 text-primary-foreground/70 transition-smooth hover:border-gold hover:bg-gold hover:text-accent-foreground"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-6 font-bold">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="text-primary-foreground/70 hover:text-gold transition-smooth text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="mb-6 font-bold">Property Types</h4>
            <ul className="space-y-3">
              {["Luxury Homes", "Penthouses", "Villas", "Apartments", "Commercial"].map((item) => (
                <li key={item}>
                  <Link
                    to="/properties"
                    className="text-primary-foreground/70 hover:text-gold transition-smooth text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="mb-6 font-bold">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <span className="text-primary-foreground/70 text-sm">
                  123 Luxury Avenue, Beverly Hills, CA 90210
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-gold" />
                <a
                  href="tel:+1234567890"
                  className="text-primary-foreground/70 hover:text-gold transition-smooth text-sm"
                >
                  (123) 456-7890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-gold" />
                <a
                  href="mailto:info@prestigeestates.com"
                  className="text-primary-foreground/70 hover:text-gold transition-smooth text-sm"
                >
                  info@prestigeestates.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 border-t border-primary-foreground/10 pt-7">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <p className="text-primary-foreground/50 text-sm">
              © {new Date().getFullYear()} Prestige Estates. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6 md:justify-end">
              <Link to="/properties" className="inline-flex items-center gap-1 text-primary-foreground/50 text-sm transition-smooth hover:text-primary-foreground">
                Explore homes <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
