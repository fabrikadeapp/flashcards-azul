import { NextResponse } from 'next/server';
import { getUsers } from '@/lib/users';

export async function GET() {
    try {
        const users = getUsers();

        // Retornamos todos os usuários (removendo a senha por segurança)
        const sanitizedUsers = users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            createdAt: u.createdAt
        }));

        return NextResponse.json({ success: true, users: sanitizedUsers });
    } catch (err) {
        return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
    }
}
