'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Order } from '@/lib/types/commerce';

export default function OrdersAdminPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrders() {
            const res = await fetch('/api/admin/orders');
            const data = await res.json();
            setOrders(data.orders || []);
            setLoading(false);
        }
        fetchOrders();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
            case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400';
            case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-400';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <h1 className="text-3xl font-bold dark:text-white">Vendas & Pedidos</h1>
                    <button onClick={() => router.push('/admin/commerce')} className="text-slate-500">Voltar</button>
                </header>

                <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Usuário</th>
                                <th className="p-4">Produto</th>
                                <th className="p-4">Valor</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Data</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {orders.map(order => (
                                <tr key={order.id} className="text-sm dark:text-slate-300">
                                    <td className="p-4 font-mono text-[10px]">{order.id.slice(0, 8)}...</td>
                                    <td className="p-4">{order.user_id}</td>
                                    <td className="p-4">{order.product_id}</td>
                                    <td className="p-4 font-bold">R$ {(order.amount_cents! / 100).toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-500">
                                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && !loading && (
                                <tr><td colSpan={6} className="p-12 text-center text-slate-500">Nenhum pedido encontrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
