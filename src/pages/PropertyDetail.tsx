import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Share2,
  Calendar,
  ChevronLeft,
  Check,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useProperties, useProperty } from "@/hooks/useProperties";
import PropertyCard from "@/components/PropertyCard";
import SupportTicketForm from "@/components/SupportTicketForm";

import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

const fallbackImages = [property1, property2, property3];

const defaultAgent = {
  name: "Alexandra Sterling",
  phone: "(123) 456-7890",
  email: "contact@prestigeestates.com",
  image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
};

const defaultFeatures = [
  "Gourmet kitchen",
  "Master suite",
  "Home office",
  "Smart home system",
  "Security system",
  "Climate control",
];

const PropertyDetail = () => {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const { data: property, isLoading } = useProperty(id || "");
  const { data: properties = [] } = useProperties();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 bg-secondary rounded" />
            <div className="aspect-[16/9] bg-secondary rounded-2xl" />
            <div className="h-10 w-full max-w-96 bg-secondary rounded" />
          </div>
        </div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 container mx-auto px-4 text-center">
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Property Not Found
          </h1>
          <p className="text-muted-foreground mt-4">
            The property you're looking for doesn't exist.
          </p>
          <Link to="/properties">
            <Button variant="gold" className="mt-8">
              Browse Properties
            </Button>
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const images = property.gallery_images?.length > 0
    ? property.gallery_images
    : property.image_url
    ? [property.image_url, ...fallbackImages.slice(0, 2)]
    : fallbackImages;

  const features = property.amenities?.length > 0 ? property.amenities : defaultFeatures;
  const transactionType = property.transaction_type || "sale";
  const availabilityStatus = property.availability_status || "available";
  const isAvailable = availabilityStatus === "available";
  const saleAllowed = transactionType === "sale" || transactionType === "both";
  const rentAllowed = transactionType === "rent" || transactionType === "both";
  const availabilityLabel = availabilityStatus === "pending"
    ? "Application Pending"
    : availabilityStatus.charAt(0).toUpperCase() + availabilityStatus.slice(1);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24">
        {/* Back Button */}
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/properties"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-smooth"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Properties
          </Link>
        </div>

        {/* Image Gallery */}
        <section className="container mx-auto px-4">
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="aspect-[16/10] overflow-hidden border border-border">
                <img
                  src={images[activeImage]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
              {images.slice(0, 3).map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={cn(
                    "aspect-[16/10] overflow-hidden border transition-smooth lg:aspect-[16/9]",
                    activeImage === index ? "ring-2 ring-gold" : "opacity-70 hover:opacity-100"
                  )}
                >
                  <img
                    src={img}
                    alt={`View ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Property Info */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="px-3 py-1 bg-gold/10 text-gold text-sm font-medium rounded-full">
                        {property.type}
                      </span>
                      <span className="ml-2 inline-flex px-3 py-1 bg-secondary text-sm font-medium capitalize text-muted-foreground">
                        {transactionType === "both" ? "For Sale & Rent" : `For ${transactionType}`}
                      </span>
                      <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-3">
                        {property.title}
                      </h1>
                      <p className="flex items-center gap-2 text-muted-foreground mt-2">
                        <MapPin className="h-5 w-5" />
                        {property.location}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsFavorite(!isFavorite)}
                        className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center transition-smooth",
                          isFavorite
                            ? "bg-gold text-accent-foreground"
                            : "bg-secondary text-foreground hover:bg-gold hover:text-accent-foreground"
                        )}
                      >
                        <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
                      </button>
                      <button className="h-12 w-12 rounded-xl bg-secondary text-foreground flex items-center justify-center hover:bg-gold hover:text-accent-foreground transition-smooth">
                        <Share2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {transactionType !== "rent" && (
                    <p className="mt-4 text-3xl font-bold text-gold md:text-4xl">
                      ${property.price.toLocaleString()} <span className="text-sm font-medium text-muted-foreground">For Sale</span>
                    </p>
                  )}
                  {rentAllowed && property.rent_price !== null && (
                    <p className="mt-2 text-2xl font-bold text-gold">
                      ${property.rent_price.toLocaleString()} <span className="text-sm font-medium text-muted-foreground">/ {property.rent_period} rent</span>
                    </p>
                  )}
                  {rentAllowed && property.security_deposit !== null && (
                    <p className="mt-2 text-sm text-muted-foreground">Security deposit: ${property.security_deposit.toLocaleString()}</p>
                  )}
                  {rentAllowed && property.availability_date && (
                    <p className="mt-1 text-sm text-muted-foreground">Available from: {property.availability_date}</p>
                  )}
                  {rentAllowed && property.minimum_rental_period && (
                    <p className="mt-1 text-sm text-muted-foreground">Minimum rental period: {property.minimum_rental_period} months</p>
                  )}
                  {!isAvailable && (
                    <p className="mt-4 inline-flex bg-secondary px-3 py-2 text-sm font-semibold text-muted-foreground">{availabilityLabel}</p>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="border border-border bg-secondary p-4 text-center">
                    <Bed className="h-6 w-6 mx-auto text-gold mb-2" />
                    <p className="text-lg font-semibold text-foreground">
                      {property.beds}
                    </p>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                  </div>
                  <div className="border border-border bg-secondary p-4 text-center">
                    <Bath className="h-6 w-6 mx-auto text-gold mb-2" />
                    <p className="text-lg font-semibold text-foreground">
                      {property.baths}
                    </p>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                  </div>
                  <div className="border border-border bg-secondary p-4 text-center">
                    <Square className="h-6 w-6 mx-auto text-gold mb-2" />
                    <p className="text-lg font-semibold text-foreground">
                      {property.sqft.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Sq Ft</p>
                  </div>
                  <div className="border border-border bg-secondary p-4 text-center">
                    <Calendar className="h-6 w-6 mx-auto text-gold mb-2" />
                    <p className="text-lg font-semibold text-foreground">
                      {property.year_built || "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">Year Built</p>
                  </div>
                </div>

                {/* Description */}
                {property.description && (
                  <div>
                    <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                      About This Property
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {property.description}
                    </p>
                  </div>
                )}

                {/* Features */}
                <div>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                    Property Features
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center border border-gold/20 bg-gold/10">
                          <Check className="h-4 w-4 text-gold" />
                        </div>
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Agent Card */}
                <div className="sticky top-28 border border-border bg-card p-6 shadow-card">
                  <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
                    Contact Agent
                  </h3>
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={defaultAgent.image}
                      alt={defaultAgent.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div>
                      <p className="font-semibold text-foreground">
                        {defaultAgent.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Property Specialist
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {isAvailable && saleAllowed && (
                      <Link to={`/property/${property.id}/request?type=purchase`} className="block">
                        <Button variant="gold" size="lg" className="w-full">Buy Property</Button>
                      </Link>
                    )}
                    {isAvailable && rentAllowed && (
                      <Link to={`/property/${property.id}/request?type=rental`} className="block">
                        <Button variant={saleAllowed ? "outline" : "gold"} size="lg" className="w-full">Rent Property</Button>
                      </Link>
                    )}
                    <SupportTicketForm
                      propertyId={property.id}
                      propertyTitle={property.title}
                      triggerButton={
                        <Button variant="secondary" size="lg" className="w-full">
                          Ask a Question
                        </Button>
                      }
                    />
                  </div>

                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Response time: Within 24 hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {properties.filter((item) => item.id !== property.id).length > 0 && (
        <section className="border-t border-border bg-secondary py-16 sm:py-20">
          <div className="site-container">
            <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="section-eyebrow">Explore more</span>
                <h2 className="mt-2 text-3xl font-bold text-foreground">You may also like</h2>
              </div>
              <Link to="/properties" className="text-sm font-semibold text-gold transition-smooth hover:text-gold-dark">
                View all properties
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {properties
                .filter((item) => item.id !== property.id)
                .slice(0, 3)
                .map((item, index) => (
                  <PropertyCard
                    key={item.id}
                    id={item.id}
                    image={item.image_url || fallbackImages[index % fallbackImages.length]}
                    title={item.title}
                    location={item.location}
                    price={`$${item.price.toLocaleString()}`}
                    beds={item.beds}
                    baths={item.baths}
                    sqft={`${item.sqft.toLocaleString()} sqft`}
                    type={item.type}
                    featured={item.featured}
                    transactionType={item.transaction_type}
                    rentPrice={item.rent_price}
                    rentPeriod={item.rent_period}
                    availabilityStatus={item.availability_status}
                  />
                ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
};

export default PropertyDetail;
