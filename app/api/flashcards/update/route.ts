import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { id, numero, pergunta, resposta, modulo, categoria, userEmail } = await req.json();

        if (numero === undefined) {
            return NextResponse.json({ error: 'Número do flashcard é obrigatório' }, { status: 400 });
        }

        // Buscar flashcard atual para log
        const { data: currentCard, error: fetchError } = await supabase
            .from('flashcards')
            .select('*')
            .eq('numero', numero)
            .single();

        if (fetchError || !currentCard) {
            return NextResponse.json({ error: 'Flashcard não encontrado' }, { status: 404 });
        }

        // Registro de Auditoria no Supabase
        const auditEntries = [];

        if (currentCard.pergunta !== pergunta) {
            auditEntries.push({
                user_email: userEmail || 'Desconhecido',
                flashcard_numero: numero,
                field: 'pergunta',
                old_value: currentCard.pergunta,
                new_value: pergunta
            });
        }

        if (currentCard.resposta !== resposta) {
            auditEntries.push({
                user_email: userEmail || 'Desconhecido',
                flashcard_numero: numero,
                field: 'resposta',
                old_value: currentCard.resposta,
                new_value: resposta
            });
        }

        if (auditEntries.length > 0) {
            await supabase.from('audit_logs').insert(auditEntries);
        }

        // Realiza o Update
        const { error: updateError } = await supabase
            .from('flashcards')
            .update({ pergunta, resposta, modulo, categoria })
            .eq('numero', numero);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Erro atualizar flashcard:', err);
        return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
    }
}
