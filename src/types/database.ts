// Tipos generados por Supabase MCP (generate_typescript_types).
// Regenerar cuando cambie el schema (tablas, vistas o funciones).

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
      carreras: {
        Row: {
          codigo: string | null
          created_at: string | null
          created_by: string | null
          id: string
          nombre: string
        }
        Insert: {
          codigo?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          nombre: string
        }
        Update: {
          codigo?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      comentarios_app: {
        Row: {
          autor_id: string | null
          created_at: string
          estado: string
          id: string
          mensaje: string
          tipo: string
        }
        Insert: {
          autor_id?: string | null
          created_at?: string
          estado?: string
          id?: string
          mensaje: string
          tipo: string
        }
        Update: {
          autor_id?: string | null
          created_at?: string
          estado?: string
          id?: string
          mensaje?: string
          tipo?: string
        }
        Relationships: []
      }
      profesores: {
        Row: {
          apellido: string
          avatar_url: string | null
          created_at: string | null
          created_by: string | null
          id: string
          nombre: string
        }
        Insert: {
          apellido: string
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          nombre: string
        }
        Update: {
          apellido?: string
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      ramos: {
        Row: {
          carrera_id: string | null
          codigo: string | null
          created_at: string | null
          created_by: string | null
          id: string
          nombre: string
        }
        Insert: {
          carrera_id?: string | null
          codigo?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          nombre: string
        }
        Update: {
          carrera_id?: string | null
          codigo?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "ramos_carrera_id_fkey"
            columns: ["carrera_id"]
            isOneToOne: false
            referencedRelation: "carreras"
            referencedColumns: ["id"]
          },
        ]
      }
      resenas: {
        Row: {
          autor_id: string | null
          calificacion_accesibilidad: number | null
          calificacion_exigencia: number | null
          calificacion_explicacion: number | null
          calificacion_general: number | null
          comentario: string
          created_at: string | null
          id: string
          profesor_id: string | null
          ramo_id: string | null
          semestre: string
        }
        Insert: {
          autor_id?: string | null
          calificacion_accesibilidad?: number | null
          calificacion_exigencia?: number | null
          calificacion_explicacion?: number | null
          calificacion_general?: number | null
          comentario: string
          created_at?: string | null
          id?: string
          profesor_id?: string | null
          ramo_id?: string | null
          semestre: string
        }
        Update: {
          autor_id?: string | null
          calificacion_accesibilidad?: number | null
          calificacion_exigencia?: number | null
          calificacion_explicacion?: number | null
          calificacion_general?: number | null
          comentario?: string
          created_at?: string | null
          id?: string
          profesor_id?: string | null
          ramo_id?: string | null
          semestre?: string
        }
        Relationships: [
          {
            foreignKeyName: "resenas_profesor_id_fkey"
            columns: ["profesor_id"]
            isOneToOne: false
            referencedRelation: "profesor_stats"
            referencedColumns: ["profesor_id"]
          },
          {
            foreignKeyName: "resenas_profesor_id_fkey"
            columns: ["profesor_id"]
            isOneToOne: false
            referencedRelation: "profesores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resenas_ramo_id_fkey"
            columns: ["ramo_id"]
            isOneToOne: false
            referencedRelation: "ramo_stats"
            referencedColumns: ["ramo_id"]
          },
          {
            foreignKeyName: "resenas_ramo_id_fkey"
            columns: ["ramo_id"]
            isOneToOne: false
            referencedRelation: "ramos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      profesor_ramo_stats: {
        Row: {
          profesor_apellido: string | null
          profesor_avatar_url: string | null
          profesor_id: string | null
          profesor_nombre: string | null
          promedio_accesibilidad: number | null
          promedio_exigencia: number | null
          promedio_explicacion: number | null
          promedio_general: number | null
          ramo_id: string | null
          score_ponderado: number | null
          total_resenas: number | null
        }
        Relationships: [
          {
            foreignKeyName: "resenas_profesor_id_fkey"
            columns: ["profesor_id"]
            isOneToOne: false
            referencedRelation: "profesor_stats"
            referencedColumns: ["profesor_id"]
          },
          {
            foreignKeyName: "resenas_profesor_id_fkey"
            columns: ["profesor_id"]
            isOneToOne: false
            referencedRelation: "profesores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resenas_ramo_id_fkey"
            columns: ["ramo_id"]
            isOneToOne: false
            referencedRelation: "ramo_stats"
            referencedColumns: ["ramo_id"]
          },
          {
            foreignKeyName: "resenas_ramo_id_fkey"
            columns: ["ramo_id"]
            isOneToOne: false
            referencedRelation: "ramos"
            referencedColumns: ["id"]
          },
        ]
      }
      profesor_stats: {
        Row: {
          apellido: string | null
          avatar_url: string | null
          nombre: string | null
          profesor_id: string | null
          promedio_accesibilidad: number | null
          promedio_exigencia: number | null
          promedio_explicacion: number | null
          promedio_general: number | null
          score_ponderado: number | null
          total_resenas: number | null
        }
        Relationships: []
      }
      ramo_stats: {
        Row: {
          carrera_id: string | null
          codigo: string | null
          dificultad: number | null
          nombre: string | null
          promedio_general: number | null
          ramo_id: string | null
          total_profes: number | null
          total_resenas: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ramos_carrera_id_fkey"
            columns: ["carrera_id"]
            isOneToOne: false
            referencedRelation: "carreras"
            referencedColumns: ["id"]
          },
        ]
      }
      stats_rankea: {
        Row: {
          feedback_pendiente: number | null
          profes_total: number | null
          rating_promedio_global: number | null
          resenas_total: number | null
          resenas_ultima_semana: number | null
          resenas_ultimo_mes: number | null
          snapshot_at: string | null
          usuarios_que_publicaron: number | null
          usuarios_total: number | null
          usuarios_ultima_semana: number | null
          usuarios_ultimo_mes: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      find_similar_profesores: {
        Args: { p_apellido: string; p_nombre: string }
        Returns: {
          apellido: string
          id: string
          nombre: string
          similitud: number
        }[]
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
