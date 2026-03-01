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
    const [allowEditing, setAllowEditing] = useState(false)

    // Novo Estado para trocar senha
    const [currentUserEmail, setCurrentUserEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [passwordMessage, setPasswordMessage] = useState('')
    const [isChangingPassword, setIsChangingPassword] = useState(false)

    const router = useRouter()

    useEffect(() => {
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
            setCurrentUserEmail(user.email)
        } catch {
            router.push('/')
            return
        }

        const fetchData = async () => {
            try {
                const [usersRes, settingsRes] = await Promise.all([
                    fetch('/api/admin/users'),
                    fetch('/api/admin/settings')
                ])

                if (!usersRes.ok) throw new Error('Erro ao carregar usuários')
                const usersData = await usersRes.json()
                setUsersList(usersData.users)

                if (settingsRes.ok) {
                    const settingsData = await settingsRes.json()
                    setAllowEditing(settingsData.settings.allowFlashcardEditing)
                }
            } catch (err) {
                setError('Não foi possível carregar os dados.')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [router])

    const toggleEditing = async () => {
        const newValue = !allowEditing
        setAllowEditing(newValue)
        try {
            await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ allowFlashcardEditing: newValue })
            })
        } catch (err) {
            console.error('Failed to update editing setting')
            setAllowEditing(!newValue) // rollback on error
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newPassword || newPassword.length < 4) {
            setPasswordMessage('A senha precisa ter pelo menos 4 caracteres.')
            return
        }
        setIsChangingPassword(true)
        setPasswordMessage('')

        try {
            const res = await fetch('/api/admin/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentEmail: currentUserEmail, newPassword })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            setPasswordMessage('Senha alterada com sucesso!')
            setNewPassword('')
        } catch (err: any) {
            setPasswordMessage(err.message || 'Erro ao alterar a senha.')
        } finally {
            setIsChangingPassword(false)
        }
    }

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
                    <div className="flex flex-col gap-8">
                        {/* Seção Alterar Senha de Admin */}
                        <div className="bg-white dark:bg-slate-950 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-6 md:p-8">
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                Minhas Configurações
                            </h2>
                            <form onSubmit={handleChangePassword} className="flex flex-col sm:flex-row items-center gap-4 max-w-xl">
                                <input
                                    type="password"
                                    required
                                    placeholder="Nova senha do Administrador..."
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                />
                                <button
                                    type="submit"
                                    disabled={isChangingPassword}
                                    className="w-full sm:w-auto whitespace-nowrap px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-white transition-colors disabled:opacity-50"
                                >
                                    {isChangingPassword ? 'Salvando...' : 'Atualizar Senha'}
                                </button>
                            </form>
                            {passwordMessage && (
                                <p className={`mt-3 text-sm font-medium ${passwordMessage.includes('sucesso') ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                    {passwordMessage}
                                </p>
                            )}
                        </div>

                        {/* Seção da Tabela */}
                        <div className="bg-white dark:bg-slate-950 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">

                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                    Usuários Cadastrados ({usersList.length})
                                </h2>
                                <div className="flex items-center gap-3 bg-white dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <span className={`text-sm font-medium ${allowEditing ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
                                        Edição de Flashcards
                                    </span>
                                    <button
                                        onClick={toggleEditing}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${allowEditing ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${allowEditing ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
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
                    </div>
                )}
            </div>
            <div className="text-center mt-12 text-slate-400 dark:text-slate-600 text-xs font-medium tracking-wide">
                <p>v1.0.2</p>
            </div>
        </div>
    )
}
