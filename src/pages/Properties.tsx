import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, SlidersHorizontal, Grid, List, X } from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import { Skeleton } from "@/components/ui/skeleton";

const Properties = () => {
  const [searchParams] = useSearchParams();
  const { data: properties = [], isLoading } = useProperties();
  
  // Initialize filters from URL params
  const initialLocation = searchParams.get("location") || "";
  const initialType = searchParams.get("type") || "all";
  const initialPrice = searchParams.get("price") || "";
  const initialBeds = searchParams.get("beds") || "any";
  const initialTransaction = searchParams.get("transaction") || "all";
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedBeds, setSelectedBeds] = useState(initialBeds);
  const [selectedTransaction, setSelectedTransaction] = useState(initialTransaction);
  const [locationFilter, setLocationFilter] = useState(initialLocation);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Parse initial price range from URL
  useEffect(() => {
    if (initialPrice) {
      const [min, max] = initialPrice.split("-").map((v) => {
        const num = parseInt(v.replace(/\D/g, ""));
        return isNaN(num) ? 0 : num;
      });
      if (max) {
        setPriceRange([min, max]);
      } else if (initialPrice.includes("+")) {
        setPriceRange([min, 100000000]);
      }
    }
  }, [initialPrice]);

  // Get unique locations for suggestions
  const uniqueLocations = useMemo(() => {
    const locations = properties.map((p) => p.location);
    return [...new Set(locations)];
  }, [properties]);

  // Get min/max prices from properties
  const { minPrice, maxPrice } = useMemo(() => {
    if (properties.length === 0) return { minPrice: 0, maxPrice: 50000000 };
    const prices = properties
      .map((p) => selectedTransaction === "rent" ? p.rent_price : p.price)
      .filter((price): price is number => price !== null);
    if (prices.length === 0) return { minPrice: 0, maxPrice: 50000000 };
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  }, [properties, selectedTransaction]);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch =
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType =
        selectedType === "all" ||
        property.type.toLowerCase() === selectedType.toLowerCase();

      const matchesTransaction =
        selectedTransaction === "all" ||
        (selectedTransaction === "sale" && (property.transaction_type === "sale" || property.transaction_type === "both")) ||
        (selectedTransaction === "rent" && (property.transaction_type === "rent" || property.transaction_type === "both") && property.rent_price !== null);
      
      const matchesBeds =
        selectedBeds === "any" ||
        (selectedBeds === "5+" ? property.beds >= 5 : property.beds === parseInt(selectedBeds));
      
      const matchesLocation =
        !locationFilter ||
        property.location.toLowerCase().includes(locationFilter.toLowerCase());
      
      const displayedPrice = selectedTransaction === "rent" ? property.rent_price : property.price;
      const matchesPrice =
        displayedPrice !== null && displayedPrice >= priceRange[0] && displayedPrice <= priceRange[1];

      return matchesSearch && matchesType && matchesTransaction && matchesBeds && matchesLocation && matchesPrice;
    });
  }, [properties, searchQuery, selectedType, selectedTransaction, selectedBeds, locationFilter, priceRange]);

  const hasActiveFilters = 
    selectedType !== "all" || 
    selectedTransaction !== "all" ||
    selectedBeds !== "any" || 
    locationFilter !== "" || 
    priceRange[0] > 0 || 
    priceRange[1] < maxPrice;

  const clearFilters = () => {
    setSelectedType("all");
    setSelectedTransaction("all");
    setSelectedBeds("any");
    setLocationFilter("");
    setPriceRange([0, maxPrice]);
  };

  const formatPrice = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-primary pb-12 pt-32 text-primary-foreground">
        <div className="site-container">
          <div className="max-w-3xl">
            <span className="section-eyebrow">
              Our Collection
            </span>
            <h1 className="mt-2 text-4xl font-bold text-primary-foreground md:text-5xl">
              Luxury Properties
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/70">
              Browse our exclusive collection of premium properties in the most
              sought-after locations around the world.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border sticky top-20 bg-background/95 backdrop-blur-sm z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Type Filter */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[140px] h-12">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="penthouse">Penthouse</SelectItem>
                  <SelectItem value="loft">Loft</SelectItem>
                  <SelectItem value="estate">Estate</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedTransaction} onValueChange={setSelectedTransaction}>
                <SelectTrigger className="h-12 w-[140px]">
                  <SelectValue placeholder="Buy or rent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Buy or rent</SelectItem>
                  <SelectItem value="sale">For sale</SelectItem>
                  <SelectItem value="rent">For rent</SelectItem>
                </SelectContent>
              </Select>

              {/* Beds Filter */}
              <Select value={selectedBeds} onValueChange={setSelectedBeds}>
                <SelectTrigger className="w-[120px] h-12">
                  <SelectValue placeholder="Beds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Beds</SelectItem>
                  <SelectItem value="1">1 Bed</SelectItem>
                  <SelectItem value="2">2 Beds</SelectItem>
                  <SelectItem value="3">3 Beds</SelectItem>
                  <SelectItem value="4">4 Beds</SelectItem>
                  <SelectItem value="5+">5+ Beds</SelectItem>
                </SelectContent>
              </Select>

              {/* More Filters Popover */}
              <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="default" className="h-12">
                    <SlidersHorizontal className="h-5 w-5 mr-2" />
                    More Filters
                    {hasActiveFilters && (
                      <span className="ml-2 h-2 w-2 rounded-full bg-gold" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">Location</h4>
                      <Input
                        placeholder="Filter by location..."
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                      />
                      {locationFilter && uniqueLocations.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {uniqueLocations
                            .filter((loc) =>
                              loc.toLowerCase().includes(locationFilter.toLowerCase())
                            )
                            .slice(0, 3)
                            .map((loc) => (
                              <button
                                key={loc}
                                onClick={() => setLocationFilter(loc)}
                                className="text-xs px-2 py-1 bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
                              >
                                {loc}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Price Range</h4>
                      <div className="px-2">
                        <Slider
                          value={priceRange}
                          onValueChange={(value) => setPriceRange(value as [number, number])}
                          min={0}
                          max={maxPrice || 50000000}
                          step={100000}
                          className="mb-3"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{formatPrice(priceRange[0])}</span>
                          <span>{formatPrice(priceRange[1])}</span>
                        </div>
                      </div>
                    </div>

                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="w-full"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* View Toggle */}
              <div className="hidden md:flex items-center gap-1 p-1 bg-secondary rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-smooth ${
                    viewMode === "grid"
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-smooth ${
                    viewMode === "list"
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <p className="text-muted-foreground mb-8">
            Showing {filteredProperties.length} properties
          </p>

          {isLoading ? (
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-64 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`grid gap-8 ${
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {filteredProperties.map((property, index) => (
                <div
                  key={property.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <PropertyCard
                    id={property.id}
                    image={property.image_url || "/placeholder.svg"}
                    title={property.title}
                    location={property.location}
                    price={`$${(selectedTransaction === "rent" ? property.rent_price || 0 : property.price).toLocaleString()}`}
                    beds={property.beds}
                    baths={property.baths}
                    sqft={`${property.sqft.toLocaleString()} sqft`}
                    type={property.type}
                    featured={property.featured}
                    transactionType={property.transaction_type}
                    rentPrice={property.rent_price}
                    rentPeriod={property.rent_period}
                    availabilityStatus={property.availability_status}
                  />
                </div>
              ))}
            </div>
          )}

          {!isLoading && filteredProperties.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                No properties found matching your criteria.
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Properties;
