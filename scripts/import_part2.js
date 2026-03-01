const fs = require('fs');
const path = require('path');

const TXT_FILE_PATH = path.join(__dirname, '../novos_flashcards_2.txt');
const JSON_FILE_PATH = path.join(__dirname, '../public/flashcards 2.json');

async function importPart2() {
    try {
        const textContent = fs.readFileSync(TXT_FILE_PATH, 'utf-8');
        const lines = textContent.split('\n').filter(line => line.trim().length > 0);

        // Ler o JSON atual
        let flashcardsAtuais = [];
        if (fs.existsSync(JSON_FILE_PATH)) {
            const jsonContent = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
            flashcardsAtuais = JSON.parse(jsonContent);
        }

        let ultimoNumero = flashcardsAtuais.length > 0 ? Math.max(...flashcardsAtuais.map(f => f.numero || 0)) : 0;

        let adicionados = 0;
        let ignorados = 0;

        for (const line of lines) {
            // Formato: "1. Pergunta? Resposta" ou "1. Pergunta: Resposta" ou "1. Pergunta Resposta"
            const match = line.match(/^\d+\.\s+(.*?)(?:\?|:)\s+(.*)$/);

            let pergunta = "";
            let resposta = "";

            if (match) {
                // match[1] não inclui o ? ou : (porque não foram capturados ou ficou de fora)
                pergunta = match[1].trim() + (line.includes('?') ? '?' : ':');
                resposta = match[2].trim();
            } else {
                // fallback
                const firstSpace = line.indexOf(' ');
                const textWithoutNum = line.substring(firstSpace + 1);
                pergunta = textWithoutNum;
                resposta = "";
            }

            // Checar se já existe no banco (busca aproximada)
            const jaExiste = flashcardsAtuais.some(f => {
                // Compara os primeiros 30 caracteres
                return f.pergunta.toLowerCase().substring(0, 30) === pergunta.toLowerCase().substring(0, 30);
            });

            if (jaExiste) {
                ignorados++;
            } else {
                ultimoNumero++;
                flashcardsAtuais.push({
                    numero: ultimoNumero,
                    pergunta: pergunta,
                    resposta: resposta,
                    modulo: "Mosaico / Limitações A320",
                    categoria: "Avaliação Prática"
                });
                adicionados++;
            }
        }

        fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(flashcardsAtuais, null, 2), 'utf-8');
        console.log(`Sucesso! ${adicionados} flashcards adicionados. ${ignorados} foram ignorados porque já existiam no banco.`);

    } catch (err) {
        console.error('Erro ao importar parte 2:', err);
    }
}

importPart2();
