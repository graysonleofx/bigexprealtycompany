import { useState } from "react";
import { useProperties, useDeleteProperty, Property } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import PropertyFormDialog from "@/components/admin/PropertyFormDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminProperties = () => {
  const { data: properties, isLoading } = useProperties();
  const deleteProperty = useDeleteProperty();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredProperties = properties?.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteProperty.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProperty(null);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Properties
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your property listings
          </p>
        </div>
        <Button variant="gold" onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search properties..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 bg-secondary rounded-lg" />
                <div className="flex-1">
                  <div className="h-5 w-48 bg-secondary rounded mb-2" />
                  <div className="h-4 w-32 bg-secondary rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProperties?.map((property) => (
            <div
              key={property.id}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-card transition-smooth"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="h-20 w-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                  {property.image_url ? (
                    <img
                      src={property.image_url}
                      alt={property.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-heading font-semibold text-foreground truncate">
                        {property.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {property.location}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{property.beds} beds</span>
                        <span>{property.baths} baths</span>
                        <span>{property.sqft.toLocaleString()} sqft</span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-heading font-bold text-foreground">
                        ${property.price.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {property.featured && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold/10 text-gold">
                            Featured
                          </span>
                        )}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground">
                          {property.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:flex-col">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(property)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(property.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {(!filteredProperties || filteredProperties.length === 0) && (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <p className="text-muted-foreground">No properties found</p>
              <Button
                variant="gold"
                className="mt-4"
                onClick={() => setIsFormOpen(true)}
              >
                Add your first property
              </Button>
            </div>
          )}
        </div>
      )}

      <PropertyFormDialog
        open={isFormOpen}
        onOpenChange={handleFormClose}
        property={editingProperty}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this property? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProperties;
