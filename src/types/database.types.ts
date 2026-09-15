export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      acoes: {
        Row: { data: Json; id: string; updated_at: string };
        Insert: { data?: Json; id: string; updated_at?: string };
        Update: { data?: Json; id?: string; updated_at?: string };
        Relationships: [];
      };
      action_ranking: {
        Row: {
          derrotas: number;
          discord_id: string;
          discord_tag: string | null;
          site_display_name: string | null;
          site_username: string | null;
          total: number;
          updated_at: string;
          vitorias: number;
          winrate: number;
        };
        Insert: {
          derrotas?: number;
          discord_id: string;
          discord_tag?: string | null;
          site_display_name?: string | null;
          site_username?: string | null;
          total?: number;
          updated_at?: string;
          vitorias?: number;
          winrate?: number;
        };
        Update: {
          derrotas?: number;
          discord_id?: string;
          discord_tag?: string | null;
          site_display_name?: string | null;
          site_username?: string | null;
          total?: number;
          updated_at?: string;
          vitorias?: number;
          winrate?: number;
        };
        Relationships: [];
      };
      announcements: {
        Row: {
          body: string;
          color: string | null;
          created_at: string;
          id: string;
          image_url: string | null;
          posted_by_discord_id: string | null;
          title: string;
        };
        Insert: {
          body: string;
          color?: string | null;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          posted_by_discord_id?: string | null;
          title: string;
        };
        Update: {
          body?: string;
          color?: string | null;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          posted_by_discord_id?: string | null;
          title?: string;
        };
        Relationships: [];
      };
      config_servidores: {
        Row: { data: Json; id: string; updated_at: string };
        Insert: { data?: Json; id: string; updated_at?: string };
        Update: { data?: Json; id?: string; updated_at?: string };
        Relationships: [];
      };
      crew_photos: {
        Row: {
          created_at: string;
          id: string;
          image_url: string;
          posted_by_discord_id: string | null;
          subtitle: string | null;
          title: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_url: string;
          posted_by_discord_id?: string | null;
          subtitle?: string | null;
          title: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_url?: string;
          posted_by_discord_id?: string | null;
          subtitle?: string | null;
          title?: string;
        };
        Relationships: [];
      };
      discord_link_requests: {
        Row: {
          code: string;
          discord_id: string | null;
          discord_tag: string | null;
          expires_at: string;
          id: string;
          member_id: string;
          requested_at: string;
          reviewed_at: string | null;
          reviewed_by_discord_id: string | null;
          status: string;
        };
        Insert: {
          code: string;
          discord_id?: string | null;
          discord_tag?: string | null;
          expires_at?: string;
          id?: string;
          member_id: string;
          requested_at?: string;
          reviewed_at?: string | null;
          reviewed_by_discord_id?: string | null;
          status?: string;
        };
        Update: {
          code?: string;
          discord_id?: string | null;
          discord_tag?: string | null;
          expires_at?: string;
          id?: string;
          member_id?: string;
          requested_at?: string;
          reviewed_at?: string | null;
          reviewed_by_discord_id?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'discord_link_requests_member_id_fkey';
            columns: ['member_id'];
            isOneToOne: false;
            referencedRelation: 'member_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      farm: {
        Row: { data: Json; id: string; updated_at: string };
        Insert: { data?: Json; id: string; updated_at?: string };
        Update: { data?: Json; id?: string; updated_at?: string };
        Relationships: [];
      };
      historico: {
        Row: { data: Json; id: string; updated_at: string };
        Insert: { data?: Json; id: string; updated_at?: string };
        Update: { data?: Json; id?: string; updated_at?: string };
        Relationships: [];
      };
      member_profiles: {
        Row: {
          avatar_url: string | null;
          banner_url: string | null;
          bio: string | null;
          created_at: string;
          discord_id: string | null;
          discord_url: string | null;
          display_name: string;
          id: string;
          instagram_url: string | null;
          is_admin: boolean;
          location: string | null;
          music_url: string | null;
          role_id: string | null;
          share_image: string;
          twitch_url: string | null;
          updated_at: string;
          username: string;
          x_url: string | null;
          youtube_url: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          banner_url?: string | null;
          bio?: string | null;
          created_at?: string;
          discord_id?: string | null;
          discord_url?: string | null;
          display_name: string;
          id: string;
          instagram_url?: string | null;
          is_admin?: boolean;
          location?: string | null;
          music_url?: string | null;
          role_id?: string | null;
          share_image?: string;
          twitch_url?: string | null;
          updated_at?: string;
          username: string;
          x_url?: string | null;
          youtube_url?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          banner_url?: string | null;
          bio?: string | null;
          created_at?: string;
          discord_id?: string | null;
          discord_url?: string | null;
          display_name?: string;
          id?: string;
          instagram_url?: string | null;
          is_admin?: boolean;
          location?: string | null;
          music_url?: string | null;
          role_id?: string | null;
          share_image?: string;
          twitch_url?: string | null;
          updated_at?: string;
          username?: string;
          x_url?: string | null;
          youtube_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'member_profiles_role_id_fkey';
            columns: ['role_id'];
            isOneToOne: false;
            referencedRelation: 'roles';
            referencedColumns: ['id'];
          },
        ];
      };
      member_roles: {
        Row: { created_at: string; member_id: string; role_id: string };
        Insert: { created_at?: string; member_id: string; role_id: string };
        Update: { created_at?: string; member_id?: string; role_id?: string };
        Relationships: [
          {
            foreignKeyName: 'member_roles_member_id_fkey';
            columns: ['member_id'];
            isOneToOne: false;
            referencedRelation: 'member_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'member_roles_role_id_fkey';
            columns: ['role_id'];
            isOneToOne: false;
            referencedRelation: 'roles';
            referencedColumns: ['id'];
          },
        ];
      };
      punicoes_ativas: {
        Row: { data: Json; id: string; updated_at: string };
        Insert: { data?: Json; id: string; updated_at?: string };
        Update: { data?: Json; id?: string; updated_at?: string };
        Relationships: [];
      };
      registros: {
        Row: { data: Json; id: string; updated_at: string };
        Insert: { data?: Json; id: string; updated_at?: string };
        Update: { data?: Json; id?: string; updated_at?: string };
        Relationships: [];
      };
      roles: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          sort_order: number;
          color: string | null;
          discord_role_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          sort_order?: number;
          color?: string | null;
          discord_role_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          sort_order?: number;
          color?: string | null;
          discord_role_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type DefaultSchema = Database['public'];

export type Tables<T extends keyof DefaultSchema['Tables']> = DefaultSchema['Tables'][T]['Row'];
export type TablesInsert<T extends keyof DefaultSchema['Tables']> = DefaultSchema['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof DefaultSchema['Tables']> = DefaultSchema['Tables'][T]['Update'];
