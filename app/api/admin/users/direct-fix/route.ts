import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';
import { normalizeEmail } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { email, status } = await req.json();

        if (!email || !status) {
            return NextResponse.json({ error: 'Email e status são obrigatórios' }, { status: 400 });
        }

        const cleanEmail = normalizeEmail(email);

        console.log(`[DirectFix] Attempting to fix user: ${cleanEmail} to ${status}`);

        // Update by email directly to be very robust
        const { data, error, count } = await supabase
            .from('users')
            .update({ status })
            .ilike('email', cleanEmail)
            .select();

        if (error) {
            return NextResponse.json({ error: error.message, details: error }, { status: 500 });
        }

        if (!data || data.length === 0) {
            return NextResponse.json({
                error: 'Usuário não encontrado com este e-mail',
                context: { searched: cleanEmail }
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: `Usuário ${cleanEmail} atualizado para ${status}`,
            data
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
