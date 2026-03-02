'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CheckoutSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    return (
        <div className="min-h-screen bg-[#0B1F3B] flex items-center justify-center text-white p-6">
            <div className="max-w-md w-full bg-white/5 backdrop-blur-3xl rounded-3xl p-12 text-center border border-white/10 shadow-2xl">
                <div className="text-6xl mb-8 animate-bounce">✈️</div>
                <h1 className="text-3xl font-bold mb-4">Pagamento Confirmado!</h1>
                <p className="text-slate-400 mb-10">
                    Seu acesso foi liberado. O sistema está processando sua ativação e em alguns instantes você poderá acessar seus cartões.
                </p>
                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => router.push('/app')}
                        className="bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                    >
                        Ver Meus Treinamentos
                    </button>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="bg-white/10 hover:bg-white/20 py-4 rounded-2xl font-semibold transition-all"
                    >
                        Voltar ao Dashboard Antigo
                    </button>
                </div>
                {sessionId && (
                    <p className="mt-8 text-[10px] text-slate-600 font-mono">
                        Session: {sessionId}
                    </p>
                )}
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0B1F3B] flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        }>
            <CheckoutSuccessContent />
        </Suspense>
    );
}
