import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
        }

        // Verifica se já existe
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return NextResponse.json({ error: 'Este e-mail já está cadastrado' }, { status: 400 });
        }

        const newUser = {
            name,
            email,
            password, // Em um sistema real, faríamos um hash (bcrypt)
            role: email === 'aero.gus@hotmail.com' ? 'admin' : 'user',
            status: email === 'aero.gus@hotmail.com' ? 'active' : 'pending'
        };

        console.log('Attempting to register user:', { name, email, role: newUser.role });

        const { data, error } = await supabase.from('users').insert([newUser]).select();

        if (error) {
            console.error('Registration Error:', error);
            throw error;
        }

        console.log('User registered successfully:', data);

        return NextResponse.json({ success: true, message: 'Cadastro realizado com sucesso!' });
    } catch (err) {
        console.error('Erro register:', err);
        return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
    }
}
