import { supabase, Flashcard } from '@/lib/supabase'
import FlashcardViewer from '@/components/FlashcardViewer'

async function getFlashcards(): Promise<Flashcard[]> {
  try {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .order('numero', { ascending: true })

    if (error) {
      console.error('Erro ao buscar flashcards:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erro na conexão com Supabase:', error)
    return []
  }
}

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
            Erro ao conectar ao banco de dados
          </p>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
            <p className="text-red-700 dark:text-red-400 mb-4">
              ⚠️ Não foi possível carregar os flashcards.
            </p>
            <p className="text-sm text-red-600 dark:text-red-500">
              Certifique-se de que:
            </p>
            <ul className="text-sm text-red-600 dark:text-red-500 mt-2 space-y-1">
              <li>✓ As variáveis de ambiente estão configuradas</li>
              <li>✓ Banco de dados Supabase está operacional</li>
              <li>✓ A tabela &quot;flashcards&quot; foi criada</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return <FlashcardViewer flashcards={flashcards} />
}
