'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
    id: string
    name: string
    email: string
    role: string
    status?: 'active' | 'frozen' | 'banned' | 'pending'
    canEdit?: boolean
    createdAt: string
}

interface AuditLog {
    id: string
    timestamp: string
    userEmail: string
    flashcardNumero: number
    field: 'pergunta' | 'resposta'
    oldValue: string
    newValue: string
}

export default function AdminDashboard() {
    // Usar useState com inicialização correta
    const [usersList, setUsersList] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

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
                const [usersRes, auditRes] = await Promise.all([
                    fetch('/api/admin/users'),
                    fetch('/api/admin/audit')
                ])

                if (!usersRes.ok) throw new Error('Erro ao carregar usuários')
                const usersData = await usersRes.json()
                setUsersList(usersData.users)

                if (auditRes.ok) {
                    const auditData = await auditRes.json()
                    setAuditLogs(auditData.logs)
                }
            } catch (err) {
                setError('Não foi possível carregar os dados.')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [router])

    const handleUpdateEditPermission = async (email: string, canEdit: boolean) => {
        try {
            const res = await fetch('/api/admin/users/update-edit-permission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, canEdit })
            })
            const data = await res.json()
            if (res.ok) {
                setUsersList(prev => prev.map(u => u.email === email ? { ...u, canEdit } : u))
            } else {
                alert(data.error)
            }
        } catch (err) {
            console.error('Erro ao atualizar permissão:', err)
            alert('Erro de conexão.')
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

    const handleUpdateStatus = async (userId: string, newStatus: string) => {
        try {
            const res = await fetch('/api/admin/users/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, newStatus })
            })
            if (!res.ok) throw new Error()

            // update local state
            setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus as any } : u))
        } catch (err) {
            alert('Erro ao atualizar o status do usuário.')
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Tem certeza que deseja BANIR COMPLETAMENTE/EXCLUIR a conta deste usuário? Esta ação é irreversível.')) return

        try {
            const res = await fetch('/api/admin/users/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            })
            if (!res.ok) throw new Error()

            setUsersList(prev => prev.filter(u => u.id !== userId))
        } catch (err) {
            alert('Erro ao excluir o usuário.')
        }
    }

    const handleRevertLog = async (logId: string) => {
        if (!confirm('Reverter o flashcard para o valor anterior dessa modificação? Isso será registrado como uma nova ação pelo Sistema.')) return

        try {
            const res = await fetch('/api/admin/audit/revert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ logId })
            })
            if (!res.ok) throw new Error()

            alert('Modificação revertida com sucesso!')
            window.location.reload()
        } catch (err) {
            alert('Erro ao reverter.')
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
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 text-xs uppercase tracking-wider">
                                            <th className="p-4 font-semibold border-b border-slate-100 dark:border-slate-800">Tripulante</th>
                                            <th className="p-4 font-semibold border-b border-slate-100 dark:border-slate-800">Usuário / Email</th>
                                            <th className="p-4 font-semibold border-b border-slate-100 dark:border-slate-800">Cadastro</th>
                                            <th className="p-4 font-semibold border-b border-slate-100 dark:border-slate-800">Status</th>
                                            <th className="p-4 font-semibold border-b border-slate-100 dark:border-slate-800">Edição de Cards</th>
                                            <th className="p-4 font-semibold border-b border-slate-100 dark:border-slate-800">Perfil / Role</th>
                                            <th className="p-4 font-semibold border-b border-slate-100 dark:border-slate-800">Ações</th>
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
                                                    {new Date(user.createdAt).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                                </td>
                                                <td className="p-4">
                                                    {user.role === 'admin' ? (
                                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-600 border border-green-100 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800">
                                                            Aprovado
                                                        </span>
                                                    ) : (
                                                        <select
                                                            value={user.status || 'pending'}
                                                            onChange={(e) => handleUpdateStatus(user.id, e.target.value)}
                                                            className={`text-xs font-bold rounded-full px-3 py-1 outline-none cursor-pointer border ${user.status === 'active' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800' :
                                                                user.status === 'frozen' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-800' :
                                                                    user.status === 'banned' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800' :
                                                                        'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                                                }`}
                                                        >
                                                            <option value="pending" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Pendente</option>
                                                            <option value="active" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Liberado</option>
                                                            <option value="frozen" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Congelado</option>
                                                            <option value="banned" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Banido</option>
                                                        </select>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    {user.role === 'admin' ? (
                                                        <span className="text-slate-400 text-xs italic font-medium">Ilimitada</span>
                                                    ) : (
                                                        <label className="flex items-center space-x-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="form-checkbox h-4 w-4 text-emerald-500 dark:text-emerald-400 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer"
                                                                checked={user.canEdit || false}
                                                                onChange={(e) => handleUpdateEditPermission(user.email, e.target.checked)}
                                                            />
                                                            <span className="text-slate-600 dark:text-slate-400 text-xs font-semibold select-none">Permitir Edição</span>
                                                        </label>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${user.role === 'admin'
                                                        ? 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/40 dark:text-purple-400 dark:border-purple-800'
                                                        : 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800'
                                                        }`}>
                                                        {user.role === 'admin' ? 'Administrador' : 'Aluno'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    {user.role !== 'admin' && (
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 font-bold p-2 transition-colors"
                                                            title="Excluir Usuário"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {usersList.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-slate-500">
                                                    Ninguém se cadastrou ainda.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                        </div>

                        {/* Seção de Auditoria */}
                        <div className="bg-white dark:bg-slate-950 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden mt-8">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                        Auditoria de Flashcards ({auditLogs.length})
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">Veja quem alterou o que nos cartões e reverta se precisar.</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 text-xs uppercase tracking-wider">
                                            <th className="p-4 font-semibold border-b border-slate-100 dark:border-slate-800">Card #</th>
                                            <th className="p-4 font-semibold border-b border-slate-100 dark:border-slate-800">Usuário</th>
                                            <th className="p-4 font-semibold border-b border-slate-100 dark:border-slate-800">Campo Alterado</th>
                                            <th className="p-4 font-semibold border-b border-slate-100 dark:border-slate-800">Modificação (Antes ➔ Depois)</th>
                                            <th className="p-4 font-semibold border-b border-slate-100 dark:border-slate-800">Data</th>
                                            <th className="p-4 font-semibold border-b border-slate-100 dark:border-slate-800">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                        {auditLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition">
                                                <td className="p-4 font-bold text-slate-900 dark:text-slate-200">
                                                    #{log.flashcardNumero}
                                                </td>
                                                <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    {log.userEmail}
                                                </td>
                                                <td className="p-4 text-sm text-slate-600 dark:text-slate-400 capitalize">
                                                    {log.field}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1 text-xs">
                                                        <div className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 p-2 rounded line-clamp-2" title={log.oldValue}>
                                                            <span className="font-bold mr-1">-</span> {log.oldValue}
                                                        </div>
                                                        <div className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 p-2 rounded line-clamp-2" title={log.newValue}>
                                                            <span className="font-bold mr-1">+</span> {log.newValue}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-600 dark:text-slate-400 text-xs">
                                                    {new Date(log.timestamp).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="p-4">
                                                    {log.userEmail !== 'SISTEMA (Administrador reverteu)' && (
                                                        <button
                                                            onClick={() => handleRevertLog(log.id)}
                                                            className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                                                        >
                                                            Reverter
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {auditLogs.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-slate-500">
                                                    Nenhum card foi modificado.
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
                <p>v1.0.4</p>
            </div>
        </div>
    )
}
