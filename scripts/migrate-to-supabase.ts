import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import 'dotenv/config.js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log('Iniciando migração...');

    // 1. Flashcards (public/flashcards.json)
    try {
        const flashcardsPath = path.join(process.cwd(), 'public', 'flashcards.json');
        if (fs.existsSync(flashcardsPath)) {
            const flashcardsData = JSON.parse(fs.readFileSync(flashcardsPath, 'utf-8'));

            console.log(`Migrando ${flashcardsData.length} flashcards...`);
            // Lote 500 por vez para não dar erro de tamanho
            const batchSize = 500;
            for (let i = 0; i < flashcardsData.length; i += batchSize) {
                const batch = flashcardsData.slice(i, i + batchSize);
                const { error } = await supabase.from('flashcards').upsert(batch, { onConflict: 'numero' });
                if (error) console.error('Erro flashcards:', error);
                console.log(`  - Lote ${i / batchSize + 1} de flashcards inserido`);
            }
            console.log('Flashcards migrados com sucesso!');
        }
    } catch (error) {
        console.error('Erro ao migrar flashcards:', error);
    }

    // 2. Users (data/users.json)
    try {
        const usersPath = path.join(process.cwd(), 'data', 'users.json');
        if (fs.existsSync(usersPath)) {
            const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));

            const mappedUsers = usersData.map((u: any) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                password: u.password,
                role: u.role,
                status: u.status || 'pending',
                created_at: u.createdAt
            }));

            console.log(`Migrando ${mappedUsers.length} usuários...`);
            const { error } = await supabase.from('users').upsert(mappedUsers, { onConflict: 'email' });
            if (error) console.error('Erro users:', error);
            else console.log('Usuários migrados com sucesso!');
        }
    } catch (error) {
        console.error('Erro ao migrar users:', error);
    }

    // 3. Settings (data/settings.json) - if exists
    try {
        const settingsPath = path.join(process.cwd(), 'data', 'settings.json');
        if (fs.existsSync(settingsPath)) {
            const settingsData = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

            console.log('Migrando settings...');
            const { error } = await supabase.from('settings').upsert({
                id: 'config',
                value: settingsData
            }, { onConflict: 'id' });

            if (error) console.error('Erro settings:', error);
            else console.log('Settings migrados com sucesso!');
        }
    } catch (error) {
        console.error('Erro ao migrar settings:', error);
    }

    // 4. Audit Logs (data/audit.json) - if exists
    try {
        const auditPath = path.join(process.cwd(), 'data', 'audit.json');
        if (fs.existsSync(auditPath)) {
            const auditData = JSON.parse(fs.readFileSync(auditPath, 'utf-8'));

            const mappedAudit = auditData.map((l: any) => ({
                id: l.id,
                timestamp: l.timestamp,
                user_email: l.userEmail,
                flashcard_numero: l.flashcardNumero,
                field: l.field,
                old_value: l.oldValue,
                new_value: l.newValue
            }));

            console.log(`Migrando ${mappedAudit.length} audits...`);
            const { error } = await supabase.from('audit_logs').upsert(mappedAudit, { onConflict: 'id' });
            if (error) console.error('Erro audit:', error);
            else console.log('Audit migrado com sucesso!');
        }
    } catch (error) {
        console.error('Erro ao migrar audit:', error);
    }

    console.log('Migração concluída!');
}

migrate();
