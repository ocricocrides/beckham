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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      acoes: {
        Row: {
          data: Json
          id: string
          updated_at: string
        }
        Insert: {
          data?: Json
          id: string
          updated_at?: string
        }
        Update: {
          data?: Json
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      action_ranking: {
        Row: {
          derrotas: number
          discord_id: string
          discord_tag: string | null
          site_display_name: string | null
          site_username: string | null
          total: number
          updated_at: string
          vitorias: number
          winrate: number
        }
        Insert: {
          derrotas?: number
          discord_id: string
          discord_tag?: string | null
          site_display_name?: string | null
          site_username?: string | null
          total?: number
          updated_at?: string
          vitorias?: number
          winrate?: number
        }
        Update: {
          derrotas?: number
          discord_id?: string
          discord_tag?: string | null
          site_display_name?: string | null
          site_username?: string | null
          total?: number
          updated_at?: string
          vitorias?: number
          winrate?: number
        }
        Relationships: []
      }
      announcements: {
        Row: {
          body: string
          color: string | null
          created_at: string
          deleted_at: string | null
          id: string
          image_url: string | null
          posted_by_discord_id: string | null
          posted_by_display_name: string | null
          posted_by_username: string | null
          title: string
        }
        Insert: {
          body: string
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          image_url?: string | null
          posted_by_discord_id?: string | null
          posted_by_display_name?: string | null
          posted_by_username?: string | null
          title: string
        }
        Update: {
          body?: string
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          image_url?: string | null
          posted_by_discord_id?: string | null
          posted_by_display_name?: string | null
          posted_by_username?: string | null
          title?: string
        }
        Relationships: []
      }
      config_servidores: {
        Row: {
          data: Json
          id: string
          updated_at: string
        }
        Insert: {
          data?: Json
          id: string
          updated_at?: string
        }
        Update: {
          data?: Json
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      crew_photos: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          image_url: string
          posted_by_discord_id: string | null
          posted_by_display_name: string | null
          posted_by_username: string | null
          subtitle: string | null
          title: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          image_url: string
          posted_by_discord_id?: string | null
          posted_by_display_name?: string | null
          posted_by_username?: string | null
          subtitle?: string | null
          title: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          image_url?: string
          posted_by_discord_id?: string | null
          posted_by_display_name?: string | null
          posted_by_username?: string | null
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      discord_action_log: {
        Row: {
          action: string
          actor_display_name: string | null
          actor_username: string | null
          created_at: string
          id: string
          image_url: string | null
          processed_at: string | null
          subject: string | null
        }
        Insert: {
          action: string
          actor_display_name?: string | null
          actor_username?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          processed_at?: string | null
          subject?: string | null
        }
        Update: {
          action?: string
          actor_display_name?: string | null
          actor_username?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          processed_at?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      discord_link_requests: {
        Row: {
          code: string
          discord_id: string | null
          discord_tag: string | null
          expires_at: string
          id: string
          member_id: string
          requested_at: string
          reviewed_at: string | null
          reviewed_by_discord_id: string | null
          status: string
        }
        Insert: {
          code: string
          discord_id?: string | null
          discord_tag?: string | null
          expires_at?: string
          id?: string
          member_id: string
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by_discord_id?: string | null
          status?: string
        }
        Update: {
          code?: string
          discord_id?: string | null
          discord_tag?: string | null
          expires_at?: string
          id?: string
          member_id?: string
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by_discord_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "discord_link_requests_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      farm: {
        Row: {
          data: Json
          id: string
          updated_at: string
        }
        Insert: {
          data?: Json
          id: string
          updated_at?: string
        }
        Update: {
          data?: Json
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      historico: {
        Row: {
          data: Json
          id: string
          updated_at: string
        }
        Insert: {
          data?: Json
          id: string
          updated_at?: string
        }
        Update: {
          data?: Json
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      member_profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          can_delete_announcements: boolean
          can_delete_photos: boolean
          can_post_announcements: boolean
          can_post_photos: boolean
          created_at: string
          discord_id: string | null
          discord_url: string | null
          display_name: string
          id: string
          instagram_url: string | null
          is_admin: boolean
          location: string | null
          music_url: string | null
          role_id: string | null
          share_image: string
          twitch_url: string | null
          updated_at: string
          username: string
          x_url: string | null
          youtube_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          can_delete_announcements?: boolean
          can_delete_photos?: boolean
          can_post_announcements?: boolean
          can_post_photos?: boolean
          created_at?: string
          discord_id?: string | null
          discord_url?: string | null
          display_name: string
          id: string
          instagram_url?: string | null
          is_admin?: boolean
          location?: string | null
          music_url?: string | null
          role_id?: string | null
          share_image?: string
          twitch_url?: string | null
          updated_at?: string
          username: string
          x_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          can_delete_announcements?: boolean
          can_delete_photos?: boolean
          can_post_announcements?: boolean
          can_post_photos?: boolean
          created_at?: string
          discord_id?: string | null
          discord_url?: string | null
          display_name?: string
          id?: string
          instagram_url?: string | null
          is_admin?: boolean
          location?: string | null
          music_url?: string | null
          role_id?: string | null
          share_image?: string
          twitch_url?: string | null
          updated_at?: string
          username?: string
          x_url?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      member_roles: {
        Row: {
          created_at: string
          member_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          member_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          member_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_roles_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      punicoes_ativas: {
        Row: {
          data: Json
          id: string
          updated_at: string
        }
        Insert: {
          data?: Json
          id: string
          updated_at?: string
        }
        Update: {
          data?: Json
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      registros: {
        Row: {
          data: Json
          id: string
          updated_at: string
        }
        Insert: {
          data?: Json
          id: string
          updated_at?: string
        }
        Update: {
          data?: Json
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          can_delete_announcements: boolean
          can_delete_photos: boolean
          can_post_announcements: boolean
          can_post_photos: boolean
          color: string | null
          created_at: string
          discord_role_id: string | null
          id: string
          is_admin: boolean
          name: string
          sort_order: number
          tipo: string
        }
        Insert: {
          can_delete_announcements?: boolean
          can_delete_photos?: boolean
          can_post_announcements?: boolean
          can_post_photos?: boolean
          color?: string | null
          created_at?: string
          discord_role_id?: string | null
          id?: string
          is_admin?: boolean
          name: string
          sort_order?: number
          tipo?: string
        }
        Update: {
          can_delete_announcements?: boolean
          can_delete_photos?: boolean
          can_post_announcements?: boolean
          can_post_photos?: boolean
          color?: string | null
          created_at?: string
          discord_role_id?: string | null
          id?: string
          is_admin?: boolean
          name?: string
          sort_order?: number
          tipo?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_delete_announcements: { Args: { p_uid: string }; Returns: boolean }
      can_delete_photos: { Args: { p_uid: string }; Returns: boolean }
      can_post_announcements: { Args: { p_uid: string }; Returns: boolean }
      can_post_photos: { Args: { p_uid: string }; Returns: boolean }
      is_effective_admin: { Args: { p_uid: string }; Returns: boolean }
      recompute_member_principal: {
        Args: { p_member_id: string }
        Returns: undefined
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
