export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      payment_methods: {
        Row: {
          bank_account_last_four: string | null
          bank_name: string | null
          card_brand: string | null
          card_holder_name: string | null
          card_last_four: string | null
          created_at: string
          id: string
          is_default: boolean | null
          method_type: string
          paypal_email: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bank_account_last_four?: string | null
          bank_name?: string | null
          card_brand?: string | null
          card_holder_name?: string | null
          card_last_four?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          method_type: string
          paypal_email?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bank_account_last_four?: string | null
          bank_name?: string | null
          card_brand?: string | null
          card_holder_name?: string | null
          card_last_four?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          method_type?: string
          paypal_email?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          amenities: string[] | null
          availability_date: string | null
          availability_status: string
          baths: number
          beds: number
          created_at: string | null
          description: string | null
          featured: boolean | null
          gallery_images: string[] | null
          id: string
          image_url: string | null
          location: string
          lot_size: string | null
          minimum_rental_period: number | null
          parking: string | null
          price: number
          rent_period: string | null
          rent_price: number | null
          security_deposit: number | null
          sqft: number
          title: string
          transaction_type: string
          type: string
          updated_at: string | null
          year_built: number | null
        }
        Insert: {
          amenities?: string[] | null
          availability_date?: string | null
          availability_status?: string
          baths?: number
          beds?: number
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          gallery_images?: string[] | null
          id?: string
          image_url?: string | null
          location: string
          lot_size?: string | null
          minimum_rental_period?: number | null
          parking?: string | null
          price: number
          rent_period?: string | null
          rent_price?: number | null
          security_deposit?: number | null
          sqft?: number
          title: string
          transaction_type?: string
          type?: string
          updated_at?: string | null
          year_built?: number | null
        }
        Update: {
          amenities?: string[] | null
          availability_date?: string | null
          availability_status?: string
          baths?: number
          beds?: number
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          gallery_images?: string[] | null
          id?: string
          image_url?: string | null
          location?: string
          lot_size?: string | null
          minimum_rental_period?: number | null
          parking?: string | null
          price?: number
          rent_period?: string | null
          rent_price?: number | null
          security_deposit?: number | null
          sqft?: number
          title?: string
          transaction_type?: string
          type?: string
          updated_at?: string | null
          year_built?: number | null
        }
        Relationships: []
      }
      property_requests: {
        Row: {
          applicant_email: string
          applicant_name: string
          applicant_phone: string
          contact_method: string
          created_at: string
          id: string
          message: string
          move_in_date: string | null
          number_of_occupants: number | null
          property_id: string | null
          property_price: number
          property_title: string
          request_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applicant_email: string
          applicant_name: string
          applicant_phone: string
          contact_method?: string
          created_at?: string
          id?: string
          message?: string
          move_in_date?: string | null
          number_of_occupants?: number | null
          property_id?: string | null
          property_price: number
          property_title: string
          request_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applicant_email?: string
          applicant_name?: string
          applicant_phone?: string
          contact_method?: string
          created_at?: string
          id?: string
          message?: string
          move_in_date?: string | null
          number_of_occupants?: number | null
          property_id?: string | null
          property_price?: number
          property_title?: string
          request_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          admin_notes: string | null
          created_at: string
          guest_email: string | null
          guest_name: string | null
          id: string
          message: string
          priority: string
          property_id: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          message: string
          priority?: string
          property_id?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          message?: string
          priority?: string
          property_id?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_replies: {
        Row: {
          created_at: string
          id: string
          is_admin_reply: boolean
          message: string
          ticket_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin_reply?: boolean
          message: string
          ticket_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_admin_reply?: boolean
          message?: string
          ticket_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      create_property_request: {
        Args: {
          p_applicant_email: string
          p_applicant_name: string
          p_applicant_phone: string
          p_contact_method: string
          p_message?: string
          p_move_in_date?: string | null
          p_number_of_occupants?: number | null
          p_property_id: string
          p_request_type: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
