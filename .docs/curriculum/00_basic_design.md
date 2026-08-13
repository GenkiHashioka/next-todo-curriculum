# Todo アプリケーション 基本設計書

## 1. プロジェクト概要

### 1.1 目的
React + Next.js の初心者が、API との連携を学習するための Todo アプリケーションを段階的に構築する。

### 1.2 対象者
- React の基本概念を理解している初学者
- Next.js のルーティングと基本構造を理解している学習者
- API との通信を学びたい開発者

### 1.3 学習目標
- クライアントコンポーネントでの状態管理とAPIフェッチの理解
- サーバーコンポーネントとクライアントコンポーネントの使い分け
- UIライブラリ（HeroUI）を活用したモダンなUI構築
- コンポーネント設計による責務の分離と再利用性の向上

---

## 2. アプリケーション要件

### 2.1 機能要件

#### 認証機能
- ユーザー登録
- ログイン
- ログアウト
- 認証状態の保持（Cookie/JWT）

#### Todo管理機能
- Todo一覧表示（ページネーション、フィルタリング、ソート）
- Todo詳細表示
- Todo作成
- Todo更新
- Todo削除
- Todo完了/未完了の切り替え

#### ユーザー管理機能
- プロフィール表示
- プロフィール更新
- パスワード変更
- ユーザーのTodo統計表示

### 2.2 非機能要件
- レスポンシブデザイン（モバイル、タブレット、デスクトップ対応）
- アクセシビリティ対応
- エラーハンドリング
- ローディング状態の表示

---

## 3. 技術スタック

### 3.1 フロントエンド
- **フレームワーク**: Next.js 16.3.0 (App Router)
- **UI ライブラリ**: React 19.2.8
- **スタイリング**: Tailwind CSS 4.3, HeroUI 3.2.3
- **型定義**: TypeScript 6.0.3
- **状態管理**: React Hooks（useState, useEffect, etc.）

### 3.2 バックエンド（既存API）
- **認証**: JWT（JSON Web Token）
- **データベース**: PostgreSQL
- **バリデーション**: Zod 4.4.3

---

## 4. API エンドポイント一覧

### 4.1 認証API

#### POST /api/auth/register
- **概要**: 新規ユーザー登録
- **リクエスト**:
  ```json
  {
    "username": "string (必須, 1-50文字)",
    "password": "string (必須, 6文字以上)",
    "firstName": "string (任意)",
    "lastName": "string (任意)"
  }
  ```
- **レスポンス**: ユーザー情報 + JWT トークン

#### POST /api/auth/login
- **概要**: ログイン
- **リクエスト**:
  ```json
  {
    "username": "string (必須)",
    "password": "string (必須)"
  }
  ```
- **レスポンス**: ユーザー情報 + JWT トークン

#### POST /api/auth/logout
- **概要**: ログアウト
- **リクエスト**: なし
- **レスポンス**: 成功メッセージ

### 4.2 Todo API

#### GET /api/todos
- **概要**: Todo一覧取得（ページネーション、フィルタリング、ソート対応）
- **クエリパラメータ**:
  - `page`: ページ番号（デフォルト: 1）
  - `perPage`: 1ページあたりの件数（デフォルト: 20, 最大: 100）
  - `completedFilter`: 完了フィルタ（all/completed/incomplete）
  - `sortBy`: ソート基準（createdAt/updatedAt/title）
  - `sortOrder`: ソート順（asc/desc）
- **レスポンス**: Todo一覧 + ページネーション情報

#### GET /api/todos/[id]
- **概要**: Todo詳細取得
- **レスポンス**: Todo詳細情報

#### POST /api/todos
- **概要**: Todo作成
- **リクエスト**:
  ```json
  {
    "title": "string (必須, 1-32文字)",
    "descriptions": "string (任意, 128文字以下)"
  }
  ```
- **レスポンス**: 作成されたTodo

#### PUT /api/todos/[id]
- **概要**: Todo更新
- **リクエスト**:
  ```json
  {
    "title": "string (任意, 1-32文字)",
    "descriptions": "string (任意, 128文字以下)"
  }
  ```
- **レスポンス**: 更新されたTodo

