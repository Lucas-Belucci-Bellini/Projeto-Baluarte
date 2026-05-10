/**
 * Definição das 26 linguagens suportadas pelo Editor de Código.
 *
 * Cada entrada:
 *   id: chave única usada no engine
 *   name: nome exibido no UI
 *   ext: extensão default
 *   icon: glifo unicode usado no card / tab
 *   runner: tipo de runner ('js' | 'html' | 'css' | 'markdown' | null)
 *   keywords: palavras-chave para highlight
 *   lineComment: prefixo de comentário de linha (ou null)
 *   blockComment: { open, close } para comentário de bloco (ou null)
 *   stringDelimiters: caracteres de string ['"', "'", '`'] etc.
 */

export const LANGS = [
  /* ===== Web ===== */
  {
    id: 'javascript',
    name: 'JavaScript',
    ext: 'js',
    icon: 'JS',
    runner: 'js',
    keywords: 'var let const function return if else for while do break continue switch case default class extends new this super import export from as async await yield try catch finally throw typeof instanceof in of delete void null undefined true false static get set',
    lineComment: '//',
    blockComment: { open: '/*', close: '*/' },
    stringDelimiters: ['"', "'", '`']
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    ext: 'ts',
    icon: 'TS',
    runner: null,
    keywords: 'var let const function return if else for while do break continue switch case default class extends new this super import export from as async await yield try catch finally throw typeof instanceof in of delete void null undefined true false static get set interface type enum namespace declare readonly public private protected abstract implements keyof infer never unknown any string number boolean object',
    lineComment: '//',
    blockComment: { open: '/*', close: '*/' },
    stringDelimiters: ['"', "'", '`']
  },
  {
    id: 'jsx',
    name: 'JSX',
    ext: 'jsx',
    icon: 'JX',
    runner: null,
    keywords: 'var let const function return if else for while class import export from default new this super async await',
    lineComment: '//',
    blockComment: { open: '/*', close: '*/' },
    stringDelimiters: ['"', "'", '`']
  },
  {
    id: 'tsx',
    name: 'TSX',
    ext: 'tsx',
    icon: 'TX',
    runner: null,
    keywords: 'var let const function return if else for while class import export from default new this super async await interface type enum',
    lineComment: '//',
    blockComment: { open: '/*', close: '*/' },
    stringDelimiters: ['"', "'", '`']
  },
  {
    id: 'html',
    name: 'HTML',
    ext: 'html',
    icon: '◫',
    runner: 'html',
    keywords: '',
    lineComment: null,
    blockComment: { open: '<!--', close: '-->' },
    stringDelimiters: ['"', "'"],
    isMarkup: true
  },
  {
    id: 'css',
    name: 'CSS',
    ext: 'css',
    icon: '◈',
    runner: 'css',
    keywords: 'important',
    lineComment: null,
    blockComment: { open: '/*', close: '*/' },
    stringDelimiters: ['"', "'"],
    isCss: true
  },
  {
    id: 'scss',
    name: 'SCSS',
    ext: 'scss',
    icon: '◇',
    runner: null,
    keywords: 'important mixin include extend if else for each while function return',
    lineComment: '//',
    blockComment: { open: '/*', close: '*/' },
    stringDelimiters: ['"', "'"],
    isCss: true
  },
  {
    id: 'json',
    name: 'JSON',
    ext: 'json',
    icon: '{}',
    runner: null,
    keywords: 'true false null',
    lineComment: null,
    blockComment: null,
    stringDelimiters: ['"']
  },
  {
    id: 'yaml',
    name: 'YAML',
    ext: 'yaml',
    icon: '◊',
    runner: null,
    keywords: 'true false null yes no',
    lineComment: '#',
    blockComment: null,
    stringDelimiters: ['"', "'"]
  },
  {
    id: 'markdown',
    name: 'Markdown',
    ext: 'md',
    icon: '✎',
    runner: 'markdown',
    keywords: '',
    lineComment: null,
    blockComment: null,
    stringDelimiters: [],
    isMarkdown: true
  },
  {
    id: 'xml',
    name: 'XML',
    ext: 'xml',
    icon: '⌐',
    runner: null,
    keywords: '',
    lineComment: null,
    blockComment: { open: '<!--', close: '-->' },
    stringDelimiters: ['"', "'"],
    isMarkup: true
  },

  /* ===== Backend / Sistemas ===== */
  {
    id: 'python',
    name: 'Python',
    ext: 'py',
    icon: 'PY',
    runner: null,
    keywords: 'def class return if elif else for while break continue pass import from as with try except finally raise global nonlocal lambda yield True False None and or not in is async await',
    lineComment: '#',
    blockComment: null,
    stringDelimiters: ['"', "'"]
  },
  {
    id: 'java',
    name: 'Java',
    ext: 'java',
    icon: 'JV',
    runner: null,
    keywords: 'public private protected class interface extends implements static final void int long short byte char boolean float double String new this super return if else for while do break continue switch case default try catch finally throw throws import package abstract synchronized volatile transient native enum null true false instanceof',
    lineComment: '//',
    blockComment: { open: '/*', close: '*/' },
    stringDelimiters: ['"', "'"]
  },
  {
    id: 'c',
    name: 'C',
    ext: 'c',
    icon: 'C',
    runner: null,
    keywords: 'int long short char float double void if else for while do break continue switch case default return struct union enum typedef static const extern auto register volatile sizeof goto inline restrict signed unsigned',
    lineComment: '//',
    blockComment: { open: '/*', close: '*/' },
    stringDelimiters: ['"', "'"]
  },
  {
    id: 'cpp',
    name: 'C++',
    ext: 'cpp',
    icon: 'C+',
    runner: null,
    keywords: 'int long short char float double void bool if else for while do break continue switch case default return class struct union enum typedef static const extern auto register volatile sizeof goto inline namespace using public private protected virtual override final new delete this nullptr template typename try catch throw friend operator',
    lineComment: '//',
    blockComment: { open: '/*', close: '*/' },
    stringDelimiters: ['"', "'"]
  },
  {
    id: 'csharp',
    name: 'C#',
    ext: 'cs',
    icon: 'C#',
    runner: null,
    keywords: 'using namespace class struct interface enum public private protected internal static readonly const new this base virtual override sealed abstract void int long short byte char bool string float double decimal var if else for while do break continue switch case default return try catch finally throw async await async yield null true false in out ref params',
    lineComment: '//',
    blockComment: { open: '/*', close: '*/' },
    stringDelimiters: ['"', "'"]
  },
  {
    id: 'go',
    name: 'Go',
    ext: 'go',
    icon: 'GO',
    runner: null,
    keywords: 'func var const type struct interface package import return if else for range break continue switch case default fallthrough go defer chan map make new nil true false',
    lineComment: '//',
    blockComment: { open: '/*', close: '*/' },
    stringDelimiters: ['"', "'", '`']
  },
  {
    id: 'rust',
    name: 'Rust',
    ext: 'rs',
    icon: 'RS',
    runner: null,
    keywords: 'fn let mut const static struct enum trait impl pub use crate mod self Self if else match for while loop break continue return where type as ref move dyn async await unsafe extern in true false None Some Ok Err',
    lineComment: '//',
    blockComment: { open: '/*', close: '*/' },
    stringDelimiters: ['"', "'"]
  },
  {
    id: 'ruby',
    name: 'Ruby',
    ext: 'rb',
    icon: 'RB',
    runner: null,
    keywords: 'def class module end if elsif else unless while until for in do return break next yield require require_relative attr_accessor attr_reader attr_writer self nil true false and or not begin rescue ensure raise',
    lineComment: '#',
    blockComment: null,
    stringDelimiters: ['"', "'"]
  },
  {
    id: 'php',
    name: 'PHP',
    ext: 'php',
    icon: 'PH',
    runner: null,
    keywords: 'function class interface extends implements public private protected static const new return if else elseif for foreach while do break continue switch case default echo print require include namespace use as try catch finally throw global var array null true false instanceof',
    lineComment: '//',
    blockComment: { open: '/*', close: '*/' },
    stringDelimiters: ['"', "'"]
  },

  /* ===== Scripting / Shell ===== */
  {
    id: 'sql',
    name: 'SQL',
    ext: 'sql',
    icon: 'DB',
    runner: null,
    keywords: 'SELECT FROM WHERE INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE DROP ALTER ADD INDEX VIEW DATABASE SCHEMA AS JOIN INNER LEFT RIGHT OUTER FULL ON GROUP BY HAVING ORDER LIMIT OFFSET UNION DISTINCT IS NOT NULL AND OR IN EXISTS LIKE BETWEEN CASE WHEN THEN ELSE END WITH RECURSIVE',
    lineComment: '--',
    blockComment: { open: '/*', close: '*/' },
    stringDelimiters: ["'"],
    caseInsensitive: true
  },
  {
    id: 'bash',
    name: 'Bash',
    ext: 'sh',
    icon: '$_',
    runner: null,
    keywords: 'if then else elif fi for while do done case esac function return in select until break continue exit export local readonly source echo printf read test',
    lineComment: '#',
    blockComment: null,
    stringDelimiters: ['"', "'"]
  },
  {
    id: 'powershell',
    name: 'PowerShell',
    ext: 'ps1',
    icon: 'PS',
    runner: null,
    keywords: 'function param if elseif else switch foreach for while do until break continue return try catch finally throw begin process end filter in not and or eq ne lt gt le ge like match contains',
    lineComment: '#',
    blockComment: { open: '<#', close: '#>' },
    stringDelimiters: ['"', "'"]
  },
  {
    id: 'lua',
    name: 'Lua',
    ext: 'lua',
    icon: 'LU',
    runner: null,
    keywords: 'function end local if then else elseif for while do repeat until return break in and or not nil true false',
    lineComment: '--',
    blockComment: { open: '--[[', close: ']]' },
    stringDelimiters: ['"', "'"]
  },
  {
    id: 'swift',
    name: 'Swift',
    ext: 'swift',
    icon: 'SW',
    runner: null,
    keywords: 'func var let class struct enum protocol extension if else guard for while repeat switch case default return break continue import public private internal fileprivate open static final override init self Self super nil true false in as is throws try catch throw',
    lineComment: '//',
    blockComment: { open: '/*', close: '*/' },
    stringDelimiters: ['"']
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    ext: 'kt',
    icon: 'KT',
    runner: null,
    keywords: 'fun val var class object interface enum sealed data inline if else when for while do return break continue import package private public protected internal abstract open override final companion is as in throw try catch finally true false null this super',
    lineComment: '//',
    blockComment: { open: '/*', close: '*/' },
    stringDelimiters: ['"', "'"]
  }
];

export function getLang(id) {
  return LANGS.find((l) => l.id === id) || LANGS[0];
}

export function langForExt(ext) {
  if (!ext) return null;
  const clean = ext.toLowerCase().replace(/^\./, '');
  return LANGS.find((l) => l.ext === clean) || null;
}
