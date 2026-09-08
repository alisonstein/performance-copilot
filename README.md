# Performance Copilot

MicroSaaS para gestores de tráfego, freelancers e agências: suba um CSV de
campanhas do Meta Ads ou Google Ads e receba métricas consolidadas, alertas,
oportunidades, recomendações e um resumo executivo pronto para o cliente.

Este repositório contém dois produtos no mesmo projeto Next.js:

- **Landing page pública** (`/`) — inalterada, com os CTAs apontando para
  `/register` e `/login`.
- **Aplicação autenticada** (`/dashboard/**`) — o MVP funcional: cadastro,
  login, clientes, upload de CSV, diagnóstico automático e histórico.

---

## Stack

- Next.js 15 (App Router) + React 18 + TypeScript
- Tailwind CSS
- Supabase (Auth + Postgres + RLS)
- OpenAI API (opcional — o sistema funciona sem ela, veja abaixo)
- Zod (validação), PapaParse (CSV), Recharts (gráficos), Lucide (ícones)
- Vitest (testes unitários)

---

## 1. Instalação

```bash
npm install
```

## 2. Criar o projeto no Supabase

1. Crie uma conta e um projeto em [supabase.com](https://supabase.com).
2. Em **Project Settings → API**, copie:
   - `Project URL` → vai em `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → vai em `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → vai em `SUPABASE_SERVICE_ROLE_KEY` (opcional no MVP,
     reservada para tarefas administrativas futuras — veja
     `lib/supabase/admin.ts`)

## 3. Rodar a migration SQL

O schema completo (tabelas, índices, triggers e políticas de RLS) está em
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).

Duas formas de aplicá-lo:

**Opção A — SQL Editor (mais simples):**
No painel do Supabase, abra **SQL Editor → New query**, cole o conteúdo do
arquivo `supabase/migrations/0001_init.sql` e rode.

**Opção B — Supabase CLI:**
```bash
npx supabase login
npx supabase link --project-ref <seu-project-ref>
npx supabase db push
```

A migration cria:

- `profiles` — um registro por usuário (criado automaticamente por um
  trigger em `auth.users`), com o campo `plan` (`free` por padrão).
- `clients` — clientes/contas geridos pelo usuário.
- `analyses` — cada análise (upload de CSV) com os totais já calculados.
- `analysis_items` — as linhas por campanha de cada análise.
- `ai_analysis` — diagnóstico, alertas, oportunidades, recomendações e
  resumo executivo gerados (por IA ou pelo motor de regras).

Todas as tabelas têm **Row Level Security (RLS)** habilitado: cada usuário só
enxerga e só escreve os próprios dados (`auth.uid() = user_id`, com as
tabelas filhas validadas via `EXISTS` contra a análise/dono).

## 4. Variáveis de ambiente

Copie o exemplo e preencha:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Nunca** faça commit do `.env.local` (já está no `.gitignore`).

Sem `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`, as páginas
`/login`, `/register` etc. mostram um aviso de "configuração pendente" em vez
de quebrar, e qualquer rota `/dashboard/**` redireciona para
`/config-pendente`.

## 5. Configurar a URL de redirecionamento no Supabase Auth

Em **Authentication → URL Configuration** no painel do Supabase, adicione:

- **Site URL:** `http://localhost:3000` (troque pela URL de produção depois)
- **Redirect URLs:** `http://localhost:3000/auth/callback` (e a versão de
  produção, ex. `https://seu-dominio.vercel.app/auth/callback`)

Isso é necessário para o fluxo de confirmação de e-mail e de recuperação de
senha funcionarem (`app/auth/callback/route.ts`).

