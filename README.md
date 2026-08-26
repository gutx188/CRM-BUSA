# CRM Busa Seguros

Aplicação web estática para gestão de assistências, sinistros, clientes, seguradoras e oficinas da Busa Corretora de Seguros. Esta versão foi preparada para ser publicada diretamente no GitHub Pages.

## O que foi adaptado

O projeto final contém somente o frontend necessário para o funcionamento do CRM no navegador. O backend, o banco de dados, o repositório Git aninhado, o ZIP original e os arquivos anexados ao projeto foram removidos do pacote público.

A navegação usa **hash routing**, portanto recarregar uma tela como `#/assistencias` não exige configuração de servidor para redirecionar rotas. O Vite usa uma base relativa, e os assets públicos são resolvidos a partir de `BASE_URL`, permitindo usar o mesmo build tanto em um domínio próprio quanto em `usuario.github.io/nome-do-repositorio/`.

Os registros e os anexos são armazenados no `localStorage` do navegador. Isso significa que os dados ficam separados por navegador e dispositivo; esta publicação não oferece banco compartilhado nem autenticação de usuários. A sincronização remota só deve ser adicionada posteriormente com um backend próprio e regras de segurança apropriadas.

## Executar localmente

É necessário ter Node.js 22 ou superior e pnpm 11 instalado. Depois, execute:

```bash
pnpm install
pnpm run dev
```

Para simular o resultado de produção:

```bash
pnpm run build
pnpm run preview
```

O build será criado em `dist/`.

## Publicar no GitHub Pages

O arquivo `.github/workflows/deploy.yml` já está incluído. Para usá-lo:

1. Crie um repositório no GitHub e envie todo o conteúdo deste diretório para a branch `main`.
2. Abra **Settings → Pages** no repositório.
3. Em **Build and deployment**, selecione **GitHub Actions** como fonte.
4. Execute o workflow `Publicar CRM no GitHub Pages` pela aba **Actions** ou faça um novo push na branch `main`.
5. Após a conclusão, o GitHub exibirá o endereço publicado na implantação do ambiente `github-pages`.

A documentação oficial do GitHub sobre publicação com workflows está disponível em [GitHub Pages: publicando com uma ação personalizada][1].

## Estrutura principal

| Caminho | Finalidade |
| --- | --- |
| `src/` | Código React do CRM e componentes da interface |
| `public/` | Logo, favicon e arquivos públicos |
| `vite.config.ts` | Configuração do build, base relativa e alias do frontend |
| `.github/workflows/deploy.yml` | Compilação e publicação automática |
| `dist/` | Artefato gerado localmente; não deve ser versionado |

## Observação sobre dados reais

Antes de usar dados de clientes em produção, configure controles de acesso, autenticação e armazenamento no servidor. O GitHub Pages entrega arquivos estáticos e não deve ser usado como banco de dados ou como local para guardar credenciais privadas.

## Referências

[1]: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages "GitHub Docs — Using custom workflows with GitHub Pages"
