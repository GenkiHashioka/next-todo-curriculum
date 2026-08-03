# 見本アプリのデプロイ手順（Vercel + Neon）

受講者に見せる**完成見本**を Web 上に公開するための手順。
デプロイ対象は **`reference/v3-complete` ブランチ**（完成状態の実装）。

- **アプリ**: Vercel（無料 Hobby プラン）
- **データベース**: Neon（無料プラン・PostgreSQL）

> ℹ️ ローカル開発では Docker の PostgreSQL を使うが、Vercel には Docker が無いため
> **DB は外部（Neon）に置く**。アプリのコード変更は不要。

> ⚠️ Vercel の Hobby プランは「個人の非商用利用」向け。会社の正式な資産として運用する
> 場合は Pro プラン（$20/月）への切り替えを検討すること。

---

## 1. Neon で PostgreSQL を用意する

1. https://neon.com にアクセスし、GitHub アカウントでサインアップ
2. 新しいプロジェクトを作成
   - Project name: `next-todo-curriculum`（任意）
   - Postgres version: 16 以上
   - Region: 東京（`ap-southeast-1` など近いリージョン）
3. 作成後に表示される **接続文字列（Connection string）** を控える
   - **必ず「Pooled connection」を選ぶ**
     Vercel はリクエストごとに関数が起動するため、プーリングされていない接続だと
     接続数を使い切ってエラーになる
   - 形式: `postgresql://<user>:<password>@<host>-pooler.<region>.aws.neon.tech/<db>?sslmode=require`

### テーブルを作成する

Neon コンソールの **SQL Editor** を開き、リポジトリの
[`.docker/db/init.sql`](../.docker/db/init.sql) の内容をそのまま貼り付けて実行する。

作成されるもの:

- `users` テーブル（＋ username / deleted のインデックス）
- `todos` テーブル（＋ user_id / deleted のインデックス）
- `uuid-ossp` 拡張

> ✅ 実行後、SQL Editor で `SELECT * FROM users;` が
> 「0 行」で返れば成功（テーブルはあるがデータは空）。

---

## 2. Vercel にデプロイする

1. https://vercel.com に GitHub アカウントでサインアップ
2. **Add New → Project** から `next-todo-curriculum` をインポート
   - Private リポジトリなので、GitHub 連携時にこのリポジトリへのアクセスを許可する
3. **設定を変更する（重要）**
   | 項目 | 値 |
   |---|---|
   | Framework Preset | Next.js（自動検出される） |
   | **Production Branch** | **`reference/v3-complete`** ← 既定は `main` なので必ず変更 |
   | Build Command | 既定のまま（`next build`） |
   | Root Directory | 既定のまま（`./`） |

   > ⚠️ `main` はスターター（`src/features/` が空）なので、
   > そのままデプロイしても**画面が何も無いアプリ**が公開されてしまう。

4. **環境変数を設定する**（Environment Variables）

   | 変数名 | 値 |
   |---|---|
   | `DB_URL` | 手順 1 で控えた **Pooled** 接続文字列 |
   | `JWT_SECRET` | 長いランダム文字列（`openssl rand -base64 64` で生成） |
   | `NODE_ENV` | `production` |

   > 💡 `NEXT_PUBLIC_API_URL` は**設定しなくてよい**。
   > 未設定の場合は Vercel が渡す `VERCEL_URL`（自分自身のドメイン）が使われる。

5. **Deploy** を押す

---

## 3. 動作確認

デプロイ完了後、発行された URL（`https://xxx.vercel.app`）を開く。

1. `/register` から最初のユーザーを作成する
   - DB は空なので、まずユーザー登録が必要
   - 管理者権限が欲しい場合は、登録後に Neon の SQL Editor で
     `UPDATE users SET role = 1 WHERE username = '<自分のユーザー名>';`
     （role: 1=ADMIN, 2=MANAGER, 4=USER, 8=GUEST）
2. ログインして以下を確認する
   - Todo の作成・編集・削除・完了切り替え
   - 一覧のページネーション・フィルタ・ソート
   - プロフィール（情報編集・パスワード変更・統計）
   - ユーザー管理（ADMIN・MANAGER のみ表示される）

---

## 4. 以降の運用

- `reference/v3-complete` に push すると**自動で再デプロイ**される
- 受講者向けの README からこの URL を案内すると、
  「動く見本を触ってから実装する」流れが作れる

### うまくいかないとき

| 症状 | 原因と対処 |
|---|---|
| 500 エラー・DB に繋がらない | `DB_URL` が **Pooled** 接続文字列か確認。`?sslmode=require` が付いているかも確認 |
| ログインできるがすぐ切れる | `JWT_SECRET` が未設定、またはデプロイのたびに変わっていないか確認 |
| 画面が真っ白・404 だらけ | Production Branch が `main`（スターター）になっている可能性大 |
| ビルドは通るが API が 500 | Neon にテーブルが作られていない（手順 1 の SQL を実行したか確認） |
