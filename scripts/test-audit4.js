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
    console.log("Fetching all audit_logs...");
    const res = await supabase.from('audit_logs').select('*');
    console.log("FULL RES ERROR:", res.error);
    console.log("FULL RES DATA:", res.data);

    // Test single insert to show error explicitly if columns are wrong
    const res2 = await supabase.from('audit_logs').insert([{
        user_email: "test",
        flashcard_numero: 1,
        field: "t",
        old_value: "a",
        new_value: "b"
    }]);
    console.log("INSERT ERROR:", res2.error);
}
check();
