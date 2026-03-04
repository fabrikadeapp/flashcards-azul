import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { pergunta, resposta, userEmail } = await req.json();

        if (!pergunta || !resposta) {
            return NextResponse.json({ error: 'Pergunta e resposta são obrigatórias' }, { status: 400 });
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
            return NextResponse.json({ error: 'Acesso negado: Usuário não autorizado' }, { status: 403 });
        }

        if (user.role !== 'admin' && user.status !== 'active') {
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
            return NextResponse.json({ error: 'Sem permissão para criar cards' }, { status: 403 });
        }

        // 2. DESCOBRE O MAIOR NÚMERO
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
