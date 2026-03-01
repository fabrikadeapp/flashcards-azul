import fs from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: 'user' | 'admin';
    createdAt: string;
}

export function getUsers(): User[] {
    try {
        if (!fs.existsSync(usersFilePath)) {
            return [];
        }
        const data = fs.readFileSync(usersFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler users.json:', error);
        return [];
    }
}

export function saveUsers(users: User[]) {
    try {
        if (!fs.existsSync(path.dirname(usersFilePath))) {
            fs.mkdirSync(path.dirname(usersFilePath), { recursive: true });
        }
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Erro ao salvar users.json:', error);
    }
}
