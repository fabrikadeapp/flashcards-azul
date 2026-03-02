'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Flashcard } from '@/lib/supabase';
import { Product } from '@/lib/types/commerce';

export default function MappingPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function init() {
            setLoading(true);
            const { data: prodData } = await supabase.from('products').select('*');
            setProducts(prodData || []);

            const { data: cardData } = await supabase
                .from('flashcards')
                .select('*')
                .order('numero', { ascending: true });
            setCards(cardData || []);
            setLoading(false);
        }
        init();
    }, []);

    useEffect(() => {
        if (!selectedProduct) {
            setSelectedCardIds(new Set());
            return;
        }

        async function fetchAssociations() {
            const res = await fetch(`/api/admin/products/associate-cards?productId=${selectedProduct}`);
            const data = await res.json();
            setSelectedCardIds(new Set(data.flashcardIds || []));
        }
        fetchAssociations();
    }, [selectedProduct]);

    const handleToggle = (id: string | undefined) => {
        if (!id) return;
        const next = new Set(selectedCardIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedCardIds(next);
    };

    const handleSave = async () => {
        if (!selectedProduct) return;
        setSaving(true);
        try {
            const res = await fetch('/api/admin/products/associate-cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: selectedProduct,
                    flashcardIds: Array.from(selectedCardIds)
                })
            });
            if (res.ok) alert('Vínculos salvos com sucesso!');
        } catch (err) {
            alert('Erro ao salvar vínculos');
        } finally {
            setSaving(false);
        }
    };

    const filteredCards = cards.filter(c =>
        c.pergunta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.modulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.numero.toString().includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <h1 className="text-3xl font-bold dark:text-white">Vincular Flashcards</h1>
                    <button onClick={() => router.push('/admin/commerce')} className="text-slate-500">Voltar</button>
                </header>

                <div className="bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row gap-8 mb-8">
                        <div className="flex-1">
                            <label className="block text-sm font-bold mb-2 dark:text-white">Selecione o Produto (Aeronave)</label>
                            <select
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className="w-full p-4 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            >
                                <option value="">Escolha um produto...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-bold mb-2 dark:text-white">Filtrar Cards</label>
                            <input
                                type="text"
                                placeholder="Busque por pergunta, módulo ou número..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-4 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="h-[500px] overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl mb-8">
                        <table className="w-full">
                            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10">
                                <tr className="text-left text-xs uppercase text-slate-500">
                                    <th className="p-4">Vincular</th>
                                    <th className="p-4">#</th>
                                    <th className="p-4">Módulo</th>
                                    <th className="p-4">Pergunta</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredCards.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedCardIds.has(c.id!)}
                                                onChange={() => handleToggle(c.id)}
                                                className="w-5 h-5 rounded cursor-pointer"
                                            />
                                        </td>
                                        <td className="p-4 font-bold dark:text-white">#{c.numero}</td>
                                        <td className="p-4 text-xs text-slate-500">{c.modulo}</td>
                                        <td className="p-4 text-sm dark:text-slate-300 line-clamp-1">{c.pergunta}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center">
                        <p className="text-sm text-slate-500">
                            {selectedCardIds.size} cards selecionados para este produto.
                        </p>
                        <button
                            onClick={handleSave}
                            disabled={!selectedProduct || saving}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-2xl font-bold disabled:opacity-50 transition-all"
                        >
                            {saving ? 'Salvando...' : 'Salvar Associação'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
