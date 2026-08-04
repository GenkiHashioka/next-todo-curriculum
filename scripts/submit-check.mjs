#!/usr/bin/env node
/**
 * 提出前チェック（受講者用）
 *
 * レビューに出せる状態かどうかを、機械的に判定できる範囲だけ検査します。
 *   bun run submit-check
 *
 * 【このスクリプトの方針】
 * - 見つけた問題を直しません。場所と理由を出すだけです。
 *   直してしまうと「なぜそれが問題なのか」を知らないまま先へ進むことになり、
 *   このカリキュラムの目的（自分で書けるようになること）から外れるためです。
 * - 実装の中身が良いかどうかは判定しません。それはレビューで講師と話す部分です。
 * - 通っても「合格」ではありません。「レビューに出せる状態になった」だけです。
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
};

/** 触ってはいけない層（フロントの課題なので、バックエンドを書き換えて解決するのは筋が違う） */
const PROTECTED_PATHS = [
  'src/app/api/',
  'src/domain/',
  'src/infrastructure/',
  'src/usecases/',
  'src/lib/',
];

/** 受講者が実装する場所 */
const WORK_DIRS = ['src/features', 'src/components'];

/** v3 に存在しない名前。見つかったら確実に問題 */
const V2_ONLY = [
  'CardBody',
  'CardHeader',
  'CardFooter',
  'SelectItem',
  'HeroUIProvider',
  'useDisclosure',
  'ModalContent',
  'ModalBody',
  'ModalHeader',
  'ModalFooter',
  'NavbarBrand',
  'NavbarContent',
  'NavbarItem',
  '<Navbar',
  '<Textarea',
];

/** v2 の prop 名だが、自作コンポーネントでも使うので警告どまりにする */
const V2_AMBIGUOUS =
  /onValueChange|selectedKeys|isLoading=|color="(primary|danger|default|secondary)"/;

/** v3 のテーマに無いクラス。指定しても効かず、HeroUI の既定スタイルを打ち消して崩れる */
const DEAD_CLASSES = /rounded-medium|default-[0-9]+|text-small|bg-default-/;

const results = [];
const details = [];

function record(name, level, lines = []) {
  results.push({ name, level });
  if (lines.length) details.push({ name, level, lines });
}

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function tryGit(args) {
  try {
    return git(args);
  } catch {
    return null;
  }
}

/** 対象ディレクトリ配下のファイルを再帰的に集める */
function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function sourceFiles() {
  return WORK_DIRS.flatMap((d) => walk(d)).filter((f) => /\.(tsx|ts)$/.test(f));
}

function grepFiles(predicate) {
  const hits = [];
  for (const file of sourceFiles()) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, i) => {
      const why = predicate(line);
      if (why) hits.push(`${relative('.', file).replace(/\\/g, '/')}:${i + 1}  ${why}`);
    });
  }
  return hits;
}

// ────────────────────────────────────────────────────────────
// 0. ブランチとステップ番号
// ────────────────────────────────────────────────────────────
const branch = tryGit(['rev-parse', '--abbrev-ref', 'HEAD']);
if (!branch) {
  console.error('git リポジトリではないようです。リポジトリのルートで実行してください。');
  process.exit(1);
}

const stepMatch = branch.match(/-step-([1-4])$/);
const step = stepMatch ? Number(stepMatch[1]) : null;

console.log('');
console.log(`${C.bold}提出前チェック${C.reset}  ${C.cyan}${branch}${C.reset}` + (step ? `  (Step ${step})` : ''));
console.log('');

// ────────────────────────────────────────────────────────────
// 1. ブランチ
// ────────────────────────────────────────────────────────────
if (branch === 'main') {
  record('ブランチ', 'error', [
    'main で作業しています。main は受講者全員の出発点なので変更しません。',
    '自分のブランチ（{名前}-step-{番号}）を切り直してください。',
  ]);
} else if (!stepMatch) {
  record('ブランチ', 'warn', [
    `ブランチ名から Step 番号を読み取れませんでした（規約: {名前}-step-{番号}）。`,
    'ステップ制約のチェックはスキップします。',
  ]);
} else {
  record('ブランチ', 'ok');
}

// ────────────────────────────────────────────────────────────
// 2. コミット・push の漏れ
// ────────────────────────────────────────────────────────────
{
  // `git status` は Windows だと改行コード（CRLF）の違いだけで「変更あり」と報告するため、
  // 実際の差分を見る `git diff` を使う。新規ファイルは diff に出ないので別途拾う。
  const modified = tryGit(['diff', '--name-only', 'HEAD']);
  const untracked = tryGit(['ls-files', '--others', '--exclude-standard']);
  const unpushed = tryGit(['log', '--oneline', '@{u}..HEAD']);
  const lines = [];

  const pending = [modified, untracked]
    .filter(Boolean)
    .flatMap((l) => l.split('\n'))
    .filter(Boolean);

  if (pending.length) {
    lines.push('コミットしていない変更があります:');
    lines.push(...pending.slice(0, 10).map((f) => `    ${f}`));
    if (pending.length > 10) lines.push(`    ... 他 ${pending.length - 10} 件`);
  }
  if (unpushed === null) {
    lines.push('このブランチはまだ push されていません（リモートが未設定）。');
    lines.push(`    git push -u origin ${branch}`);
  } else if (unpushed) {
    lines.push('push していないコミットがあります:');
    lines.push(...unpushed.split('\n').map((l) => `    ${l}`));
  }

  record('コミット・push', lines.length ? 'error' : 'ok', lines);
}

