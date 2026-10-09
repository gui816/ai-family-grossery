# Lista Família

Lista de compras familiar, mobile-first, com listas partilhadas, categorias, quantidades e sincronização em tempo real.

## Funcionalidades do MVP

- Criar uma lista e partilhá-la por link ou código de 6 caracteres.
- Entrar numa lista existente com o código.
- Adicionar e remover artigos.
- Definir quantidade e categoria manual ou automática.
- Marcar artigos como comprados e limpar os concluídos.
- Atualizações em tempo real via Socket.IO.
- Interface responsiva em português europeu.
- Persistência em MongoDB.

## Requisitos

- Node.js 20+
- MongoDB local ou MongoDB Atlas

## Executar localmente

```bash
npm install
cp .env.example .env
# Edita .env e configura MONGODB_URI
npm run dev
```

Abre http://localhost:5173. A API corre em http://localhost:3001.

## Produção

1. Define `MONGODB_URI`, `MONGODB_DB`, `PORT` e `CLIENT_ORIGIN` no serviço de alojamento.
2. Executa `npm install && npm run build`.
3. Executa `npm start` para servir a API e os ficheiros compilados.
4. Configura HTTPS no serviço de alojamento.

O `CLIENT_ORIGIN` deve corresponder à origem pública da aplicação. O alojamento tem de suportar WebSockets.

## Segurança e limites do MVP

O código de partilha funciona como uma chave de acesso: qualquer pessoa que o tenha pode ver e alterar a lista. Partilha-o apenas com pessoas de confiança. Antes de um lançamento público, acrescenta autenticação, rate limiting, proteção contra abuso e opções para revogar convites.

Nunca coloques credenciais MongoDB no frontend. Mantém `MONGODB_URI` apenas como variável de ambiente no servidor.

## Estrutura

```text
lista-familia/
├── server/index.js
├── src/App.jsx
├── src/main.jsx
├── src/styles.css
├── index.html
├── package.json
├── vite.config.js
└── .env.example
```

## Próximas melhorias

- Listas recorrentes e sugestões de artigos habituais.
- Quantidades editáveis diretamente na lista.
- Membros e permissões.
- PWA instalável e notificações push.
- Testes automatizados e pipeline CI.
- Plano premium depois de validar utilização e disposição para pagar.
