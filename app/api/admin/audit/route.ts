import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data: logs, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('timestamp', { ascending: false });

        if (error) {
            throw error;
        }

        // Renomeando campos pro front
        const mappedLogs = logs.map(l => ({
            id: l.id,
            timestamp: l.timestamp,
            userEmail: l.user_email,
            flashcardNumero: l.flashcard_numero,
            field: l.field,
            oldValue: l.old_value,
            newValue: l.new_value
        }));

        return NextResponse.json({ success: true, logs: mappedLogs });
    } catch (err) {
        console.error('Erro audit logs:', err);
        return NextResponse.json({ error: 'Erro ao obter logs de auditoria' }, { status: 500 });
    }
}
