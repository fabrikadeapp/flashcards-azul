import { getFlashcards, Flashcard } from '@/lib/supabase'
import FlashcardViewer from '@/components/FlashcardViewer'

export default async function Home() {
  const flashcards = await getFlashcards()

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-azul dark:text-blue-400 mb-4">
            ✈️ Flashcards A320
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Nenhum Flashcard retornado pelo banco de dados.
          </p>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
            <p className="text-red-700 dark:text-red-400 mb-4">
              ⚠️ Não foi possível se conectar ao Supabase ou as tabelas não foram preenchidas.
            </p>
            <p className="text-sm text-red-600 dark:text-red-500">
              Verifique as permissões (RLS) da tabela "flashcards" no painel do Supabase.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <FlashcardViewer flashcards={flashcards} />
}
