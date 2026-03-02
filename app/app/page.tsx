'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types/commerce';

interface EntitlementWithProduct {
    id: string;
    expires_at: string;
    product: Product;
}

export default function MyProductsPage() {
    const [entitlements, setEntitlements] = useState<EntitlementWithProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
            router.push('/');
            return;
        }

        const user = JSON.parse(storedUser);

        async function fetchEntitlements() {
            try {
                // Since RLS is enabled on entitlements, we can use the anon client 
                // IF we were using Supabase Auth. 
                // BUT we are using custom auth, so we should probably fetch via an API route 
                // that uses supabaseAdmin or we can try fetching with the userId.

                // For this implementation, I'll use an API route to be safe with their custom auth.
                const res = await fetch(`/api/app/entitlements?userId=${user.id}`);
                const data = await res.json();

                setEntitlements(data.entitlements || []);
            } catch (err) {
                console.error('Error fetching entitlements:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchEntitlements();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B1F3B] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1F3B] text-white p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-10 flex items-center gap-3">
                    <span className="text-4xl text-blue-500">✈️</span>
                    Meus Treinamentos
                </h1>

                {entitlements.length === 0 ? (
                    <div className="bg-white/5 rounded-3xl p-12 text-center border border-white/10">
                        <p className="text-xl text-slate-400 mb-8">Você ainda não possui treinamentos ativos.</p>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl font-bold transition-all"
                        >
                            Ver Catálogo de Produtos
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {entitlements.map((e) => (
                            <div
                                key={e.id}
                                onClick={() => router.push(`/app/p/${e.product.slug}`)}
                                className="group bg-white/5 rounded-3xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer"
                            >
                                <div className="aspect-video relative overflow-hidden">
                                    <img
                                        src={e.product.image_url || 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=800'}
                                        alt={e.product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 right-4 bg-green-500 text-xs font-bold px-3 py-1 rounded-full text-white uppercase shadow-lg">
                                        Ativo
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2">{e.product.name}</h3>
                                    <p className="text-sm text-slate-400">
                                        Expira em: {new Date(e.expires_at).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
