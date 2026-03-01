import { NextResponse } from 'next/server';
import { getUsers, saveUsers, User } from '@/lib/users';

export async function POST(req: Request) {
    try {
        const { currentEmail, newPassword } = await req.json();

        if (!currentEmail || !newPassword) {
            return NextResponse.json({ error: 'E-mail e nova senha são obrigatórios' }, { status: 400 });
        }

        const users = getUsers();
        const userIndex = users.findIndex((u: User) => u.email === currentEmail && u.role === 'admin');

        if (userIndex === -1) {
            return NextResponse.json({ error: 'Administrador não encontrado' }, { status: 404 });
        }

        // Atualiza a senha
        users[userIndex].password = newPassword;
        saveUsers(users);

        return NextResponse.json({ success: true, message: 'Senha atualizada com sucesso!' });
    } catch (err) {
        return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
    }
}
