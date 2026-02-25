# 🚀 Setup Simples - JSON Local (SEM CUSTOS)

**Este é o setup mais simples possível!** Sem backend, sem variáveis de ambiente, sem custos.

---

## ⚡ Quick Start (2 MINUTOS)

### 1. Instalar dependências

```bash
cd /Users/gustavoholderbaumvieira/Desktop/code/flashcards-azul
npm install
```

### 2. Rodar localmente

```bash
npm run dev
```

### 3. Abrir no navegador

```
http://localhost:3000
```

**PRONTO!** 🎉 Flashcards funcionando! ✈️

---

## 📋 **Como Funciona?**

```
Arquitetura Simples:

Browser
  ↓
Next.js App (npm run dev)
  ↓
Carrega public/flashcards.json
  ↓
React renderiza no cliente
  ↓
LocalStorage salva progresso
```

**Sem backend. Sem servidor. Sem custos.** 💰

---

## 📂 **Arquivos Importantes**

```
public/flashcards.json
  └─ Todos os 600 flashcards em JSON

app/page.tsx
  └─ Carrega JSON na primeira vez

components/FlashcardViewer.tsx
  └─ Renderiza os flashcards

localStorage
  └─ Salva progresso no navegador
```

---

## 🔄 **Adicionar Mais Flashcards**

Editar `public/flashcards.json`:

```json
[
  {
    "numero": 1,
    "pergunta": "Sua pergunta aqui",
    "resposta": "Sua resposta aqui",
    "modulo": "Módulo 1",
    "categoria": "AVT"
  },
  ...
]
```

Salvar e recarregar navegador. **Pronto!** ✨

---

## 🌍 **Deploy no Vercel**

1. Push para GitHub:
```bash
git add .
git commit -m "feat: json-based flashcard system"
git push origin main
```

2. No Vercel.com:
   - New Project
   - Selecionar repo
   - Deploy! (não precisa de variáveis de ambiente)

**Site ao vivo em ~2 minutos!** 🚀

---

## 💾 **Progresso Salvo**

O progresso é salvo automaticamente em:
- `localStorage` do navegador
- Salvo por domínio (localhost, Vercel, etc)
- Retoma de onde parou

---

## ⚙️ **Comandos Úteis**

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar versão produção
npm run start

# Lint
npm run lint
```

---

## 🎯 **Limitações (Intencionais)**

❌ Não sincroniza entre dispositivos
- ✅ Solução: Use o mesmo navegador

❌ Sem autenticação de usuário
- ✅ Solução: Qualquer um pode usar (educacional)

❌ Sem analytics
- ✅ Solução: Adicione depois se necessário

---

## ✨ **Vantagens**

✅ Zero custos
✅ Zero configuração
✅ Zero backend
✅ Funciona offline (após 1ª carga)
✅ Deploy em 1 clique
✅ Rápido e leve
✅ Simples de entender

---

## 🚀 **Próximos Passos**

1. ✅ Clonar/setup projeto
2. ✅ `npm install`
3. ✅ `npm run dev`
4. ✅ Testar em localhost:3000
5. ✅ Fazer commit
6. ✅ Deploy Vercel
7. ✅ Compartilhar URL!

---

**Tudo pronto em < 5 minutos!** ⚡

*"Gerenciamento, não heroísmo!"* ✈️
