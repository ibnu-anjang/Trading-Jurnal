// AUTO-GENERATED — jangan edit manual.
// Regenerate via Supabase MCP (`generate_typescript_types`) atau:
//   npx supabase gen types typescript --project-id <id> > src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      symbols: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          account_id: string | null
          close_price: number
          created_at: string | null
          direction: string
          emotion_score: number | null
          entry_price: number
          fee: number
          id: string
          lesson_notes: string | null
          net: number | null
          points: number | null
          reason_entry: string | null
          rule_followed: boolean | null
          screenshots: string[]
          size: number
          symbol: string
          tags: string[]
          trade_date: string
          updated_at: string | null
          user_id: string
          value: number | null
          win_loss: string | null
        }
        Insert: {
          account_id?: string | null
          close_price: number
          created_at?: string | null
          direction: string
          emotion_score?: number | null
          entry_price: number
          fee?: number
          id?: string
          lesson_notes?: string | null
          net?: number | null
          points?: number | null
          reason_entry?: string | null
          rule_followed?: boolean | null
          screenshots?: string[]
          size: number
          symbol: string
          tags?: string[]
          trade_date: string
          updated_at?: string | null
          user_id: string
          value?: number | null
          win_loss?: string | null
        }
        Update: {
          account_id?: string | null
          close_price?: number
          created_at?: string | null
          direction?: string
          emotion_score?: number | null
          entry_price?: number
          fee?: number
          id?: string
          lesson_notes?: string | null
          net?: number | null
          points?: number | null
          reason_entry?: string | null
          rule_followed?: boolean | null
          screenshots?: string[]
          size?: number
          symbol?: string
          tags?: string[]
          trade_date?: string
          updated_at?: string | null
          user_id?: string
          value?: number | null
          win_loss?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trades_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_accounts: {
        Row: {
          broker: string | null
          created_at: string
          currency: string
          id: string
          initial_balance: number
          is_archived: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          broker?: string | null
          created_at?: string
          currency?: string
          id?: string
          initial_balance?: number
          is_archived?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          broker?: string | null
          created_at?: string
          currency?: string
          id?: string
          initial_balance?: number
          is_archived?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          currency: string
          id: string
          starting_capital: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string
          id?: string
          starting_capital?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string
          id?: string
          starting_capital?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
