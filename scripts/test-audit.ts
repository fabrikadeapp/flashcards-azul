import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

async function testUpdate() {
    const numero = 94; // According to screenshot: "94 / 745"
    const userEmail = "gustavoholderbaumvieira@gmail.com"; // Provide a valid admin or editor email
    // Or let's test with gustavo

    // First let's get any card
    const { data: currentCard, error: fetchError } = await supabase
        .from('flashcards')
        .select('*')
        .limit(1)
        .single();

    if (!currentCard) {
        console.log("No card found");
        return;
    }

    console.log("Card found:", currentCard.numero);

    const auditEntries = [{
        user_email: "test@example.com",
        flashcard_numero: currentCard.numero,
        field: 'resposta',
        old_value: currentCard.resposta,
        new_value: currentCard.resposta + " test"
    }];

    console.log("Trying to insert audit entry:", auditEntries);
    const { data, error } = await supabase.from('audit_logs').insert(auditEntries);
    console.log("Audit log insert result:", data, error);
}

testUpdate();
