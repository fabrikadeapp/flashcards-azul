import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAuditLogs, createAuditLog } from '@/lib/audit';

export async function POST(req: Request) {
    try {
        const { logId } = await req.json();

        if (!logId) {
            return NextResponse.json({ error: 'ID do log é obrigatório' }, { status: 400 });
        }

        const logs = getAuditLogs();
        const logToRevert = logs.find((l) => l.id === logId);

        if (!logToRevert) {
            return NextResponse.json({ error: 'Log de auditoria não encontrado' }, { status: 404 });
        }

        const filePath = path.join(process.cwd(), 'public', 'flashcards.json');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const flashcards = JSON.parse(fileContent);

        const index = flashcards.findIndex((fc: any) => fc.numero === logToRevert.flashcardNumero);
        if (index === -1) {
            return NextResponse.json({ error: 'Flashcard correspondente não encontrado' }, { status: 404 });
        }

        const currentValue = flashcards[index][logToRevert.field];

        // Reverte para o 'oldValue' do log original
        flashcards[index][logToRevert.field] = logToRevert.oldValue;
        fs.writeFileSync(filePath, JSON.stringify(flashcards, null, 2), 'utf-8');

        // Cria um novo log de auditoria registrando essa reversão
        createAuditLog({
            userEmail: 'SISTEMA (Administrador reverteu)',
            flashcardNumero: logToRevert.flashcardNumero,
            field: logToRevert.field,
            oldValue: currentValue,
            newValue: logToRevert.oldValue
        });

        return NextResponse.json({ success: true, message: 'Alteração revertida com sucesso!' });
    } catch (err) {
        console.error('Erro ao reverter flashcard:', err);
        return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
    }
}
