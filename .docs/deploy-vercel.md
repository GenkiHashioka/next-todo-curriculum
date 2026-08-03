# 見本アプリのデプロイ手順（Vercel + Neon）

受講者に見せる**完成見本**を Web 上に公開するための手順。
デプロイ対象は **`reference/v3-complete` ブランチ**（完成状態の実装）。

- **アプリ**: Vercel（無料 Hobby プラン）
- **データベース**: Neon（Vercel の Marketplace 統合を利用・無料プラン）

> ℹ️ ローカル開発では Docker の PostgreSQL を使うが、Vercel には Docker が無いため
> **DB は外部（Neon）に置く**。アプリのコード側は対応済みで変更不要。

> ⚠️ Vercel の Hobby プランは「個人の非商用利用」向け。会社の正式な資産として運用する
> 場合は Pro プラン（$20/月）への切り替えを検討すること。

---

## 手順の流れ

Neon 単体でプロジェクトを作ろうとすると「Vercel の Neon Postgres 統合を使ってください」と
案内されるため、**Vercel を先に作り、そこから Neon を追加する**流れになる。

```
1. Vercel でプロジェクト作成（先に作る）
2. Vercel の Marketplace から Neon を追加（DB が自動で作られる）
3. Neon にテーブルを作成
4. 残りの環境変数を設定して再デプロイ
5. 動作確認
```

---

## 1. Vercel でプロジェクトを作成する

1. https://vercel.com に GitHub アカウントでサインアップ
2. **Add New → Project** から `next-todo-curriculum` をインポート
   - Private リポジトリなので、GitHub 連携時にこのリポジトリへのアクセスを許可する
3. **設定を変更する（重要）**

   | 項目 | 値 |
   |---|---|
   | Framework Preset | Next.js（自動検出される） |
   | **Production Branch** | **`reference/v3-complete`** ← 既定は `main` なので必ず変更 |
   | Build Command / Root Directory | 既定のまま |

   > ⚠️ `main` はスターター（`src/features/` が空）なので、
   > そのままデプロイすると**画面が何も無いアプリ**が公開されてしまう。

   > 💡 Production Branch は Project Settings → Git からいつでも変更できる。
   > 初回デプロイが `main` で走ってしまっても、変更後に再デプロイすればよい。

4. この時点では DB が無いため、ビルドが通ってもアプリはまだ正常に動かない。次へ進む。

---

## 2. Neon（PostgreSQL）を追加する

1. Vercel のプロジェクト画面 → **Storage** タブ（または Integrations / Marketplace）
2. **Neon（Postgres）** を選んで作成
   - Region は東京など近い場所を選ぶ
   - プランは Free を選択
3. 作成すると、Vercel の環境変数に接続情報が**自動で追加**される
   - `DATABASE_URL`（プーリング済み）、`POSTGRES_URL` など

> 💡 **接続文字列の名前について**
> このアプリは本来 `DB_URL` を参照するが、統合が入れる `DATABASE_URL` /
> `POSTGRES_URL` でも動くようコード側を対応済み（`src/infrastructure/database/connection.ts`）。
> **手動での追加設定は不要。**
>
> Vercel はリクエストごとに関数が起動するため、接続は**プーリング済み**
> （ホスト名に `-pooler` が入っているもの）である必要がある。
> 統合が入れる `DATABASE_URL` は通常プーリング済みなのでそのまま使える。

---

## 3. テーブルを作成する

Vercel の Storage 画面から Neon のコンソールを開く（または https://console.neon.tech）。

**SQL Editor** に、リポジトリの [`.docker/db/init.sql`](../.docker/db/init.sql) の内容を
そのまま貼り付けて実行する。

作成されるもの:

- `users` テーブル（＋ username / deleted のインデックス）
- `todos` テーブル（＋ user_id / deleted のインデックス）
- `uuid-ossp` 拡張

> ✅ 実行後、`SELECT * FROM users;` が「0 行」で返れば成功
> （テーブルはあるがデータは空）。

---

## 4. 残りの環境変数を設定して再デプロイ

Vercel の **Settings → Environment Variables** で、以下を追加する。

| 変数名 | 値 |
|---|---|
| `JWT_SECRET` | 長いランダム文字列（`openssl rand -base64 64` で生成） |
| `NODE_ENV` | `production` |

> 💡 `DB_URL` は不要（統合が入れる `DATABASE_URL` が使われる）。
> `NEXT_PUBLIC_API_URL` も不要（Vercel が渡す `VERCEL_URL` で自己解決する）。

設定したら **Deployments → 最新のデプロイ → Redeploy** で再デプロイする
（環境変数はビルド時に読み込まれるため、追加後は再デプロイが必要）。

---

## 5. 動作確認

発行された URL（`https://xxx.vercel.app`）を開く。

1. `/register` から最初のユーザーを作成する
   - DB は空なので、まずユーザー登録が必要
   - 管理者権限が欲しい場合は、登録後に Neon の SQL Editor で
     ```sql
     UPDATE users SET role = 1 WHERE username = '<自分のユーザー名>';
     ```
     （role: 1=ADMIN, 2=MANAGER, 4=USER, 8=GUEST）
2. ログインして以下を確認する
   - Todo の作成・編集・削除・完了切り替え
   - 一覧のページネーション・フィルタ・ソート
   - プロフィール（情報編集・パスワード変更・統計）
   - ユーザー管理（ADMIN・MANAGER のみ表示される）

---

## 6. 以降の運用

- `reference/v3-complete` に push すると**自動で再デプロイ**される
- 受講者向けの README からこの URL を案内すると、
  「動く見本を触ってから実装する」流れが作れる

### うまくいかないとき

| 症状 | 原因と対処 |
|---|---|
| 画面が真っ白・404 だらけ | Production Branch が `main`（スターター）になっている可能性大 |
| 500 エラー・DB に繋がらない | Neon の統合が入っているか、環境変数に `DATABASE_URL` があるか確認 |
| `self signed certificate` などの SSL エラー | 接続文字列に `sslmode=require` が付いているか確認 |
| ビルドは通るが API が 500 | Neon にテーブルが作られていない（手順 3 の SQL を実行したか確認） |
| ログインできるがすぐ切れる | `JWT_SECRET` が未設定。設定後に再デプロイしたか確認 |
| 環境変数を足したのに反映されない | 追加後に **Redeploy** が必要 |
