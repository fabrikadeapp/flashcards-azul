import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

let envPath = '.env.local';
const envCols = fs.readFileSync(envPath, 'utf8').split('\n');
let url = '';
let key = '';

for (const line of envCols) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1]!.trim().replace(/"/g, '');
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1]!.trim().replace(/"/g, '');
}

const supabase = createClient(url, key);

async function check() {
    console.log("Checking audit_logs insertion...");
    const auditEntries = [{
        user_email: "test@test.com",
        flashcard_numero: 94,
        field: 'resposta',
        old_value: "old",
        new_value: "new"
    }];
    const res2 = await supabase.from('audit_logs').insert(auditEntries).select('*');
    if (res2.error) {
        console.log("Insert Error:", res2.error);
    } else {
        console.log("Inserted:", res2.data);
    }
}
check();
