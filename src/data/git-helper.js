/**
 * Git Helper — cheatsheet de comandos Git + modelos de .gitignore (v2.0.0).
 */

export const GIT_SECTIONS = [
  {
    grupo: 'Configuração e início',
    icon: '⚙',
    comandos: [
      { cmd: 'git config --global user.name "Nome"', desc: 'Define seu nome nos commits.' },
      { cmd: 'git config --global user.email "voce@email.com"', desc: 'Define seu e-mail nos commits.' },
      { cmd: 'git init', desc: 'Cria um repositório novo na pasta atual.' },
      { cmd: 'git clone <url>', desc: 'Baixa um repositório remoto para o seu PC.' }
    ]
  },
  {
    grupo: 'Mudanças do dia a dia',
    icon: '✎',
    comandos: [
      { cmd: 'git status', desc: 'Mostra o que mudou, o que está preparado e o que não.' },
      { cmd: 'git add <arquivo>', desc: 'Prepara um arquivo para o próximo commit.' },
      { cmd: 'git add .', desc: 'Prepara tudo que mudou na pasta atual.' },
      { cmd: 'git commit -m "mensagem"', desc: 'Salva as mudanças preparadas com uma descrição.' },
      { cmd: 'git diff', desc: 'Mostra as mudanças ainda não preparadas.' },
      { cmd: 'git restore <arquivo>', desc: 'Descarta as mudanças não salvas de um arquivo.' }
    ]
  },
  {
    grupo: 'Branches',
    icon: '⎇',
    comandos: [
      { cmd: 'git branch', desc: 'Lista as branches locais.' },
      { cmd: 'git switch -c <nome>', desc: 'Cria e entra numa branch nova.' },
      { cmd: 'git switch <nome>', desc: 'Troca para uma branch existente.' },
      { cmd: 'git merge <branch>', desc: 'Funde a branch indicada na branch atual.' },
      { cmd: 'git branch -d <nome>', desc: 'Apaga uma branch já mesclada.' }
    ]
  },
  {
    grupo: 'Repositório remoto',
    icon: '⇅',
    comandos: [
      { cmd: 'git remote -v', desc: 'Mostra os repositórios remotos configurados.' },
      { cmd: 'git fetch', desc: 'Baixa as novidades do remoto sem mesclar.' },
      { cmd: 'git pull', desc: 'Baixa e já mescla as novidades do remoto.' },
      { cmd: 'git push', desc: 'Envia seus commits para o repositório remoto.' },
      { cmd: 'git push -u origin <branch>', desc: 'Envia uma branch nova e passa a rastreá-la.' }
    ]
  },
  {
    grupo: 'Histórico',
    icon: '◷',
    comandos: [
      { cmd: 'git log --oneline', desc: 'Lista os commits, um por linha.' },
      { cmd: 'git log --graph --oneline', desc: 'Histórico com o desenho das branches.' },
      { cmd: 'git show <commit>', desc: 'Mostra os detalhes e o diff de um commit.' },
      { cmd: 'git blame <arquivo>', desc: 'Mostra quem alterou cada linha do arquivo.' }
    ]
  },
  {
    grupo: 'Desfazer e recuperar',
    icon: '↺',
    comandos: [
      { cmd: 'git revert <commit>', desc: 'Cria um commit que desfaz outro (seguro).' },
      { cmd: 'git reset --soft HEAD~1', desc: 'Desfaz o último commit, mantendo as mudanças.' },
      { cmd: 'git stash', desc: 'Guarda mudanças temporariamente sem commitar.' },
      { cmd: 'git stash pop', desc: 'Recupera as mudanças guardadas no stash.' },
      { cmd: 'git reflog', desc: 'Histórico de tudo — ajuda a recuperar trabalho "perdido".' }
    ]
  }
];

export const GITIGNORE_TEMPLATES = [
  {
    nome: 'Node.js',
    conteudo: `node_modules/
dist/
.env
.env.local
npm-debug.log*
*.tsbuildinfo`
  },
  {
    nome: 'Python',
    conteudo: `__pycache__/
*.py[cod]
.venv/
venv/
*.egg-info/
.pytest_cache/
.env`
  },
  {
    nome: 'Sistema e editores',
    conteudo: `.DS_Store
Thumbs.db
.vscode/
.idea/
*.swp
*~`
  }
];
