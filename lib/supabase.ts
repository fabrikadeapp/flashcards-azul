import fs from 'fs'
import path from 'path'

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
    const filePath = path.join(process.cwd(), 'public', 'flashcards.json')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(fileContent)
    return data
  } catch (error) {
    console.error('Erro ao carregar flashcards:', error)
    return []
  }
}