#### DELETE /api/todos/[id]
- **概要**: Todo削除
- **レスポンス**: 成功メッセージ

### 4.3 ユーザーAPI

#### GET /api/users/me
- **概要**: 現在ログイン中のユーザー情報取得
- **レスポンス**: ユーザー情報

#### PATCH /api/users/me
- **概要**: プロフィール更新
- **リクエスト**:
  ```json
  {
    "firstName": "string (任意)",
    "lastName": "string (任意)",
    "firstNameRuby": "string (任意)",
    "lastNameRuby": "string (任意)"
  }
  ```
- **レスポンス**: 更新されたユーザー情報

#### GET /api/users/me/todos
- **概要**: ログインユーザーのTodo一覧取得
- **レスポンス**: Todo一覧

#### GET /api/users/me/todos/stats
- **概要**: ログインユーザーのTodo統計取得
- **レスポンス**:
  ```json
  {
    "totalTodos": "number",
    "completedTodos": "number",
    "pendingTodos": "number",
    "completionRate": "number"
  }
  ```

#### PUT /api/users/me/password
- **概要**: パスワード変更
- **リクエスト**:
  ```json
  {
    "currentPassword": "string (必須)",
    "newPassword": "string (必須, 6文字以上)"
  }
  ```
- **レスポンス**: 成功メッセージ

---

## 5. ディレクトリ構成

> 参考実装の構成です（**これと同じにする必要はありません**）。`app/` は薄いルーティング層で、
> 各ルートは `page.tsx`（+ `error.tsx` / `loading.tsx`）から `features/` 側のコンポーネントを
> 呼び出します。ファイルの分け方や名前は、自分で考えて決めて構いません。

```
src/
├── app/                          # Next.js App Router（薄いルーティング層）
│   ├── layout.tsx                # ルートレイアウト（Header を配置）
│   ├── page.tsx                  # ホームページ
│   ├── globals.css               # グローバルCSS（Tailwind + HeroUI）
│   ├── providers.tsx             # Toast.Provider 等
│   ├── api/                      # APIルート（既存・変更しない）
│   ├── login/                    # /login
│   ├── register/                 # /register
│   ├── todos/                    # /todos
│   │   └── [id]/                 # /todos/[id]
│   ├── profile/                  # /profile
│   └── users/                    # /users（ADMIN・MANAGER のみ）
│       ├── [id]/                 # /users/[id]
│       └── create/               # /users/create
├── components/                   # 全ページ共通のUI
│   └── Header.tsx                # 共通ヘッダー（Step 4 で切り出し）
├── features/                     # 機能別UIコンポーネント
│   ├── auth/                     # 認証機能
│   │   ├── components/           # 分割コンポーネント（Step 4 以降）
│   │   ├── LoginPage.tsx         # ログインページコンポーネント
│   │   └── RegisterPage.tsx      # 登録ページコンポーネント
│   ├── todos/                    # Todo機能
│   │   ├── components/           # 分割コンポーネント（Step 4 以降）
│   │   ├── TodoListPage.tsx      # Todo一覧ページコンポーネント
│   │   └── TodoDetailPage.tsx    # Todo詳細ページコンポーネント
│   ├── profile/                  # プロフィール機能
│   │   ├── components/           # 分割コンポーネント（Step 4 以降）
│   │   └── ProfilePage.tsx       # プロフィールページコンポーネント
│   └── users/                    # ユーザー管理機能
│       ├── components/           # 分割コンポーネント（Step 4 以降）
│       ├── UserListPage.tsx      # ユーザー一覧ページコンポーネント
│       ├── UserDetailPage.tsx    # ユーザー詳細ページコンポーネント
│       └── CreateUserPage.tsx    # ユーザー作成ページコンポーネント
├── lib/                          # ユーティリティ・共通ロジック（既存）
└── types/                        # 型定義（既存）
```

---

## 6. 学習ステップ概要

### Step 1: クライアントコンポーネントによる実装
- **目標**: APIとの基本的な通信を理解する
- **制約**: 
  - クライアントコンポーネントのみ使用
  - 1ページ = 1ファイル = 1コンポーネント
  - Tailwind CSS のみ使用（HeroUI 不可）
