import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { userId, newStatus } = await req.json();

        if (!userId || !newStatus) {
            return NextResponse.json({ error: 'ID do usuário e novo status são obrigatórios' }, { status: 400 });
        }

        const validStatuses = ['active', 'frozen', 'banned', 'pending'];
        if (!validStatuses.includes(newStatus)) {
            return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
        }

        console.log('Update Status Request:', { userId, newStatus });

        const { data, error } = await supabase
            .from('users')
            .update({ status: newStatus })
            .eq('id', userId)
            .select();

        console.log('Supabase Response Data:', data);

        if (error) {
            console.error('Supabase Update Error:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            console.warn('No user found with ID:', userId);
            return NextResponse.json({ error: 'Usuário não encontrado no banco' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Status atualizado com sucesso' });
    } catch (err) {
        console.error('Erro update-status:', err);
        return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
    }
}
