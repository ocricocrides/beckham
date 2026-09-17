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
      clip_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
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
          actor_discord_id: string | null
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
          actor_discord_id?: string | null
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
          actor_discord_id?: string | null
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
      discord_tickets: {
        Row: {
          category: string
          closed_at: string | null
          created_at: string
          discord_channel_id: string | null
          id: string
          opener_discord_id: string
          opener_tag: string | null
          source_member_id: string | null
          source_text: string | null
          status: string
        }
        Insert: {
          category: string
          closed_at?: string | null
          created_at?: string
          discord_channel_id?: string | null
          id?: string
          opener_discord_id: string
          opener_tag?: string | null
          source_member_id?: string | null
          source_text?: string | null
          status?: string
        }
        Update: {
          category?: string
          closed_at?: string | null
          created_at?: string
          discord_channel_id?: string | null
          id?: string
          opener_discord_id?: string
          opener_tag?: string | null
          source_member_id?: string | null
          source_text?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "discord_tickets_source_member_id_fkey"
            columns: ["source_member_id"]
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
      featured_clips: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          member_id: string | null
          sort_order: number
          title: string
          url: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          member_id?: string | null
          sort_order?: number
          title: string
          url: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          member_id?: string | null
          sort_order?: number
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_clips_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "clip_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_clips_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["id"]
          },
        ]
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
          can_review_registrations: boolean
          card_role_id: string | null
          created_at: string
          discord_id: string | null
          discord_url: string | null
          display_name: string
          id: string
          instagram_url: string | null
          is_admin: boolean
          is_member: boolean
          location: string | null
          music_url: string | null
          role_id: string | null
          share_image: string
          tiktok_url: string | null
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
          can_review_registrations?: boolean
          card_role_id?: string | null
          created_at?: string
          discord_id?: string | null
          discord_url?: string | null
          display_name: string
          id: string
          instagram_url?: string | null
          is_admin?: boolean
          is_member?: boolean
          location?: string | null
          music_url?: string | null
          role_id?: string | null
          share_image?: string
          tiktok_url?: string | null
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
          can_review_registrations?: boolean
          card_role_id?: string | null
          created_at?: string
          discord_id?: string | null
          discord_url?: string | null
          display_name?: string
          id?: string
          instagram_url?: string | null
          is_admin?: boolean
          is_member?: boolean
          location?: string | null
          music_url?: string | null
          role_id?: string | null
          share_image?: string
          tiktok_url?: string | null
          twitch_url?: string | null
          updated_at?: string
          username?: string
          x_url?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_profiles_card_role_id_fkey"
            columns: ["card_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
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
      member_stream_platforms: {
        Row: {
          created_at: string
          member_id: string
          platform: string
        }
        Insert: {
          created_at?: string
          member_id: string
          platform: string
        }
        Update: {
          created_at?: string
          member_id?: string
          platform?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_stream_platforms_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
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
          can_review_registrations: boolean
          color: string | null
          created_at: string
          discord_role_id: string | null
          id: string
          is_admin: boolean
          is_streamer: boolean
          name: string
          show_on_card: boolean
          sort_order: number
          tipo: string
        }
        Insert: {
          can_delete_announcements?: boolean
          can_delete_photos?: boolean
          can_post_announcements?: boolean
          can_post_photos?: boolean
          can_review_registrations?: boolean
          color?: string | null
          created_at?: string
          discord_role_id?: string | null
          id?: string
          is_admin?: boolean
          is_streamer?: boolean
          name: string
          show_on_card?: boolean
          sort_order?: number
          tipo?: string
        }
        Update: {
          can_delete_announcements?: boolean
          can_delete_photos?: boolean
          can_post_announcements?: boolean
          can_post_photos?: boolean
          can_review_registrations?: boolean
          color?: string | null
          created_at?: string
          discord_role_id?: string | null
          id?: string
          is_admin?: boolean
          is_streamer?: boolean
          name?: string
          show_on_card?: boolean
          sort_order?: number
          tipo?: string
        }
        Relationships: []
      }
      site_registrations: {
        Row: {
          discord_applied_at: string | null
          discord_id: string
          discord_messages: Json | null
          id_jogo: string
          member_id: string
          nome: string
          posted_at: string | null
          recrutador: string
          reviewed_at: string | null
          reviewed_by_discord_id: string | null
          reviewed_by_member_id: string | null
          reviewed_source: string | null
          status: string
          submitted_at: string
          telefone: string
        }
        Insert: {
          discord_applied_at?: string | null
          discord_id: string
          discord_messages?: Json | null
          id_jogo: string
          member_id: string
          nome: string
          posted_at?: string | null
          recrutador: string
          reviewed_at?: string | null
          reviewed_by_discord_id?: string | null
          reviewed_by_member_id?: string | null
          reviewed_source?: string | null
          status?: string
          submitted_at?: string
          telefone: string
        }
        Update: {
          discord_applied_at?: string | null
          discord_id?: string
          discord_messages?: Json | null
          id_jogo?: string
          member_id?: string
          nome?: string
          posted_at?: string | null
          recrutador?: string
          reviewed_at?: string | null
          reviewed_by_discord_id?: string | null
          reviewed_by_member_id?: string | null
          reviewed_source?: string | null
          status?: string
          submitted_at?: string
          telefone?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_registrations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: true
            referencedRelation: "member_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_registrations_reviewed_by_member_id_fkey"
            columns: ["reviewed_by_member_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wall_posts: {
        Row: {
          body: string
          created_at: string
          id: string
          member_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          member_id?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wall_posts_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      enviar_registro: {
        Args: {
          p_id_jogo: string
          p_nome: string
          p_recrutador: string
          p_telefone: string
        }
        Returns: undefined
      }
      can_delete_announcements: { Args: { p_uid: string }; Returns: boolean }
      can_delete_photos: { Args: { p_uid: string }; Returns: boolean }
      can_post_announcements: { Args: { p_uid: string }; Returns: boolean }
      can_post_photos: { Args: { p_uid: string }; Returns: boolean }
      can_review_registrations: { Args: { p_uid: string }; Returns: boolean }
      is_effective_admin: { Args: { p_uid: string }; Returns: boolean }
      listar_registros_pendentes: {
        Args: never
        Returns: {
          avatar_url: string
          discord_id: string
          display_name: string
          id_jogo: string
          member_id: string
          nome: string
          posted_at: string
          recrutador: string
          submitted_at: string
          telefone: string
          username: string
        }[]
      }
      pode_revisar_registro: { Args: { p_uid: string }; Returns: boolean }
      revisar_registro: {
        Args: { p_aprovado: boolean; p_member_id: string }
        Returns: undefined
      }
      recompute_member_principal: {
        Args: { p_member_id: string }
        Returns: undefined
      }
      site_home_stats: { Args: never; Returns: Json }
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
