import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
    try {
        const { currentEmail, newPassword } = await req.json();

        if (!currentEmail || !newPassword) {
            return NextResponse.json({ error: 'Email e nova senha são obrigatórios' }, { status: 400 });
        }

        const { error } = await supabase
            .from('users')
            .update({ password: newPassword })
            .eq('email', currentEmail)
            .eq('role', 'admin');

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true, message: 'Senha do Administrador atualizada com sucesso!' });
    } catch (err) {
        console.error('Erro ao alterar senha:', err);
        return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
    }
}
