const fs = require('fs');

const envCols = fs.readFileSync('.env.local', 'utf8').split('\n');
let url = '', key = '';
for (const line of envCols) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim().replace(/(^"|"$|\\n)/g, '');
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim().replace(/(^"|"$|\\n)/g, '');
}

async function testFetch() {
    console.log("URL:", url);
    const res = await fetch(`${url}/rest/v1/audit_logs?select=*`, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    });

    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body:", text);
}
testFetch();
