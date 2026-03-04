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
    console.log("Fetching all audit_logs...");
    const res = await supabase.from('audit_logs').select('*');
    console.log("FULL RES:", res);
}
check();
