---
description: AIOS-Master Overview and Unified Command Registry
---

# ✈️ AIOS-Master Unified Workflow

Este é o workflow mestre para orquestração de Agentes Laura.IA.

## 🚀 Comandos Rápidos (Slash Commands)

- **/architect** -> Design de Arquitetura & Patterns
- **/dev** -> Implementação de Código & Bugfixes
- **/qa** -> Validação & Testes Automatizados
- **/devops** -> Deploy & Git Management (Push Master/Main)
- **/data-engineer** -> Schema Design & Supabase RLS
- **/ux** -> Refinamento Visual & Laura.IA Style

## 🛠️ Procedimento de Deploy Seguro

1. `npm run lint`
2. `npm run build` (Local)
3. `git add .`
4. `git commit -m "feat: [descrição]"`
5. `git push origin main`

## 📊 Status do Projeto
- **Database**: Supabase (Public Schema)
- **Auth**: Email/Password logic
- **Tenancy**: Single-contract focus
- **Deployment**: Vercel

// turbo
3. Link with existing agents
`cp .codex/agents/*.md _agents/workflows/`
