// ============================================================================
// Tipos do schema Supabase (escritos à mão para bater com
// supabase/migrations/0001_init.sql). Se preferir, substitua por tipos
// gerados automaticamente com:
//   npx supabase gen types typescript --project-id <seu-projeto> > types/database.ts
// ============================================================================

export type Plan = "free" | "pro" | "agency";
export type Platform = "meta_ads" | "google_ads";
export type AnalysisStatus = "processing" | "completed" | "failed";
export type AiSource = "rules" | "ai";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          company_name: string | null;
          plan: Plan;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          company_name?: string | null;
          plan?: Plan;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          company_name?: string | null;
          plan?: Plan;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category?: string | null;
          notes?: string | null;
        };
        Update: {
          name?: string;
          category?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      analyses: {
        Row: {
          id: string;
          user_id: string;
          client_id: string;
          platform: Platform;
          start_date: string;
          end_date: string;
          file_name: string | null;
          status: AnalysisStatus;
          total_spend: number;
          impressions: number;
          clicks: number;
          ctr: number;
          cpc: number;
          cpm: number;
          conversions: number;
          cpa: number;
          revenue: number;
          roas: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id: string;
          platform: Platform;
          start_date: string;
          end_date: string;
          file_name?: string | null;
          status?: AnalysisStatus;
          total_spend?: number;
          impressions?: number;
          clicks?: number;
          ctr?: number;
          cpc?: number;
          cpm?: number;
          conversions?: number;
          cpa?: number;
          revenue?: number;
          roas?: number;
        };
        Update: {
          status?: AnalysisStatus;
          total_spend?: number;
          impressions?: number;
          clicks?: number;
          ctr?: number;
          cpc?: number;
          cpm?: number;
          conversions?: number;
          cpa?: number;
          revenue?: number;
          roas?: number;
        };
        Relationships: [
          {
            foreignKeyName: "analyses_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
        ];
      };
      analysis_items: {
        Row: {
          id: string;
          analysis_id: string;
          campaign_name: string;
          adset_name: string | null;
          ad_name: string | null;
          spend: number;
          impressions: number;
          clicks: number;
          ctr: number;
          cpc: number;
          cpm: number;
          conversions: number;
          cpa: number;
          revenue: number;
          roas: number;
          raw_data: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          analysis_id: string;
          campaign_name: string;
          adset_name?: string | null;
          ad_name?: string | null;
          spend?: number;
          impressions?: number;
          clicks?: number;
          ctr?: number;
          cpc?: number;
          cpm?: number;
          conversions?: number;
          cpa?: number;
          revenue?: number;
          roas?: number;
          raw_data?: Record<string, unknown> | null;
        };
        Update: {
          raw_data?: Record<string, unknown> | null;
        };
        Relationships: [
          {
            foreignKeyName: "analysis_items_analysis_id_fkey";
            columns: ["analysis_id"];
            isOneToOne: false;
            referencedRelation: "analyses";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_analysis: {
        Row: {
          id: string;
          analysis_id: string;
          diagnosis: string | null;
          alerts: unknown;
          opportunities: unknown;
          recommendations: unknown;
          executive_summary: string | null;
          source: AiSource;
          created_at: string;
        };
        Insert: {
          id?: string;
          analysis_id: string;
          diagnosis?: string | null;
          alerts?: unknown;
          opportunities?: unknown;
          recommendations?: unknown;
          executive_summary?: string | null;
          source?: AiSource;
        };
        Update: {
          diagnosis?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ai_analysis_analysis_id_fkey";
            columns: ["analysis_id"];
            isOneToOne: true;
            referencedRelation: "analyses";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
