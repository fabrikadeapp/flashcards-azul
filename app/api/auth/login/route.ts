import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        if (user.password !== password) {
            return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
        }

        if (user.role !== 'admin') {
            if (user.status === 'pending') {
                return NextResponse.json({ error: 'Seu cadastro está em análise pela coordenação.' }, { status: 403 });
            }
            if (user.status === 'frozen') {
                return NextResponse.json({ error: 'Seu acesso está suspenso temporariamente.' }, { status: 403 });
            }
            if (user.status === 'banned') {
                return NextResponse.json({ error: 'Sua conta foi banida da plataforma.' }, { status: 403 });
            }
        }

        const { data: configData } = await supabase
            .from('settings')
            .select('value')
            .eq('id', 'config')
            .single();

        const editorsList = configData?.value?.editors || [];

        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            canEdit: editorsList.includes(user.email)
        };

        return NextResponse.json({ success: true, user: safeUser });
    } catch (err) {
        console.error('Erro de login:', err);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
