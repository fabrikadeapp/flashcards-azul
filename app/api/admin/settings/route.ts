import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('value')
            .eq('id', 'config')
            .single();

        if (error || !data) {
            // Default caso não exista
            return NextResponse.json({ success: true, settings: { allowFlashcardEditing: false } });
        }

        return NextResponse.json({ success: true, settings: data.value });
    } catch (err) {
        console.error('Erro get settings:', err);
        return NextResponse.json({ error: 'Erro ao carregar configurações' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { allowFlashcardEditing } = await req.json();

        const { error } = await supabase
            .from('settings')
            .upsert({
                id: 'config',
                value: { allowFlashcardEditing }
            }, { onConflict: 'id' });

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true, settings: { allowFlashcardEditing } });
    } catch (err) {
        console.error('Erro atualizar settings:', err);
        return NextResponse.json({ error: 'Erro ao atualizar configurações' }, { status: 500 });
    }
}
