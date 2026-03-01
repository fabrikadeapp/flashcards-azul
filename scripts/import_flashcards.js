const fs = require('fs');
const path = require('path');

const TXT_FILE_PATH = path.join(__dirname, '../novos_flashcards.txt');
const JSON_FILE_PATH = path.join(__dirname, '../public/flashcards 2.json');

async function importFlashcards() {
  try {
    if (!fs.existsSync(TXT_FILE_PATH)) {
      console.log('Arquivo novos_flashcards.txt não encontrado. Crie o arquivo na raiz do projeto com o texto.');
      return;
    }

    const textContent = fs.readFileSync(TXT_FILE_PATH, 'utf-8');
    
    // Expressão regular para encontrar "Pergunta XXX - [Texto]?\nResposta: [Texto]"
    // Levando em conta possíveis quebras de linhas ou variações de formatação
    const regex = /Pergunta\s+\d+\s*-\s*([\s\S]*?)\nResposta:\s*([\s\S]*?)(?=\nPergunta\s+\d+|$)/g;
    
    let match;
    const novosFlashcards = [];
    
    while ((match = regex.exec(textContent)) !== null) {
      novosFlashcards.push({
        pergunta: match[1].trim(),
        resposta: match[2].trim(),
        modulo: "Mosaico / Limitações A320", // Você pode alterar esse módulo
        categoria: "Avaliação Prática"      // E a categoria também
      });
    }

    if (novosFlashcards.length === 0) {
      console.log('Nenhum flashcard encontrado no arquivo. Verifique se o formato "Pergunta XXX - ..." e "Resposta: ..." estão corretos.');
      return;
    }

    console.log(`Encontrados ${novosFlashcards.length} novos flashcards.`);

    // Lê o JSON atual
    let flashcardsAtuais = [];
    if (fs.existsSync(JSON_FILE_PATH)) {
      const jsonContent = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
      flashcardsAtuais = JSON.parse(jsonContent);
    }
    
    // Pega o número do último flashcard para continuar a contagem
    let ultimoNumero = flashcardsAtuais.length > 0 ? Math.max(...flashcardsAtuais.map(f => f.numero || 0)) : 0;

    // Associa os IDs/números nos novos cards
    novosFlashcards.forEach(card => {
      ultimoNumero++;
      flashcardsAtuais.push({
        numero: ultimoNumero,
        ...card
      });
    });

    // Salva o JSON atualizado
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(flashcardsAtuais, null, 2), 'utf-8');
    
    console.log(`Sucesso! Os ${novosFlashcards.length} flashcards foram adicionados ao arquivo flashcards 2.json.`);
  } catch (err) {
    console.error('Erro ao importar os flashcards:', err);
  }
}

importFlashcards();
