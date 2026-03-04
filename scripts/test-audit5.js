const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envCols = fs.readFileSync('.env.local', 'utf8').split('\n');
let url = '', key = '';
for (const line of envCols) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim().replace(/"/g, '');
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim().replace(/"/g, '');
}

const supabase = createClient(url, key);

async function check() {
    const res = await supabase.from('audit_logs').select('*');
    console.log("ALL LOGS:", JSON.stringify(res, null, 2));

    const insertRes = await supabase.from('audit_logs').insert([{
        user_email: "t",
        flashcard_numero: 1,
        field: "pergunta",
        old_value: "a",
        new_value: "b"
    }]);

    console.log("INSERT RES:", JSON.stringify(insertRes, null, 2));
}
check();
