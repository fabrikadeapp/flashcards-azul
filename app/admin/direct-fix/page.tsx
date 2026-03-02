'use client'

import { useState } from 'react'

export default function DirectFixPage() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState('active')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const handleFix = async () => {
        if (!email) return alert('Email é obrigatório')
        setLoading(true)
        setResult(null)
        try {
            const res = await fetch('/api/admin/users/direct-fix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, status })
            })
            const data = await res.json()
            setResult(data)
        } catch (err: any) {
            setResult({ error: err.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 font-sans">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Ferramenta de Resgate de Usuário</h1>
                <p className="text-zinc-500 mb-8">Force a ativação de um usuário ignorando caches e interface padrão.</p>

                <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">E-mail do Usuário</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                                placeholder="ex: usuario@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Novo Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                            >
                                <option value="active">Active (Acesso Total)</option>
                                <option value="pending">Pending</option>
                                <option value="frozen">Frozen</option>
                                <option value="banned">Banned</option>
                            </select>
                        </div>

                        <button
                            onClick={handleFix}
                            disabled={loading}
                            className={`w-full p-4 rounded-xl font-bold transition-all ${loading ? 'bg-zinc-400' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'}`}
                        >
                            {loading ? 'Processando...' : 'FORÇAR ATUALIZAÇÃO'}
                        </button>
                    </div>

                    {result && (
                        <div className="mt-8 p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-auto max-h-64">
                            <h4 className="font-bold mb-2">Resultado do Servidor:</h4>
                            <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
