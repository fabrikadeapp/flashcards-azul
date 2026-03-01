import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'E-mail e senha são obrigatórios' }, { status: 400 });
        }

        console.log('Login attempt:', email);

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            console.error('Login user check error:', error);
            return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
        }

        if (user.password !== password) {
            console.warn('Wrong password for:', email);
            return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
        }

        // Verifica status para não-admins
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

        // Pega lista de editores
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
            canEdit: user.role === 'admin' || editorsList.includes(user.email)
        };

        console.log('Login successful:', email, 'Role:', safeUser.role);

        return NextResponse.json({ success: true, user: safeUser });
    } catch (err) {
        console.error('Erro de login interno:', err);
        return NextResponse.json({ error: 'Erro interno no servidor de autenticação' }, { status: 500 });
    }
}
