import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Home, DollarSign, BedDouble, ArrowDown } from "lucide-react";
import heroImage from "@/assets/hero-mansion.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState<"buy" | "rent">("buy");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (propertyType && propertyType !== "all") params.set("type", propertyType);
    if (priceRange && priceRange !== "any") params.set("price", priceRange);
    if (bedrooms && bedrooms !== "any") params.set("beds", bedrooms);
    navigate(`/properties${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section className="relative isolate overflow-hidden bg-slate-dark text-primary-foreground">
      <div className="absolute inset-0 -z-20">
        <img src={heroImage} alt="" className="h-full w-full object-cover object-center" />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-dark via-slate-dark/90 to-slate-dark/30" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-slate-dark/75 to-transparent" />
      <div className="absolute -right-36 top-36 -z-10 h-96 w-96 rounded-full bg-blue-500/15 blur-[120px]" />

      <div className="site-container pb-14 pt-32 sm:pb-16 sm:pt-36 lg:pb-20 lg:pt-40">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/75 animate-fade-up">
              <span className="h-px w-9 bg-gold" />
              Real estate, considered differently
            </div>
            <h1 className="max-w-3xl text-5xl font-bold leading-[1.04] tracking-[-0.045em] text-primary-foreground sm:text-6xl lg:text-[76px] animate-fade-up stagger-1">
              A better way to
              <span className="text-gradient-gold block">find your place.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-primary-foreground/72 sm:text-lg sm:leading-8 animate-fade-up stagger-2">
              Buy, rent, sell, or invest with a team that puts your next move first. Discover a more considered approach to property.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4 animate-fade-up stagger-3">
              <Button variant="gold" size="lg" onClick={handleSearch}>
                Explore properties
                <Search className="h-4 w-4" />
              </Button>
              <a href="#property-search" className="inline-flex items-center gap-2 px-2 py-3 text-sm font-semibold text-primary-foreground/85 transition-smooth hover:text-gold">
                Find your next move
                <ArrowDown className="h-4 w-4 text-gold" />
              </a>
            </div>

            <div className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-primary-foreground/15 pt-6 animate-fade-up stagger-4">
              <div>
                <p className="text-2xl font-bold text-primary-foreground sm:text-3xl">500<span className="text-gold">+</span></p>
                <p className="mt-1 text-xs text-primary-foreground/60 sm:text-sm">Premium properties</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-foreground sm:text-3xl">1,200<span className="text-gold">+</span></p>
                <p className="mt-1 text-xs text-primary-foreground/60 sm:text-sm">Happy clients</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-foreground sm:text-3xl">15<span className="text-gold">+</span></p>
                <p className="mt-1 text-xs text-primary-foreground/60 sm:text-sm">Years of experience</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="ml-auto max-w-[390px] border-l border-primary-foreground/20 pl-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">The right move starts here</p>
              <p className="mt-5 text-2xl font-medium leading-relaxed text-primary-foreground/90">
                A home is more than an address. It&apos;s where your next chapter begins.
              </p>
              <div className="mt-7 h-px w-20 bg-gradient-gold" />
              <p className="mt-5 text-sm text-primary-foreground/60">Thoughtful guidance. Exceptional places.</p>
            </div>
          </div>
        </div>

        <div id="property-search" className="mt-14 border border-white/60 bg-white p-4 text-foreground shadow-2xl shadow-black/20 sm:mt-16 sm:p-6 lg:mt-20">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Property search</p>
              <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">Find your place</h2>
            </div>
            <div className="flex border border-border p-1">
              {(["buy", "rent"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSearchType(type)}
                  className={`min-w-[78px] px-4 py-2 text-sm font-semibold capitalize transition-smooth ${
                    searchType === type ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_0.85fr_auto]">
            <label className="flex h-12 items-center gap-3 border border-input px-3 focus-within:ring-2 focus-within:ring-ring">
              <MapPin className="h-4 w-4 shrink-0 text-gold" />
              <span className="sr-only">Location</span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleSearch()}
                placeholder="City, area or postcode"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
            <label className="flex h-12 items-center gap-3 border border-input px-3 focus-within:ring-2 focus-within:ring-ring">
              <Home className="h-4 w-4 shrink-0 text-gold" />
              <span className="sr-only">Property type</span>
              <select value={propertyType} onChange={(event) => setPropertyType(event.target.value)} className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none">
                <option value="">All property types</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="penthouse">Penthouse</option>
                <option value="condo">Condo</option>
                <option value="estate">Estate</option>
              </select>
            </label>
            <label className="flex h-12 items-center gap-3 border border-input px-3 focus-within:ring-2 focus-within:ring-ring">
              <DollarSign className="h-4 w-4 shrink-0 text-gold" />
              <span className="sr-only">Price range</span>
              <select value={priceRange} onChange={(event) => setPriceRange(event.target.value)} className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none">
                <option value="">Any price</option>
                <option value="0-1000000">$0 - $1M</option>
                <option value="1000000-2000000">$1M - $2M</option>
                <option value="2000000-5000000">$2M - $5M</option>
                <option value="5000000-10000000">$5M - $10M</option>
                <option value="10000000+">$10M+</option>
              </select>
            </label>
            <label className="flex h-12 items-center gap-3 border border-input px-3 focus-within:ring-2 focus-within:ring-ring">
              <BedDouble className="h-4 w-4 shrink-0 text-gold" />
              <span className="sr-only">Bedrooms</span>
              <select value={bedrooms} onChange={(event) => setBedrooms(event.target.value)} className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none">
                <option value="">Any beds</option>
                <option value="1">1 bedroom</option>
                <option value="2">2 bedrooms</option>
                <option value="3">3 bedrooms</option>
                <option value="4">4 bedrooms</option>
                <option value="5+">5+ bedrooms</option>
              </select>
            </label>
            <Button variant="gold" className="h-12 px-6" onClick={handleSearch}>
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
