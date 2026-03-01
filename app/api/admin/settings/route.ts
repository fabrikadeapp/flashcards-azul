import { NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/settings';

export async function GET() {
    try {
        const settings = getSettings();
        return NextResponse.json({ success: true, settings });
    } catch (err) {
        return NextResponse.json({ error: 'Erro ao obter configurações' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { allowFlashcardEditing } = await req.json();

        if (typeof allowFlashcardEditing !== 'boolean') {
            return NextResponse.json({ error: 'Valor inválido' }, { status: 400 });
        }

        const settings = getSettings();
        settings.allowFlashcardEditing = allowFlashcardEditing;
        saveSettings(settings);

        return NextResponse.json({ success: true, settings });
    } catch (err) {
        return NextResponse.json({ error: 'Erro ao salvar configurações' }, { status: 500 });
    }
}
