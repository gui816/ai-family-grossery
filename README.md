# Lista Família

Lista de compras familiar, mobile-first, com listas partilhadas, categorias, quantidades e sincronização em tempo real.

## Funcionalidades

- Criar uma lista e partilhá-la por link ou código.
- Entrar numa lista existente com o código.
- Adicionar e remover artigos, definir quantidade e categoria.
- Marcar artigos como comprados e limpar os concluídos.
- Atualizações em tempo real entre dispositivos através de Supabase Realtime Broadcast.
- Interface responsiva em português europeu.
- Persistência PostgreSQL gerida pelo Supabase; sem servidor Express, MongoDB ou Socket.IO.

## Configurar o Supabase

1. Cria um projeto em [supabase.com](https://supabase.com/).
2. Abre **SQL Editor**, cria uma query e executa todo o ficheiro `supabase/migrations/202610090001_initial_schema.sql`.
3. Em **Project Settings → API**, copia o Project URL e a chave publishable (ou anon legacy).
4. Copia `.env.example` para `.env.local` e preenche `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
5. Instala dependências e arranca a aplicação:

```bash
npm install
cp .env.example .env.local
# Edita .env.local com os dados do teu projeto
npm run dev
```

Abre o endereço local indicado pelo Vite.

## Deploy

A aplicação é uma SPA estática. Define `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas variáveis de ambiente do serviço de build e executa `npm install && npm run build`; publica a pasta `dist`. O URL e a chave publicável são dados de cliente e podem estar no bundle. **Nunca coloques uma chave `service_role` no frontend.**

## Segurança

As tabelas não têm acesso direto concedido ao papel `anon`; a app usa funções PostgreSQL `SECURITY DEFINER` com `search_path` fixo e validação do código de partilha. O código de convite dá acesso de leitura e escrita à lista, pelo que deve ser partilhado apenas com pessoas de confiança. O código gerado tem 12 caracteres hexadecimais. Antes de promover a aplicação para uso público, acrescenta proteção contra abuso/rate limiting e considera autenticação e convites revogáveis.

## Estrutura

- `src/App.jsx`: interface e chamadas RPC.
- `src/lib/supabase.js`: cliente Supabase.
- `supabase/migrations/`: schema, funções RPC e permissões.
