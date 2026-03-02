'use client'

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types/commerce';

export default function ProductDashboard() {
    const { slug } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [entitled, setEntitled] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
            router.push('/');
            return;
        }

        const user = JSON.parse(storedUser);

        async function verifyAccess() {
            try {
                // Get product
                const { data: prodData } = await supabase
                    .from('products')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (!prodData) {
                    router.push('/app');
                    return;
                }
                setProduct(prodData);

                // Verify entitlement via API to be safe
                const res = await fetch(`/api/app/verify-access?userId=${user.id}&productId=${prodData.id}`);
                const data = await res.json();

                if (data.active) {
                    setEntitled(true);
                } else {
                    router.push(`/p/${slug}?error=access_denied`);
                }
            } catch (err) {
                console.error('Error verifying access:', err);
                router.push('/app');
            } finally {
                setLoading(false);
            }
        }
        verifyAccess();
    }, [slug, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B1F3B] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!entitled || !product) return null;

    return (
        <div className="min-h-screen bg-[#0B1F3B] text-white">
            {/* Header */}
            <header className="p-8 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/app')}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        ←
                    </button>
                    <h1 className="text-2xl font-bold">{product.name}</h1>
                </div>
                <div className="flex gap-4">
                    <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase">
                        Acesso Ativo
                    </span>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto py-16 px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Flashcards Card */}
                    <div
                        onClick={() => router.push(`/app/p/${slug}/cards`)}
                        className="bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-blue-500 transition-all cursor-pointer group"
                    >
                        <div className="text-4xl mb-6">🗂️</div>
                        <h2 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors">Ver Flashcards</h2>
                        <p className="text-slate-400 mb-8">
                            Estude todos os cartões disponíveis para esta aeronave selecionada.
                        </p>
                        <div className="text-blue-500 font-bold group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                            Acessar Agora <span>→</span>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white/5 rounded-3xl p-8 border border-white/10 opacity-50 cursor-not-allowed">
                        <div className="text-4xl mb-6">📊</div>
                        <h2 className="text-2xl font-bold mb-4">Estatísticas</h2>
                        <p className="text-slate-400 mb-8">
                            Acompanhe seu progresso e desempenho (Em breve).
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
