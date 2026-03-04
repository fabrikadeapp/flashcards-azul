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
                    fetch('/api/admin/users?t=' + Date.now(), { method: 'POST' }),
                    fetch('/api/admin/audit?t=' + Date.now())
                ])

                if (!usersRes.ok) {
                    const data = await usersRes.json();
                    throw new Error(data.error || 'Erro ao carregar usuários');
                }
                if (!auditRes.ok) {
                    const data = await auditRes.json();
                    throw new Error(data.error || 'Erro ao carregar auditoria');
                }

                const usersData = await usersRes.json();
                const auditData = await auditRes.json();

                setUsersList(usersData.users || [])
                setAuditLogs(auditData.logs || [])
            } catch (err: any) {
                console.error('Fetch error:', err);
                setError(err.message || 'Não foi possível carregar os dados.')
            } finally {
                setLoading(false)
            }
        }

        const fetchManually = async () => {
            setLoading(true)
            await fetchData()
        }

        fetchData()
        const interval = setInterval(fetchData, 30000) // Auto refresh every 30s
        return () => clearInterval(interval)
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

    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
    const [pendingStatus, setPendingStatus] = useState<Record<string, string>>({})

    const handleUpdateStatus = async (userId: string) => {
        const newStatus = pendingStatus[userId]
        if (!newStatus) return

        setUpdatingStatus(userId)
        try {
            console.log(`[Diagnostic] Attempting status update for ${userId} to ${newStatus}`)
            const res = await fetch('/api/admin/users/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, newStatus, timestamp: new Date().toISOString() })
            })

            const data = await res.json()

            if (!res.ok) {
                console.error('[Diagnostic] Update status failed:', data)
                throw new Error(data.error || 'Erro ao comunicar com o servidor')
            }

            console.log(`[Diagnostic] Update status success for ${userId}:`, data)

            // update local state
            setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus as any } : u))

            // Clear pending
            setPendingStatus(prev => {
                const updated = { ...prev }
                delete updated[userId]
                return updated
            })

            alert(`✅ Status atualizado com sucesso para: ${newStatus}\n\nO sistema confirmou a gravação no banco de dados.`)
        } catch (err: any) {
            console.error('[Diagnostic] Persistence error:', err)
            alert('❌ FALHA CRÍTICA AO SALVAR:\n' + (err.message || 'Erro desconhecido. Verifique a conexão com o banco.'))
        } finally {
            setUpdatingStatus(null)
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Tem certeza que deseja excluir o cadastro deste usuário? Ele poderá se cadastrar novamente no futuro usando os mesmos dados.')) return

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

                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push('/admin/commerce')}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md font-bold"
                        >
                            💰 Gerenciar Loja
                        </button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition shadow-sm font-medium"
                        >
                            ← Voltar para Flashcards
                        </button>
                    </div>
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
                                <button
                                    onClick={() => window.location.reload()}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-bold rounded-xl border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                                    Sincronizar Dados
                                </button>
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
                                                        <div className="flex items-center gap-2">
                                                            <div className="relative">
                                                                <select
                                                                    value={pendingStatus[user.id] || user.status || 'pending'}
                                                                    disabled={updatingStatus === user.id}
                                                                    onChange={(e) => setPendingStatus(prev => ({ ...prev, [user.id]: e.target.value }))}
                                                                    className={`text-xs font-bold rounded-full px-3 py-1 outline-none cursor-pointer border pr-8 transition-all appearance-none ${(pendingStatus[user.id] || user.status) === 'active' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800' :
                                                                        (pendingStatus[user.id] || user.status) === 'frozen' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-800' :
                                                                            (pendingStatus[user.id] || user.status) === 'banned' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800' :
                                                                                'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                                                        } ${pendingStatus[user.id] ? 'ring-2 ring-blue-500/50' : ''}`}
                                                                >
                                                                    <option value="pending" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Pendente</option>
                                                                    <option value="active" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Liberado</option>
                                                                    <option value="frozen" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Congelado</option>
                                                                    <option value="banned" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Banido</option>
                                                                </select>
                                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                                                                </div>
                                                            </div>

                                                            {pendingStatus[user.id] && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(user.id)}
                                                                    disabled={updatingStatus === user.id}
                                                                    className="flex items-center justify-center h-7 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold shadow-lg transition-all animate-pulse"
                                                                >
                                                                    {updatingStatus === user.id ? (
                                                                        <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                                                                    ) : (
                                                                        'SALVAR'
                                                                    )}
                                                                </button>
                                                            )}

                                                            {updatingStatus === user.id && (
                                                                <span className="text-[10px] font-bold text-blue-500 animate-pulse">Gravando...</span>
                                                            )}
                                                        </div>
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

                        {/* Resgate Card */}
                        <a href="/admin/direct-fix" className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-blue-500 transition-all">
                            <div className="flex items-start justify-between relative z-10">
                                <div>
                                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Utilidade</p>
                                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Resgate Crítico</h3>
                                    <p className="text-xs text-zinc-400">Ative usuários por e-mail manualmente em segundos.</p>
                                </div>
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-2xl">
                                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                                </div>
                            </div>
                        </a>

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
