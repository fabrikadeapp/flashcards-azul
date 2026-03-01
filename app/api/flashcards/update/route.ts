import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSettings } from '@/lib/settings';

export async function POST(req: Request) {
    try {
        const settings = getSettings();
        if (!settings.allowFlashcardEditing) {
            return NextResponse.json({ error: 'A edição está desabilitada pelo administrador.' }, { status: 403 });
        }

        const { numero, newPergunta, newResposta } = await req.json();

        if (!numero || (!newPergunta && !newResposta)) {
            return NextResponse.json({ error: 'Dados insuficientes para atualização' }, { status: 400 });
        }

        const filePath = path.join(process.cwd(), 'public', 'flashcards.json');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const flashcards = JSON.parse(fileContent);

        const index = flashcards.findIndex((fc: any) => fc.numero === numero);
        if (index === -1) {
            return NextResponse.json({ error: 'Flashcard não encontrado' }, { status: 404 });
        }

        if (newPergunta) flashcards[index].pergunta = newPergunta;
        if (newResposta) flashcards[index].resposta = newResposta;

        fs.writeFileSync(filePath, JSON.stringify(flashcards, null, 2), 'utf-8');

        return NextResponse.json({ success: true, message: 'Flashcard atualizado com sucesso' });
    } catch (err) {
        console.error('Erro ao atualizar flashcard', err);
        return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
    }
}
