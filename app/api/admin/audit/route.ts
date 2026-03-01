import { NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/audit';

export async function GET() {
    try {
        const logs = getAuditLogs();
        return NextResponse.json({ success: true, logs });
    } catch (err) {
        return NextResponse.json({ error: 'Erro ao obter logs de auditoria' }, { status: 500 });
    }
}
