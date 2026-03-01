'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)

        try {
            if (isLogin) {
                // Fluxo de Login
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                })
                const data = await res.json()

                if (!res.ok) throw new Error(data.error)

                localStorage.setItem('currentUser', JSON.stringify(data.user))

                if (data.user.role === 'admin') {
                    router.push('/admin')
                } else {
                    router.push('/dashboard')
                }
            } else {
                // Fluxo de Cadastro
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password }),
                })
                const data = await res.json()

                if (!res.ok) throw new Error(data.error)

                setMessage('Cadastro realizado com sucesso! Faça seu login.')
                setIsLogin(true)
                setPassword('')
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao processar sua requisição.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0B1F3B] flex flex-col items-center justify-center font-sans overflow-hidden py-12 px-4 sm:px-6 lg:px-8 relative">

            {/* Background Orbs / Glows */}
            <div className="absolute top-0 -left-64 w-96 h-96 bg-[#1E63FF] rounded-full mix-blend-screen filter blur-[150px] opacity-30"></div>
            <div className="absolute bottom-0 -right-64 w-96 h-96 bg-[#F5B942] rounded-full mix-blend-screen filter blur-[150px] opacity-20"></div>

            {/* Main Container */}
            <div className="z-10 w-full max-w-md">

                {/* Header Branding */}
                <div className="text-center mb-10 group relative" onDoubleClick={() => router.push('/admin')}>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-[#FFFFFF] tracking-tight hover:scale-105 transition-transform duration-500 cursor-default">
                        Mentor <span className="text-[#1E63FF]">Pilot</span>
                    </h1>
                    <p className="mt-3 text-[#F5B942] tracking-wide text-sm font-medium uppercase">
                        Treinamento Operacional A320
                    </p>
                </div>

                {/* Auth Apple Glass Card */}
                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/10 relative overflow-hidden">

                    {/* Subtle top edge glow */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#1E63FF]/50 to-transparent"></div>

                    {/* Toggle Tabs */}
                    <div className="flex bg-black/20 p-1.5 rounded-2xl mb-8 relative">
                        <button
                            onClick={() => { setIsLogin(true); setError(''); setMessage(''); }}
                            className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 z-10 ${isLogin ? 'text-[#0B1F3B] bg-[#FFFFFF] shadow-md' : 'text-white/60 hover:text-white'
                                }`}
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setError(''); setMessage(''); }}
                            className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 z-10 ${!isLogin ? 'text-[#0B1F3B] bg-[#FFFFFF] shadow-md' : 'text-white/60 hover:text-white'
                                }`}
                        >
                            Criar Conta
                        </button>
                    </div>

                    {/* Feedback Messages */}
                    <div className="h-6 mb-4 flex items-center justify-center">
                        {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
                        {message && isLogin && <p className="text-[#F5B942] text-sm font-medium">{message}</p>}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="group">
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nome do Tripulante"
                                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#1E63FF]/50 focus:border-transparent transition-all backdrop-blur-sm"
                                />
                            </div>
                        )}

                        <div className="group">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="E-mail (Seu Usuário)"
                                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#1E63FF]/50 focus:border-transparent transition-all backdrop-blur-sm"
                            />
                        </div>

                        <div className="group">
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Senha de Acesso"
                                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#1E63FF]/50 focus:border-transparent transition-all backdrop-blur-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1E63FF] hover:bg-[#1E63FF]/90 text-white font-bold rounded-2xl py-4 mt-6 shadow-[0_0_20px_rgba(30,99,255,0.3)] hover:shadow-[0_0_30px_rgba(30,99,255,0.5)] transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Autenticando...' : isLogin ? 'Acessar Treinamento' : 'Finalizar Inscrição'}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center mt-12 text-white/30 text-xs font-medium tracking-wide">
                    <p>PRODUZIDO POR <span className="text-white/60">FABRIKA DE APP</span></p>
                    <p className="mt-1">© {new Date().getFullYear()} Todos os direitos reservados</p>
                </div>

            </div>
        </div>
    )
}