// ────────────────────────────────────────────────────────────
// 3. 触ってはいけない層
// ────────────────────────────────────────────────────────────
{
  // 「今の main と中身が違うか」を見る。
  //
  // `origin/main...HEAD`（3点）だと「分岐点以降に触ったか」になり、main 側の修正を
  // 取り込んだだけのファイルまで引っかかる。ここで知りたいのは履歴ではなく現在の中身なので、
  // 2 点比較を使う。
  //
  // `git status` ではなく `git diff` を使うのは、Windows では改行コード（CRLF）の違いだけで
  // status が「変更あり」と報告してしまい、ほぼ全ファイルが誤検知になるため。
  const committed = tryGit(['diff', '--name-only', 'origin/main', 'HEAD', '--', ...PROTECTED_PATHS]);
  const uncommitted = tryGit(['diff', '--name-only', 'HEAD', '--', ...PROTECTED_PATHS]);

  const found = new Set();
  for (const list of [committed, uncommitted]) {
    if (list) for (const f of list.split('\n')) found.add(f.trim());
  }
  found.delete('');
  const files = [...found];

  if (committed === null) {
    record('触ってはいけない層', 'warn', [
      'origin/main を参照できませんでした（git fetch origin を実行してください）。',
    ]);
  } else if (files.length) {
    record('触ってはいけない層', 'error', [
      'バックエンド側を変更しています。これはフロントエンドの課題なので、',
      'API を書き換えて解決するのは筋が違います。元に戻してください。',
      ...files.map((f) => `    ${f}`),
    ]);
  } else {
    record('触ってはいけない層', 'ok');
  }
}

// ────────────────────────────────────────────────────────────
// 4. ビルド（型エラーはここで出る）
// ────────────────────────────────────────────────────────────
{
  process.stdout.write(`${C.dim}  ビルド中...${C.reset}`);
  try {
    execFileSync('bun', ['run', 'build'], { stdio: 'pipe' });
    process.stdout.write('\r\x1b[K');
    record('ビルド', 'ok');
  } catch (e) {
    process.stdout.write('\r\x1b[K');
    const out = `${e.stdout ?? ''}${e.stderr ?? ''}`;
    const picked = out
      .split(/\r?\n/)
      .filter((l) => /error|Error|\.tsx?:\d+/.test(l))
      .slice(0, 15);
    record('ビルド', 'error', [
      'ビルドが通りません。型エラーがある可能性が高いです。',
      ...picked.map((l) => `    ${l.trim()}`),
      '',
      '    ヒント: ブランチを切り替えた直後なら、古いキャッシュが原因のこともあります。',
      '           その場合は .next を削除してから再実行してください。',
    ]);
  }
}

// ────────────────────────────────────────────────────────────
// 5. Lint
// ────────────────────────────────────────────────────────────
{
  try {
    execFileSync('bun', ['run', 'lint'], { stdio: 'pipe' });
    record('Lint', 'ok');
  } catch (e) {
    const out = `${e.stdout ?? ''}${e.stderr ?? ''}`;
    const picked = out.split(/\r?\n/).filter((l) => l.trim()).slice(-12);
    record('Lint', 'warn', [
      'Biome の指摘があります。多くは自動修正できます:',
      '    bun run check',
      ...picked.map((l) => `    ${l.trim()}`),
    ]);
  }
}

// ────────────────────────────────────────────────────────────
// 6. ステップの制約
// ────────────────────────────────────────────────────────────
if (step) {
  const lines = [];

  // Step 1・2 は HeroUI を使わない
  if (step <= 2) {
    const hits = grepFiles((l) => (l.includes('@heroui/react') ? l.trim() : null));
    if (hits.length) {
      lines.push(`Step ${step} では HeroUI を使いません（Tailwind CSS だけで組みます）。`);
      lines.push('    素の HTML と Tailwind で組むことに、この段階の意味があります。');
      lines.push(...hits.map((h) => `    ${h}`));
    }
  }

  // Step 1〜3 はコンポーネント分割しない
  if (step <= 3) {
    const split = WORK_DIRS.filter((d) => d === 'src/features')
      .flatMap((d) => (existsSync(d) ? readdirSync(d) : []))
      .map((f) => join('src/features', f, 'components'))
      .filter((p) => existsSync(p));
    if (split.length) {
      lines.push(`Step ${step} ではコンポーネント分割をしません（Step 4 でやります）。`);
      lines.push(...split.map((p) => `    ${p.replace(/\\/g, '/')}`));
    }
  }

  // Step 1 は全ファイルがクライアントコンポーネント
  if (step === 1) {
    const missing = sourceFiles()
      .filter((f) => f.endsWith('.tsx'))
      .filter((f) => !readFileSync(f, 'utf8').includes("'use client'"));
    if (missing.length) {
      lines.push("Step 1 は 'use client' を付けたクライアントコンポーネントだけで実装します。");
      lines.push(...missing.map((f) => `    ${relative('.', f).replace(/\\/g, '/')}`));
    }
  }

  record('ステップ制約', lines.length ? 'error' : 'ok', lines);
}

