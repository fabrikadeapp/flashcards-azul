# 📚 Flashcards A320 - Azul Airlines

Sistema interativo de flashcards para treinamento de pilotos da Azul Airlines. Contém **600 flashcards** cobrindo:

- Regulamentação MGO (Manual Geral de Operações)
- Memory Items do QRH
- Equipamentos e Sistemas
- Segurança e Procedimentos
- Simulador Mosaico e CRM/PSI
- **Limitações Operacionais (AFM/QRH)**

## 🚀 Quick Start

### 1. Clonar/Setup do Projeto

```bash
cd flashcards-azul
npm install
```

### 2. Configurar Supabase

1. Criar conta em [supabase.com](https://supabase.com)
2. Criar novo projeto
3. Copiar URL e Anon Key
4. Criar arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_key_aqui
```

### 3. Setup do Banco de Dados

1. No Supabase, ir para **SQL Editor**
2. Executar o conteúdo de `scripts/seed.sql`
3. Isso criará a tabela e inserirá os 600 flashcards

### 4. Rodar Localmente

```bash
npm run dev
```

Acessar em [http://localhost:3000](http://localhost:3000)

## 📖 Como Usar

### Navegação

- **Seta Direita (→)**: Revelar resposta
- **Seta Baixo (↓)**: Próxima pergunta
- **Seta Esquerda (←)**: Pergunta anterior
- **Clique no card**: Alternar pergunta/resposta

### Tema

- **Botão ☀️/🌙** (canto superior direito): Alternar Light/Dark Mode
- Preferência salva automaticamente no navegador

### Progresso

- As 600 perguntas aparecem em **ordem aleatória**
- Posição atual é salva no `localStorage`
- Retoma de onde parou ao voltar

## 🏗️ Stack Técnico

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS 3
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## 📊 Estrutura de Dados

Cada flashcard contém:

```typescript
{
  id: number              // ID único
  numero: number          // Número do flashcard (1-600)
  pergunta: string        // Texto da pergunta
  resposta: string        // Texto da resposta
  modulo: string          // Módulo (ex: "Módulo 1", "Módulo 23")
  categoria: string       // Categoria (ex: "AVT", "LIMITATIONS")
  created_at: timestamp   // Data de criação
}
```

## 🌍 Deploy no Vercel

### 1. Push para GitHub

```bash
git add .
git commit -m "feat: initial flashcard system"
git push origin main
```

### 2. Conectar no Vercel

1. Ir para [vercel.com](https://vercel.com)
2. Clicar "New Project"
3. Selecionar repositório GitHub
4. Adicionar Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

## 📝 Conteúdo dos 600 Flashcards

### Partes 1-4 (Itens 1-150)
- Avaliação Técnica e Sistemas (AVT)
- Avaliação Periódica
- Memory Items do QRH
- MGO e Security

### Partes 5-7 (Itens 151-500)
- Regulamentação MGO (Cap. 1-9)
- Briefings e Preparação
- PBN e Navegação
- Passageiros Especiais
- Equipamentos de Emergência
- Simulador Mosaico
- CRM e PSI

### Parte 8 (Itens 501-600) ⭐
- **LIMITATIONS Completas**:
  - Ventos, Pistas e Portas
  - Velocidades Máximas (V-speeds)
  - Pesos e Fatores de Carga
  - Autopilot e Sistemas de Voo
  - Motores e Empuxo
  - Óleo e Combustível
  - Ar, APU e Pressurização
  - Elétrica e Equipamentos
  - Regulamentações e Despacho

## 🎯 Uso Recomendado

1. **Estudo Diário**: 30-50 flashcards por sessão
2. **Review**: Retomar do último ponto
3. **Teste**: Fazer todas as 600 em sequência aleatória
4. **Elevação**: Usar como última revisão antes do simulador

## 🛠️ Manutenção

### Adicionar mais flashcards

```sql
INSERT INTO flashcards (numero, pergunta, resposta, modulo, categoria)
VALUES (601, 'Pergunta nova?', 'Resposta nova', 'Módulo XX', 'Categoria');
```

### Resetar progresso

Limpar localStorage no navegador:
```javascript
localStorage.clear()
```

## 📞 Suporte

Para dúvidas ou sugestões, abrir issue no repositório.

---

**Preparação Intensiva para Elevação de Comandante - Azul Airlines ✈️**

*"Gerenciamento, não heroísmo!"*
