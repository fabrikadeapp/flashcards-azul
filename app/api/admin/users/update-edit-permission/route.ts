import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { email, canEdit } = await req.json();
        const cleanEmail = email?.trim().toLowerCase();

        if (!cleanEmail || canEdit === undefined) {
            return NextResponse.json({ error: 'Email e permissão são obrigatórios' }, { status: 400 });
        }

        // 1. Pega configurações atuais
        const { data: configData, error: fetchError } = await supabase
            .from('settings')
            .select('value')
            .eq('id', 'config')
            .single();

        let currentConfig = { allowFlashcardEditing: false, editors: [] as string[] };
        if (!fetchError && configData?.value) {
            currentConfig = { ...currentConfig, ...configData.value };
        }

        if (!currentConfig.editors) currentConfig.editors = [];

        // 2. Adiciona ou remove o email da lista de editores
        if (canEdit) {
            if (!currentConfig.editors.includes(cleanEmail)) {
                currentConfig.editors.push(cleanEmail);
            }
        } else {
            currentConfig.editors = currentConfig.editors.filter((e: string) => e !== cleanEmail);
        }

        console.log('Updating edit permission for:', email, 'to:', canEdit);
        console.log('New Config to save:', currentConfig);

        // 3. Salva a nova configuração
        const { data, error: upsertError } = await supabase
            .from('settings')
            .upsert({
                id: 'config',
                value: currentConfig
            }, { onConflict: 'id' })
            .select();

        if (upsertError) {
            console.error('Database Error:', upsertError);
            if (upsertError.code === '401' || upsertError.message?.includes('Invalid key')) {
                return NextResponse.json({ error: 'Erro de conexão: Chave Admin inválida no Vercel.' }, { status: 500 });
            }
            throw upsertError;
        }

        console.log('Config updated successfully:', data);

        return NextResponse.json({ success: true, message: 'Permissão de edição atualizada!' });
    } catch (err) {
        console.error('Erro update-edit-permission:', err);
        return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
    }
}
