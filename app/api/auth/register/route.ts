import { NextResponse } from 'next/server';
import { getUsers, saveUsers, User } from '@/lib/users';

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
        }

        const users = getUsers();

        if (users.find((u) => u.email === email)) {
            return NextResponse.json({ error: 'Este e-mail já está cadastrado' }, { status: 400 });
        }

        const newUser: User = {
            id: crypto.randomUUID(),
            name,
            email,
            password, // Em um sistema real, faríamos um hash (bcrypt)
            role: email === 'admin@azul.com' ? 'admin' : 'user', // Acesso oculto de admin
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveUsers(users);

        return NextResponse.json({ success: true, message: 'Cadastro realizado com sucesso!' });
    } catch (err) {
        return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
    }
}