- **成果物**: 基本的な機能が動作するTodoアプリ

### Step 2: サーバーコンポーネントへのリプレイス
- **目標**: サーバーコンポーネントとクライアントコンポーネントの使い分けを理解する
- **作業**: データフェッチが不要な部分をサーバーコンポーネント化
- **成果物**: パフォーマンスが向上したTodoアプリ

### Step 3: UIライブラリを使用した画面のリプレイス
- **目標**: HeroUIを活用したモダンなUI構築を学ぶ
- **作業**: Tailwind CSSで実装したUIをHeroUIコンポーネントに置き換え
- **成果物**: 洗練されたUIのTodoアプリ

### Step 4: UIコンポーネントの分割（最終ステップ）
- **目標**: コンポーネント設計の基礎を学ぶ
- **作業**: 1ファイルで実装していたコンポーネントを適切な粒度に分割
- **成果物**: メンテナンス性の高いコンポーネント構成

---

## 7. 共通設計方針

### 7.1 認証状態管理
- Cookie ベースの認証（JWT）
- ミドルウェアで認証チェック
- 未認証時はログインページへリダイレクト

### 7.2 エラーハンドリング
- API エラーは try-catch で捕捉
- ユーザーフレンドリーなエラーメッセージ表示
- ネットワークエラーの考慮

### 7.3 ローディング状態
- データフェッチ中はローディングインジケーター表示
- 楽観的更新（Optimistic Update）の活用

### 7.4 バリデーション
- クライアント側でも基本的なバリデーションを実施
- サーバー側のバリデーションエラーを適切に表示

---

## 8. 注意事項

### 8.1 学習者へのアドバイス
- 各ステップを順番に進めることを推奨
- 実装前に設計書を熟読し、全体像を把握すること
- わからない部分は公式ドキュメントを参照すること

### 8.2 AI との付き合い方

**AI（Claude Code / GitHub Copilot など）を使うことは歓迎します。**
実務でも当たり前に使う道具なので、使いこなせること自体が力になります。

ただし、このカリキュラムの目的は **「自分で書けるようになること」** です。
次の点だけ意識してください。

| ✅ おすすめの使い方 | ⚠️ もったいない使い方 |
|---|---|
| エラーの意味を聞く | 「この画面を作って」と丸投げする |
| 「なぜこう書くのか」を聞く | 動いたコードを理解せず次へ進む |
| 自分が書いたコードをレビューしてもらう | 教材を読まずに AI にだけ聞く |
| 設計の選択肢を挙げてもらい、自分で選ぶ | |

このリポジトリには [`AGENTS.md`](../../AGENTS.md) を置いてあり、
**AI が「答えを書く人」ではなく「教える人」として振る舞う**よう指示しています。
そのため、聞いてもすぐには完成コードが出てこないはずです。意地悪ではなく、
そのほうが身につくためです。

> 💡 レビューでは「なぜそう書いたか」を質問します。
> 説明できることが、そのステップを終えた証明になります。

### 8.3 実装時の留意点

- TypeScript の型定義を活用し、型安全性を確保
- コンソールエラーが出ないように実装
- アクセシビリティを意識したマークアップ

### 8.4 拡張性の考慮
- 将来的な機能追加を見据えた設計
- コンポーネントの再利用性を意識
- テストしやすいコード構造

---

## 9. 参考リソース

### 9.1 公式ドキュメント
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [HeroUI Documentation](https://heroui.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### 9.2 関連ツール
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev)

---

## 10. 各ステップの詳細設計書

各ステップの詳細な実装方針については、以下の個別設計書を参照してください。

- [Step 1: クライアントコンポーネントによる実装](./01_step1_client_component.md)
- [Step 2: サーバーコンポーネントへのリプレイス](./02_step2_server_component.md)
- [Step 3: UIライブラリを使用した画面のリプレイス](./03_step3_ui_library.md)
- [Step 4: UIコンポーネントの分割](./04_step4_component_division.md)

---

**Document Version**: 2.1.0  
**Last Updated**: 2026-08-03  
**Author**: jugeeem（原著）  
**Reviser**: Genki Hashioka（HeroUI v3・近代化スタックへの改訂）
