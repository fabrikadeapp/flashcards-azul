import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();
        const cleanEmail = email?.trim().toLowerCase();

        if (!cleanEmail || !password) {
            return NextResponse.json({ error: 'E-mail e senha são obrigatórios' }, { status: 400 });
        }

        if (!isSupabaseAdminConfigured) {
            return NextResponse.json({
                error: 'Configuração Pendente: Adicione a SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente da Vercel e faça um novo Deploy.'
            }, { status: 500 });
        }

        console.log('Login attempt:', cleanEmail);

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', cleanEmail)
            .single();

        if (error) {
            console.error('Database Error:', error);
            // Se for erro de auth no Supabase (pode ser chave inválida)
            if (error.code === '401' || error.message?.includes('Invalid key')) {
                return NextResponse.json({ error: 'Erro de conexão com o banco (Chave Admin inválida)' }, { status: 500 });
            }
            if (error.code === 'PGRST116') { // Código para '0 rows found'
                return NextResponse.json({ error: 'Conta não encontrada com este e-mail' }, { status: 401 });
            }
            return NextResponse.json({ error: 'Erro ao consultar banco de dados: ' + error.message }, { status: 500 });
        }

        if (!user) {
            return NextResponse.json({ error: 'Credenciais inválidas (usuário não existe)' }, { status: 401 });
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
