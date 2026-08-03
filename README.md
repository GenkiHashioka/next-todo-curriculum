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

## 🏛 アーキテクチャ

バックエンドは **クリーンアーキテクチャ**（層ごとに責務を分け、依存の向きを内側へ揃える設計）で
構成されています。フロントエンドを実装するうえで直接触る必要はありませんが、
「なぜ画面から DB を直接触らないのか」を理解する助けになります。

```
src/
├── app/                    # 🌐 インターフェース層（Next.js App Router）
│   ├── login/ register/    #    ルーティング。各 page.tsx は薄く、features を呼ぶだけ
│   ├── todos/ profile/     #
│   ├── users/              #
│   └── api/                #    バックエンド API（受講者は変更しない）
│
├── features/               # 🎨 フィーチャー層（★ 画面の実装本体）
│   ├── auth/               #    ログイン・ユーザー登録
│   ├── todos/              #    Todo 一覧・詳細
│   ├── profile/            #    プロフィール（情報編集・パスワード変更・統計）
│   └── users/              #    ユーザー管理（ADMIN・MANAGER のみ）
├── components/             #    全ページ共通の UI（Header）
│
├── usecases/               # 🔄 ユースケース層（アプリケーションロジック）
│   ├── AuthUseCase.ts      #    認証
│   ├── TodoUseCase.ts      #    Todo 操作
│   └── UserUseCase.ts      #    ユーザー操作
│
├── domain/                 # 🎯 ドメイン層（ビジネスルールの中心）
│   ├── entities/           #    User / Todo
│   └── repositories/       #    リポジトリのインターフェース（実装は持たない）
│
├── infrastructure/         # 🏗 インフラストラクチャ層（外部との境界）
│   ├── database/           #    PostgreSQL 接続
│   └── repositories/       #    リポジトリの実装（生 SQL）
│
├── lib/                    # 🛠 共通ライブラリ（層をまたいで使う）
│   ├── api.ts              #    ★ フロントから API を呼ぶ Server Actions
│   ├── auth-middleware.ts  #    JWT 認証ミドルウェア
│   ├── container.ts        #    DI コンテナ
│   ├── jwt.ts / cookie.ts  #    トークン・Cookie
│   ├── response.ts         #    API レスポンスの共通形式
│   ├── validation.ts       #    Zod スキーマ
│   └── date-utils.ts       #    JST 日時ユーティリティ
│
└── types/                  # 📋 型定義
```

### 依存の向き

```
app ─→ usecases ─→ domain
features ─→ lib/api.ts ─→ (API) ─→ usecases ─→ domain
                                  infrastructure ─→ domain
```

内側（`domain`）ほど安定していて、外側（`app` / `infrastructure`）に依存しません。
DB を PostgreSQL から別のものに変えても、`domain` と `usecases` は変更不要という考え方です。

### 設計の要点

- **層の分離** — 各層が自分の責務だけを持ち、越境しない
- **依存性の注入（DI）** — `lib/container.ts` が実装を組み立て、上位層は interface だけを知る
- **テスタビリティ** — 依存を差し替えられるので、DB なしで **425 件**のテストが動く
- **型安全性** — TypeScript 6 による厳密な型チェック（`npm run build` で検証）

> 💡 **フロントから見ると**: 画面（`features/`）は `lib/api.ts` の Server Actions を呼ぶだけで、
> その先の層構造を意識する必要はありません。この「境界」があるおかげで、
> バックエンドの実装が変わってもフロントは影響を受けません。

---

## 📁 実装を読むときの入口

まずは `src/features/` から読むのがおすすめです。
各機能の `components/` 配下が、**Step 4 でコンポーネント分割した結果**です。

Step ごとの意図は [カリキュラム教材](./.docs/curriculum/00_basic_design.md) を参照してください。
