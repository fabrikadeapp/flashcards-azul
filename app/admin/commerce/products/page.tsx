'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product, ProductTier } from '@/lib/types/commerce';

export default function ProductsAdminPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [editingTiers, setEditingTiers] = useState<ProductTier[]>([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        setLoading(true);
        const res = await fetch('/api/admin/products');
        const data = await res.json();
        setProducts(data.products || []);
        setLoading(false);
    }

    const handleEditProduct = async (product: Product) => {
        setEditingProduct(product);
        // Fetch tiers for this product
        const res = await fetch(`/api/admin/tiers?productId=${product.id}`);
        const data = await res.json();
        setEditingTiers(data.tiers || []);
    };

    const handleSaveProduct = async () => {
        if (!editingProduct) return;
        const method = editingProduct.id ? 'PUT' : 'POST';
        const res = await fetch('/api/admin/products', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingProduct)
        });
        if (res.ok) {
            setEditingProduct(null);
            fetchProducts();
        } else {
            const data = await res.json();
            alert(data.error);
        }
    };

    const handleToggleStatus = async (product: Product) => {
        await fetch('/api/admin/products', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: product.id, is_active: !product.is_active })
        });
        fetchProducts();
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <h1 className="text-3xl font-bold dark:text-white">Gerenciar Produtos</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setEditingProduct({ name: '', slug: '', description: '', is_active: true })}
                            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold"
                        >
                            + Novo Produto
                        </button>
                        <button onClick={() => router.push('/admin/commerce')} className="text-slate-500">Voltar</button>
                    </div>
                </header>

                {editingProduct ? (
                    <div className="bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 mb-12">
                        <h2 className="text-xl font-bold mb-6 dark:text-white">
                            {editingProduct.id ? 'Editar Produto' : 'Novo Produto'}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="block text-sm font-bold mb-2 dark:text-slate-400">Nome</label>
                                <input
                                    type="text"
                                    value={editingProduct.name || ''}
                                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                    className="w-full p-4 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 dark:text-slate-400">Slug (URL)</label>
                                <input
                                    type="text"
                                    value={editingProduct.slug || ''}
                                    onChange={e => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                                    className="w-full p-4 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold mb-2 dark:text-slate-400">Descrição</label>
                                <textarea
                                    value={editingProduct.description || ''}
                                    onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                    className="w-full p-4 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-white h-32"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold mb-2 dark:text-slate-400">Imagem URL</label>
                                <input
                                    type="text"
                                    value={editingProduct.image_url || ''}
                                    onChange={e => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                                    className="w-full p-4 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button onClick={() => setEditingProduct(null)} className="px-6 py-2 text-slate-500">Cancelar</button>
                            <button onClick={handleSaveProduct} className="bg-blue-600 text-white px-8 py-2 rounded-xl font-bold">Salvar Produto</button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {products.map(p => (
                            <div key={p.id} className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
                                <div className="flex items-center gap-6">
                                    <img src={p.image_url || ''} className="w-16 h-16 rounded-2xl object-cover bg-slate-100" alt="" />
                                    <div>
                                        <h3 className="text-xl font-bold dark:text-white">{p.name}</h3>
                                        <p className="text-sm text-slate-500">/p/{p.slug}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {p.is_active ? 'Ativo' : 'Inativo'}
                                    </span>
                                    <button onClick={() => handleEditProduct(p)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">✏️</button>
                                    <button onClick={() => handleToggleStatus(p)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                        {p.is_active ? '🚫' : '✅'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
