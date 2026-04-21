import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Reemplaza estos valores con los de tu proyecto en supabase.com
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Faltan las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. ' +
    'Crea un archivo .env en la raíz del proyecto con esos valores.'
  )
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)

export type SupabaseClient = typeof supabase
