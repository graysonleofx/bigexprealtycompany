import { Button } from "@/components/ui/button";
import PropertyCard from "./PropertyCard";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useFeaturedProperties } from "@/hooks/useProperties";

// Fallback images for properties without images
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import property4 from "@/assets/property-4.jpg";
import property5 from "@/assets/property-5.jpg";
import property6 from "@/assets/property-6.jpg";

const fallbackImages = [property1, property2, property3, property4, property5, property6];

const FeaturedProperties = () => {
  const { data: properties, isLoading } = useFeaturedProperties();

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`;
  };

  const getImage = (imageUrl: string | null, index: number) => {
    return imageUrl || fallbackImages[index % fallbackImages.length];
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-gold font-medium text-sm uppercase tracking-wider">
              Our Properties
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-2">
              Featured Listings
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg">
              Explore our handpicked selection of the finest properties available,
              each offering exceptional luxury and unparalleled comfort.
            </p>
          </div>
          <Link to="/properties">
            <Button variant="outline" size="lg">
              View All Properties
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Properties Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-secondary" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-secondary rounded w-3/4" />
                  <div className="h-4 bg-secondary rounded w-1/2" />
                  <div className="h-4 bg-secondary rounded w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property, index) => (
              <div
                key={property.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PropertyCard
                  id={property.id}
                  image={getImage(property.image_url, index)}
                  title={property.title}
                  location={property.location}
                  price={formatPrice(property.price)}
                  beds={property.beds}
                  baths={property.baths}
                  sqft={`${property.sqft.toLocaleString()} sqft`}
                  type={property.type}
                  featured={property.featured}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No featured properties available yet.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProperties;
