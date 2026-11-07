# reserve.me backend

API Node.js separada do frontend Vue, com autenticação persistida no MySQL e
sessões revogáveis armazenadas como hashes. A senha nunca é salva em texto puro.

## Requisitos

- Node.js 22.18 ou superior
- MySQL 8+

## Configuração e execução

```powershell
Copy-Item .env.example .env
npm install
```

Edite `.env` com os dados do MySQL. Crie o banco e as tabelas com:

```powershell
docker compose up -d
Get-Content .\sql\schema.sql | mysql -u root -p
```

Se o banco já foi criado antes do campo `role`, aplique a migração:

```powershell
Get-Content .\sql\migrate-user-roles.sql | mysql -u root -p
```

Para criar contas locais de demonstração, informe uma senha temporária sem
salvá-la no código ou no arquivo `.env`:

```powershell
$env:DEMO_PASSWORD = Read-Host "Senha temporaria (minimo 12 caracteres)"
npm run seed-users
Remove-Item Env:DEMO_PASSWORD
```

O seed cria um aluno, dois professores e um administrador. Alunos são
deliberadamente impedidos de iniciar sessão na área de reservas.

Para criar uma conta individual depois, execute `npm run create-user --
email@escola.edu.br "Nome" teacher` (`student`, `teacher` ou `admin`). A senha
será solicitada sem aparecer no terminal.

Inicie a API:

```powershell
npm run dev
```

A API ficará disponível em `http://localhost:3000`. O Vite encaminha `/api` para
essa porta durante o desenvolvimento. Em produção, configure o proxy HTTPS para
a API e `FRONTEND_ORIGIN`; cookies `Secure` são habilitados com
`NODE_ENV=production`.

## API de autenticação

| Método | Rota | Resultado |
|---|---|---|
| `POST` | `/api/auth/login` | Valida `email` e `password`; cria cookie HttpOnly |
| `GET` | `/api/auth/me` | Retorna os dados públicos do usuário autenticado |
| `POST` | `/api/auth/logout` | Revoga a sessão e remove o cookie |

O cookie usa `SameSite=Lax`, expira em oito horas e contém um token aleatório;
somente seu hash SHA-256 é armazenado no banco. Senhas são verificadas com
bcrypt. Tentativas de login são limitadas por endereço IP. Credenciais inválidas
retornam a mesma mensagem para evitar revelar se um e-mail está cadastrado.

## Testes e documentação

```powershell
npm test
npm run docs
```

Os testes usam `node:test`, não precisam de um servidor MySQL e cobrem validação,
credenciais inválidas, criação e uso do cookie, consulta da sessão e logout.
`npm run docs` gera a documentação JSDoc em `docs/api/`.
