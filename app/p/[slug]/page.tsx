'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, ProductTier } from '@/lib/types/commerce';
import { FLAGS } from '@/lib/flags';

export default function ProductLandingPage() {
    const { slug } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [tiers, setTiers] = useState<ProductTier[]>([]);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch product
                const { data: prodData } = await supabase
                    .from('products')
                    .select('*')
                    .eq('slug', slug)
                    .eq('is_active', true)
                    .single();

                if (!prodData) {
                    router.push('/');
                    return;
                }
                setProduct(prodData);

                // Fetch tiers
                const { data: tiersData } = await supabase
                    .from('product_tiers')
                    .select('*')
                    .eq('product_id', prodData.id)
                    .eq('is_active', true)
                    .order('sort_order', { ascending: true });

                setTiers(tiersData || []);
            } catch (err) {
                console.error('Error fetching product data:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [slug, router]);

    const handleBuy = async (tier: ProductTier) => {
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
            // Redirect to login with return path
            router.push(`/?returnTo=/p/${slug}`);
            return;
        }

        const user = JSON.parse(storedUser);
        setBuying(tier.id);

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tierId: tier.id, userId: user.id })
            });
            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Erro ao iniciar o checkout');
            }
        } catch (err) {
            console.error('Checkout error:', err);
            alert('Erro de conexão ao tentar iniciar o pagamento');
        } finally {
            setBuying(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B1F3B] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="min-h-screen bg-[#0B1F3B] text-white">
            {/* Hero Section */}
            <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={product.image_url || 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=1920'}
                        alt={product.name}
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0B1F3B]/50 via-[#0B1F3B]/80 to-[#0B1F3B]"></div>
                </div>

                <div className="relative z-10 text-center px-4 max-w-4xl">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                        {product.name}
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto">
                        {product.description || 'O treinamento mais completo e intuitivo para pilotos profissionais.'}
                    </p>
                </div>
            </div>

            {/* Tiers Section */}
            <div className="max-w-7xl mx-auto px-4 py-24 -mt-32 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {tiers.map((tier) => (
                        <div
                            key={tier.id}
                            className={`flex flex-col rounded-3xl p-8 backdrop-blur-xl border border-white/10 transition-all duration-300 hover:scale-105 ${tier.name === 'Pro'
                                    ? 'bg-blue-600/20 ring-2 ring-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.2)]'
                                    : 'bg-white/5'
                                }`}
                        >
                            <div className="mb-0">
                                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-extrabold">R$ {(tier.price_cents / 100).toFixed(2)}</span>
                                    <span className="text-slate-400">/{tier.access_days} dias</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-12 flex-grow">
                                <li className="flex items-center gap-3">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <span>Acesso a todos os flashcards</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <span>Atualizações constantes</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <span>Suporte via e-mail</span>
                                </li>
                            </ul>

                            <button
                                onClick={() => handleBuy(tier)}
                                disabled={!!buying}
                                className={`w-full py-4 rounded-xl font-bold transition-all ${buying === tier.id ? 'opacity-50 cursor-not-allowed' : ''
                                    } ${tier.name === 'Pro'
                                        ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg'
                                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                                    }`}
                            >
                                {buying === tier.id ? 'Processando...' : 'Assinar Agora'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Success Message Banner */}
            {searchParams.get('cancelled') && (
                <div className="fixed bottom-8 right-8 bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-bounce">
                    Pagamento cancelado ou falhou. Tente novamente!
                </div>
            )}
        </div>
    );
}
