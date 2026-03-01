import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, name, email, role, status, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // Pega lista de editores salvos no config
        const { data: configData } = await supabase
            .from('settings')
            .select('value')
            .eq('id', 'config')
            .single();

        const editorsList = configData?.value?.editors || [];

        const mappedUsers = users.map(u => ({
            ...u,
            canEdit: editorsList.includes(u.email),
            createdAt: u.created_at
        }));

        return NextResponse.json({ success: true, users: mappedUsers });
    } catch (err) {
        console.error('Erro users:', err);
        return NextResponse.json({ error: 'Erro ao obter usuários' }, { status: 500 });
    }
}
