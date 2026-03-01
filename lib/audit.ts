import fs from 'fs';
import path from 'path';

const auditFilePath = path.join(process.cwd(), 'data', 'audit.json');

export interface AuditLog {
    id: string;
    timestamp: string;
    userEmail: string;
    flashcardNumero: number;
    field: 'pergunta' | 'resposta';
    oldValue: string;
    newValue: string;
}

export function getAuditLogs(): AuditLog[] {
    try {
        if (!fs.existsSync(auditFilePath)) {
            return [];
        }
        const data = fs.readFileSync(auditFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler audit.json:', error);
        return [];
    }
}

export function saveAuditLogs(logs: AuditLog[]) {
    try {
        if (!fs.existsSync(path.dirname(auditFilePath))) {
            fs.mkdirSync(path.dirname(auditFilePath), { recursive: true });
        }
        fs.writeFileSync(auditFilePath, JSON.stringify(logs, null, 2));
    } catch (error) {
        console.error('Erro ao salvar audit.json:', error);
    }
}

export function createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const logs = getAuditLogs();
    const newLog: AuditLog = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        ...log
    };
    logs.unshift(newLog); // Prepend the latest logs
    saveAuditLogs(logs);
}
