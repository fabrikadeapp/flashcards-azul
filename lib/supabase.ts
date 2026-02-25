// Interface para Flashcard
export interface Flashcard {
  numero: number
  pergunta: string
  resposta: string
  modulo: string
  categoria: string
}

// Função para carregar flashcards do JSON
export async function getFlashcards(): Promise<Flashcard[]> {
  try {
    const response = await fetch('/flashcards.json')
    if (!response.ok) {
      throw new Error('Erro ao carregar flashcards.json')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erro ao carregar flashcards:', error)
    return []
  }
}
