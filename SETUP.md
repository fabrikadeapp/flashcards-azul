# 🚀 Setup Completo - Flashcards A320

Guia passo a passo para configurar o sistema do zero até deploy no Vercel.

## Fase 1: Preparação Local

### 1.1 Clonar o projeto

```bash
git clone <seu-repo>
cd flashcards-azul
```

### 1.2 Instalar dependências

```bash
npm install
```

### 1.3 Criar arquivo `.env.local`

```bash
cp .env.example .env.local
```

Deixe em branco por enquanto (preencheremos no próximo passo).

## Fase 2: Configurar Supabase

### 2.1 Criar conta (se não tiver)

1. Ir para [supabase.com](https://supabase.com)
2. Clicar "Start your project"
3. Fazer signup com GitHub ou email
4. Criar organização

### 2.2 Criar novo projeto

1. Clicar "New project"
2. Preencher:
   - **Name**: `flashcards-azul`
   - **Password**: Salvar em local seguro
   - **Region**: `South America (São Paulo)` (mais perto do Brasil)
3. Clicar "Create new project"
4. Aguardar ~2 minutos para provisionar

### 2.3 Obter credenciais

Após o projeto estar pronto:

1. No menu esquerdo, clicar em **Settings** > **API**
2. Copiar:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Colar em `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxx
```

## Fase 3: Criar Banco de Dados

### 3.1 Acessar SQL Editor

1. No Supabase, ir para **SQL Editor** (lado esquerdo)
2. Clicar **New Query**

### 3.2 Executar SQL para criar tabela

Copiar todo o conteúdo de `scripts/seed.sql` e colar na query.

Depois clicar **Run** (ou Ctrl+Enter)

Você deve ver:
```
✓ Query executed successfully
```

### 3.3 Verificar dados inseridos

1. Ir para **Table Editor** (lado esquerdo)
2. Selecionar tabela `flashcards`
3. Deve mostrar os flashcards inseridos

## Fase 4: Testar Localmente

### 4.1 Rodar servidor de desenvolvimento

```bash
npm run dev
```

Você deve ver:
```
✓ Ready in 1234ms
  ➜  Local:        http://localhost:3000
```

### 4.2 Acessar no navegador

1. Abrir [http://localhost:3000](http://localhost:3000)
2. Deve aparecer a página com flashcards
3. Testar navegação:
   - Seta → para revelar resposta
   - Seta ↓ para próxima pergunta
   - Botão 🌙 para dark mode

### 4.3 Solução de problemas

**"Erro ao conectar ao banco de dados"**
- Verificar se `.env.local` tem as credenciais corretas
- Verificar se a tabela foi criada no Supabase
- Verificar se o IP está na lista de acesso (normalmente Supabase permite todos)

**"Flashcards aparecem vazios"**
- Ir para Supabase > Table Editor
- Verificar se dados estão na tabela `flashcards`
- Verificar console do navegador (F12) para erros

## Fase 5: Deploy no Vercel

### 5.1 Preparar repositório Git

```bash
git add .
git commit -m "feat: initial flashcard system with 600 items"
git push origin main
```

### 5.2 Conectar com Vercel

1. Ir para [vercel.com](https://vercel.com)
2. Clicar "New Project"
3. Clicar "Import Git Repository"
4. Selecionar seu repositório
5. Clicar "Import"

### 5.3 Configurar Environment Variables

Na tela de configuração do projeto:

1. Em **Environment Variables**, adicionar:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: `https://xxxxx.supabase.co`

   (Clicar "Add" para adicionar outra)

2. Segunda variável:
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: `eyJxxxxxxxx`

3. Clicar **Deploy**

### 5.4 Aguardar build

O Vercel vai:
1. Clonar o repositório ✓
2. Instalar dependências ✓
3. Fazer build ✓
4. Deploy ✓

Quando ver a mensagem "Congratulations! Your project has been successfully deployed", o site está ao vivo!

### 5.5 Acessar URL do Vercel

Vercel automaticamente gera uma URL como:
```
https://flashcards-azul-xxxx.vercel.app
```

Compartilhar esse link para acessar em qualquer lugar!

## Fase 6: Atualizações Futuras

### Adicionar mais flashcards

1. No Supabase, ir para **SQL Editor**
2. Executar novo INSERT:

```sql
INSERT INTO flashcards (numero, pergunta, resposta, modulo, categoria)
VALUES (601, 'Nova pergunta?', 'Nova resposta', 'Módulo X', 'Categoria');
```

3. A mudança aparece no site ao refresh (Vercel reimplanta automaticamente se fizer push para main)

### Atualizar código

1. Fazer alterações locais
2. Testar com `npm run dev`
3. Git push para main
4. Vercel automáticamente redeploy

## 📊 Resumo de Configuração

| Serviço | URL | Função |
|---------|-----|--------|
| **Supabase** | https://supabase.co | Banco PostgreSQL |
| **Vercel** | https://vercel.com | Hosting do site |
| **GitHub** | seu-repo | Versionamento |

## ✅ Checklist de Setup

- [ ] Node.js 18+ instalado
- [ ] Projeto criado no Supabase
- [ ] Credenciais no `.env.local`
- [ ] Tabela criada e dados inseridos
- [ ] Site funciona em localhost:3000
- [ ] Repositório no GitHub
- [ ] Projeto criado no Vercel
- [ ] Environment variables configuradas
- [ ] Site ao vivo no Vercel

## 🎯 Próximos Passos

1. Compartilhar link do Vercel com pilotos
2. Coletar feedback sobre conteúdo
3. Adicionar mais flashcards conforme necessário
4. Implementar sistema de pontuação (opcional)
5. Adicionar autenticação para rastrear progresso por usuário

---

**Dúvidas?** Verificar a seção "Solução de Problemas" no README.md
