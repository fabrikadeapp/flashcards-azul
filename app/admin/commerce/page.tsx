'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CommerceAdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('currentUser');
        if (!stored) {
            console.log('Commerce Admin: No session found, redirecting to login');
            router.push('/login');
            return;
        }

        try {
            const user = JSON.parse(stored);
            if (user.role !== 'admin') {
                console.log('Commerce Admin: User is not admin, role found:', user.role);
                router.push('/dashboard');
                return;
            }
            setLoading(false);
        } catch (e) {
            console.error('Commerce Admin: Error parsing session', e);
            router.push('/login');
        }
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-bold dark:text-white">Gerenciamento Comercial</h1>
                        <p className="text-slate-500">Produtos, Assinaturas e Vendas</p>
                    </div>
                    <button
                        onClick={() => router.push('/admin')}
                        className="bg-white dark:bg-slate-800 px-6 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                    >
                        ← Voltar ao Admin Principal
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Products Manager */}
                    <div
                        onClick={() => router.push('/admin/commerce/products')}
                        className="bg-white dark:bg-slate-950 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-blue-500 transition-all group hover:shadow-xl dark:hover:shadow-blue-500/5"
                    >
                        <div className="text-4xl mb-6">📦</div>
                        <h2 className="text-xl font-bold dark:text-white group-hover:text-blue-500 transition-colors">Produtos & Tiers</h2>
                        <p className="text-slate-500 text-sm mt-3 leading-relaxed">Crie aeronaves e configure os planos de preços (mensal, anual, etc).</p>
                    </div>

                    {/* Orders Manager */}
                    <div
                        onClick={() => router.push('/admin/commerce/orders')}
                        className="bg-white dark:bg-slate-950 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-blue-500 transition-all group hover:shadow-xl dark:hover:shadow-blue-500/5"
                    >
                        <div className="text-4xl mb-6">💰</div>
                        <h2 className="text-xl font-bold dark:text-white group-hover:text-blue-500 transition-colors">Vendas & Pedidos</h2>
                        <p className="text-slate-500 text-sm mt-3 leading-relaxed">Acompanhe transações reais e status de confirmação do Stripe.</p>
                    </div>

                    {/* Flashcard Mapper */}
                    <div
                        onClick={() => router.push('/admin/commerce/mapping')}
                        className="bg-white dark:bg-slate-950 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-blue-500 transition-all group hover:shadow-xl dark:hover:shadow-blue-500/5"
                    >
                        <div className="text-4xl mb-6">🗺️</div>
                        <h2 className="text-xl font-bold dark:text-white group-hover:text-blue-500 transition-colors">Vincular Flashcards</h2>
                        <p className="text-slate-500 text-sm mt-3 leading-relaxed">Defina quais cartões públicos pertencem a cada produto/aeronave.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
