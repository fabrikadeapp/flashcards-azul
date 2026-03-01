import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { email, canEdit } = await req.json();

        if (!email || canEdit === undefined) {
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
            if (!currentConfig.editors.includes(email)) {
                currentConfig.editors.push(email);
            }
        } else {
            currentConfig.editors = currentConfig.editors.filter((e: string) => e !== email);
        }

        // 3. Salva a nova configuração
        const { error: upsertError } = await supabase
            .from('settings')
            .upsert({
                id: 'config',
                value: currentConfig
            }, { onConflict: 'id' });

        if (upsertError) {
            throw upsertError;
        }

        return NextResponse.json({ success: true, message: 'Permissão de edição atualizada!' });
    } catch (err) {
        console.error('Erro update-edit-permission:', err);
        return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
    }
}
