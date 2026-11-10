import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  type: string;
  featured: boolean;
  description: string | null;
  image_url: string | null;
  gallery_images: string[];
  amenities: string[];
  year_built: number | null;
  lot_size: string | null;
  parking: string | null;
  created_at: string;
  updated_at: string;
}

export type PropertyInput = Omit<Property, "id" | "created_at" | "updated_at">;

export const useProperties = () => {
  return useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Property[];
    },
  });
};

export const useFeaturedProperties = () => {
  return useQuery({
    queryKey: ["properties", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as Property[];
    },
  });
};

export const useProperty = (id: string) => {
  return useQuery({
    queryKey: ["properties", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as Property | null;
    },
    enabled: !!id,
  });
};

export const useCreateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (property: PropertyInput) => {
      const { data, error } = await supabase
        .from("properties")
        .insert(property)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Property created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create property: " + error.message);
    },
  });
};

export const useUpdateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...property }: Partial<Property> & { id: string }) => {
      const { data, error } = await supabase
        .from("properties")
        .update(property)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Property updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update property: " + error.message);
    },
  });
};

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Property deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete property: " + error.message);
    },
  });
};
