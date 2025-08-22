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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      device_categories: {
        Row: {
          color_code: string | null
          created_at: string | null
          description: string | null
          icon_name: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          color_code?: string | null
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          color_code?: string | null
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      device_placements: {
        Row: {
          coverage_area: Json | null
          created_at: string | null
          device_name: string
          device_spec_id: number | null
          id: string
          installation_notes: string | null
          mounting_height: number | null
          placement_reason: string | null
          position_x: number | null
          position_y: number | null
          priority: string | null
          project_id: string | null
          quantity: number
          room_name: string | null
          wiring_requirements: Json | null
        }
        Insert: {
          coverage_area?: Json | null
          created_at?: string | null
          device_name: string
          device_spec_id?: number | null
          id?: string
          installation_notes?: string | null
          mounting_height?: number | null
          placement_reason?: string | null
          position_x?: number | null
          position_y?: number | null
          priority?: string | null
          project_id?: string | null
          quantity?: number
          room_name?: string | null
          wiring_requirements?: Json | null
        }
        Update: {
          coverage_area?: Json | null
          created_at?: string | null
          device_name?: string
          device_spec_id?: number | null
          id?: string
          installation_notes?: string | null
          mounting_height?: number | null
          placement_reason?: string | null
          position_x?: number | null
          position_y?: number | null
          priority?: string | null
          project_id?: string | null
          quantity?: number
          room_name?: string | null
          wiring_requirements?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "device_placements_device_spec_id_fkey"
            columns: ["device_spec_id"]
            isOneToOne: false
            referencedRelation: "device_specifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_placements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      device_specifications: {
        Row: {
          category_id: number
          coverage_area_sqft: number | null
          coverage_radius_feet: number | null
          created_at: string | null
          description: string | null
          detection_range_feet: number | null
          device_name: string
          environmental_requirements: string | null
          field_of_view_degrees: number | null
          id: number
          installation_constraints: string | null
          interference_frequency_ghz: number | null
          mounting_height_max_feet: number | null
          mounting_height_min_feet: number | null
          mounting_height_optimal_feet: number | null
          placement_rules: Json | null
          power_consumption_watts: number | null
          technical_specs: Json | null
          updated_at: string | null
          voltage_requirements: string | null
        }
        Insert: {
          category_id: number
          coverage_area_sqft?: number | null
          coverage_radius_feet?: number | null
          created_at?: string | null
          description?: string | null
          detection_range_feet?: number | null
          device_name: string
          environmental_requirements?: string | null
          field_of_view_degrees?: number | null
          id?: number
          installation_constraints?: string | null
          interference_frequency_ghz?: number | null
          mounting_height_max_feet?: number | null
          mounting_height_min_feet?: number | null
          mounting_height_optimal_feet?: number | null
          placement_rules?: Json | null
          power_consumption_watts?: number | null
          technical_specs?: Json | null
          updated_at?: string | null
          voltage_requirements?: string | null
        }
        Update: {
          category_id?: number
          coverage_area_sqft?: number | null
          coverage_radius_feet?: number | null
          created_at?: string | null
          description?: string | null
          detection_range_feet?: number | null
          device_name?: string
          environmental_requirements?: string | null
          field_of_view_degrees?: number | null
          id?: number
          installation_constraints?: string | null
          interference_frequency_ghz?: number | null
          mounting_height_max_feet?: number | null
          mounting_height_min_feet?: number | null
          mounting_height_optimal_feet?: number | null
          placement_rules?: Json | null
          power_consumption_watts?: number | null
          technical_specs?: Json | null
          updated_at?: string | null
          voltage_requirements?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_specifications_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "device_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_racks: {
        Row: {
          created_at: string | null
          equipment_list: Json | null
          id: string
          installation_specs: Json | null
          position_x: number | null
          position_y: number | null
          power_requirements: number | null
          project_id: string | null
          rack_name: string
          rack_type: string
          rack_units: number | null
          wiring_diagram: Json | null
        }
        Insert: {
          created_at?: string | null
          equipment_list?: Json | null
          id?: string
          installation_specs?: Json | null
          position_x?: number | null
          position_y?: number | null
          power_requirements?: number | null
          project_id?: string | null
          rack_name: string
          rack_type: string
          rack_units?: number | null
          wiring_diagram?: Json | null
        }
        Update: {
          created_at?: string | null
          equipment_list?: Json | null
          id?: string
          installation_specs?: Json | null
          position_x?: number | null
          position_y?: number | null
          power_requirements?: number | null
          project_id?: string | null
          rack_name?: string
          rack_type?: string
          rack_units?: number | null
          wiring_diagram?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_racks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          subscription_tier: string | null
          updated_at: string | null
          user_role: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_role?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          automation_tier: string
          created_at: string | null
          description: string | null
          device_configuration: Json | null
          estimated_cost: number | null
          floor_plan_analysis: Json | null
          floor_plan_url: string | null
          id: string
          project_name: string
          project_status: string | null
          tier_details: Json | null
          total_devices: number | null
          updated_at: string | null
          user_id: string | null
          user_preferences: Json | null
        }
        Insert: {
          automation_tier: string
          created_at?: string | null
          description?: string | null
          device_configuration?: Json | null
          estimated_cost?: number | null
          floor_plan_analysis?: Json | null
          floor_plan_url?: string | null
          id?: string
          project_name: string
          project_status?: string | null
          tier_details?: Json | null
          total_devices?: number | null
          updated_at?: string | null
          user_id?: string | null
          user_preferences?: Json | null
        }
        Update: {
          automation_tier?: string
          created_at?: string | null
          description?: string | null
          device_configuration?: Json | null
          estimated_cost?: number | null
          floor_plan_analysis?: Json | null
          floor_plan_url?: string | null
          id?: string
          project_name?: string
          project_status?: string | null
          tier_details?: Json | null
          total_devices?: number | null
          updated_at?: string | null
          user_id?: string | null
          user_preferences?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
