import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, User, LogOut, Settings, Building2, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/support", label: "Support" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-primary-foreground/10 bg-slate-dark/95 text-primary-foreground shadow-lg shadow-slate-dark/10 backdrop-blur-xl">
      <div className="site-container">
        <div className="flex h-[76px] items-center justify-between">
          <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="BIG EXP REALTY COMPANY home">
            <span className="flex h-10 w-10 items-center justify-center border border-gold/40 bg-gold/10 text-gold">
              <Building2 className="h-5 w-5" />
            </span>
            <span className="text-[17px] font-bold tracking-tight text-primary-foreground sm:text-lg">
              BIG EXP <span className="text-gold">REALTY COMPANY</span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "relative py-2 text-[13px] font-medium transition-smooth after:absolute after:inset-x-0 after:-bottom-[2px] after:h-0.5 after:origin-left after:scale-x-0 after:bg-gold after:transition-transform hover:text-primary-foreground after:hover:scale-x-100",
                  location.pathname === link.href
                    ? "text-primary-foreground after:scale-x-100"
                    : "text-primary-foreground/65",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-4 lg:flex">
            <a href="tel:+1234567890" className="flex items-center gap-2 text-sm text-primary-foreground/70 transition-smooth hover:text-primary-foreground">
              <Phone className="h-4 w-4 text-gold" />
              +44 7344 024977
            </a>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="hero-outline" size="sm">
                    <User className="h-4 w-4" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/my-requests" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      My Requests
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="hero-outline" size="sm">Sign In</Button>
              </Link>
            )}

            <Link to="/contact">
              <Button variant="gold" size="sm" className="gap-1">
                Let&apos;s Talk
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-11 w-11 items-center justify-center border border-primary-foreground/15 text-primary-foreground transition-smooth hover:border-gold/60 hover:text-gold lg:hidden"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isOpen && (
          <div className="border-t border-primary-foreground/10 pb-6 pt-3 lg:hidden">
            <div className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "border-b border-primary-foreground/5 py-3 text-sm font-medium transition-smooth hover:text-gold",
                    location.pathname === link.href ? "text-gold" : "text-primary-foreground/75",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsOpen(false)} className="border-b border-primary-foreground/5 py-3 text-sm text-primary-foreground/75 hover:text-gold">
                      Admin Panel
                    </Link>
                  )}
                  <Link to="/my-requests" onClick={() => setIsOpen(false)} className="border-b border-primary-foreground/5 py-3 text-sm text-primary-foreground/75 hover:text-gold">
                    My Requests
                  </Link>
                  <button
                    type="button"
                    onClick={() => { signOut(); setIsOpen(false); }}
                    className="border-b border-primary-foreground/5 py-3 text-left text-sm text-primary-foreground/75 hover:text-gold"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsOpen(false)} className="border-b border-primary-foreground/5 py-3 text-sm text-primary-foreground/75 hover:text-gold">
                  Sign In
                </Link>
              )}
              <Link to="/contact" onClick={() => setIsOpen(false)} className="mt-5">
                <Button variant="gold" className="w-full">Let&apos;s Talk <ArrowUpRight className="h-4 w-4" /></Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
