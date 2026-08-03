# Todo アプリ フロントエンド開発カリキュラム

新規参画者向けの実践研修用リポジトリです。
**バックエンド API は完成済み**なので、あなたは **フロントエンドを段階的に実装** していきます。

> 📘 **まずは [カリキュラム基本設計書](./.docs/curriculum/00_basic_design.md) を読んでください。**
> このリポジトリの `src/features/` は空です。そこにあなたのコードを書いていきます。

---

## 🎯 このカリキュラムでやること

同じ Todo アプリを **4 つのステップで作り替えながら**、モダンな React / Next.js の
実装パターンを身につけます。

| Step | テーマ | 学ぶこと |
|:---:|---|---|
| 1 | [クライアントコンポーネント](./.docs/curriculum/01_step1_client_component.md) | API 通信 / `useState`・`useEffect` / まず動くものを作る |
| 2 | [サーバーコンポーネント](./.docs/curriculum/02_step2_server_component.md) | RSC とクライアントの使い分け / Server Actions |
| 3 | [UI ライブラリ](./.docs/curriculum/03_step3_ui_library.md) | HeroUI v3 でのモダン UI 構築 |
| 4 | [コンポーネント分割](./.docs/curriculum/04_step4_component_division.md) | 責務の分離 / Props 設計 / 再利用性 |

各ステップの制約（「Step 1 では HeroUI を使わない」など）は、**段階を踏んで理解するため**の
ものです。順番に進めてください。

---

## 🚀 セットアップ

### 必要なもの

- **Node.js 20 以上**
- **Docker Desktop**（PostgreSQL を動かすため）

### 1. リポジトリを取得

```bash
git clone https://github.com/GenkiHashioka/next-todo-curriculum.git
cd next-todo-curriculum
npm install
```

### 2. 環境変数を設定

`.env.example` をコピーして `.env` を作成し、以下の値を設定します。

```bash
cp .env.example .env
```

```bash
HEALTHCHECK_INTERVAL=30s
HEALTHCHECK_TIMEOUT=10s
HEALTHCHECK_RETRIES=5

DB_HOST=localhost
DB_LOCAL_PORT=5431
DB_CONTAINER_PORT=5432
DB_NAME=todos
DB_USER=admin
DB_PASSWORD=password

NODE_ENV=development
JWT_SECRET=<任意の長いランダム文字列>
DB_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_LOCAL_PORT}/${DB_NAME}

NGINX_LOCAL_PORT=80
NGINX_CONTAINER_PORT=80
```

> 💡 `JWT_SECRET` は自分で決めた長いランダム文字列で構いません。
> 例: `openssl rand -base64 64`（Git Bash や WSL で実行）

### 3. データベースを起動

```bash
docker compose up -d
```

起動確認（`STATUS` が `Up` になっていれば OK）:

```bash
docker compose ps
```

### 4. 開発サーバーを起動

```bash
npm run dev
```

→ http://localhost:3000 を開きます。

> ℹ️ **最初は画面がありません。**
> `src/features/` が空なので、`/login` などにアクセスしても 404 です。
> ここから Step 1 の教材に沿って、あなたが画面を作っていきます。

### 5. 最初のユーザーを作る

データベースは空の状態から始まります。Step 1 でユーザー登録画面（`/register`）を実装したら、
そこから自分のアカウントを作成してください。

---

## 🌿 ブランチの使い方

**`main` は変更しません。** 必ず自分用のブランチを切って作業します。

```bash
# 1. main から自分のベースブランチを作る（最初に 1 回だけ）
git checkout main
git checkout -b hashioka          # ← 自分の名前に置き換える
git push -u origin hashioka

# 2. ステップごとに、自分のベースブランチから作業ブランチを切る
git checkout -b hashioka-step-1
# ... 実装 ...
git add .
git commit -m "feat: Step1 ログイン画面を実装"
git push -u origin hashioka-step-1
```

ステップが完了してレビューが通ったら、自分のベースブランチにマージして次のステップへ進みます。

```
main（不変・スターター）
 └─ hashioka                    ← 自分のベース
     ├─ hashioka-step-1         ← Step 1 の作業（完了したら hashioka へマージ）
     ├─ hashioka-step-2
     ├─ hashioka-step-3
     └─ hashioka-step-4
```

---

## 📚 よく使うコマンド

```bash
npm run dev        # 開発サーバー起動（Turbopack）
npm run build      # 本番ビルド（型チェックも実行されます）
npm test           # テスト実行（API 側のテスト）
npm run check      # Biome でフォーマット＋リント（コミット前に実行推奨）
```

> ✅ **コミット前に `npm run build` が通ることを確認**してください。型エラーはここで見つかります。

---

## 🧱 技術スタック

| 分類 | 使用技術 |
|---|---|
| フレームワーク | Next.js 16（App Router） |
| UI | React 19 / HeroUI v3 / Tailwind CSS 4 |
| 言語 | TypeScript 6 |
| バリデーション | Zod 4 |
| DB | PostgreSQL 16（Docker） |
| 認証 | JWT（Cookie 保存） |
| テスト | Jest |
| コード品質 | Biome |

> ⚠️ **HeroUI は v3 です。** ネット上の記事の多くは v2 向けで **書き方が異なります**。
> v2 → v3 の対応表を [.docs/heroui-v2-to-v3-migration.md](./.docs/heroui-v2-to-v3-migration.md) に
> まとめてあるので、詰まったらここを参照してください。

---

## 📁 ディレクトリ構成

```
src/
├── app/            # ルーティング（あなたがページを追加していく）
│   └── api/        # バックエンド API（完成済み・変更しません）
├── features/       # ★ あなたが実装する場所（今は空）
├── components/     # 共通 UI（Step 4 で作ります）
├── domain/         # ビジネスルール（完成済み）
├── infrastructure/ # DB アクセス（完成済み）
├── lib/            # 共通ユーティリティ（完成済み）
├── types/          # 型定義（完成済み）
└── usecases/       # アプリケーションロジック（完成済み）
```

**触るのは `src/app/`（ページ追加）と `src/features/`、`src/components/` だけ**です。
それ以外は完成済みのバックエンドなので変更不要です。

API の仕様（エンドポイント一覧・リクエスト/レスポンス）は
[基本設計書 §4](./.docs/curriculum/00_basic_design.md) にまとまっています。

---

## 🔍 完成イメージを見たい

`reference/v3-complete` ブランチに、完成状態の実装が入っています。

```bash
git switch reference/v3-complete    # 完成版を見る
git switch main                     # 戻る
```

> 💡 **丸写しより「答え合わせ」に使うのがおすすめ**です。
> 自分で書いてみて動かなかった箇所を見比べると、理解が深まります。

---

## 🆘 困ったとき

| 症状 | 対処 |
|---|---|
| `docker compose up` でエラー | Docker Desktop が起動しているか確認 |
| DB に繋がらない | `.env` の `DB_LOCAL_PORT=5431` が他と競合していないか確認 |
| 画面が 404 | まだそのページを実装していない可能性大（教材を確認） |
| HeroUI の書き方が記事と違う | v3 を使用中。[移行対応表](./.docs/heroui-v2-to-v3-migration.md)を参照 |
| 型エラーが出る | `npm run build` で詳細を確認 |

解決しない場合は、遠慮なく質問してください。

---

**Happy Coding! 🎉**
