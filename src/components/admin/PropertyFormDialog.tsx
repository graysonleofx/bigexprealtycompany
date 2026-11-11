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
  transaction_type: z.enum(["sale", "rent", "both"]),
  rent_price: z.number().min(0).nullable(),
  rent_period: z.enum(["weekly", "monthly", "yearly"]),
  security_deposit: z.number().min(0).nullable(),
  availability_date: z.string().nullable(),
  minimum_rental_period: z.number().int().min(1).nullable(),
  availability_status: z.enum(["available", "pending", "sold", "rented", "unavailable"]),
  beds: z.coerce.number().min(0).max(50),
  baths: z.coerce.number().min(0).max(50),
  sqft: z.coerce.number().min(0),
  type: z.string().min(1, "Type is required"),
  featured: z.boolean(),
  description: z.string().max(5000).nullable(),
  image_url: z.string().nullable(),
  year_built: z.preprocess(
    (value) => value === "" || value === null || value === undefined ? null : Number(value),
    z.number().min(1800).max(2100).nullable(),
  ),
  lot_size: z.string().max(50).nullable().optional(),
  parking: z.string().max(100).nullable().optional(),
}).superRefine((values, context) => {
  if (values.transaction_type !== "sale" && values.rent_price <= 0) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["rent_price"], message: "Enter a rent greater than zero" });
  }
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
      transaction_type: "sale",
      rent_price: null,
      rent_period: "monthly",
      security_deposit: null,
      availability_date: "",
      minimum_rental_period: null,
      availability_status: "available",
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
        transaction_type: property.transaction_type,
        rent_price: property.rent_price,
        rent_period: property.rent_period || "monthly",
        security_deposit: property.security_deposit,
        availability_date: property.availability_date || "",
        minimum_rental_period: property.minimum_rental_period,
        availability_status: property.availability_status,
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
        transaction_type: "sale",
        rent_price: null,
        rent_period: "monthly",
        security_deposit: null,
        availability_date: "",
        minimum_rental_period: null,
        availability_status: "available",
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
      transaction_type: values.transaction_type,
      rent_price: values.transaction_type === "sale" ? null : values.rent_price,
      rent_period: values.transaction_type === "sale" ? null : values.rent_period,
      security_deposit: values.transaction_type === "sale" ? null : values.security_deposit,
      availability_date: values.transaction_type === "sale" || !values.availability_date ? null : values.availability_date,
      minimum_rental_period: values.transaction_type === "sale" ? null : values.minimum_rental_period,
      availability_status: values.availability_status,
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

              {form.watch("transaction_type") !== "rent" && (
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sale Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="4250000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="transaction_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sale">For sale</SelectItem>
                        <SelectItem value="rent">For rent</SelectItem>
                        <SelectItem value="both">Sale and rent</SelectItem>
                      </SelectContent>
                    </Select>
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

              {form.watch("transaction_type") !== "sale" && (
                <>
                  <FormField
                    control={form.control}
                    name="rent_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rent Price</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" value={field.value ?? ""} onChange={(event) => field.onChange(event.target.value === "" ? null : Number(event.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rent_period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rent Period</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="security_deposit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Security Deposit (optional)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" value={field.value ?? ""} onChange={(event) => field.onChange(event.target.value === "" ? null : Number(event.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="availability_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available From (optional)</FormLabel>
                        <FormControl>
                          <Input type="date" value={field.value ?? ""} onChange={(event) => field.onChange(event.target.value)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="minimum_rental_period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Rental Period (months, optional)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" value={field.value ?? ""} onChange={(event) => field.onChange(event.target.value === "" ? null : Number(event.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="availability_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="rented">Rented</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
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
