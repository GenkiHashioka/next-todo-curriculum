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
1. Vercel でプロジェクト作成（先に作る／初回は main が公開される）
2. デプロイ対象を reference/v3-complete に切り替える（作成後の設定）
3. Vercel の Storage から Neon を追加（DB が自動で作られる）
4. Neon にテーブルを作成
5. 残りの環境変数を設定して再デプロイ
6. 動作確認
```

---

## 1. Vercel でプロジェクトを作成する

1. https://vercel.com に GitHub アカウントでサインアップ
2. **Add New → Project** から `next-todo-curriculum` をインポート
   - Private リポジトリなので、GitHub 連携時にこのリポジトリへのアクセスを許可する
3. インポート画面では以下だけ設定する

   | 項目 | 値 |
   |---|---|
   | Framework Preset | Next.js（自動検出される） |
   | Build Command / Root Directory | 既定のまま |
   | Environment Variables | ここで `JWT_SECRET` を入れておくと後が楽（値は下記参照） |

   **`JWT_SECRET` は新しく生成する。ローカルの `.env` の値は流用しない。**

   ```bash
   openssl rand -base64 64    # Git Bash / WSL で実行し、出力を貼り付ける
   ```

   > ⚠️ 開発機と本番で同じ秘密鍵を使うと、ローカルの `.env` が漏れた時点で本番も
   > 破られる。本番用の鍵は本番にしか存在しない値にすること。
   > （この鍵はログイン状態の署名に使うだけなので、ローカルと違う値で問題ない）

   > ℹ️ **`NODE_ENV` は設定しない。** Vercel が本番デプロイで自動的に `production` を
   > 設定するため、手動で入れる必要はない。

   > ℹ️ **インポート画面に「Production Branch」の項目はない。**
   > デプロイ対象ブランチはプロジェクト作成後に変更する（次の手順 2）。

4. **Deploy** を押す
   - この初回デプロイは既定ブランチ（`main`＝スターター）で走るため、
     **画面が何も無いアプリ**が公開される。想定どおりなので気にしなくてよい。
   - DB もまだ無いので、この時点ではアプリは正常に動かない。

---

## 2. デプロイ対象を見本ブランチに切り替える

`main` はスターター（`src/features/` が空）なので、そのままでは中身の無いアプリが
公開され続ける。**完成見本のブランチに切り替える。**

1. プロジェクト → **Settings** → 左メニュー **Environments**
2. **Production** をクリック
3. **Branch Tracking** の項目で、`main` から **`reference/v3-complete`** に変更して **Save**

   > ℹ️ 以前は Settings → Git にあったが、現在は **Environments** 配下に移動している。
   > Git の画面には Production Branch の項目は無い。

4. 設定を変えただけでは本番 URL は切り替わらないので、どちらかで反映させる
   - **Deployments** タブ → `reference/v3-complete` のデプロイの **⋯ → Promote to Production**
   - または `reference/v3-complete` に何か push して本番デプロイを走らせる

---

## 3. Neon（PostgreSQL）を追加する

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

## 4. テーブルを作成する

Vercel の Storage 画面から Neon のコンソールを開く（または https://console.neon.tech）。

### まず「どの DB に作るか」を確認する

Neon の SQL Editor には **Branch**（Neon 独自の DB ブランチ）と **Database** の
選択欄がある。複数ある場合は、**アプリが接続する DB を選ぶ必要がある。**

接続先は Vercel の環境変数 `DATABASE_URL` に書かれている。

```
postgresql://user:pass@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
                                                                  ~~~~~~
                                                                  ← これが DB 名
```

SQL Editor で次を実行し、表示される DB 名が上記と一致していることを確認する。

```sql
SELECT current_database();
```

> ⚠️ 別の DB にテーブルを作ってしまうと、テーブルは存在するのにアプリからは
> 「テーブルが無い」と言われる状態になる（API が 500 を返す）。

### テーブルを作成する

リポジトリの [`.docker/db/init.sql`](../.docker/db/init.sql) の内容をそのまま
SQL Editor に貼り付けて実行する。

作成されるもの:

- `users` テーブル（＋ username / deleted のインデックス）
- `todos` テーブル（＋ user_id / deleted のインデックス）
- `uuid-ossp` 拡張

### 作成できたか確認する

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

→ `users` と `todos` が出れば成功。
`SELECT * FROM users;` が「0 行」で返るのも正常（テーブルはあるがデータは空）。

---

## 5. 残りの環境変数を設定して再デプロイ

手順 1 で `JWT_SECRET` を設定済みならこの章は不要。まだなら
Vercel の **Settings → Environment Variables** で追加する。

| 変数名 | 値 |
|---|---|
| `JWT_SECRET` | **新しく生成した**長いランダム文字列（`openssl rand -base64 64`） |

**設定しなくてよいもの:**

| 変数名 | 理由 |
|---|---|
| `NODE_ENV` | Vercel が本番デプロイで自動的に `production` を設定する |
| `DB_URL` | Neon 統合が入れる `DATABASE_URL` がそのまま使われる |
| `NEXT_PUBLIC_API_URL` | Vercel が渡す `VERCEL_URL` で自己解決する |
| `DB_HOST` / `DB_NAME` などの個別項目 | ローカルの Docker 用。Vercel では接続文字列だけあればよい |

設定したら **Deployments → 最新のデプロイ → Redeploy** で再デプロイする
（環境変数はビルド時に読み込まれるため、追加後は再デプロイが必要）。

---

## 6. 動作確認

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

## 7. 以降の運用

- `reference/v3-complete` に push すると**自動で再デプロイ**される
- 受講者向けの README からこの URL を案内すると、
  「動く見本を触ってから実装する」流れが作れる

### うまくいかないとき

| 症状 | 原因と対処 |
|---|---|
| 画面が真っ白・404 だらけ | Settings → Environments → Production の Branch Tracking が `main`（スターター）のままの可能性大 |
| 500 エラー・DB に繋がらない | Neon の統合が入っているか、環境変数に `DATABASE_URL` があるか確認 |
| `self signed certificate` などの SSL エラー | 接続文字列に `sslmode=require` が付いているか確認 |
| ビルドは通るが API が 500 | Neon にテーブルが無い、または DATABASE_URL とは別の DB に作ってしまっている（手順 4 の current_database() で確認） |
| ログインできるがすぐ切れる | `JWT_SECRET` が未設定。設定後に再デプロイしたか確認 |
| 環境変数を足したのに反映されない | 追加後に **Redeploy** が必要 |
