import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { pergunta, resposta } = await req.json();

        if (!pergunta || !resposta) {
            return NextResponse.json({ error: 'Pergunta e resposta são obrigatórias' }, { status: 400 });
        }

        const filePath = path.join(process.cwd(), 'public', 'flashcards.json');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const flashcards = JSON.parse(fileContent);

        // Find the highest numero to assign a new one
        const highestNumero = flashcards.reduce((max: number, card: any) => Math.max(max, card.numero || 0), 0);
        const newNumero = highestNumero + 1;

        const newFlashcard = {
            numero: newNumero,
            pergunta,
            resposta,
            modulo: 'Geral',
            categoria: 'Adicionados Manualmente'
        };

        flashcards.push(newFlashcard);

        fs.writeFileSync(filePath, JSON.stringify(flashcards, null, 2), 'utf-8');

        return NextResponse.json({ success: true, flashcard: newFlashcard });
    } catch (err) {
        console.error('Erro ao criar flashcard', err);
        return NextResponse.json({ error: 'Erro no servidor ao criar o flashcard' }, { status: 500 });
    }
}
