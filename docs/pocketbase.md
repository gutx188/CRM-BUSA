# Preparação do PocketBase

O CRM continua usando `localStorage` enquanto
`VITE_ENABLE_POCKETBASE_SYNC` não estiver definido como `true`.

## Variáveis de ambiente

Copie `.env.example` para o ambiente de desenvolvimento ou produção e informe
somente a URL pública do PocketBase:

```text
VITE_POCKETBASE_URL=https://api.seudominio.com
VITE_POCKETBASE_COLLECTION=crm_workspaces
VITE_POCKETBASE_WORKSPACE=crm-corretora
VITE_ENABLE_POCKETBASE_SYNC=false
```

Variáveis com o prefixo `VITE_` são públicas e entram no JavaScript enviado ao
navegador. Nunca coloque aqui senha de superusuário, chave privada, token
administrativo ou a chave de criptografia do PocketBase.

## Coleção esperada

Crie uma coleção `crm_workspaces` com:

- `workspace`: texto, obrigatório e único;
- `payload`: JSON, obrigatório.

O adaptador grava um único registro por workspace, mantendo o `AppData`
completo no campo `payload`. O `id`, `created` e `updated` são gerenciados pelo
PocketBase.

## Segurança antes de ativar

O CRM foi solicitado como público e sem login. Portanto, uma coleção com escrita
anônima permitiria que qualquer pessoa com o endereço pudesse alterar os dados.
Para produção, prefira um proxy no servidor/API com credencial protegida ou
adicione autenticação e regras de acesso antes de mudar
`VITE_ENABLE_POCKETBASE_SYNC` para `true`.

O adaptador não usa a API administrativa e não expõe credenciais. Backups do
`pb_data/data.db` continuam sendo uma etapa de infraestrutura separada e ainda
não foram configurados.