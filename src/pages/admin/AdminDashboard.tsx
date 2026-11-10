import { useProperties } from "@/hooks/useProperties";
import { Building, DollarSign, Star, TrendingUp } from "lucide-react";

const AdminDashboard = () => {
  const { data: properties, isLoading } = useProperties();

  const stats = [
    {
      label: "Total Properties",
      value: properties?.length || 0,
      icon: Building,
      color: "text-blue-500",
    },
    {
      label: "Featured",
      value: properties?.filter((p) => p.featured).length || 0,
      icon: Star,
      color: "text-gold",
    },
    {
      label: "Total Value",
      value: `$${((properties?.reduce((sum, p) => sum + p.price, 0) || 0) / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: "text-cyan-600",
    },
    {
      label: "Avg Price",
      value: properties?.length
        ? `$${((properties.reduce((sum, p) => sum + p.price, 0) / properties.length) / 1000000).toFixed(2)}M`
        : "$0",
      icon: TrendingUp,
      color: "text-blue-600",
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of your property listings
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
              <div className="h-12 w-12 bg-secondary rounded-lg mb-4" />
              <div className="h-4 w-20 bg-secondary rounded mb-2" />
              <div className="h-8 w-24 bg-secondary rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-card transition-smooth"
            >
              <div className={`h-12 w-12 rounded-lg bg-secondary flex items-center justify-center mb-4`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-heading font-bold text-foreground mt-1">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
          Recent Properties
        </h2>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Property
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {properties?.slice(0, 5).map((property) => (
                  <tr key={property.id} className="hover:bg-secondary/50 transition-smooth">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {property.image_url && (
                          <img
                            src={property.image_url}
                            alt={property.title}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-foreground">{property.title}</p>
                          <p className="text-sm text-muted-foreground">{property.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {property.type}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      ${property.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {property.featured ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold/10 text-gold">
                          Featured
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground">
                          Standard
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {(!properties || properties.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No properties found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
