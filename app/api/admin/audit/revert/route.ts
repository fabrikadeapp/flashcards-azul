import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { logId } = await req.json();

        if (!logId) {
            return NextResponse.json({ error: 'ID do log é obrigatório' }, { status: 400 });
        }

        // Buscar log
        const { data: logToRevert, error: logError } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('id', logId)
            .single();

        if (logError || !logToRevert) {
            return NextResponse.json({ error: 'Log de auditoria não encontrado' }, { status: 404 });
        }

        // Buscar flashcard atual
        const { data: currentCard, error: fcError } = await supabase
            .from('flashcards')
            .select('*')
            .eq('numero', logToRevert.flashcard_numero)
            .single();

        if (fcError || !currentCard) {
            return NextResponse.json({ error: 'Flashcard correspondente não encontrado' }, { status: 404 });
        }

        const currentValue = currentCard[logToRevert.field];

        // Reverte para o 'oldValue' do log original
        const { error: updateError } = await supabase
            .from('flashcards')
            .update({ [logToRevert.field]: logToRevert.old_value })
            .eq('numero', logToRevert.flashcard_numero);

        if (updateError) {
            throw updateError;
        }

        // Cria um novo log de auditoria registrando essa reversão
        const { error: newLogError } = await supabase.from('audit_logs').insert([{
            user_email: 'SISTEMA (Administrador reverteu)',
            flashcard_numero: logToRevert.flashcard_numero,
            field: logToRevert.field,
            old_value: currentValue,
            new_value: logToRevert.old_value
        }]);

        if (newLogError) {
            throw newLogError;
        }

        return NextResponse.json({ success: true, message: 'Alteração revertida com sucesso!' });
    } catch (err) {
        console.error('Erro ao reverter flashcard:', err);
        return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
    }
}