// ────────────────────────────────────────────────────────────
// 7. HeroUI v3 の書き方（Step 3 以降）
// ────────────────────────────────────────────────────────────
if (!step || step >= 3) {
  // 7a. 確実に v2
  const v2 = grepFiles((l) => {
    const found = V2_ONLY.find((n) => l.includes(n));
    return found ? `${found}   ${C.dim}${l.trim().slice(0, 60)}${C.reset}` : null;
  });
  record(
    'HeroUI v2 の書き方',
    v2.length ? 'error' : 'ok',
    v2.length
      ? [
          'v3 に存在しない名前を使っています。ネットや生成AIの情報は v2 向けが多いので、',
          'そのままでは動きません。対応表: .docs/heroui-v2-to-v3-migration.md',
          ...v2.map((h) => `    ${h}`),
        ]
      : [],
  );

  // 7b. 紛らわしい（自作コンポーネントなら問題なし）
  const amb = grepFiles((l) => {
    const m = l.match(V2_AMBIGUOUS);
    return m ? `${m[0]}   ${C.dim}${l.trim().slice(0, 60)}${C.reset}` : null;
  });
  if (amb.length) {
    record('v2 らしき Props', 'warn', [
      '自分で作ったコンポーネントの Props なら問題ありません。',
      'HeroUI のコンポーネントに付けている場合だけ直してください',
      '（v3 では color= → variant=、isLoading= → isPending=）。',
      ...amb.map((h) => `    ${h}`),
    ]);
  } else {
    record('v2 らしき Props', 'ok');
  }

  // 7c. v3 に無いクラス
  const dead = grepFiles((l) => {
    const m = l.match(DEAD_CLASSES);
    return m ? `${m[0]}   ${C.dim}${l.trim().slice(0, 60)}${C.reset}` : null;
  });
  record(
    'v3 に無いクラス',
    dead.length ? 'error' : 'ok',
    dead.length
      ? [
          'v3 のテーマに無いクラスです。効かないうえ、HeroUI の既定スタイルを',
          '打ち消して見た目が崩れます。',
          ...dead.map((h) => `    ${h}`),
        ]
      : [],
  );
}

// ────────────────────────────────────────────────────────────
// 結果
// ────────────────────────────────────────────────────────────
const mark = { ok: `${C.green}OK${C.reset}`, warn: `${C.yellow}確認${C.reset}`, error: `${C.red}NG${C.reset}` };

/** 日本語は端末上で 2 文字分の幅を取るので、桁を揃えるには実表示幅で数える */
function displayWidth(s) {
  let w = 0;
  for (const ch of s) w += /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹯＀-｠￠-￦]/.test(ch) ? 2 : 1;
  return w;
}

const width = Math.max(...results.map((r) => displayWidth(r.name))) + 2;

for (const r of results) {
  const pad = ' '.repeat(width - displayWidth(r.name));
  console.log(`  ${r.name}${pad}${mark[r.level]}`);
}
console.log('');

for (const d of details) {
  const color = d.level === 'error' ? C.red : C.yellow;
  console.log(`${color}${C.bold}[${d.name}]${C.reset}`);
  for (const l of d.lines) console.log(`  ${l}`);
  console.log('');
}

const errors = results.filter((r) => r.level === 'error').length;

console.log(`${C.bold}機械では判定できません。自分で確認してください${C.reset}`);
console.log('  □ 実際に画面を触って、実装した機能がひととおり動く');
console.log('  □ エラーになったとき、画面に何が出るか確認した');
console.log(`  □ ${C.bold}自分が書いたコードを、人に説明できる${C.reset}`);
console.log(`    ${C.dim}レビューでは「なぜそう書いたか」を聞かれます。ここが一番大事です。${C.reset}`);
console.log('');

if (errors > 0) {
  console.log(`${C.red}${C.bold}直すところが ${errors} 件あります。${C.reset}`);
  console.log(`${C.dim}このチェックは代わりに直しません。分からなければ遠慮なく聞いてください。${C.reset}`);
  console.log('');
  process.exit(1);
}

console.log(`${C.green}${C.bold}レビューに出せます。${C.reset}`);
console.log(`${C.dim}※ 「合格」ではありません。実装の中身はレビューで一緒に見ます。${C.reset}`);
console.log('');
