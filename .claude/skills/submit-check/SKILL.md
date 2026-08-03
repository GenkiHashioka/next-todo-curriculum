---
name: submit-check
description: レビューに出す前の自己チェック。ブランチ・ビルド・ステップ制約など、機械的に確認できることだけを検査して、提出できる状態かを判定する。受講者が各ステップの実装を終えたときに実行する。Use when a student finished implementing a step and wants to check whether it is ready to submit for review.
---

# 提出前の自己チェック

**レビューに出せる状態かどうか**を確認します。各ステップの実装が終わったら実行してください。

---

## ⚠️ このスキルの役割（重要）

- ここで見るのは、**機械的に判定できることだけ**です。
  ビルドが通るか、ステップの制約を守っているか、といった「間違いようがない」部分です。
- **実装の中身が良いかどうかは判定しません。** それはレビューで講師と話す部分です。
- **通っても「合格」ではありません。** 「レビューに出せる状態になった」というだけです。

### 🚫 見つけた問題を、代わりに直さないこと

問題が見つかったら、**どこに何があるかだけを伝えて、そこで止まってください。**
修正コードを書いてはいけません。ファイルも編集しないでください。

> なぜか: ここで直してしまうと、受講者は「なぜそれが問題なのか」を知らないまま先へ進みます。
> このカリキュラムの目的は、動くものを作ることではなく、自分で書けるようになることです。

受講者が「直し方が分からない」と言った場合は、リポジトリの `AGENTS.md`（チューターモード）に
従って、答えではなくヒントを段階的に出してください。

---

## 手順

### 0. 対象のステップを判定する

```bash
git rev-parse --abbrev-ref HEAD
```

ブランチ名（例 `hashioka-step-2`）から **ステップ番号**を読み取ります。
読み取れない場合は、何のステップの実装かを受講者に尋ねてください。

### 1. ブランチ

| 確認 | 方法 |
|---|---|
| `main` で作業していないか | 現在のブランチが `main` でないこと |
| 命名が規約どおりか | `{名前}-step-{番号}` の形式か |

`main` で作業していた場合は**最優先で伝えてください**。
そのままでは提出できません（`main` は受講者全員の出発点なので変更しません）。

### 2. コミット・push の漏れ

```bash
git status --short
git log --oneline @{u}..HEAD 2>/dev/null || echo "リモートに未 push"
```

- コミットしていない変更が残っていないか
- リモートに push されているか（push されていないとレビューできません）

### 3. 触ってはいけない場所を変更していないか

このカリキュラムはフロントエンドの課題です。**バックエンドを書き換えて解決するのは筋が違う**ため、
以下の変更があれば指摘してください。

```bash
git diff --stat origin/main...HEAD -- src/app/api/ src/domain/ src/infrastructure/ src/usecases/ src/lib/
```

出力があれば、そのファイルを挙げます。
（`src/lib/api.ts` は Step 2 以降で読む対象ですが、**書き換える**必要はありません）

### 4. ビルドが通るか

```bash
npm run build
```

**型エラーはここで出ます。** 落ちた場合は、エラーメッセージの中の
**ファイル名と行番号、そして「何が期待されていて何が来たか」**を抜き出して伝えてください。
原因の説明までは構いませんが、修正コードは書かないでください。

> 💡 ブランチを切り替えた直後に、存在しないファイルの型エラーが出ることがあります。
> その場合は `.next` を消して再実行してください（キャッシュが残っているだけです）。

### 5. Lint

```bash
npm run lint
```

Biome の指摘が出た場合は挙げます。`npm run check` で自動修正できるものが多いので、
**受講者自身が実行できるよう案内**してください（こちらで実行しない）。

### 6. ステップの制約を守っているか

**このカリキュラムで最も大事なチェック**です。段階的に学ぶ設計なので、
先のステップの技術を使ってしまうと、そのステップで学ぶはずのものを飛ばすことになります。

