# Demo Loja de Roupas

Demonstração independente do sistema de gestão de lojas de roupas, baseada no código da DonnaTicy e da Alldav. Mantém catálogo, estoque, PDV, vendas, clientes, compras, financeiro, relatórios e gestão de usuários.

Esta pasta usa exclusivamente o banco Neon da demonstração. Não contém backups, credenciais, histórico Git nem vínculos de deploy dos projetos originais. Os cadastros iniciais são fictícios; não há cobrança Pix da licença nem impressão automática configuradas.

## Iniciar localmente

Requer Node.js 22 ou superior e npm.

```powershell
npm ci
npm run db:deploy
npm run db:seed
npm run dev
```

Abra http://localhost:3000. Se a porta estiver ocupada, o Next informa outra porta no terminal.

O ambiente desta máquina está em `.env.local` (ignorado pelo Git). O administrador inicial usa `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` desse arquivo. A primeira entrada solicita a troca de senha. Executar o seed novamente preserva a senha e os dados existentes.

## Configurar outra instalação

Copie `.env.example` para `.env.local`, preencha as duas conexões do mesmo banco e gere segredos próprios para `JWT_SECRET`, `MFA_ENCRYPTION_KEY` e `CRON_SECRET`. Defina uma senha forte em `SEED_ADMIN_PASSWORD`.

- `DATABASE_URL`: conexão Neon com pooler, usada pela aplicação.
- `DIRECT_DATABASE_URL`: conexão direta do mesmo endpoint, sem `-pooler`, usada nas migrações.
- Variáveis já definidas no terminal têm precedência sobre `.env.local`; confira o destino antes de comandos de banco.
- `npm run db:deploy` aplica as migrações versionadas sem apagar cadastros.
- `npm run db:seed` cria o administrador e exemplos de catálogo, estoque e cadastros auxiliares. Não importa dados das lojas originais.
- `npm run users:admins` garante o administrador da demo, preservando sua senha existente.

Os scripts herdados de limpeza e reset apagam dados; não são necessários para instalar ou atualizar a demo.

## Validação

```powershell
npm test
npm run lint
npm run build
npm run test:integration
```

Os testes de integração iniciam um PostgreSQL local descartável, sem usar o Neon. O build gera o Prisma Client e compila o app, sem aplicar migrações.

## Publicação

Repositório: https://github.com/ZeteSouza99/DemoLojaRoupa

Endereço de produção: https://demolojaroupa.vercel.app

O branch principal é `main`. A Vercel recebe as variáveis de produção diretamente nas configurações do projeto; `.env.local` e a senha inicial do administrador não são enviados ao GitHub. Em produção, `NEXT_PUBLIC_APP_URL` usa o endereço HTTPS acima.

Configure um projeto de hospedagem próprio com as variáveis da demo, ajuste `NEXT_PUBLIC_APP_URL` e execute as migrações antes da publicação. Os segredos ficam apenas no ambiente do servidor. O arquivo `vercel.json` mantém a rotina diária de manutenção herdada, protegida por `CRON_SECRET`.
