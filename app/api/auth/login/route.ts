import { NextResponse } from 'next/server';
import { getUsers } from '@/lib/users';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'E-mail e senha são obrigatórios' }, { status: 400 });
        }

        const users = getUsers();
        const user = users.find((u) => u.email === email && u.password === password);

        if (!user) {
            return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
        }

        // Retorna dados básicos sem senha
        const returnUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        return NextResponse.json({ success: true, user: returnUser });
    } catch (err) {
        return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
    }
}
