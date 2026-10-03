// 同じ Markdown ファイルの中に、ほぼ同じコードブロックが複数ないかを検出する。
// 使い方: bun .claude/skills/check-curriculum-sync/find-duplicate-code-blocks.mjs .docs/curriculum/*.md
//
// 片方だけ直すと、同じ教材の中で矛盾したコード例が併存してしまう（#28）。
// ヒットしたペアが本当に重複かどうかは人が判断する（SKILL.md の手順を参照）。
import { readFileSync } from 'node:fs';

// 短いブロックは偶然の一致が多いので対象外にする
const MIN_LINES = 15;
// 共通行数 ÷ 小さい方の行数 がこれ以上なら報告する
const THRESHOLD = 0.8;

const extractBlocks = (lines) => {
  const blocks = [];
  let current = null;
  lines.forEach((line, i) => {
    if (/^\s*```/.test(line)) {
      if (current) {
        blocks.push(current);
        current = null;
      } else {
        current = { start: i + 1, body: [] };
      }
    } else if (current) {
      current.body.push(line);
    }
  });
  return blocks;
};

// コメントだけの差分は重複とみなしたいので、空行とコメント行を除いて比較する
const normalize = (body) =>
  new Set(
    body
      .map((line) => line.trim())
      .filter(
        (line) => line && !line.startsWith('//') && !/^\{?\/\*.*\*\/\}?$/.test(line),
      ),
  );

let found = 0;
for (const file of process.argv.slice(2)) {
  const blocks = extractBlocks(readFileSync(file, 'utf8').split('\n'))
    .map((block) => ({ start: block.start, lines: normalize(block.body) }))
    .filter((block) => block.lines.size >= MIN_LINES);

  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      const a = blocks[i].lines;
      const b = blocks[j].lines;
      let common = 0;
      for (const line of a) if (b.has(line)) common++;
      const similarity = common / Math.min(a.size, b.size);
      if (similarity >= THRESHOLD) {
        found++;
        console.log(
          `${file}:${blocks[i].start} <-> :${blocks[j].start}  ${Math.round(similarity * 100)}% (${a.size}行 / ${b.size}行)`,
        );
      }
    }
  }
}

if (found === 0) console.log('重複したコードブロックはありません');
