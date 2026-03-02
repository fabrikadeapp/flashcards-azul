import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';

import { normalizeEmail } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();
        const cleanEmail = normalizeEmail(email);

        if (!cleanEmail || !password) {
            return NextResponse.json({ error: 'E-mail e senha são obrigatórios' }, { status: 400 });
        }

        if (!isSupabaseAdminConfigured) {
            return NextResponse.json({
                error: 'Configuração Pendente: Adicione a SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente da Vercel e faça um novo Deploy.'
            }, { status: 500 });
        }

        console.log('Login attempt:', cleanEmail);
        const charCodes = cleanEmail.split('').map((c: string) => c.charCodeAt(0));
        console.log('Email char codes:', charCodes);

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .ilike('email', cleanEmail) // Muito mais robusto que .eq()
            .single();

        if (error) {
            console.error('Database Login Query Error:', error);
            if (error.code === '401' || error.message?.includes('Invalid key')) {
                return NextResponse.json({ error: 'Erro de conexão: Chave Admin inválida ou expirada.' }, { status: 500 });
            }
            if (error.code === 'PGRST116') { // 0 rows
                return NextResponse.json({ error: 'Conta não encontrada com este e-mail - verifique se o e-mail está correto no Admin.' }, { status: 401 });
            }
            return NextResponse.json({ error: 'Erro ao consultar banco: ' + error.message }, { status: 500 });
        }

        if (!user) {
            return NextResponse.json({ error: 'Sistema não encontrou o usuário após a consulta.' }, { status: 401 });
        }

        if (user.password !== password) {
            console.warn('Wrong password for:', cleanEmail);
            return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
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
