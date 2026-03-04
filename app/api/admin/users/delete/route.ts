import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
        }

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true, message: 'Usuário excluído com sucesso' });
    } catch (err) {
        console.error('Erro ao excluir:', err);
        return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
    }
}
