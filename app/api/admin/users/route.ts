import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, name, email, role, status, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // Renomeando created_at para manter compatibilidade no front
        const mappedUsers = users.map(u => ({
            ...u,
            createdAt: u.created_at
        }));

        return NextResponse.json({ success: true, users: mappedUsers });
    } catch (err) {
        console.error('Erro users:', err);
        return NextResponse.json({ error: 'Erro ao obter usuários' }, { status: 500 });
    }
}
