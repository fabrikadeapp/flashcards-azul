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

console.log('URL?', !!url, 'KEY?', !!key);
const supabase = createClient(url, key);

async function check() {
    console.log("Checking audit_logs...");
    const res2 = await supabase.from('audit_logs').select('*').limit(1);
    console.log("audit_logs query result:", res2.error ? res2.error.message : "Success!");
    console.log("audit_logs records:", res2.data);
}
check();
