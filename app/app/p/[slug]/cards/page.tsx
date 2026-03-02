'use client'

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Flashcard } from '@/lib/supabase';
import FlashcardViewer from '@/components/FlashcardViewer';

export default function ProductCardsPage() {
    const { slug } = useParams();
    const router = useRouter();
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
            router.push('/');
            return;
        }

        const user = JSON.parse(storedUser);

        async function fetchCards() {
            try {
                // Fetch cards via API route to enforce entitlement check
                const res = await fetch(`/api/app/product-cards?slug=${slug}&userId=${user.id}`);
                const data = await res.json();

                if (res.ok) {
                    setCards(data.cards || []);
                } else {
                    router.push(`/app/p/${slug}`);
                }
            } catch (err) {
                console.error('Error fetching product cards:', err);
                router.push('/app');
            } finally {
                setLoading(false);
            }
        }
        fetchCards();
    }, [slug, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B1F3B] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (cards.length === 0) {
        return (
            <div className="min-h-screen bg-[#0B1F3B] flex flex-col items-center justify-center text-white p-8">
                <h1 className="text-2xl font-bold mb-4">Nenhum cartão disponível</h1>
                <p className="text-slate-400 mb-8">Esta aeronave ainda não possui cartões associados.</p>
                <button
                    onClick={() => router.push(`/app/p/${slug}`)}
                    className="bg-blue-600 px-6 py-2 rounded-xl"
                >
                    Voltar
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1F3B]">
            <FlashcardViewer flashcards={cards} />
        </div>
    );
}
