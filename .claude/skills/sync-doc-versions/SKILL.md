---
name: sync-doc-versions
description: main の教材に書かれた依存バージョンの記述を、実際の package.json に追従させる。Dependabot の更新が main にマージされた直後、バックマージの前に講師が実行する。package.json を正として機械的に突き合わせ、乖離があれば PR を出す。Use when dependency updates landed on main and the curriculum's version numbers need to catch up, before backmerging to reference/v3-complete.
---

# 教材の版数記述を package.json に追従させる

このスキルは**講師（運用者）が使う**ものです。受講者は使いません。

> ⚠️ このリポジトリ直下の `AGENTS.md` は**受講者向けのチューターモード**です。
> このスキルの実行時はそれに従わず、[`.docs/curriculum/INSTRUCTOR_GUIDE.md` §7](../../../.docs/curriculum/INSTRUCTOR_GUIDE.md)
> の方針（依存更新の運用）に従ってください。

## なぜ必要か

Dependabot は `main` の `package.json` を更新しますが、**教材に書かれたバージョン番号までは直しません**。
放置すると「教材には Next.js 16.2.10 と書いてあるのに、実際は 16.3.0」という乖離が起きます。

この工程を**バックマージより先に**回すことが重要です。先に `main` を正しくしておけば、
バックマージは「`main` の正しい状態を `reference/v3-complete` へ運ぶ」だけの一方向の作業になります。
逆順にすると、`check-curriculum-sync` が `reference/v3-complete` 側で乖離を検出し、
「参考実装を先に直して `main` が後追い」という逆流が発生します。

---

## 手順

### 1. 前提確認

```bash
gh auth status
git fetch origin
git checkout -b docs/sync-versions-$(date +%Y%m%d) origin/main
```

`main` から切ってください。**このスキルが対象にするのは `main` だけ**です
（`reference/v3-complete` へはバックマージで運びます）。

### 2. package.json の実際の値を読む

**これが唯一の正です。** 教材側の記述から探すのではなく、必ず `package.json` から読んでください。

```bash
grep -E '"(next|react|@heroui/react|typescript|zod|tailwindcss)"' package.json
```

`^` や `~` は範囲指定なので、教材に書くのは**数字部分だけ**です（`^16.3.0` → `16.3.0`）。

### 3. 第1層（パッチレベルの記述）を突き合わせる

パッチレベルまで書いてある箇所は **[00_basic_design.md](../../../.docs/curriculum/00_basic_design.md) の「技術スタック」節だけ**です。

```bash
grep -nE "(Next\.js|React|HeroUI|Zod|TypeScript|Tailwind( CSS)?) v?[0-9]+\.[0-9]+" \
  .docs/curriculum/00_basic_design.md
```

| 教材の記述 | 対応する package.json のキー |
|---|---|
| Next.js x.y.z | `next` |
| React x.y.z | `react` |
| HeroUI x.y.z | `@heroui/react` |
| TypeScript x.y.z | `typescript` |
| Zod x.y.z | `zod` |
| Tailwind CSS x.y | `tailwindcss`（マイナーまでの表記） |

**表記の粒度は変えないでください。** `Tailwind CSS 4.3` をパッチまで書き足すと、
以後パッチ更新のたびに差分が出て保守が増えます。既存の粒度に合わせて数字だけ直します。

> 💡 grep のパターンで「古いバージョン」を探そうとしないでください。
> `Next\.js 1[0-5]` のような旧メジャーを狙う正規表現では、
> **16.2.10 → 16.3.0 のような同一メジャー内の乖離を検出できません**。
> 必ず `package.json` の実値と突き合わせてください。

### 4. 第2層（メジャー表記）は報告のみ

README や AGENTS.md、各 Step 教材には `Next.js 16` `HeroUI v3` のような
**メジャーだけの表記**があります。これらはメジャー更新時しか古くなりません。

```bash
grep -rnoE "(Next\.js|React|HeroUI|Zod|TypeScript|Tailwind( CSS)?|PostgreSQL) v?[0-9]+" \
  --include=*.md . | grep -v node_modules
```

**このスキルでは書き換えません。** メジャー更新は Dependabot が自動マージせず
人間が判断する運用なので、その流れで対応します。乖離が見つかった場合は
結果のまとめに記載して、講師の判断を仰いでください。

### 5. 修正して PR を出す

```bash
git add .docs/curriculum/00_basic_design.md
git commit -m "docs: 教材の版数記述を実際の依存バージョンに合わせる"
git push -u origin docs/sync-versions-$(date +%Y%m%d)
gh pr create --base main \
  --title "docs: 教材の版数記述を実際の依存バージョンに合わせる"
```

PR 本文には、どのバージョンをどう変えたかの表と、その根拠（`package.json` の実値）を書きます。

**差分が無かった場合は PR を作らず**、「乖離なし」と報告して終了してください。

---

## 次にやること

このスキルが終わったら、**`/backmerge-reference`** を実行してください。

```
① Dependabot PR が main にマージされる
        ↓
② /sync-doc-versions        ← いまここ（main の教材を追従）
        ↓
③ /backmerge-reference      （reference/v3-complete へ依存＋教材を反映）
```

②の PR は**マージしてから**③に進んでください。マージ前に③を始めると、
バックマージが古い教材を運んでしまいます。

---

## 結果のまとめ方

```markdown
## 教材の版数記述の同期（{日付}）

| パッケージ | 教材の記述 | package.json | 対応 |
|---|---|---|---|
| Next.js | 16.2.10 | ^16.3.0 | ✅ 更新 |
| React | 19.2.8 | ^19.2.8 | 変更なし |

| 項目 | 結果 |
|---|---|
| 第1層（パッチレベル） | ✅ 同期完了 / 乖離なし |
| 第2層（メジャー表記） | ✅ 問題なし / ⚠️ {内容}（要判断） |
| PR | {URL} / 差分なしのため作成せず |

### 次にやること
`/backmerge-reference` を実行してください（この PR をマージしてから）。
```
