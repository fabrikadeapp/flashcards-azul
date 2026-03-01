import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { userId, status } = await req.json();

        if (!userId || !status) {
            return NextResponse.json({ error: 'ID do usuário e novo status são obrigatórios' }, { status: 400 });
        }

        const validStatuses = ['active', 'frozen', 'banned', 'pending'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
        }

        const { error } = await supabase
            .from('users')
            .update({ status })
            .eq('id', userId);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true, message: 'Status atualizado com sucesso' });
    } catch (err) {
        console.error('Erro update-status:', err);
        return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
    }
}
