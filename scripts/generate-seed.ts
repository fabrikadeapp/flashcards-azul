/**
 * Script para gerar o SQL seed completo com todos os 600 flashcards
 *
 * Execução:
 * npx ts-node scripts/generate-seed.ts > scripts/seed-complete.sql
 */

// Dados dos flashcards estruturados por módulo
const flashcardsData = [
  // Parte 1: Itens 1-150 (AVT, Periódica, Memory Items, MGO/Security)
  {
    numero: 1,
    pergunta: 'Descreva o sistema Hidráulico',
    resposta: '3 sistemas independentes (Verde, Azul, Amarelo) a 3000 PSI. A PTU liga com diferencial de 500 PSI entre verde e amarelo. Não há transferência de fluido.',
    modulo: 'Módulo 1',
    categoria: 'AVT'
  },
  {
    numero: 2,
    pergunta: 'Superfície atuada pelos 3 sistemas hidráulicos',
    resposta: 'Leme de direção',
    modulo: 'Módulo 1',
    categoria: 'AVT'
  },
  // ... mais flashcards aqui ...

  // Parte 8: Itens 501-600 (LIMITATIONS)
  {
    numero: 501,
    pergunta: 'Qual é a limitação de inclinação (Runway Slope) da pista para decolagem e pouso',
    resposta: 'A inclinação média máxima permitida é de ±2%',
    modulo: 'Módulo 23',
    categoria: 'LIMITATIONS'
  },
];

// Gerar SQL
const generateSQL = () => {
  console.log(`-- Seed SQL para Flashcards A320 - Azul Airlines
-- Total de flashcards: ${flashcardsData.length}
-- Gerado automaticamente

CREATE TABLE IF NOT EXISTS flashcards (
  id BIGSERIAL PRIMARY KEY,
  numero INTEGER UNIQUE NOT NULL,
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  modulo VARCHAR(255) NOT NULL,
  categoria VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_flashcards_numero ON flashcards(numero);
CREATE INDEX IF NOT EXISTS idx_flashcards_modulo ON flashcards(modulo);
CREATE INDEX IF NOT EXISTS idx_flashcards_categoria ON flashcards(categoria);

TRUNCATE flashcards RESTART IDENTITY CASCADE;

-- Inserting flashcards
`);

  // Gerar INSERTs em batches de 50 para melhor performance
  let batchCount = 0;
  const batchSize = 50;

  for (let i = 0; i < flashcardsData.length; i += batchSize) {
    const batch = flashcardsData.slice(i, i + batchSize);

    console.log(`INSERT INTO flashcards (numero, pergunta, resposta, modulo, categoria) VALUES`);

    batch.forEach((card, index) => {
      const isLast = index === batch.length - 1 && i + batchSize >= flashcardsData.length;
      const comma = isLast ? ';' : ',';

      const pergunta = card.pergunta.replace(/'/g, "''");
      const resposta = card.resposta.replace(/'/g, "''");

      console.log(`(${card.numero}, '${pergunta}', '${resposta}', '${card.modulo}', '${card.categoria}')${comma}`);
    });

    console.log('');
    batchCount++;
  }
};

generateSQL();
