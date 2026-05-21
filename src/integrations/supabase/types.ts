export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      attendance: {
        Row: {
          class_id: string;
          id: string;
          marked_at: string;
          present: boolean;
          student_id: string;
        };
        Insert: {
          class_id: string;
          id?: string;
          marked_at?: string;
          present?: boolean;
          student_id: string;
        };
        Update: {
          class_id?: string;
          id?: string;
          marked_at?: string;
          present?: boolean;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "live_classes";
            referencedColumns: ["id"];
          },
        ];
      };
      courses: {
        Row: {
          category: string;
          coach_id: string | null;
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          price: number;
          schedule: string | null;
          seats: number;
          thumbnail_url: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          category?: string;
          coach_id?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          price?: number;
          schedule?: string | null;
          seats?: number;
          thumbnail_url?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          coach_id?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          price?: number;
          schedule?: string | null;
          seats?: number;
          thumbnail_url?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      demo_bookings: {
        Row: {
          course: string;
          created_at: string;
          email: string;
          id: string;
          message: string | null;
          name: string;
          parent_name: string | null;
          phone: string;
          preferred_subject: string | null;
          preferred_timing: string | null;
          status: string;
          source: string | null;
          student_class: string | null;
        };
        Insert: {
          course: string;
          created_at?: string;
          email: string;
          id?: string;
          message?: string | null;
          name: string;
          parent_name?: string | null;
          phone: string;
          preferred_subject?: string | null;
          preferred_timing?: string | null;
          status?: string;
          source?: string | null;
          student_class?: string | null;
        };
        Update: {
          course?: string;
          created_at?: string;
          email?: string;
          id?: string;
          message?: string | null;
          name?: string;
          parent_name?: string | null;
          phone?: string;
          preferred_subject?: string | null;
          preferred_timing?: string | null;
          status?: string;
          source?: string | null;
          student_class?: string | null;
        };
        Relationships: [];
      };
      enrollments: {
        Row: {
          course_id: string;
          enrolled_at: string;
          fee_amount: number;
          id: string;
          status: string;
          student_id: string;
        };
        Insert: {
          course_id: string;
          enrolled_at?: string;
          fee_amount?: number;
          id?: string;
          status?: string;
          student_id: string;
        };
        Update: {
          course_id?: string;
          enrolled_at?: string;
          fee_amount?: number;
          id?: string;
          status?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      fees: {
        Row: {
          amount: number;
          course_id: string | null;
          created_at: string;
          id: string;
          notes: string | null;
          paid_at: string | null;
          period: string;
          status: string;
          student_id: string;
          updated_at: string;
        };
        Insert: {
          amount?: number;
          course_id?: string | null;
          created_at?: string;
          id?: string;
          notes?: string | null;
          paid_at?: string | null;
          period: string;
          status?: string;
          student_id: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          course_id?: string | null;
          created_at?: string;
          id?: string;
          notes?: string | null;
          paid_at?: string | null;
          period?: string;
          status?: string;
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fees_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      invoices: {
        Row: {
          amount: number;
          fee_id: string | null;
          id: string;
          invoice_number: string;
          issued_at: string;
          pdf_url: string | null;
          student_id: string;
        };
        Insert: {
          amount?: number;
          fee_id?: string | null;
          id?: string;
          invoice_number: string;
          issued_at?: string;
          pdf_url?: string | null;
          student_id: string;
        };
        Update: {
          amount?: number;
          fee_id?: string | null;
          id?: string;
          invoice_number?: string;
          issued_at?: string;
          pdf_url?: string | null;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_fee_id_fkey";
            columns: ["fee_id"];
            isOneToOne: false;
            referencedRelation: "fees";
            referencedColumns: ["id"];
          },
        ];
      };
      live_classes: {
        Row: {
          coach_id: string | null;
          course_id: string | null;
          created_at: string;
          duration_min: number;
          enablex_room_id: string | null;
          id: string;
          scheduled_at: string;
          status: string;
          title: string;
        };
        Insert: {
          coach_id?: string | null;
          course_id?: string | null;
          created_at?: string;
          duration_min?: number;
          enablex_room_id?: string | null;
          id?: string;
          scheduled_at: string;
          status?: string;
          title: string;
        };
        Update: {
          coach_id?: string | null;
          course_id?: string | null;
          created_at?: string;
          duration_min?: number;
          enablex_room_id?: string | null;
          id?: string;
          scheduled_at?: string;
          status?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "live_classes_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          body: string;
          class_id: string;
          created_at: string;
          id: string;
          sender_id: string;
        };
        Insert: {
          body: string;
          class_id: string;
          created_at?: string;
          id?: string;
          sender_id: string;
        };
        Update: {
          body?: string;
          class_id?: string;
          created_at?: string;
          id?: string;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "live_classes";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          phone: string | null;
          updated_at: string;
          user_id: string;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
          user_id: string;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
          user_id?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      site_stats: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          label: string;
          sort_order: number;
          suffix: string | null;
          updated_at: string;
          value: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          label: string;
          sort_order?: number;
          suffix?: string | null;
          updated_at?: string;
          value?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          label?: string;
          sort_order?: number;
          suffix?: string | null;
          updated_at?: string;
          value?: number;
        };
        Relationships: [];
      };
      success_stories: {
        Row: {
          achievement: string | null;
          created_at: string;
          featured: boolean;
          headline: string;
          id: string;
          image_url: string | null;
          is_active: boolean;
          name: string;
          sort_order: number;
          story: string;
          updated_at: string;
        };
        Insert: {
          achievement?: string | null;
          created_at?: string;
          featured?: boolean;
          headline: string;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name: string;
          sort_order?: number;
          story: string;
          updated_at?: string;
        };
        Update: {
          achievement?: string | null;
          created_at?: string;
          featured?: boolean;
          headline?: string;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name?: string;
          sort_order?: number;
          story?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          featured: boolean;
          id: string;
          is_active: boolean;
          name: string;
          quote: string;
          rating: number;
          role: string | null;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          featured?: boolean;
          id?: string;
          is_active?: boolean;
          name: string;
          quote: string;
          rating?: number;
          role?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          featured?: boolean;
          id?: string;
          is_active?: boolean;
          name?: string;
          quote?: string;
          rating?: number;
          role?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_role: {
        Args: { _user_id: string };
        Returns: Database["public"]["Enums"]["app_role"];
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "coach" | "student";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "coach", "student"],
    },
  },
} as const;
