import { NextResponse } from 'next/server';
import { getUsers, saveUsers, User } from '@/lib/users';

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
        }

        const users = getUsers();
        const userIndex = users.findIndex((u: User) => u.id === userId);

        if (userIndex === -1) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        if (users[userIndex].role === 'admin') {
            return NextResponse.json({ error: 'Não é possível excluir o administrador' }, { status: 403 });
        }

        users.splice(userIndex, 1);
        saveUsers(users);

        return NextResponse.json({ success: true, message: 'Usuário excluído com sucesso!' });
    } catch (err) {
        return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
    }
}
