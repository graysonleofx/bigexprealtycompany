import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Square, Heart, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
}: PropertyCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Link
      to={`/property/${id}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden border border-border bg-card shadow-card transition-smooth hover:-translate-y-1 hover:shadow-card-hover",
        featured && "border-t-2 border-t-gold"
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[1.4/1] overflow-hidden">
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
            {price}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-1 text-lg font-bold text-foreground transition-smooth group-hover:text-gold">
          {title}
        </h3>
        
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
        <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-sm">
          <span className="font-semibold text-foreground transition-smooth group-hover:text-gold">View property</span>
          <ArrowUpRight className="h-4 w-4 text-gold transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
