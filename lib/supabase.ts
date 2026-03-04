import { createClient } from '@supabase/supabase-js'

const sanitizeEnv = (val?: string) => (val || '').replace(/[\n\r]|\\n|"|'/g, '').trim();

const supabaseUrl = sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) || 'https://placeholder.supabase.co';
const supabaseAnonKey = sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Interface para Flashcard
export interface Flashcard {
  id?: string
  numero: number
  pergunta: string
  resposta: string
  modulo: string
  categoria: string
}

// Função para buscar todos flashcards do Supabase
export async function getFlashcards(): Promise<Flashcard[]> {
  try {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .order('numero', { ascending: true })

    if (error) {
      console.error('Erro no Supabase:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erro ao carregar flashcards:', error)
    return []
  }
}
