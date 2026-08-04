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

> 🔍 **どんなものを作るのか**は、[参考実装](https://next-todo-curriculum.vercel.app)を
> 触ってみると掴めます。ただし**そのとおりに作る必要はありません**
> （[詳しくはこちら](#-参考実装を見たい)）。

---

## 🚀 セットアップ

開発環境は **Dev Container**（Docker の中で開発する仕組み）で統一しています。
Node.js や PostgreSQL を自分の PC に入れる必要はありません。

### 必要なもの

- **コンテナを動かす環境**（下記参照）
- **VS Code** + [Dev Containers 拡張](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
  - Cursor でも同じ手順で使えます

> ⚠️ **エディタは VS Code（または Cursor）を使ってください。**
> このカリキュラムは Dev Container を前提にしており、他のエディタでは環境が揃いません。

**コンテナ環境の選び方**

| OS | 推奨 |
|---|---|
| **Windows** | **Docker Desktop**（WSL2 バックエンド） |
| **macOS** | **Docker Desktop は避けてください。** [OrbStack](https://orbstack.dev/) / [Colima](https://github.com/abiosoft/colima) / [Podman Desktop](https://podman-desktop.io/) などを使ってください |

> ℹ️ **Mac で代替を使う場合の注意**
> Dev Containers 拡張が公式にサポートしているのは Docker です。
> 他のランタイムは「Docker 互換 CLI として動く場合が多いが、公式サポートではない」
> という位置づけです（[VS Code 公式ドキュメント](https://code.visualstudio.com/docs/devcontainers/containers)）。
> 動かない場合は環境を切り分ける必要があるので、**セットアップで詰まったら早めに相談してください。**
>
> なお OrbStack は**業務利用が有償**です。無償で使うなら Colima か Podman Desktop になります。

### 1. リポジトリを取得

**取得する場所が OS によって違います。ここだけ注意してください。**

<table>
<tr><th>OS</th><th>clone する場所</th></tr>
<tr>
<td><b>Windows</b></td>
<td>

**必ず WSL2 の中**に置いてください。
Windows 側（`C:\Users\...`）に置くと**動作が極端に遅くなります**。

```bash
# WSL2 のターミナルを開いて実行
cd ~
git clone https://github.com/GenkiHashioka/next-todo-curriculum.git
```

</td>
</tr>
<tr>
<td><b>macOS / Linux</b></td>
<td>

どこでも構いません。

```bash
git clone https://github.com/GenkiHashioka/next-todo-curriculum.git
```

</td>
</tr>
</table>

### 2. コンテナで開く

取得したフォルダを VS Code で開くと、右下に通知が出ます。

> Folder contains a Dev Container configuration file. Reopen folder to develop in a container.

**「Reopen in Container」** を押してください。
（通知が出ない場合は `F1` →「Dev Containers: Reopen in Container」）

これだけで、次がすべて自動で行われます。

- Node.js と PostgreSQL の準備
- `.env` の作成（`JWT_SECRET` も自動生成されます）
- `main` へ誤って push しないための設定
- 依存パッケージのインストール

> ⏳ **初回は 5〜15 分ほどかかります。**（Docker イメージの取得と依存のインストール）
> 2 回目以降は数秒で開きます。

### 3. 開発サーバーを起動

コンテナの中のターミナル（VS Code のターミナル）で実行します。

```bash
npm run dev
```

→ http://localhost:3000 を開きます。

> ℹ️ **最初は画面がありません。**
> `src/features/` が空なので、`/login` などにアクセスしても 404 です。
> ここから Step 1 の教材に沿って、あなたが画面を作っていきます。

### 4. 最初のユーザーを作る

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

```
main（不変・スターター）
 └─ hashioka                    ← 自分のベース
     ├─ hashioka-step-1         ← Step 1 の作業（完了したら hashioka へマージ）
     ├─ hashioka-step-2
     ├─ hashioka-step-3
     └─ hashioka-step-4
```

### レビューの出し方

ステップの実装が終わったら、**まず提出前チェックを実行**してください。

```bash
npm run submit-check
```

ブランチ・ビルド・ステップの制約など、機械的に確認できることを検査します。
指摘が出たら**自分で直してから**提出してください（このチェックは代わりに直しません。
直し方が分からなければ遠慮なく聞いてください）。

チェックが通ったら、GitHub で **プルリクエスト（PR）** を作成します。

| | |
|---|---|
| **from** | `hashioka-step-1`（作業ブランチ） |
| **to** | `hashioka`（自分のベースブランチ） |

> ⚠️ **`main` に向けないでください。** 向き先は必ず自分のベースブランチです。

PR を作ると、ビルドとテストが自動で実行されます（GitHub の PR 画面で結果が見えます）。
**緑になったことを確認してから**レビューを依頼してください。

レビューが通ったら、**PR 画面の Merge ボタン**でマージします。
そのあと次のステップのブランチを、自分のベースブランチから切ります。

```bash
git checkout hashioka
git pull                          # マージ結果を取り込む
git checkout -b hashioka-step-2   # 次のステップへ
```

---

## 📚 よく使うコマンド

```bash
npm run dev            # 開発サーバー起動（Turbopack）
npm run build          # 本番ビルド（型チェックも実行されます）
npm run check          # Biome でフォーマット＋リント（コミット前に実行推奨）
npm test               # テスト実行（API 側のテスト）

npm run submit-check   # ★ 提出前チェック（レビューに出す前に必ず実行）
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
| 開発環境 | Dev Container（Docker） |

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

## 🔍 参考実装を見たい

デプロイしてあるので、環境構築なしでそのまま触れます。

**https://next-todo-curriculum.vercel.app**

コードは `reference/v3-complete` ブランチにあります。

```bash
git switch reference/v3-complete    # 参考実装を見る
git switch main                     # 戻る
```

> 📘 **これは「唯一の正解」ではありません。**
>
> この実装は、カリキュラム作成者が書いたものです。
> **同じ見た目・同じ書き方にする必要はありません。**
>
> このカリキュラムの目的は「自分で考えて Todo アプリを作りきること」です。
> レイアウトや配色、コンポーネントの分け方が違っても、
> **要件を満たしていて、なぜそう作ったか説明できれば、それはあなたの正解です。**
>
> 使い方としては、
> - 動くものを触って**完成イメージを掴む**
> - 詰まったときに**書き方の一例として参照する**
>
> のがおすすめです。丸写しすると、そのステップで学べるはずのものを逃してしまいます。

---

## 🆘 困ったとき

| 症状 | 対処 |
|---|---|
| コンテナが起動しない | コンテナ環境（Docker Desktop / OrbStack / Colima など）が起動しているか確認 |
| **動作がとにかく重い（Windows）** | リポジトリを **WSL2 の中**に置いているか確認。Windows 側（`C:\...`）だと極端に遅くなります |
| **「Reopen in Container」が反応しない（Mac）** | Docker 以外のランタイムは公式サポート外です。`docker ps` が通るか確認し、通らなければランタイム側の設定を見直してください |
| DB に繋がらない | `.env` の `DB_HOST` が `localhost` ではなく **`db`** になっているか確認 |
| ポート 5431 が使えない | 他のプロジェクトの PostgreSQL と衝突。`.env` の `DB_LOCAL_PORT` を変更 |
| セットアップをやり直したい | `F1` →「Dev Containers: Rebuild Container」 |
| DB を空に戻したい | コンテナの外で `docker compose down -v`（データが消えます） |
| 画面が 404 | まだそのページを実装していない可能性大（教材を確認） |
| HeroUI の書き方が記事と違う | v3 を使用中。[移行対応表](./.docs/heroui-v2-to-v3-migration.md)を参照 |
| 型エラーが出る | `npm run build` で詳細を確認 |
| 削除したはずのページで型エラーが出る | ビルドキャッシュが古い。`rm -rf .next` してから再ビルド<br>（ブランチを切り替えた直後に起きやすい） |

解決しない場合は、遠慮なく質問してください。

---

**Happy Coding! 🎉**
