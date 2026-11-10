import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Property, useCreateProperty, useUpdateProperty } from "@/hooks/useProperties";
import ImageUpload from "./ImageUpload";

const propertySchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  location: z.string().min(1, "Location is required").max(200),
  price: z.coerce.number().min(0, "Price must be positive"),
  beds: z.coerce.number().min(0).max(50),
  baths: z.coerce.number().min(0).max(50),
  sqft: z.coerce.number().min(0),
  type: z.string().min(1, "Type is required"),
  featured: z.boolean(),
  description: z.string().max(5000).nullable(),
  image_url: z.string().nullable(),
  year_built: z.coerce.number().min(1800).max(2100).nullable().optional(),
  lot_size: z.string().max(50).nullable().optional(),
  parking: z.string().max(100).nullable().optional(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

interface PropertyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: Property | null;
}

const propertyTypes = ["House", "Villa", "Penthouse", "Loft", "Estate", "Condo", "Townhouse", "Apartment"];

const PropertyFormDialog = ({
  open,
  onOpenChange,
  property,
}: PropertyFormDialogProps) => {
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const isEditing = !!property;

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      location: "",
      price: 0,
      beds: 0,
      baths: 0,
      sqft: 0,
      type: "House",
      featured: false,
      description: "",
      image_url: null,
      year_built: null,
      lot_size: "",
      parking: "",
    },
  });

  useEffect(() => {
    if (property) {
      form.reset({
        title: property.title,
        location: property.location,
        price: property.price,
        beds: property.beds,
        baths: property.baths,
        sqft: property.sqft,
        type: property.type,
        featured: property.featured,
        description: property.description || "",
        image_url: property.image_url || null,
        year_built: property.year_built,
        lot_size: property.lot_size || "",
        parking: property.parking || "",
      });
    } else {
      form.reset({
        title: "",
        location: "",
        price: 0,
        beds: 0,
        baths: 0,
        sqft: 0,
        type: "House",
        featured: false,
        description: "",
        image_url: null,
        year_built: null,
        lot_size: "",
        parking: "",
      });
    }
  }, [property, form]);

  const onSubmit = async (values: PropertyFormValues) => {
    const data = {
      title: values.title,
      location: values.location,
      price: values.price,
      beds: values.beds,
      baths: values.baths,
      sqft: values.sqft,
      type: values.type,
      featured: values.featured,
      image_url: values.image_url || null,
      description: values.description || null,
      year_built: values.year_built || null,
      lot_size: values.lot_size || null,
      parking: values.parking || null,
      gallery_images: property?.gallery_images || [],
      amenities: property?.amenities || [],
    };

    if (isEditing) {
      await updateProperty.mutateAsync({ id: property.id, ...data });
    } else {
      await createProperty.mutateAsync(data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {isEditing ? "Edit Property" : "Add New Property"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Image Upload */}
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Modern Skyline Penthouse" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Downtown, Los Angeles" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="4250000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="beds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="baths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sqft"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Square Feet</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="4500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year_built"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year Built</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2020"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lot_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lot Size</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0.5 acres"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parking</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="3-car garage"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the property..."
                        rows={4}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border p-4 md:col-span-2">
                    <div>
                      <FormLabel className="text-base">Featured Property</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Display this property in the featured section
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gold"
                disabled={createProperty.isPending || updateProperty.isPending}
              >
                {createProperty.isPending || updateProperty.isPending
                  ? "Saving..."
                  : isEditing
                  ? "Update Property"
                  : "Create Property"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyFormDialog;
