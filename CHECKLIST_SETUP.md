# ✅ Checklist de Setup - Passos 1, 2 e 4

## ✅ PASSO 1: CLONAR REPOSITÓRIO

```bash
cd /Users/gustavoholderbaumvieira/Desktop/code/flashcards-azul
git init
git add .
git commit -m "initial commit"
```

**Status**: ✅ COMPLETADO

Todos os 23 arquivos foram criados e commitados no Git.

---

## ✅ PASSO 2: CONFIGURAR SUPABASE

### 2a. Criar Conta e Projeto

- [ ] Abrir https://supabase.com
- [ ] Fazer signup com GitHub
- [ ] Criar novo projeto:
  - Nome: `flashcards-azul`
  - Região: São Paulo
  - Database Password: [salvar]
- [ ] Aguardar ~2 minutos

### 2b. Obter Credenciais

- [ ] Ir para Settings → API
- [ ] Copiar **Project URL**:
  ```
  https://xxxxxxxxxxxxx.supabase.co
  ```
- [ ] Copiar **anon public key**:
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

### 2c. Configurar .env.local

- [ ] Criar arquivo `.env.local` no projeto
- [ ] Colar conteúdo:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- [ ] Salvar arquivo

**Instruções Detalhadas**: Ver `SUPABASE_SETUP.md`

---

## ✅ PASSO 4: EXECUTAR SEED.SQL

### 4a. No Supabase

- [ ] Abrir Supabase Dashboard
- [ ] Ir para SQL Editor
- [ ] Clicar "New Query"
- [ ] Abrir arquivo `scripts/seed.sql` (local)
- [ ] Copiar TODO o conteúdo (Ctrl+A, Ctrl+C)
- [ ] Colar no SQL Editor (Ctrl+V)
- [ ] Clicar **Run** (ou Ctrl+Enter)
- [ ] Verificar mensagem "✓ Query executed successfully"

### 4b. Verificar no Supabase

- [ ] Ir para Table Editor
- [ ] Selecionar tabela **flashcards**
- [ ] Ver 600 linhas listadas
- [ ] Confirmar colunas:
  - numero (1-600)
  - pergunta
  - resposta
  - modulo
  - categoria

**Instruções Detalhadas**: Ver `EXECUTE_SEED.md`

---

## 🎉 RESULTADO

Após completar os 3 passos:

```
✅ Repositório Git inicializado
✅ Supabase configurado
✅ Banco de dados criado com 600 flashcards
```

**Próximos passos** (passo 3):
```bash
npm install
npm run dev
# Abrir http://localhost:3000
```

---

## 📋 ORDEM DOS PASSOS

```
1. CLONAR REPOSITÓRIO (✅ FEITO)
   └─ Git init + commit

2. CONFIGURAR SUPABASE (👈 FAZER AGORA)
   ├─ Criar conta
   ├─ Criar projeto
   └─ Copiar credenciais + .env.local

3. INSTALAR DEPENDÊNCIAS (próximo)
   └─ npm install

4. EXECUTAR SEED.SQL (👈 FAZER AGORA)
   ├─ Ir para SQL Editor
   ├─ Copiar scripts/seed.sql
   ├─ Executar no Supabase
   └─ Verificar 600 linhas

5. RODAR LOCALMENTE (próximo)
   └─ npm run dev → http://localhost:3000

6. DEPLOY NO VERCEL (próximo)
   └─ Push GitHub → Auto deploy
```

---

## ⏱️ TEMPO ESTIMADO

| Passo | Tempo | Status |
|-------|-------|--------|
| 1. Clonar | 1 min | ✅ FEITO |
| 2. Supabase | 10 min | 👈 AGORA |
| 3. npm install | 3 min | Próximo |
| 4. Seed.SQL | 5 min | 👈 AGORA |
| 5. npm run dev | 2 min | Próximo |
| **TOTAL** | **~30 min** | 🎯 |

---

## 🚀 RESUMO

- **Passo 1**: ✅ Completo (Git pronto)
- **Passo 2**: 👈 **VOCÊ ESTÁ AQUI** (Fazer setup Supabase)
- **Passo 4**: 👈 **VOCÊ ESTÁ AQUI** (Executar seed.sql após passo 2)

---

## ❓ DÚVIDAS?

Arquivo detalhado: `SUPABASE_SETUP.md`
Arquivo detalhado: `EXECUTE_SEED.md`

---

**Você consegue fazer o passo 2 e 4 agora?** 💪
