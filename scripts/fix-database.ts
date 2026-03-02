import { createClient } from '@supabase/supabase-js';
import 'dotenv/config.js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
    console.log('🔄 Iniciando limpeza e normalização da base de usuários...');

    const { data: users, error: fetchError } = await supabase
        .from('users')
        .select('id, email, name');

    if (fetchError) {
        console.error('❌ Erro ao buscar usuários:', fetchError);
        return;
    }

    console.log(`📊 Encontrados ${users.length} usuários.`);

    for (const user of users) {
        const originalEmail = user.email;
        const normalizedEmail = originalEmail.trim().toLowerCase().replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '');

        if (originalEmail !== normalizedEmail) {
            console.log(`✨ Normalizando: [${originalEmail}] -> [${normalizedEmail}]`);
            const { error: updateError } = await supabase
                .from('users')
                .update({ email: normalizedEmail })
                .eq('id', user.id);

            if (updateError) {
                console.error(`❌ Erro ao atualizar ${user.id}:`, updateError.message);
                if (updateError.code === '23505') {
                    console.warn(`⚠️  Email duplicado detectado para ${normalizedEmail}. Recomenda-se exclusão manual de um deles.`);
                }
            }
        }
    }

    console.log('✅ Base de usuários saneada!');
}

fix();
