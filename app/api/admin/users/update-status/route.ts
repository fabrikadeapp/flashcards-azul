import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY === 'placeholder') {
            console.error('SUPABASE_SERVICE_ROLE_KEY is not configured');
            return NextResponse.json({ error: 'Configuração do Servidor Pendente (Service Role Key)' }, { status: 500 });
        }

        const { userId, newStatus } = await req.json();

        if (!userId || !newStatus) {
            return NextResponse.json({ error: 'ID do usuário e novo status são obrigatórios' }, { status: 400 });
        }

        const validStatuses = ['active', 'frozen', 'banned', 'pending'];
        if (!validStatuses.includes(newStatus)) {
            return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
        }

        console.log(`Executing Supabase UPDATE users SET status = ${newStatus} WHERE id = ${userId}`);

        const { data, error, count } = await supabase
            .from('users')
            .update({ status: newStatus })
            .eq('id', userId)
            .select();

        console.log('Supabase Result:', { data, count, error });

        if (error) {
            console.error('Supabase Update Error:', error);
            if (error.code === '401' || error.message?.includes('Invalid key')) {
                return NextResponse.json({ error: 'Erro de conexão: Chave Admin inválida no Vercel.' }, { status: 500 });
            }
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
