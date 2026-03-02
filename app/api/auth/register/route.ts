import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { name, email: rawEmail, password } = await req.json();
        const email = rawEmail?.trim().toLowerCase();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
        }

        if (!isSupabaseAdminConfigured) {
            return NextResponse.json({ error: 'Erro central: Supabase Admin não configurado.' }, { status: 500 });
        }

        console.log('Attempting to register user:', { name, email });

        // Verifica se já existe - Usando Admin para ver todos sem restrição de RLS
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id, email')
            .ilike('email', email) // Busca insensível a maiúsculas
            .single();

        if (existingUser) {
            console.log('User already exists:', existingUser.email);
            return NextResponse.json({ error: 'Este e-mail já está cadastrado' }, { status: 400 });
        }

        const newUser = {
            name,
            email,
            password,
            role: email === 'aero.gus@hotmail.com' ? 'admin' : 'user',
            status: email === 'aero.gus@hotmail.com' ? 'active' : 'pending'
        };

        const { data, error } = await supabase.from('users').insert([newUser]).select();

        if (error) {
            console.error('Registration Error:', error);
            return NextResponse.json({ error: 'Erro ao salvar no banco: ' + error.message }, { status: 500 });
        }

        console.log('User registered successfully:', data?.[0]?.email);

        return NextResponse.json({ success: true, message: 'Cadastro realizado com sucesso!' });
    } catch (err) {
        console.error('Erro register:', err);
        return NextResponse.json({ error: 'Erro interno no servidor de registro' }, { status: 500 });
    }
}
