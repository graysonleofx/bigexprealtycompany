import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Square, Heart, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PropertyCardProps {
  id: string;
  image: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  sqft: string;
  type: string;
  featured?: boolean;
  transactionType?: "sale" | "rent" | "both";
  rentPrice?: number | null;
  rentPeriod?: string | null;
  availabilityStatus?: "available" | "pending" | "sold" | "rented" | "unavailable";
}

const PropertyCard = ({
  id,
  image,
  title,
  location,
  price,
  beds,
  baths,
  sqft,
  type,
  featured = false,
  transactionType = "sale",
  rentPrice = null,
  rentPeriod = null,
  availabilityStatus = "available",
}: PropertyCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const isAvailable = availabilityStatus === "available";
  const statusLabel = availabilityStatus === "pending"
    ? "Application Pending"
    : availabilityStatus.charAt(0).toUpperCase() + availabilityStatus.slice(1);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden border border-border bg-card shadow-card transition-smooth hover:-translate-y-1 hover:shadow-card-hover",
        featured && "border-t-2 border-t-gold"
      )}
    >
      {/* Image Container */}
      <Link to={`/property/${id}`} className="relative block aspect-[1.4/1] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.045]"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {featured && (
            <span className="border border-gold/30 bg-slate-dark/85 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-sm">
              Featured
            </span>
          )}
          <span className="border border-white/30 bg-slate-dark/75 px-3 py-1 text-xs font-semibold capitalize text-primary-foreground backdrop-blur-sm">
            {type}
          </span>
          <span className="border border-white/30 bg-slate-dark/75 px-3 py-1 text-xs font-semibold uppercase text-primary-foreground backdrop-blur-sm">
            {transactionType === "both" ? "Sale & Rent" : transactionType === "rent" ? "For Rent" : "For Sale"}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite(!isFavorite);
          }}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className={cn(
            "absolute right-4 top-4 flex h-10 w-10 items-center justify-center border border-white/60 transition-smooth",
            isFavorite
              ? "bg-gold text-accent-foreground"
              : "bg-card/85 text-foreground backdrop-blur-sm hover:border-gold hover:bg-gold hover:text-accent-foreground"
          )}
        >
          <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
        </button>

        {/* Price */}
        <div className="absolute bottom-4 left-4">
          <p className="text-2xl font-heading font-bold text-primary-foreground">
            {transactionType === "rent" && rentPrice !== null
              ? `$${rentPrice.toLocaleString()}${rentPeriod ? ` / ${rentPeriod.replace("ly", "")}` : ""}`
              : price}
          </p>
          {transactionType === "both" && rentPrice !== null && (
            <p className="text-sm font-semibold text-primary-foreground/90">
              ${rentPrice.toLocaleString()}{rentPeriod ? ` / ${rentPeriod.replace("ly", "")}` : ""} to rent
            </p>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <Link to={`/property/${id}`}>
          <h3 className="line-clamp-1 text-lg font-bold text-foreground transition-smooth group-hover:text-gold">
            {title}
          </h3>
        </Link>
        
        <p className="flex items-center gap-1 text-muted-foreground text-sm mt-2">
          <MapPin className="h-4 w-4" />
          {location}
        </p>

        {/* Features */}
        <div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Bed className="h-4 w-4" />
            <span className="text-sm">{beds} Beds</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Bath className="h-4 w-4" />
            <span className="text-sm">{baths} Baths</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Square className="h-4 w-4" />
            <span className="text-sm">{sqft}</span>
          </div>
        </div>
        <div className="mt-auto border-t border-border pt-4">
          {isAvailable ? (
            <div className="flex flex-wrap gap-2">
              {(transactionType === "sale" || transactionType === "both") && (
                <Link to={`/property/${id}/request?type=purchase`} className="flex-1">
                  <Button variant="gold" size="sm" className="w-full">Buy Property</Button>
                </Link>
              )}
              {(transactionType === "rent" || transactionType === "both") && (
                <Link to={`/property/${id}/request?type=rental`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Rent Property
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <span className="inline-flex items-center bg-secondary px-3 py-2 text-sm font-semibold text-muted-foreground" aria-label={`Property ${statusLabel.toLowerCase()}`}>
              {statusLabel}
            </span>
          )}
          <Link to={`/property/${id}`} className="mt-3 flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground transition-smooth group-hover:text-gold">View property</span>
            <ArrowUpRight className="h-4 w-4 text-gold transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
