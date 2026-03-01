'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
    id: string
    name: string
    email: string
    role: string
    createdAt: string
}

export default function AdminDashboard() {
    // Usar useState com inicialização correta
    const [usersList, setUsersList] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        // Basic frontend auth check (to protect the route minimally)
        const stored = localStorage.getItem('currentUser')
        if (!stored) {
            router.push('/')
            return
        }

        try {
            const user = JSON.parse(stored)
            if (user.role !== 'admin') {
                router.push('/dashboard')
                return
            }
        } catch {
            router.push('/')
            return
        }

        // Fetch users if passed the auth check
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/admin/users')
                if (!res.ok) throw new Error('Erro ao carregar dados')
                const data = await res.json()
                setUsersList(data.users)
            } catch (err) {
                setError('Não foi possível carregar a lista de usuários.')
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [router])

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">Carregando painel restrito...</div>

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <span className="bg-red-500/10 text-red-600 p-2 rounded-lg">🛡️</span>
                            Painel Administrativo
                        </h1>
                        <p className="text-slate-500 mt-2">Visão geral de todos os tripulantes cadastrados no sistema.</p>
                    </div>

                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition shadow-sm font-medium"
                    >
                        ← Voltar para Flashcards
                    </button>
                </div>

                {error ? (
                    <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 mb-8 font-medium">
                        {error}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-950 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">

                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                Usuários Cadastrados ({usersList.length})
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 text-xs uppercase tracking-wider">
                                        <th className="p-4 font-semibold border-b border-slate-100 dark:border-slate-800">Tripulante</th>
                                        <th className="p-4 font-semibold border-b border-slate-100 dark:border-slate-800">Usuário / Email</th>
                                        <th className="p-4 font-semibold border-b border-slate-100 dark:border-slate-800">Data de Cadastro</th>
                                        <th className="p-4 font-semibold border-b border-slate-100 dark:border-slate-800">Perfil / Role</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {usersList.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition">
                                            <td className="p-4">
                                                <div className="font-medium text-slate-900 dark:text-slate-200">{user.name}</div>
                                            </td>
                                            <td className="p-4 text-slate-600 dark:text-slate-400">
                                                {user.email}
                                            </td>
                                            <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">
                                                {new Date(user.createdAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${user.role === 'admin'
                                                    ? 'bg-red-50 text-red-600 border-red-100'
                                                    : 'bg-blue-50 text-blue-600 border-blue-100'
                                                    }`}>
                                                    {user.role === 'admin' ? 'Administrador' : 'Comum'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {usersList.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-slate-500">
                                                Ninguém se cadastrou ainda.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                )}
            </div>
        </div>
    )
}
