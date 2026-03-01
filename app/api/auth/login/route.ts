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

        if (user.role !== 'admin') {
            if (user.status === 'pending') {
                return NextResponse.json({ error: 'Seu cadastro está em análise. Aguarde a liberação do administrador.' }, { status: 403 });
            }
            if (user.status === 'frozen') {
                return NextResponse.json({ error: 'Sua conta foi temporariamente congelada pelo administrador.' }, { status: 403 });
            }
            if (user.status === 'banned') {
                return NextResponse.json({ error: 'Sua conta foi banida do sistema.' }, { status: 403 });
            }
        }

        // Retorna dados básicos sem senha
        const returnUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
        };

        return NextResponse.json({ success: true, user: returnUser });
    } catch (err) {
        return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
    }
}
