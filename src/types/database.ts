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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      advisor_project_assignments: {
        Row: {
          advisor_member_id: string
          assigned_at: string
          assigned_by: string | null
          id: string
          project_id: string
          side: Database["public"]["Enums"]["advisor_side"]
        }
        Insert: {
          advisor_member_id: string
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          project_id: string
          side: Database["public"]["Enums"]["advisor_side"]
        }
        Update: {
          advisor_member_id?: string
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          project_id?: string
          side?: Database["public"]["Enums"]["advisor_side"]
        }
        Relationships: [
          {
            foreignKeyName: "advisor_project_assignments_advisor_member_id_fkey"
            columns: ["advisor_member_id"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_project_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at: string
          geo_location: Json | null
          id: string
          ip_address: unknown
          metadata: Json | null
          organization_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at?: string
          geo_location?: Json | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          created_at?: string
          geo_location?: Json | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cvm_participants: {
        Row: {
          cnpj: string
          created_at: string | null
          id: string
          name: string
          raw_data: Json | null
          registry_date: string | null
          registry_number: string | null
          status: string | null
          synced_at: string | null
          type: Database["public"]["Enums"]["cvm_participant_type"]
          updated_at: string | null
        }
        Insert: {
          cnpj: string
          created_at?: string | null
          id?: string
          name: string
          raw_data?: Json | null
          registry_date?: string | null
          registry_number?: string | null
          status?: string | null
          synced_at?: string | null
          type: Database["public"]["Enums"]["cvm_participant_type"]
          updated_at?: string | null
        }
        Update: {
          cnpj?: string
          created_at?: string | null
          id?: string
          name?: string
          raw_data?: Json | null
          registry_date?: string | null
          registry_number?: string | null
          status?: string | null
          synced_at?: string | null
          type?: Database["public"]["Enums"]["cvm_participant_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      eligibility_reviews: {
        Row: {
          created_at: string
          email_message_id: string | null
          email_sent: boolean | null
          email_sent_at: string | null
          form_data: Json
          id: string
          justification: string | null
          organization_id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_by: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_message_id?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          form_data?: Json
          id?: string
          justification?: string | null
          organization_id: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_by: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_message_id?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          form_data?: Json
          id?: string
          justification?: string | null
          organization_id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_by?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eligibility_reviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          description: string | null
          is_enabled: boolean
          key: string
          rules: Json | null
          updated_at: string
        }
        Insert: {
          description?: string | null
          is_enabled?: boolean
          key: string
          rules?: Json | null
          updated_at?: string
        }
        Update: {
          description?: string | null
          is_enabled?: boolean
          key?: string
          rules?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      geographies: {
        Row: {
          code: string
          created_at: string | null
          flag_emoji: string | null
          id: string
          is_active: boolean | null
          iso_code: string | null
          name_en: string
          name_pt: string | null
          parent_id: string | null
          sort_order: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          flag_emoji?: string | null
          id?: string
          is_active?: boolean | null
          iso_code?: string | null
          name_en: string
          name_pt?: string | null
          parent_id?: string | null
          sort_order?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          flag_emoji?: string | null
          id?: string
          is_active?: boolean | null
          iso_code?: string | null
          name_en?: string
          name_pt?: string | null
          parent_id?: string | null
          sort_order?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "geographies_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "geographies"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_theses: {
        Row: {
          created_at: string
          created_by: string
          criteria: Json
          deleted_at: string | null
          id: string
          is_active: boolean
          name: string
          organization_id: string
          summary: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          criteria?: Json
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          summary?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          criteria?: Json
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          summary?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investment_theses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_follows: {
        Row: {
          asset_organization_id: string
          created_at: string
          created_by: string
          deleted_at: string | null
          id: string
          investor_organization_id: string
          project_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          asset_organization_id: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          id?: string
          investor_organization_id: string
          project_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          asset_organization_id?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          id?: string
          investor_organization_id?: string
          project_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_follows_asset_organization_id_fkey"
            columns: ["asset_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_follows_investor_organization_id_fkey"
            columns: ["investor_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_follows_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      known_devices: {
        Row: {
          browser: string | null
          device_fingerprint: string
          device_name: string | null
          first_seen_at: string
          id: string
          is_trusted: boolean
          last_seen_at: string
          os: string | null
          trust_expires_at: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          device_fingerprint: string
          device_name?: string | null
          first_seen_at?: string
          id?: string
          is_trusted?: boolean
          last_seen_at?: string
          os?: string | null
          trust_expires_at?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          device_fingerprint?: string
          device_name?: string | null
          first_seen_at?: string
          id?: string
          is_trusted?: boolean
          last_seen_at?: string
          os?: string | null
          trust_expires_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string | null
          created_at: string
          data: Json
          id: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      nda_requests: {
        Row: {
          asset_organization_id: string
          created_at: string
          deleted_at: string | null
          id: string
          investor_organization_id: string
          notes: string | null
          project_id: string
          requested_at: string
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          thesis_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          asset_organization_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          investor_organization_id: string
          notes?: string | null
          project_id: string
          requested_at?: string
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          thesis_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          asset_organization_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          investor_organization_id?: string
          notes?: string | null
          project_id?: string
          requested_at?: string
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          thesis_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nda_requests_asset_organization_id_fkey"
            columns: ["asset_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nda_requests_investor_organization_id_fkey"
            columns: ["investor_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nda_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nda_requests_thesis_id_fkey"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "investment_theses"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invites: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["member_role"]
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          role?: Database["public"]["Enums"]["member_role"]
          token?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["member_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string
          organization_id: string
          role: Database["public"]["Enums"]["member_role"]
          updated_at: string
          user_id: string
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          organization_id: string
          role?: Database["public"]["Enums"]["member_role"]
          updated_at?: string
          user_id: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["member_role"]
          updated_at?: string
          user_id?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address_full: Json | null
          capital_social: number | null
          cnae_code: string | null
          cnae_description: string | null
          cnpj: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          founding_date: string | null
          id: string
          legal_nature: string | null
          logo_url: string | null
          name: string
          onboarding_completed_at: string | null
          onboarding_data: Json | null
          onboarding_started_at: string | null
          onboarding_step: Database["public"]["Enums"]["onboarding_step"] | null
          phone: string | null
          plan: string
          profile_type: Database["public"]["Enums"]["organization_profile"]
          settings: Json
          shareholders: Json | null
          slug: string
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          website: string | null
        }
        Insert: {
          address_full?: Json | null
          capital_social?: number | null
          cnae_code?: string | null
          cnae_description?: string | null
          cnpj?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          founding_date?: string | null
          id?: string
          legal_nature?: string | null
          logo_url?: string | null
          name: string
          onboarding_completed_at?: string | null
          onboarding_data?: Json | null
          onboarding_started_at?: string | null
          onboarding_step?:
            | Database["public"]["Enums"]["onboarding_step"]
            | null
          phone?: string | null
          plan?: string
          profile_type: Database["public"]["Enums"]["organization_profile"]
          settings?: Json
          shareholders?: Json | null
          slug: string
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          website?: string | null
        }
        Update: {
          address_full?: Json | null
          capital_social?: number | null
          cnae_code?: string | null
          cnae_description?: string | null
          cnpj?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          founding_date?: string | null
          id?: string
          legal_nature?: string | null
          logo_url?: string | null
          name?: string
          onboarding_completed_at?: string | null
          onboarding_data?: Json | null
          onboarding_started_at?: string | null
          onboarding_step?:
            | Database["public"]["Enums"]["onboarding_step"]
            | null
          phone?: string | null
          plan?: string
          profile_type?: Database["public"]["Enums"]["organization_profile"]
          settings?: Json
          shareholders?: Json | null
          slug?: string
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          website?: string | null
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          attempts: number
          channel: Database["public"]["Enums"]["otp_channel"]
          code_hash: string
          created_at: string
          expires_at: string
          id: string
          is_used: boolean
          max_attempts: number
          phone_number: string | null
          purpose: Database["public"]["Enums"]["otp_purpose"]
          used_at: string | null
          user_id: string
        }
        Insert: {
          attempts?: number
          channel?: Database["public"]["Enums"]["otp_channel"]
          code_hash: string
          created_at?: string
          expires_at: string
          id?: string
          is_used?: boolean
          max_attempts?: number
          phone_number?: string | null
          purpose?: Database["public"]["Enums"]["otp_purpose"]
          used_at?: string | null
          user_id: string
        }
        Update: {
          attempts?: number
          channel?: Database["public"]["Enums"]["otp_channel"]
          code_hash?: string
          created_at?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          max_attempts?: number
          phone_number?: string | null
          purpose?: Database["public"]["Enums"]["otp_purpose"]
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      project_invites: {
        Row: {
          created_at: string
          designation: Database["public"]["Enums"]["project_member_designation"]
          email: string
          expires_at: string
          id: string
          invited_by: string
          metadata: Json | null
          project_id: string
          role: Database["public"]["Enums"]["project_member_role"]
          status: Database["public"]["Enums"]["project_invite_status"]
          token: string
        }
        Insert: {
          created_at?: string
          designation?: Database["public"]["Enums"]["project_member_designation"]
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          metadata?: Json | null
          project_id: string
          role?: Database["public"]["Enums"]["project_member_role"]
          status?: Database["public"]["Enums"]["project_invite_status"]
          token?: string
        }
        Update: {
          created_at?: string
          designation?: Database["public"]["Enums"]["project_member_designation"]
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          metadata?: Json | null
          project_id?: string
          role?: Database["public"]["Enums"]["project_member_role"]
          status?: Database["public"]["Enums"]["project_invite_status"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_invites_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          added_by: string | null
          created_at: string
          designation: Database["public"]["Enums"]["project_member_designation"]
          id: string
          metadata: Json | null
          project_id: string
          role: Database["public"]["Enums"]["project_member_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          designation?: Database["public"]["Enums"]["project_member_designation"]
          id?: string
          metadata?: Json | null
          project_id: string
          role?: Database["public"]["Enums"]["project_member_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          designation?: Database["public"]["Enums"]["project_member_designation"]
          id?: string
          metadata?: Json | null
          project_id?: string
          role?: Database["public"]["Enums"]["project_member_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          advisor_email: string | null
          advisor_preference: string | null
          codename: string
          contacts: Json | null
          contacts_migrated: boolean | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          ebitda_annual_usd: number | null
          equity_max_pct: number | null
          equity_min_pct: number | null
          extra_data: Json | null
          field_metadata: Json | null
          id: string
          name: string
          objective: Database["public"]["Enums"]["project_objective"]
          organization_id: string
          readiness_data: Json | null
          readiness_score: number | null
          reason: string | null
          revenue_annual_usd: number | null
          sector_l1: string | null
          sector_l2: string | null
          sector_l3: string | null
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
          updated_by: string | null
          value_max_usd: number | null
          value_min_usd: number | null
          visibility: string | null
        }
        Insert: {
          advisor_email?: string | null
          advisor_preference?: string | null
          codename: string
          contacts?: Json | null
          contacts_migrated?: boolean | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          ebitda_annual_usd?: number | null
          equity_max_pct?: number | null
          equity_min_pct?: number | null
          extra_data?: Json | null
          field_metadata?: Json | null
          id?: string
          name: string
          objective: Database["public"]["Enums"]["project_objective"]
          organization_id: string
          readiness_data?: Json | null
          readiness_score?: number | null
          reason?: string | null
          revenue_annual_usd?: number | null
          sector_l1?: string | null
          sector_l2?: string | null
          sector_l3?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          updated_by?: string | null
          value_max_usd?: number | null
          value_min_usd?: number | null
          visibility?: string | null
        }
        Update: {
          advisor_email?: string | null
          advisor_preference?: string | null
          codename?: string
          contacts?: Json | null
          contacts_migrated?: boolean | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          ebitda_annual_usd?: number | null
          equity_max_pct?: number | null
          equity_min_pct?: number | null
          extra_data?: Json | null
          field_metadata?: Json | null
          id?: string
          name?: string
          objective?: Database["public"]["Enums"]["project_objective"]
          organization_id?: string
          readiness_data?: Json | null
          readiness_score?: number | null
          reason?: string | null
          revenue_annual_usd?: number | null
          sector_l1?: string | null
          sector_l2?: string | null
          sector_l3?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          updated_by?: string | null
          value_max_usd?: number | null
          value_min_usd?: number | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action: Database["public"]["Enums"]["rate_limit_action"]
          attempts: number
          blocked_until: string | null
          created_at: string
          id: string
          identifier: string
          updated_at: string
          window_end: string
          window_start: string
        }
        Insert: {
          action: Database["public"]["Enums"]["rate_limit_action"]
          attempts?: number
          blocked_until?: string | null
          created_at?: string
          id?: string
          identifier: string
          updated_at?: string
          window_end: string
          window_start?: string
        }
        Update: {
          action?: Database["public"]["Enums"]["rate_limit_action"]
          attempts?: number
          blocked_until?: string | null
          created_at?: string
          id?: string
          identifier?: string
          updated_at?: string
          window_end?: string
          window_start?: string
        }
        Relationships: []
      }
      taxonomy_maics: {
        Row: {
          cnae_codes: string[] | null
          code: string
          created_at: string
          description: string | null
          is_active: boolean | null
          keywords: string[] | null
          label: string
          level: number
          parent_code: string | null
        }
        Insert: {
          cnae_codes?: string[] | null
          code: string
          created_at?: string
          description?: string | null
          is_active?: boolean | null
          keywords?: string[] | null
          label: string
          level: number
          parent_code?: string | null
        }
        Update: {
          cnae_codes?: string[] | null
          code?: string
          created_at?: string
          description?: string | null
          is_active?: boolean | null
          keywords?: string[] | null
          label?: string
          level?: number
          parent_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "taxonomy_maics_parent_code_fkey"
            columns: ["parent_code"]
            isOneToOne: false
            referencedRelation: "taxonomy_maics"
            referencedColumns: ["code"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          id: string
          last_known_country: string | null
          last_known_ip: unknown
          mfa_enabled: boolean
          phone_number: string | null
          phone_verified: boolean
          phone_verified_at: string | null
          updated_at: string
          user_id: string
          whatsapp_number: string | null
          whatsapp_verified: boolean
          whatsapp_verified_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_known_country?: string | null
          last_known_ip?: unknown
          mfa_enabled?: boolean
          phone_number?: string | null
          phone_verified?: boolean
          phone_verified_at?: string | null
          updated_at?: string
          user_id: string
          whatsapp_number?: string | null
          whatsapp_verified?: boolean
          whatsapp_verified_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_known_country?: string | null
          last_known_ip?: unknown
          mfa_enabled?: boolean
          phone_number?: string | null
          phone_verified?: boolean
          phone_verified_at?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_number?: string | null
          whatsapp_verified?: boolean
          whatsapp_verified_at?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          browser: string | null
          city: string | null
          country_code: string | null
          created_at: string
          device_fingerprint: string
          device_name: string | null
          expires_at: string
          id: string
          ip_address: unknown
          is_active: boolean
          last_activity_at: string
          mfa_verified: boolean
          os: string | null
          refresh_token_hash: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          device_fingerprint: string
          device_name?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown
          is_active?: boolean
          last_activity_at?: string
          mfa_verified?: boolean
          os?: string | null
          refresh_token_hash?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          device_fingerprint?: string
          device_name?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          is_active?: boolean
          last_activity_at?: string
          mfa_verified?: boolean
          os?: string | null
          refresh_token_hash?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vdr_access_logs: {
        Row: {
          action: string
          document_id: string | null
          duration_seconds: number | null
          ended_at: string | null
          folder_id: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          organization_id: string | null
          project_id: string
          session_id: string
          shared_link_id: string | null
          started_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          document_id?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          folder_id?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          organization_id?: string | null
          project_id: string
          session_id: string
          shared_link_id?: string | null
          started_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          document_id?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          folder_id?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          organization_id?: string | null
          project_id?: string
          session_id?: string
          shared_link_id?: string | null
          started_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vdr_access_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "vdr_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vdr_access_logs_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "vdr_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vdr_access_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vdr_access_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vdr_access_logs_shared_link_id_fkey"
            columns: ["shared_link_id"]
            isOneToOne: false
            referencedRelation: "vdr_shared_links"
            referencedColumns: ["id"]
          },
        ]
      }
      vdr_access_permissions: {
        Row: {
          document_id: string | null
          expires_at: string | null
          folder_id: string | null
          granted_at: string
          granted_by: string
          grantee_org_id: string | null
          grantee_user_id: string | null
          id: string
          permission_type: string
          project_id: string
          revoked_at: string | null
          revoked_by: string | null
        }
        Insert: {
          document_id?: string | null
          expires_at?: string | null
          folder_id?: string | null
          granted_at?: string
          granted_by: string
          grantee_org_id?: string | null
          grantee_user_id?: string | null
          id?: string
          permission_type: string
          project_id: string
          revoked_at?: string | null
          revoked_by?: string | null
        }
        Update: {
          document_id?: string | null
          expires_at?: string | null
          folder_id?: string | null
          granted_at?: string
          granted_by?: string
          grantee_org_id?: string | null
          grantee_user_id?: string | null
          id?: string
          permission_type?: string
          project_id?: string
          revoked_at?: string | null
          revoked_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vdr_access_permissions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "vdr_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vdr_access_permissions_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "vdr_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vdr_access_permissions_grantee_org_id_fkey"
            columns: ["grantee_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vdr_access_permissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      vdr_document_files: {
        Row: {
          document_id: string
          file_name: string
          file_size_bytes: number | null
          file_type: string | null
          file_url: string
          id: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          document_id: string
          file_name: string
          file_size_bytes?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          document_id?: string
          file_name?: string
          file_size_bytes?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vdr_document_files_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "vdr_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      vdr_document_links: {
        Row: {
          created_at: string
          created_by: string | null
          document_id: string
          id: string
          label: string | null
          link_type: string | null
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          document_id: string
          id?: string
          label?: string | null
          link_type?: string | null
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          document_id?: string
          id?: string
          label?: string | null
          link_type?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "vdr_document_links_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "vdr_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      vdr_documents: {
        Row: {
          business_unit: string | null
          code: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          due_date: string | null
          external_url: string
          file_size_bytes: number | null
          file_type: string | null
          flags: string[] | null
          folder_id: string
          id: string
          is_confidential: boolean | null
          metadata: Json | null
          name: string
          priority: string | null
          project_id: string
          responsible_id: string | null
          risk: string | null
          sort_order: number | null
          start_date: string | null
          status: string | null
          tags: string[] | null
          updated_at: string
          validation_n1: boolean | null
          validation_n1_at: string | null
          validation_n1_by: string | null
          validation_n2: boolean | null
          validation_n2_at: string | null
          validation_n2_by: string | null
          validation_n3: boolean | null
          validation_n3_at: string | null
          validation_n3_by: string | null
        }
        Insert: {
          business_unit?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          external_url: string
          file_size_bytes?: number | null
          file_type?: string | null
          flags?: string[] | null
          folder_id: string
          id?: string
          is_confidential?: boolean | null
          metadata?: Json | null
          name: string
          priority?: string | null
          project_id: string
          responsible_id?: string | null
          risk?: string | null
          sort_order?: number | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          validation_n1?: boolean | null
          validation_n1_at?: string | null
          validation_n1_by?: string | null
          validation_n2?: boolean | null
          validation_n2_at?: string | null
          validation_n2_by?: string | null
          validation_n3?: boolean | null
          validation_n3_at?: string | null
          validation_n3_by?: string | null
        }
        Update: {
          business_unit?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          external_url?: string
          file_size_bytes?: number | null
          file_type?: string | null
          flags?: string[] | null
          folder_id?: string
          id?: string
          is_confidential?: boolean | null
          metadata?: Json | null
          name?: string
          priority?: string | null
          project_id?: string
          responsible_id?: string | null
          risk?: string | null
          sort_order?: number | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          validation_n1?: boolean | null
          validation_n1_at?: string | null
          validation_n1_by?: string | null
          validation_n2?: boolean | null
          validation_n2_at?: string | null
          validation_n2_by?: string | null
          validation_n3?: boolean | null
          validation_n3_at?: string | null
          validation_n3_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vdr_documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "vdr_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vdr_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      vdr_folders: {
        Row: {
          code: string | null
          created_at: string
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          is_default: boolean | null
          name: string
          project_id: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          project_id: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          project_id?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vdr_folders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      vdr_qa_messages: {
        Row: {
          author_id: string
          author_org_id: string
          content: string
          created_at: string
          deleted_at: string | null
          document_id: string
          id: string
          is_confidential: boolean | null
          is_resolved: boolean | null
          parent_id: string | null
          project_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          author_org_id: string
          content: string
          created_at?: string
          deleted_at?: string | null
          document_id: string
          id?: string
          is_confidential?: boolean | null
          is_resolved?: boolean | null
          parent_id?: string | null
          project_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          author_org_id?: string
          content?: string
          created_at?: string
          deleted_at?: string | null
          document_id?: string
          id?: string
          is_confidential?: boolean | null
          is_resolved?: boolean | null
          parent_id?: string | null
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vdr_qa_messages_author_org_id_fkey"
            columns: ["author_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vdr_qa_messages_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "vdr_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vdr_qa_messages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "vdr_qa_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vdr_qa_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      vdr_shared_links: {
        Row: {
          created_at: string
          created_by: string
          document_id: string | null
          expires_at: string | null
          folder_id: string | null
          id: string
          is_active: boolean | null
          max_views: number | null
          metadata: Json | null
          password_hash: string | null
          project_id: string
          revoked_at: string | null
          revoked_by: string | null
          token: string
          view_count: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          document_id?: string | null
          expires_at?: string | null
          folder_id?: string | null
          id?: string
          is_active?: boolean | null
          max_views?: number | null
          metadata?: Json | null
          password_hash?: string | null
          project_id: string
          revoked_at?: string | null
          revoked_by?: string | null
          token: string
          view_count?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          document_id?: string | null
          expires_at?: string | null
          folder_id?: string | null
          id?: string
          is_active?: boolean | null
          max_views?: number | null
          metadata?: Json | null
          password_hash?: string | null
          project_id?: string
          revoked_at?: string | null
          revoked_by?: string | null
          token?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vdr_shared_links_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "vdr_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vdr_shared_links_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "vdr_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vdr_shared_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          phone_number: string
          provider_message_id: string | null
          read_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["whatsapp_message_status"]
          template_params: Json | null
          template_type: Database["public"]["Enums"]["whatsapp_template_type"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          phone_number: string
          provider_message_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["whatsapp_message_status"]
          template_params?: Json | null
          template_type: Database["public"]["Enums"]["whatsapp_template_type"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          phone_number?: string
          provider_message_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["whatsapp_message_status"]
          template_params?: Json | null
          template_type?: Database["public"]["Enums"]["whatsapp_template_type"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      advance_onboarding_step: {
        Args: {
          p_new_step: Database["public"]["Enums"]["onboarding_step"]
          p_org_id: string
          p_step_data?: Json
        }
        Returns: {
          current_step: Database["public"]["Enums"]["onboarding_step"]
          message: string
          success: boolean
        }[]
      }
      can_access_project: {
        Args: { p_project_id: string; p_user_id: string }
        Returns: boolean
      }
      can_manage_vdr: {
        Args: { p_project_id: string; p_user_id: string }
        Returns: boolean
      }
      check_advisor_conflict: {
        Args: {
          p_advisor_member_id: string
          p_project_id: string
          p_requested_side: Database["public"]["Enums"]["advisor_side"]
        }
        Returns: boolean
      }
      check_cvm_registration: {
        Args: { cnpj_input: string }
        Returns: {
          is_registered: boolean
          participant_name: string
          participant_status: string
          participant_type: Database["public"]["Enums"]["cvm_participant_type"]
          registry_date: string
        }[]
      }
      check_rate_limit: {
        Args: {
          p_action: Database["public"]["Enums"]["rate_limit_action"]
          p_block_minutes?: number
          p_identifier: string
          p_max_attempts: number
          p_window_minutes: number
        }
        Returns: {
          allowed: boolean
          blocked_until: string
          remaining_attempts: number
        }[]
      }
      cleanup_expired_auth_records: { Args: never; Returns: undefined }
      count_org_owners: { Args: { p_org_id: string }; Returns: number }
      count_pending_invites: { Args: { p_org_id: string }; Returns: number }
      create_user_session: {
        Args: {
          p_browser?: string
          p_city?: string
          p_country_code?: string
          p_device_fingerprint: string
          p_device_name?: string
          p_expires_hours?: number
          p_ip_address?: unknown
          p_os?: string
          p_user_id: string
        }
        Returns: string
      }
      end_vdr_session:
        | {
            Args: { p_session_id: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.end_vdr_session(p_session_id => text), public.end_vdr_session(p_session_id => uuid). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { p_session_id: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.end_vdr_session(p_session_id => text), public.end_vdr_session(p_session_id => uuid). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
      generate_vdr_document_code: {
        Args: { p_folder_id: string }
        Returns: string
      }
      get_user_organizations: {
        Args: { p_user_id: string }
        Returns: {
          organization_id: string
          organization_name: string
          organization_slug: string
          profile_type: Database["public"]["Enums"]["organization_profile"]
          user_role: Database["public"]["Enums"]["member_role"]
          verification_status: Database["public"]["Enums"]["verification_status"]
        }[]
      }
      get_user_projects: {
        Args: { p_user_id: string }
        Returns: {
          access_type: string
          codename: string
          objective: Database["public"]["Enums"]["project_objective"]
          organization_id: string
          project_id: string
          status: Database["public"]["Enums"]["project_status"]
        }[]
      }
      get_user_role: {
        Args: { p_org_id: string; p_user_id: string }
        Returns: Database["public"]["Enums"]["member_role"]
      }
      get_vdr_engagement_by_investor: {
        Args: { p_project_id: string }
        Returns: {
          last_access_at: string | null
          organization_id: string
          organization_name: string
          organization_slug: string
          total_duration_seconds: number
          total_views: number
          unique_documents: number
        }[]
      }
      has_org_permission: {
        Args: {
          p_org_id: string
          p_required_roles: Database["public"]["Enums"]["member_role"][]
          p_user_id: string
        }
        Returns: boolean
      }
      has_vdr_access: {
        Args: {
          p_document_id?: string
          p_folder_id?: string
          p_project_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      invalidate_user_sessions: {
        Args: { p_except_session_id?: string; p_user_id: string }
        Returns: number
      }
      is_org_member: {
        Args: { p_org_id: string; p_user_id: string }
        Returns: boolean
      }
      is_project_owner_org: {
        Args: { p_project_id: string; p_user_id: string }
        Returns: boolean
      }
      is_sell_side_advisor: {
        Args: { p_project_id: string; p_user_id: string }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_action: Database["public"]["Enums"]["audit_action"]
          p_ip: unknown
          p_metadata: Json
          p_org_id: string
          p_ua: string
          p_user_id: string
        }
        Returns: string
      }
      log_vdr_access:
        | {
            Args: {
              p_action?: string
              p_document_id?: string
              p_folder_id?: string
              p_ip_address?: unknown
              p_metadata?: Json
              p_project_id: string
              p_session_id?: string
              p_shared_link_id?: string
              p_user_agent?: string
            }
            Returns: string
          }
        | {
            Args: {
              p_action: string
              p_document_id: string
              p_folder_id: string
              p_ip_address?: unknown
              p_metadata?: Json
              p_project_id: string
              p_session_id: string
              p_shared_link_id: string
              p_user_agent?: string
            }
            Returns: string
          }
      unvalidate_vdr_document: {
        Args: { p_document_id: string; p_level: string; p_user_id?: string }
        Returns: boolean
      }
      validate_cnpj: { Args: { cnpj_input: string }; Returns: boolean }
      validate_vdr_document: {
        Args: { p_document_id: string; p_level: string; p_user_id?: string }
        Returns: boolean
      }
      verify_otp: {
        Args: {
          p_code: string
          p_purpose?: Database["public"]["Enums"]["otp_purpose"]
          p_user_id: string
        }
        Returns: {
          message: string
          success: boolean
        }[]
      }
    }
    Enums: {
      advisor_side: "sell_side" | "buy_side"
      audit_action:
        | "auth.login"
        | "auth.logout"
        | "auth.mfa_success"
        | "auth.mfa_failed"
        | "vdr.view_doc"
        | "vdr.share_link"
        | "vdr.revoke_access"
        | "ai.prompt_sent"
        | "ai.doc_generated"
        | "project.created"
        | "project.status_changed"
        | "billing.subscription_updated"
        | "page.view"
        | "auth.signup"
        | "auth.otp_sent"
        | "auth.otp_verified"
        | "auth.recovery_requested"
        | "auth.recovery_completed"
        | "auth.session_created"
        | "auth.session_invalidated"
        | "auth.new_device_detected"
        | "auth.country_change_detected"
        | "org.created"
        | "org.updated"
        | "org.deleted"
        | "org.member_added"
        | "org.member_removed"
        | "org.member_role_changed"
        | "org.invite_sent"
        | "org.invite_accepted"
        | "org.invite_cancelled"
        | "org.invite_expired"
        | "advisor.assigned"
        | "advisor.unassigned"
        | "advisor.conflict_blocked"
        | "onboarding.started"
        | "onboarding.step_completed"
        | "onboarding.cnpj_enriched"
        | "onboarding.website_scraped"
        | "onboarding.description_generated"
        | "onboarding.eligibility_submitted"
        | "onboarding.completed"
        | "onboarding.abandoned"
        | "project.updated"
        | "project.deleted"
        | "project.taxonomy_updated"
        | "project.readiness_calculated"
        | "vdr.folder_created"
        | "vdr.folder_updated"
        | "vdr.folder_deleted"
        | "vdr.document_created"
        | "vdr.document_updated"
        | "vdr.document_deleted"
        | "vdr.link_created"
        | "vdr.link_revoked"
        | "vdr.access_granted"
        | "vdr.access_revoked"
        | "vdr.view_started"
        | "vdr.view_ended"
        | "vdr.print_attempt"
        | "vdr.qa_message_sent"
        | "vdr.qa_resolved"
        | "project.member_added"
        | "project.member_removed"
        | "project.member_role_changed"
        | "project.invite_sent"
        | "project.invite_accepted"
        | "project.invite_cancelled"
        | "project.responsible_added"
        | "project.responsible_removed"
        | "project.visibility_changed"
        | "project.creation_blocked_no_nda"
        | "project.created_from_nda"
        | "project.stage_changed"
        | "project.stage_rollback"
      cvm_participant_type:
        | "cia_aberta"
        | "fundo_investimento"
        | "gestor"
        | "administrador"
        | "consultor"
        | "auditor"
        | "agente_autonomo"
      member_role: "owner" | "admin" | "member" | "viewer"
      onboarding_step:
        | "profile_selection"
        | "cnpj_input"
        | "data_enrichment"
        | "data_confirmation"
        | "asset_company_data"
        | "asset_matching_data"
        | "asset_team"
        | "asset_codename"
        | "profile_details"
        | "eligibility_check"
        | "terms_acceptance"
        | "mfa_setup"
        | "pending_review"
        | "completed"
      organization_profile: "investor" | "asset" | "advisor"
      otp_channel: "whatsapp" | "sms" | "email"
      otp_purpose: "mfa" | "recovery" | "verification"
      project_invite_status: "pending" | "accepted" | "cancelled" | "expired"
      project_member_designation: "member" | "responsible"
      project_member_role: "viewer" | "editor" | "manager"
      project_objective: "sale" | "fundraising"
      project_status:
        | "screening"
        | "teaser"
        | "nda"
        | "cim_dfs"
        | "ioi"
        | "management_meetings"
        | "nbo"
        | "dd_spa"
        | "signing"
        | "cps"
        | "closing"
        | "disclosure"
        | "closed_won"
        | "closed_lost"
      rate_limit_action:
        | "login"
        | "mfa_attempt"
        | "recovery_request"
        | "otp_request"
        | "signup"
        | "shared_link_attempt"
      verification_status: "pending" | "verified" | "rejected" | "completed"
      whatsapp_message_status:
        | "pending"
        | "sent"
        | "delivered"
        | "read"
        | "failed"
        | "mock_sent"
      whatsapp_template_type:
        | "otp_mfa"
        | "otp_recovery"
        | "new_device_alert"
        | "country_change_alert"
        | "session_invalidated"
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
      advisor_side: ["sell_side", "buy_side"],
      audit_action: [
        "auth.login",
        "auth.logout",
        "auth.mfa_success",
        "auth.mfa_failed",
        "vdr.view_doc",
        "vdr.share_link",
        "vdr.revoke_access",
        "ai.prompt_sent",
        "ai.doc_generated",
        "project.created",
        "project.status_changed",
        "billing.subscription_updated",
        "page.view",
        "auth.signup",
        "auth.otp_sent",
        "auth.otp_verified",
        "auth.recovery_requested",
        "auth.recovery_completed",
        "auth.session_created",
        "auth.session_invalidated",
        "auth.new_device_detected",
        "auth.country_change_detected",
        "org.created",
        "org.updated",
        "org.deleted",
        "org.member_added",
        "org.member_removed",
        "org.member_role_changed",
        "org.invite_sent",
        "org.invite_accepted",
        "org.invite_cancelled",
        "org.invite_expired",
        "advisor.assigned",
        "advisor.unassigned",
        "advisor.conflict_blocked",
        "onboarding.started",
        "onboarding.step_completed",
        "onboarding.cnpj_enriched",
        "onboarding.website_scraped",
        "onboarding.description_generated",
        "onboarding.eligibility_submitted",
        "onboarding.completed",
        "onboarding.abandoned",
        "project.updated",
        "project.deleted",
        "project.taxonomy_updated",
        "project.readiness_calculated",
        "vdr.folder_created",
        "vdr.folder_updated",
        "vdr.folder_deleted",
        "vdr.document_created",
        "vdr.document_updated",
        "vdr.document_deleted",
        "vdr.link_created",
        "vdr.link_revoked",
        "vdr.shared_link_validation_failed",
        "vdr.access_granted",
        "vdr.access_revoked",
        "vdr.view_started",
        "vdr.view_ended",
        "vdr.print_attempt",
        "vdr.qa_message_sent",
        "vdr.qa_resolved",
        "project.member_added",
        "project.member_removed",
        "project.member_role_changed",
        "project.invite_sent",
        "project.invite_accepted",
        "project.invite_cancelled",
        "project.responsible_added",
        "project.responsible_removed",
        "project.visibility_changed",
        "project.creation_blocked_no_nda",
        "project.created_from_nda",
        "project.stage_changed",
        "project.stage_rollback",
      ],
      cvm_participant_type: [
        "cia_aberta",
        "fundo_investimento",
        "gestor",
        "administrador",
        "consultor",
        "auditor",
        "agente_autonomo",
      ],
      member_role: ["owner", "admin", "member", "viewer"],
      onboarding_step: [
        "profile_selection",
        "cnpj_input",
        "data_enrichment",
        "data_confirmation",
        "asset_company_data",
        "asset_matching_data",
        "asset_team",
        "asset_codename",
        "profile_details",
        "eligibility_check",
        "terms_acceptance",
        "mfa_setup",
        "pending_review",
        "completed",
      ],
      organization_profile: ["investor", "asset", "advisor"],
      otp_channel: ["whatsapp", "sms", "email"],
      otp_purpose: ["mfa", "recovery", "verification"],
      project_invite_status: ["pending", "accepted", "cancelled", "expired"],
      project_member_designation: ["member", "responsible"],
      project_member_role: ["viewer", "editor", "manager"],
      project_objective: ["sale", "fundraising"],
      project_status: [
        "screening",
        "teaser",
        "nda",
        "cim_dfs",
        "ioi",
        "management_meetings",
        "nbo",
        "dd_spa",
        "signing",
        "cps",
        "closing",
        "disclosure",
        "closed_won",
        "closed_lost",
      ],
      rate_limit_action: [
        "login",
        "mfa_attempt",
        "recovery_request",
        "otp_request",
        "signup",
        "shared_link_attempt",
      ],
      verification_status: ["pending", "verified", "rejected", "completed"],
      whatsapp_message_status: [
        "pending",
        "sent",
        "delivered",
        "read",
        "failed",
        "mock_sent",
      ],
      whatsapp_template_type: [
        "otp_mfa",
        "otp_recovery",
        "new_device_alert",
        "country_change_alert",
        "session_invalidated",
      ],
    },
  },
} as const

// Convenience type exports for common enums
export type OrganizationProfile = Database["public"]["Enums"]["organization_profile"]
export type MemberRole = Database["public"]["Enums"]["member_role"]
export type OnboardingStep = Database["public"]["Enums"]["onboarding_step"]
export type VerificationStatus = Database["public"]["Enums"]["verification_status"]
export type ProjectStatus = Database["public"]["Enums"]["project_status"]
export type ProjectObjective = Database["public"]["Enums"]["project_objective"]

// Convenience type exports for common tables
export type Project = Tables<"projects">
export type ProjectInsert = TablesInsert<"projects">
export type ProjectUpdate = TablesUpdate<"projects">
export type Organization = Tables<"organizations">
export type OrganizationMember = Tables<"organization_members">
export type TaxonomyMaics = Tables<"taxonomy_maics">
export type Geography = Tables<"geographies">
export type OrganizationInsert = TablesInsert<"organizations">
export type OrganizationUpdate = TablesUpdate<"organizations">
export type AdvisorProjectAssignment = Tables<"advisor_project_assignments">
export type AdvisorProjectAssignmentInsert = TablesInsert<"advisor_project_assignments">
export type AdvisorSide = Database["public"]["Enums"]["advisor_side"]
export type InvestmentThesis = Tables<"investment_theses">
export type InvestmentThesisInsert = TablesInsert<"investment_theses">
export type InvestmentThesisUpdate = TablesUpdate<"investment_theses">
// OnboardingProgress is not a table, it's a computed result type
export interface OnboardingProgress {
  currentStep: OnboardingStep
  stepsCompleted: OnboardingStep[]
  percentComplete: number
  startedAt?: string
  completedAt?: string
}
export type CvmParticipantType = Database["public"]["Enums"]["cvm_participant_type"]
export type AuditAction = Database["public"]["Enums"]["audit_action"]
export type OrganizationInvite = Tables<"organization_invites">

// Type for get_user_organizations RPC function result
export interface UserOrganization {
  organization_id: string
  organization_name: string
  organization_slug: string
  profile_type: OrganizationProfile
  user_role: MemberRole
  verification_status: VerificationStatus
}

// Note: Json type is already exported at the top of this file

// Onboarding data type - structured interface for onboarding_data JSON column
export interface OnboardingData {
  brasil_api?: {
    fetched_at?: string
    [key: string]: Json | undefined
  }
  clearbit?: {
    fetched_at?: string
    [key: string]: Json | undefined
  }
  jina?: {
    fetched_at?: string
    [key: string]: Json | undefined
  }
  jina_reader?: {
    markdown_content?: string
    fetched_at?: string
    [key: string]: Json | undefined
  }
  openai?: {
    fetched_at?: string
    [key: string]: Json | undefined
  }
  cvm?: {
    fetched_at?: string
    [key: string]: Json | undefined
  }
  ai_description?: {
    model?: string
    generated_at?: string
    [key: string]: Json | undefined
  }
  flow?: {
    steps_completed?: string[]
    started_at?: string
    completed_at?: string
    [key: string]: Json | undefined
  }
  eligibility?: {
    manual_review_requested?: boolean
    review_requested_at?: string
    review_requested_by?: string
    review_reason?: string
    review_notes?: string
    [key: string]: Json | undefined
  }
  [key: string]: Json | undefined
}

// Label mappings for enums
export const PROJECT_OBJECTIVE_LABELS: Record<ProjectObjective, string> = {
  sale: 'Venda',
  fundraising: 'Captação',
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  screening: 'Screening',
  teaser: 'Teaser',
  nda: 'NDA',
  cim_dfs: 'CIM / DFs',
  ioi: 'IoI',
  management_meetings: 'Management Meetings',
  nbo: 'NBO',
  dd_spa: 'DD / SPA',
  signing: 'Signing',
  cps: 'CPs',
  closing: 'Closing',
  disclosure: 'Disclosure',
  closed_won: 'Fechado',
  closed_lost: 'Perdido',
}
