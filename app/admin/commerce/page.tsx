'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CommerceAdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });

    useEffect(() => {
        const stored = localStorage.getItem('currentUser');
        if (!stored || JSON.parse(stored).role !== 'admin') {
            router.push('/');
            return;
        }
    }, [router]);

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
                        className="bg-white dark:bg-slate-800 px-6 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white"
                    >
                        ← Voltar ao Admin Principal
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Products Manager */}
                    <div
                        onClick={() => router.push('/admin/commerce/products')}
                        className="bg-white dark:bg-slate-950 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-blue-500 transition-all group"
                    >
                        <div className="text-3xl mb-4">📦</div>
                        <h2 className="text-xl font-bold dark:text-white group-hover:text-blue-500 transition-colors">Produtos & Tiers</h2>
                        <p className="text-slate-500 text-sm mt-2">Crie aeronaves e configure os planos de preços.</p>
                    </div>

                    {/* Orders Manager */}
                    <div
                        onClick={() => router.push('/admin/commerce/orders')}
                        className="bg-white dark:bg-slate-950 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-blue-500 transition-all group"
                    >
                        <div className="text-3xl mb-4">💰</div>
                        <h2 className="text-xl font-bold dark:text-white group-hover:text-blue-500 transition-colors">Vendas & Pedidos</h2>
                        <p className="text-slate-500 text-sm mt-2">Veja o histórico de transações e status do Stripe.</p>
                    </div>

                    {/* Flashcard Mapper */}
                    <div
                        onClick={() => router.push('/admin/commerce/mapping')}
                        className="bg-white dark:bg-slate-950 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-blue-500 transition-all group"
                    >
                        <div className="text-3xl mb-4">🗺️</div>
                        <h2 className="text-xl font-bold dark:text-white group-hover:text-blue-500 transition-colors">Vincular Flashcards</h2>
                        <p className="text-slate-500 text-sm mt-2">Associe cartões publicas às aeronaves específicas.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
