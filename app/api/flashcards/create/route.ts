import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { pergunta, resposta } = await req.json();

        if (!pergunta || !resposta) {
            return NextResponse.json({ error: 'Pergunta e resposta são obrigatórias' }, { status: 400 });
        }

        // Descobre o maior numero
        const { data: maxCard, error: maxError } = await supabase
            .from('flashcards')
            .select('numero')
            .order('numero', { ascending: false })
            .limit(1)
            .single();

        let newNumero = 1;
        if (maxCard && maxCard.numero) {
            newNumero = maxCard.numero + 1;
        }

        const newFlashcard = {
            numero: newNumero,
            pergunta,
            resposta,
            modulo: 'Geral',
            categoria: 'Adicionados Manualmente'
        };

        const { error: insertError } = await supabase.from('flashcards').insert([newFlashcard]);

        if (insertError) {
            throw insertError;
        }

        return NextResponse.json({ success: true, flashcard: newFlashcard });
    } catch (err) {
        console.error('Erro ao criar flashcard', err);
        return NextResponse.json({ error: 'Erro no servidor ao criar o flashcard' }, { status: 500 });
    }
}
