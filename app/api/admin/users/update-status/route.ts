import { NextResponse } from 'next/server';
import { getUsers, saveUsers, User } from '@/lib/users';

export async function POST(req: Request) {
    try {
        const { userId, newStatus } = await req.json();

        if (!userId || !newStatus) {
            return NextResponse.json({ error: 'ID do usuário e novo status são obrigatórios' }, { status: 400 });
        }

        const validStatuses = ['active', 'frozen', 'banned', 'pending'];
        if (!validStatuses.includes(newStatus)) {
            return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
        }

        const users = getUsers();
        const userIndex = users.findIndex((u: User) => u.id === userId);

        if (userIndex === -1) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        if (users[userIndex].role === 'admin') {
            return NextResponse.json({ error: 'Não é possível alterar o status do administrador' }, { status: 403 });
        }

        users[userIndex].status = newStatus;
        saveUsers(users);

        return NextResponse.json({ success: true, message: 'Status atualizado com sucesso!' });
    } catch (err) {
        return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
    }
}
