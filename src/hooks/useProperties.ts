import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  transaction_type: "sale" | "rent" | "both";
  rent_price: number | null;
  rent_period: "weekly" | "monthly" | "yearly" | null;
  security_deposit: number | null;
  availability_date: string | null;
  minimum_rental_period: number | null;
  availability_status: "available" | "pending" | "sold" | "rented" | "unavailable";
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

export type PropertyRequest = {
  id: string;
  property_id: string | null;
  user_id: string;
  request_type: "purchase" | "rental";
  property_title: string;
  property_price: number;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  contact_method: "email" | "phone";
  move_in_date: string | null;
  number_of_occupants: number | null;
  message: string;
  status: "pending" | "under_review" | "accepted" | "approved" | "rejected" | "completed" | "leased";
  created_at: string;
  updated_at: string;
};

export type PropertyRequestInput = Pick<
  PropertyRequest,
  | "property_id"
  | "request_type"
  | "applicant_name"
  | "applicant_email"
  | "applicant_phone"
  | "contact_method"
  | "message"
  | "move_in_date"
  | "number_of_occupants"
>;

export const usePropertyRequests = (userId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (userId === "") return;
    const channel = supabase
      .channel(`property-requests-${userId || "admin"}`)
      .on(
        "postgres_changes",
        userId
          ? { event: "*", schema: "public", table: "property_requests", filter: `user_id=eq.${userId}` }
          : { event: "*", schema: "public", table: "property_requests" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["property-requests"] });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);

  return useQuery({
    queryKey: ["property-requests", userId || "all"],
    queryFn: async () => {
      let query = supabase
        .from("property_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (userId) query = query.eq("user_id", userId);
      const { data, error } = await query;
      if (error) throw error;
      return data as PropertyRequest[];
    },
    enabled: userId !== "",
  });
};

export const useCreatePropertyRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: PropertyRequestInput) => {
      const { data, error } = await supabase.rpc("create_property_request", {
        p_property_id: request.property_id,
        p_request_type: request.request_type,
        p_applicant_name: request.applicant_name,
        p_applicant_email: request.applicant_email,
        p_applicant_phone: request.applicant_phone,
        p_contact_method: request.contact_method,
        p_message: request.message,
        p_move_in_date: request.move_in_date,
        p_number_of_occupants: request.number_of_occupants,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-requests"] });
    },
  });
};

export const useUpdatePropertyRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PropertyRequest["status"] }) => {
      const { data, error } = await supabase
        .from("property_requests")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-requests"] });
    },
  });
};
