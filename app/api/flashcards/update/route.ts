import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { numero, userEmail, newPergunta, newResposta } = body;

        console.log('Update Flashcard Attempt:', { numero, userEmail });

        if (numero === undefined) {
            return NextResponse.json({ error: 'Número do flashcard é obrigatório' }, { status: 400 });
        }

        if (!userEmail) {
            return NextResponse.json({ error: 'Usuário não identificado' }, { status: 401 });
        }

        // 1. VERIFICAR PERMISSÃO NO LADO DO SERVIDOR
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('role, status')
            .ilike('email', userEmail.trim())
            .single();

        if (userError || !user) {
            console.warn('User not found for update:', userEmail);
            return NextResponse.json({ error: 'Acesso negado: Usuário não encontrado' }, { status: 403 });
        }

        if (user.status !== 'active') {
            return NextResponse.json({ error: 'Acesso negado: Conta inativa' }, { status: 403 });
        }

        // Verifica se é admin ou se tem permissão explícita no settings
        const { data: configData } = await supabase
            .from('settings')
            .select('value')
            .eq('id', 'config')
            .single();

        const editorsList = configData?.value?.editors || [];
        const isEditor = user.role === 'admin' || editorsList.includes(userEmail.trim().toLowerCase());

        if (!isEditor) {
            return NextResponse.json({ error: 'Sem permissão para editar' }, { status: 403 });
        }

        // 2. BUSCAR DADOS ATUAIS
        const { data: currentCard, error: fetchError } = await supabase
            .from('flashcards')
            .select('*')
            .eq('numero', numero)
            .single();

        if (fetchError || !currentCard) {
            return NextResponse.json({ error: 'Flashcard não encontrado' }, { status: 404 });
        }

        // 3. PREPARAR UPDATE E AUDITORIA
        const updateData: any = {};
        const auditEntries: any[] = [];

        if (newPergunta !== undefined && newPergunta !== currentCard.pergunta) {
            updateData.pergunta = newPergunta;
            auditEntries.push({
                user_email: userEmail,
                flashcard_numero: numero,
                field: 'pergunta',
                old_value: currentCard.pergunta,
                new_value: newPergunta
            });
        }

        if (newResposta !== undefined && newResposta !== currentCard.resposta) {
            updateData.resposta = newResposta;
            auditEntries.push({
                user_email: userEmail,
                flashcard_numero: numero,
                field: 'resposta',
                old_value: currentCard.resposta,
                new_value: newResposta
            });
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ success: true, message: 'Nenhuma alteração detectada' });
        }

        // 4. EXECUTAR UPDATE E AUDITORIA
        const { error: updateError } = await supabase
            .from('flashcards')
            .update(updateData)
            .eq('numero', numero);

        if (updateError) throw updateError;

        if (auditEntries.length > 0) {
            await supabase.from('audit_logs').insert(auditEntries);
        }

        console.log('Flashcard updated successfully:', numero);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Erro atualizar flashcard:', err);
        return NextResponse.json({ error: 'Erro interno ao processar atualização' }, { status: 500 });
    }
}
