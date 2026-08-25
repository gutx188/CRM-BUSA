# Busa Seguros · CRM

## Visão Geral
- **Nome**: CRM Busa Corretora de Seguros (Access-Link)
- **Objetivo**: Painel de gestão para corretora de seguros — acompanhamento de assistências e sinistros
- **Origem**: Projeto migrado do Replit (workspace pnpm) para stack Vite + Cloudflare Pages

## Funcionalidades Concluídas
- ✅ **Login** com perfis de Administrador e Funcionário
- ✅ **Dashboard** com métricas e gráficos (assistências/sinistros)
- ✅ **Assistências**: cadastro, listagem, filtros e mudança de status
- ✅ **Sinistros**: cadastro, listagem, filtros e mudança de status
- ✅ **Busca global** por clientes, assistências e sinistros
- ✅ **Cadastros auxiliares**: clientes, seguradoras, oficinas, usuários
- ✅ **Upload de documentos** (armazenados localmente)
- ✅ **Log de atividades**
- ✅ **Sincronização opcional com PocketBase** (desativada por padrão)

## URLs
- **Sandbox (desenvolvimento)**: https://3000-i95xto7mm0qigg4ungbiv-b237eb32.sandbox.novita.ai
- **Produção**: (ainda não implantado — ver "Próximos passos")

## Credenciais de Teste (seed)
- **Administrador**: `admin@corretora.com` / `admin123`
- **Funcionário**: `funcionario@corretora.com` / `func123`

## Arquitetura de Dados
- **Modelos**: Usuario, Cliente, Seguradora, Oficina, Assistencia, Sinistro, LogEntry
- **Armazenamento**: `localStorage` do navegador (chave `seguros_crm_data_v1`), com seed automático de dados de exemplo
- **Sincronização opcional**: adaptador REST para PocketBase (`VITE_POCKETBASE_URL` + `VITE_ENABLE_POCKETBASE_SYNC=true`)
- ⚠️ **Importante**: os dados vivem no navegador de cada usuário. Sem PocketBase (ou outro backend), não há compartilhamento de dados entre dispositivos/usuários.

## Guia de Uso
1. Acesse a URL e faça login com uma das credenciais acima
2. Use o menu lateral para navegar: Dashboard, Nova Assistência, Assistências, Novo Sinistro, Sinistros, Buscar
3. Administradores podem gerenciar usuários e cadastros nas configurações (ícone de engrenagem)

## Funcionalidades Não Implementadas / Limitações
- Persistência centralizada (multiusuário real) — requer ativar PocketBase ou migrar para Cloudflare D1
- Autenticação real com hash de senha (hoje as senhas do seed ficam no localStorage)
- O pacote original `api-server` (Express + Drizzle/Postgres) não está em uso — o frontend nunca o consome

## Próximos Passos Recomendados
1. **Deploy em produção** no Cloudflare Pages (`npm run deploy:prod`)
2. Migrar persistência para **Cloudflare D1** com API Hono (multiusuário real e seguro)
3. Implementar autenticação com sessão/JWT e hash de senhas

## Desenvolvimento
```bash
npm install
npm run build                      # build de produção → dist/
pm2 start ecosystem.config.cjs     # serve dist/ na porta 3000 (sandbox)
npm run deploy:prod                # deploy Cloudflare Pages
```

## Deployment
- **Plataforma**: Cloudflare Pages (SPA estática)
- **Status**: ✅ Ativo no sandbox / ⏳ produção pendente
- **Stack**: React 19 + Vite 7 + TailwindCSS 4 + Radix UI + Recharts
- **Última atualização**: 2026-08-25
