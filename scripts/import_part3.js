const fs = require('fs');
const path = require('path');

const TXT_FILE_PATH = path.join(__dirname, '../novos_flashcards_8.txt');
const JSON_FILE_PATH = path.join(__dirname, '../public/flashcards.json');

async function importPart3() {
    try {
        const textContent = fs.readFileSync(TXT_FILE_PATH, 'utf-8');

        // Ler o JSON atual
        let flashcardsAtuais = [];
        if (fs.existsSync(JSON_FILE_PATH)) {
            const jsonContent = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
            flashcardsAtuais = JSON.parse(jsonContent);
        }

        let ultimoNumero = flashcardsAtuais.length > 0 ? Math.max(...flashcardsAtuais.map(f => f.numero || 0)) : 0;

        let adicionados = 0;
        let ignorados = 0;

        const regex = /Pergunta\s+\d+\s*-\s*([\s\S]*?)\nResposta:\s*([\s\S]*?)(?=\nPergunta\s+\d+|$)/g;
        let match;

        while ((match = regex.exec(textContent)) !== null) {
            let pergunta = match[1].trim();
            let resposta = match[2].trim();

            // Checar se já existe no banco (busca aproximada de 30 caracteres)
            const jaExiste = flashcardsAtuais.some(f => {
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
        console.log(`Total de flashcards agora: ${flashcardsAtuais.length}`);

    } catch (err) {
        console.error('Erro ao importar parte 3:', err);
    }
}

importPart3();
