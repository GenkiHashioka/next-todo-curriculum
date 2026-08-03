# Todo アプリ 完成見本（reference/v3-complete）

このブランチは、カリキュラムを **Step 1 〜 Step 4 まで完走した状態の参照実装** です。
受講者が目指すゴールの姿がそのまま入っています。

> 📘 **受講者の方へ**
> ここは「答え」です。**丸写しするより、詰まったときの答え合わせに使う**のがおすすめです。
> 自分で書いてから見比べると、なぜそう書くのかが理解できます。
>
> カリキュラム本体は [`main`](../../tree/main) ブランチにあります。

---

## 📖 このブランチの位置づけ

| ブランチ | 内容 |
|---|---|
| `main` | **スターター**（`src/features/` が空。ここから受講者が実装を始める） |
| `reference/v3-complete` | **完成見本**（このブランチ。全機能が実装済み） |

実装されている画面:

- ログイン / ユーザー登録
- Todo 一覧（ページネーション・フィルタ・ソート）／ Todo 詳細・編集
- プロフィール（情報編集・パスワード変更・Todo 統計）
- ユーザー管理（一覧・詳細・作成／ADMIN・MANAGER のみ）
- 共通ヘッダー、各ページの `error.tsx` / `loading.tsx`

---

## 🧱 技術スタック

| 分類 | 使用技術 |
|---|---|
| フレームワーク | Next.js 16（App Router） |
| UI | React 19 / **HeroUI v3** / Tailwind CSS 4 |
| 言語 | TypeScript 6 |
| バリデーション | Zod 4 |
| DB | PostgreSQL 16（Docker） |
| 認証 | JWT（Cookie 保存） |
| テスト | Jest（API 側 425 件） |
| コード品質 | Biome |

> ⚠️ **HeroUI は v3 です。** v2 とは API が大きく異なります（`CardBody` → `Card.Content`、
> `useDisclosure` → `useOverlayState`、Navbar 廃止など）。
> 対応表は [.docs/heroui-v2-to-v3-migration.md](./.docs/heroui-v2-to-v3-migration.md) にあります。

---

## 🚀 動かしたいとき

セットアップ手順は `main` ブランチと同じです。
[main の README](../../blob/main/README.md#-セットアップ) を参照してください。

かいつまむと:

```bash
npm install
cp .env.example .env    # 値は main の README を参照
docker compose up -d    # PostgreSQL を起動
npm run dev             # http://localhost:3000
```

`main` と違い、このブランチは**最初から全画面が動きます**。
ユーザーがまだ無い場合は `/register` からアカウントを作成してください。

---

## 📁 実装を読むときの入口

```
src/
├── app/            # ルーティング（各ページは薄く、features を呼ぶだけ）
├── features/       # ★ 画面の実装本体
│   ├── auth/       # ログイン・登録
│   ├── todos/      # Todo 一覧・詳細
│   ├── profile/    # プロフィール
│   └── users/      # ユーザー管理
├── components/     # 共通 UI（Header）
└── （以下はバックエンド：domain / infrastructure / lib / types / usecases）
```

各機能の `components/` 配下が、**Step 4 でコンポーネント分割した結果**です。
Step ごとの意図は [カリキュラム教材](./.docs/curriculum/00_basic_design.md) を参照してください。
