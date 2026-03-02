'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types/commerce';
import { FLAGS } from '@/lib/flags';
import LegacyLanding from '@/components/LandingPage/LegacyLanding';

export default function RootPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        // Handle Auth State
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            setUser(JSON.parse(stored));
        }

        if (!FLAGS.ENABLE_PRODUCT_STORE) {
            setLoading(false);
            return;
        }

        async function fetchProducts() {
            try {
                const { data } = await supabase
                    .from('products')
                    .select('*')
                    .eq('is_active', true)
                    .order('created_at', { ascending: true });

                setProducts(data || []);
            } catch (err) {
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    // If flag is OFF, show legacy landing (Login)
    if (!FLAGS.ENABLE_PRODUCT_STORE) {
        return <LegacyLanding />;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B1F3B] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1F3B] font-sans">
            {/* Navbar */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-white/5 backdrop-blur-md border-b border-white/10 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white tracking-tighter">
                        Mentor<span className="text-blue-500">Pilot</span>
                    </h1>
                    <div className="flex gap-4 items-center">
                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <button
                                        onClick={() => router.push('/admin')}
                                        className="text-blue-400 hover:text-blue-300 transition-colors font-medium border border-blue-400/20 px-4 py-1.5 rounded-lg"
                                    >
                                        ⚙️ Admin
                                    </button>
                                )}
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold transition-all"
                                >
                                    Meu Painel
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => {
                                    // When they want to login, we temporarily disable the flag for them 
                                    // or redirect to a specific login route.
                                    // Let's create a /login route that forcedly shows LegacyLanding
                                    router.push('/login');
                                }}
                                className="text-white/70 hover:text-white transition-colors font-medium"
                            >
                                Entrar
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <header className="pt-32 pb-20 px-6 text-center">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
                    Eleve seu <span className="text-blue-500">Conhecimento</span> Aeronáutico
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                    Treinamentos baseados em flashcards inteligentes para pilotos de alta performance.
                    Escolha sua aeronave e comece agora.
                </p>
            </header>

            {/* Product Grid */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => router.push(`/p/${product.slug}`)}
                            className="group relative bg-white dark:bg-white/5 rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 hover:border-blue-500/50 transition-all cursor-pointer hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                        >
                            <div className="aspect-[4/3] overflow-hidden">
                                <img
                                    src={product.image_url || 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=800'}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                    {product.name}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                    {product.description || 'Flashcards especializados para treinamento.'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 text-center mt-20">
                <div className="text-slate-500 text-sm">
                    © {new Date().getFullYear()} Mentor Pilot • Produzido por Fabrika de App
                </div>
            </footer>
        </div>
    );
}