Por padrão, o Supabase exige confirmação de e-mail no cadastro. Você pode
desativar isso em **Authentication → Providers → Email** (campo "Confirm
email") se quiser pular a etapa durante os testes locais.

## 6. Adicionar a chave da OpenAI (opcional)

1. Crie uma chave em [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2. Cole em `OPENAI_API_KEY` no `.env.local`.
3. (Opcional) ajuste `OPENAI_MODEL` — o padrão é `gpt-4o-mini`.

**A chave nunca é exposta ao navegador.** Ela só é lida em
`lib/ai/openai-provider.ts`, que roda exclusivamente no servidor (rota
`app/api/analysis/route.ts`) e é importada com a diretiva `server-only`.

Se a chave não estiver definida, ou se a chamada à OpenAI falhar por
qualquer motivo (rede, limite de uso, resposta fora do formato esperado), o
sistema usa automaticamente o diagnóstico gerado por
`lib/analysis/analysis-engine.ts` (motor de regras determinístico) — o
upload de CSV **nunca falha** por causa da IA.

## 7. Rodar localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) para a landing, ou
[http://localhost:3000/register](http://localhost:3000/register) para criar
uma conta.

Outros comandos úteis:

```bash
npm run lint       # ESLint
npm run typecheck  # TypeScript (tsc --noEmit)
npm run test       # Vitest (testes unitários)
npm run build      # build de produção
```

## 8. Como testar o upload de CSV

Um arquivo de exemplo com dados fictícios está em
[`public/examples/meta-ads-example.csv`](public/examples/meta-ads-example.csv)
(20 campanhas do Meta Ads, incluindo uma sem conversões — de propósito, para
disparar o alerta correspondente).

Fluxo de ponta a ponta:

1. Crie uma conta em `/register` e faça login.
2. Em **Clientes**, clique em **Adicionar cliente** (ex.: "Loja Exemplo").
3. Clique em **Nova análise**, selecione o cliente, a plataforma **Meta
   Ads**, um período, e envie o arquivo `meta-ads-example.csv`.
4. Você será redirecionado para o resultado: métricas, gráficos,
   diagnóstico, alertas, oportunidades, recomendações e o resumo para o
   cliente (com botão "Copiar resumo").
5. Volte para o cliente e veja a análise salva no histórico.

Também há uma página de demonstração (sem precisar subir arquivo) em
**Ver demonstração**, no menu lateral — usa dados fictícios claramente
marcados como "DADOS DE DEMONSTRAÇÃO", mas roda o mesmo motor de análise real
(`lib/analysis/analysis-engine.ts`).

### Formatos de CSV reconhecidos

`lib/csv/csv-normalizer.ts` reconhece automaticamente nomes de coluna comuns
do Meta Ads e do Google Ads, em português e inglês (ex.: `Amount spent` /
`Valor gasto` / `Cost`, `Results` / `Resultados` / `Conversions`). As
métricas (CTR, CPC, CPM, CPA, ROAS) são sempre **recalculadas** a partir dos
valores brutos — nunca confiamos cegamente em colunas agregadas do arquivo.

Se as colunas essenciais não forem reconhecidas, o sistema mostra uma
mensagem amigável explicando o que faltou, em vez de um erro técnico.

## 9. Deploy na Vercel

1. Suba este repositório para o GitHub (se ainda não estiver lá).
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório.
3. Em **Environment Variables**, adicione as mesmas variáveis do
   `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `OPENAI_MODEL`, e
   `NEXT_PUBLIC_APP_URL` apontando para o domínio final, ex.
   `https://performance-copilot.vercel.app`).
4. Clique em **Deploy**.
5. Depois do primeiro deploy, volte ao Supabase (**Authentication → URL
   Configuration**) e adicione a URL de produção + `/auth/callback` na lista
   de Redirect URLs.

> **Limite de upload em produção:** o motor de CSV foi feito para arquivos de
> até 10 MB, mas as Serverless Functions da Vercel (runtime Node.js padrão)
> costumam limitar o corpo da requisição a alguns MB, dependendo do plano.
> Para a grande maioria dos exports de Meta/Google Ads isso não é um
> problema, mas se você precisar garantir 10 MB completos em produção, a
> evolução natural é fazer o upload direto para o Supabase Storage com uma
> signed URL e processar o arquivo a partir de lá — a estrutura do projeto
> (Supabase Storage já listado nas dependências possíveis) comporta essa
> extensão sem mudanças estruturais.

---

## Estrutura do projeto

```
app/
  page.tsx, layout.tsx, globals.css     — landing page (inalterada)
  login/, register/,
  forgot-password/, reset-password/     — autenticação (Supabase Auth)
  auth/callback/route.ts                — troca de código por sessão
  config-pendente/                      — aviso quando o Supabase não está configurado
  dashboard/
    layout.tsx                          — sidebar + proteção de rota
    page.tsx                            — visão geral
    clients/                            — listagem, criação, detalhe/histórico
    analysis/new/                       — upload de CSV
    analysis/[id]/                      — resultado da análise
    history/                            — histórico de todas as análises
    settings/                           — dados da conta e do plano
    demo/                               — demonstração com dados fictícios
  api/analysis/route.ts                 — processa o CSV, roda o diagnóstico, grava no banco

components/
  (landing) Header, Hero, Pricing, ...  — componentes da landing (inalterados)
  auth/                                 — formulários de login/registro/recuperação
  dashboard/                            — sidebar, cards, gráficos, tabelas, upload
  shared/, ui/                          — componentes reutilizáveis (toast, form fields...)

lib/
  supabase/                             — clientes Supabase (browser, server, admin) e helpers de auth
  csv/csv-normalizer.ts                 — parsing e normalização de colunas de CSV
  analysis/
    metrics.ts                          — CTR, CPC, CPM, CPA, ROAS (divisão segura)
    analysis-engine.ts                  — regras determinísticas (alertas/oportunidades)
    compare.ts                          — comparação entre períodos
    client-summary.ts                   — texto simples para o cliente final
  ai/
    provider.ts                         — interface abstrata de provedor de IA
    openai-provider.ts                  — implementação OpenAI
    ai-service.ts                       — orquestra regras + IA, com fallback automático
  plans/limits.ts                       — limites por plano (estrutura para cobrança futura)
  demo/demo-data.ts                     — dados fictícios do modo demonstração
  actions/clients.ts                    — Server Action de criação de cliente

types/
  database.ts                           — tipos do schema Supabase
  domain.ts                             — tipos de domínio (métricas, alertas, etc.)

supabase/migrations/0001_init.sql       — schema completo + RLS

tests/                                  — testes unitários (Vitest)
public/examples/meta-ads-example.csv    — CSV de exemplo para testar o upload
```

---

## O que fica pronto para o futuro (não implementado neste MVP)

A estrutura já comporta, sem redesenho:

- **Cobrança** — `profiles.plan` (`free`/`pro`/`agency`) e
  `lib/plans/limits.ts` já existem; falta só integrar Stripe/Cakto e aplicar
  os limites (hoje eles só são exibidos, nunca bloqueiam).
- **Outro provedor de IA** — troque `OpenAiProvider` por outra implementação
  de `AiProvider` (`lib/ai/provider.ts`) sem tocar no resto do sistema.
- **Integração direta com Meta Ads/Google Ads API** — hoje o fluxo é 100%
  via upload de CSV, por decisão de escopo deste MVP.
- **White-label, múltiplos usuários por conta, notificações** — fora do
  escopo deste MVP, mas o schema (RLS por `user_id`) não impede evoluir para
  isso depois.

## Testes

```bash
npm run test
```

Cobrem: cálculo de CTR/CPC/CPM/CPA/ROAS (incluindo divisão por zero),
normalização de CSV (formatos pt-BR/en-US, Meta Ads, Google Ads, colunas
ausentes), as regras do motor de diagnóstico, o fallback de IA sem
`OPENAI_API_KEY`, e o pipeline completo rodando sobre o CSV de exemplo real.