| Step | 使ってはいけないもの | 確認方法 |
|:---:|---|---|
| 1 | HeroUI / サーバーコンポーネント / コンポーネント分割 | `@heroui/react` の import が無いか。`features/` の各ファイルに `'use client'` があるか。`features/*/components/` が無いか |
| 2 | HeroUI / コンポーネント分割 | `@heroui/react` の import が無いか。`features/*/components/` が無いか |
| 3 | コンポーネント分割 | `features/*/components/` が無いか |
| 4 | —（制約なし） | — |

```bash
# Step 1・2 で HeroUI を使っていないか
grep -rn "@heroui/react" src/features/ src/components/ 2>/dev/null

# Step 1〜3 でコンポーネント分割していないか
ls -d src/features/*/components/ 2>/dev/null

# Step 1 で 'use client' が付いているか（画面ファイルのみ）
grep -rL "'use client'" --include="*.tsx" src/features/ 2>/dev/null
```

> `types.ts` のような型だけのファイルに `'use client'` は不要です。上のコマンドは `.tsx` に
> 絞ってあります。ヒットしたファイルが実際に画面を描いているかを見てから指摘してください。

### 7. HeroUI v2 の書き方が混ざっていないか（Step 3 以降のみ）

**このプロジェクトの HeroUI は v3 です。** ネット上や生成AIの知識は v2 のものが多く、
v2 の書き方は v3 では動きません。

**(a) 見つかったら確実に問題**（v3 に存在しない名前）

```bash
grep -rnE "CardBody|CardHeader|CardFooter|SelectItem|HeroUIProvider|useDisclosure|ModalContent|ModalBody|ModalHeader|ModalFooter|NavbarBrand|NavbarContent|NavbarItem|<Navbar|<Textarea" src/features/ src/components/ 2>/dev/null
```

**(b) 紛らわしいので中身を見る**（v2 の prop 名だが、自作コンポーネントなら問題なし）

```bash
grep -rnE "onValueChange|selectedKeys|isLoading=|color=\"(primary|danger|default|secondary)\"" src/features/ src/components/ 2>/dev/null
```

> ⚠️ (b) は**そのまま指摘しないでください。** 受講者が自分で作ったコンポーネントに
> `isLoading` や `color` という Props を付けているだけなら、まったく問題ありません。
> ヒットした各行について、**その prop を受け取っているコンポーネントが
> `@heroui/react` からインポートされているか**を確認してから判断します。
> HeroUI のコンポーネントに付いている場合だけが指摘対象です。

あわせて、v3 に**存在しない** Tailwind クラスも確認します（指定しても効かず、
HeroUI の既定スタイルを打ち消して見た目が崩れます）。

```bash
grep -rnE "rounded-medium|default-[0-9]+|text-small|bg-default-" src/features/ src/components/ 2>/dev/null
```

対応表は [.docs/heroui-v2-to-v3-migration.md](../../../.docs/heroui-v2-to-v3-migration.md) にあります。

---

## 結果の出し方

```markdown
## 提出前チェック: {ブランチ名}（Step {N}）

### 判定
✅ レビューに出せます / ❌ 先に直すところがあります

| 確認項目 | 結果 |
|---|---|
| ブランチ | ✅ / ❌ |
| コミット・push | ✅ / ❌ |
| 触ってはいけない場所 | ✅ 変更なし / ❌ |
| ビルド | ✅ 通る / ❌ 失敗 |
| Lint | ✅ / ⚠️ |
| ステップ制約 | ✅ / ❌ |
| HeroUI v3（Step3 以降） | ✅ / ❌ |

### 直すところ
- **{何が問題か}** — `{ファイル}:{行}`
  {なぜ問題なのか}

### 自分で確認してください（ここでは判定できません）
- [ ] 実際に画面を触って、実装した機能がひととおり動く
- [ ] エラーになったとき、画面に何が出るか確認した
- [ ] **自分が書いたコードを、人に説明できる**
      （レビューでは「なぜそう書いたか」を聞かれます）
```

最後の 3 つは機械では確認できません。**必ず自分で確認してから提出してください。**
特に一番下は、このカリキュラムで一番大事なところです。
