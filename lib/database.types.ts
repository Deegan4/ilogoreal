export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      logos: {
        Row: {
          created_at: string
          id: string
          is_favorite: boolean
          prompt: string
          svg_content: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_favorite?: boolean
          prompt: string
          svg_content: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_favorite?: boolean
          prompt?: string
          svg_content?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "logos_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      logo_collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "logo_collections_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      logo_collection_items: {
        Row: {
          collection_id: string
          logo_id: string
          created_at: string
        }
        Insert: {
          collection_id: string
          logo_id: string
          created_at?: string
        }
        Update: {
          collection_id?: string
          logo_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "logo_collection_items_collection_id_fkey"
            columns: ["collection_id"]
            referencedRelation: "logo_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logo_collection_items_logo_id_fkey"
            columns: ["logo_id"]
            referencedRelation: "logos"
            referencedColumns: ["id"]
          },
        ]
      }
      logo_generation_history: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          prompt: string
          status: "completed" | "failed"
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          prompt: string
          status: "completed" | "failed"
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          prompt?: string
          status?: "completed" | "failed"
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "logo_generation_history_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          id: string
          name: string
          email: string
          message: string
          status: string
          created_at: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          message: string
          status?: string
          created_at?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          message?: string
          status?: string
          created_at?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
