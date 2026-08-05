---
name: backmerge-reference
description: main にマージされた Dependabot の依存更新を reference/v3-complete へ手動で反映する。講師が週1回程度実行する。main の未反映コミット確認からブランチ作成、動作確認、check-curriculum-sync、PR 作成までを一気に進める。Use when the instructor wants to backport dependency updates from main into the reference/v3-complete branch.
---

# main → reference/v3-complete への依存更新バックマージ

このスキルは**講師（運用者）が使う**ものです。受講者は使いません。

> ⚠️ このリポジトリ直下の `AGENTS.md` は**受講者向けのチューターモード**です。
> このスキルの実行時はそれに従わず、[`.docs/curriculum/INSTRUCTOR_GUIDE.md` §7](../../../.docs/curriculum/INSTRUCTOR_GUIDE.md)
> の方針（依存更新の運用）に従ってください。

## なぜ必要か

`.github/dependabot.yml` は `target-branch` を指定していないため、対象は **`main` のみ**です。
自動マージ（`.github/workflows/dependabot-auto-merge.yml`）も `main` にしか効きません。

`reference/v3-complete` は `main` と独立した依存バージョンで動いており、放置すると

- Vercel にデプロイされている参考実装が古い依存のまま固定される
- 「教材（`main` 前提）とデプロイされた見本（`reference/v3-complete`）で挙動が違う」事故が起きる

これを避けるため、`main` の更新を定期的に手動で取り込みます。
**自動化はしていません**（GitHub Actions は無料枠に収めたい方針、かつ `main` はフロントエンド実装が
空のスターターなので講師が定期的に中身を見る必要性自体がある — 詳細は INSTRUCTOR_GUIDE.md 参照）。

---

## 手順

### 1. 前提確認

```bash
gh auth status
git fetch origin
```

未認証なら、続行せず講師に `gh auth login` を依頼してください（このスキルは代わりに認証できません）。

### 2. 未反映の Dependabot 更新を確認

```bash
gh pr list --repo GenkiHashioka/next-todo-curriculum \
  --base main --state merged --search "author:app/dependabot" \
  --json number,title,mergedAt --limit 20
```

`origin/reference/v3-complete` に無くて `origin/main` にあるコミットも確認しておくと、
バックマージで何が入るかの見立てになります。

```bash
git log --oneline origin/reference/v3-complete..origin/main
```

### 3. 作業ブランチを切って `main` を取り込む

```bash
git checkout -b backmerge/$(date +%Y%m%d) origin/reference/v3-complete
git merge origin/main
```

`reference/v3-complete` はバックエンド層（`src/infrastructure/` 等）や `.devcontainer/` `.docs/` が
`main` とほぼ同一で、`src/features/` 配下（フロント実装）だけが分岐している設計なので、
コンフリクトは基本的に起きません。起きた場合の典型は `bun.lock` で、`main` 側を採用して
`bun install` で整合を取り直すのが早いです。

```bash
git checkout --theirs bun.lock
bun install
git add bun.lock
```

`src/features/` や `.docs/curriculum/` にコンフリクトが出た場合は機械的に解決せず、
中身を見てから判断してください（`reference/v3-complete` 側の実装・記述を壊さないこと）。

### 4. 動作確認

```bash
bun install
bun run build
bun run test
bun run lint
```

いずれかが失敗したら、依存更新による破壊的変更を疑ってください。
バージョンを跨いだ移行が必要な場合は、対象の PR（dependabot の変更内容）を確認し、
必要なコード修正をこのブランチに加えます。

### 5. `check-curriculum-sync` を実行する

**依存の版が上がると、教材のコード例やバージョン記述が古くなることがあります。**
このステップは省略しないでください。

`check-curriculum-sync` スキルを呼び出し、その手順どおりに検査してください。
特に今回の文脈で見るべきは:

- 版数記述（`grep -rnE "Next\.js 1[0-5]|React 19\.1|HeroUI 2|Zod 3|TypeScript 5" .docs/curriculum/`）
  — 更新後のバージョンと食い違っていないか
- 更新した依存（HeroUI / Next.js / Zod など）に破壊的変更があった場合、
  教材のコード例がその変更を反映できているか

問題が見つかった場合は、教材側を実装に合わせて修正してから次に進みます。

### 6. PR を作成する

```bash
bun run check   # フォーマット・リント（コミット前に推奨）
git add -A
git commit -m "chore: main の依存更新を反映（$(date +%Y-%m-%d)）"
git push -u origin backmerge/$(date +%Y%m%d)

gh pr create --repo GenkiHashioka/next-todo-curriculum \
  --base reference/v3-complete --head backmerge/$(date +%Y%m%d) \
  --title "chore: main の依存更新を反映（$(date +%Y-%m-%d)）" \
  --body "$(cat <<'EOF'
main にマージされた Dependabot の依存更新をバックマージする。

## 確認したこと
- bun run build / bun run test / bun run lint が緑
- check-curriculum-sync を実行し、教材のバージョン記述・コード例に問題がないことを確認
EOF
)"
```

PR の本文には、取り込んだ主な依存更新（手順 2 で確認したもの）を箇条書きで補うと、
レビュー（自分でマージする場合も含め）がしやすくなります。

---

## 結果のまとめ方

```markdown
## reference/v3-complete バックマージ（{日付}）

| 項目 | 結果 |
|---|---|
| 取り込んだ Dependabot PR | #.., #.. |
| コンフリクト | なし / bun.lock のみ / {ファイル名}（要確認） |
| build / test / lint | ✅ 緑 |
| check-curriculum-sync | ✅ 問題なし / ⚠️ {内容}を修正 |
| PR | {URL} |
```
