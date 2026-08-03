# Step 3: UIライブラリを使用した画面のリプレイス

## 目次
1. [Step 3 の概要](#1-step-3-の概要)
2. [HeroUI の基本](#2-heroui-の基本)
3. [コンポーネント別リプレイスガイド](#3-コンポーネント別リプレイスガイド)
   - 3.1 フォーム要素
   - 3.2 カード
   - 3.3 モーダル
   - 3.4 ナビゲーション
   - 3.5 Select
   - 3.6 Checkbox
   - 3.7 Table
   - 3.8 Error Boundary
   - 3.9 Loading State
4. [ページ別リプレイスガイド](#4-ページ別リプレイスガイド)
   - 4.1 ログインページ
   - 4.2 ユーザー登録ページ
   - 4.3 Todo 一覧ページ
   - 4.4 Todo 詳細ページ
   - 4.5 プロフィールページ
   - 4.6 ユーザー作成ページ
   - 4.7 ユーザー詳細ページ
   - 4.8 ユーザー一覧ページ
   - 4.9 Error Boundary の実装
   - 4.10 Loading State の実装
5. [スタイリングのベストプラクティス](#5-スタイリングのベストプラクティス)
6. [アクセシビリティの考慮](#6-アクセシビリティの考慮)
7. [実装チェックリスト](#7-実装チェックリスト)
8. [動作確認項目](#8-動作確認項目)
9. [次のステップへの準備](#9-次のステップへの準備)

---

## 1. Step 3 の概要

### 1.1 目的
- HeroUI コンポーネントライブラリの使い方を学ぶ
- モダンで洗練された UI を構築する
- UIライブラリを活用した効率的な開発手法を習得する

### 1.2 変更方針
Step 1・Step 2 で Tailwind CSS のみで実装していた UI を、HeroUI のコンポーネントに置き換えます。

**置き換え対象**:
- フォーム要素（Input, TextArea, Button）
- カード（Card）
- モーダル（Modal）
- テーブル・リスト表示
- ナビゲーション（v3 に Navbar は無いので素の `<header>` で自作）
- ドロップダウン（Select）
- エラー表示（Error Boundary）
- ローディング表示（Loading State）

### 1.3 制約条件
- **コンポーネントの分割は行わない**（Step 4 で実施）
- **カスタムフックの作成は行わない**（本カリキュラムの対象外）
- **ファイル構成は変更しない**

---

## 2. HeroUI の基本

### 2.1 HeroUI とは
HeroUI は React ベースの UI コンポーネントライブラリで、Next.js との統合がスムーズに行えます。

**特徴**:
- Tailwind CSS ベース
- アクセシビリティ対応
- ダークモード対応
- TypeScript サポート
- カスタマイズ性が高い

### 2.2 セットアップ確認

プロジェクトには既に HeroUI v3 がインストールされています（`package.json` 確認済み）。

> **📌 HeroUI v3 について**
> HeroUI は v3 で **React Aria ベースに再設計**され、v2 とは API が大きく変わりました。
> 具体的な v2→v3 の対応は `.docs/heroui-v2-to-v3-migration.md` にまとまっています。
> 本 Step では **v3 の書き方**で進めます（v2 のフラットな `CardBody` 等は使いません）。

**スタイルの読み込み（`globals.css`）**:
HeroUI v3 は Tailwind CSS v4 の CSS-first 方式です。`@import` でスタイルを読み込みます。

```css
/* src/app/globals.css */
@import "tailwindcss";
@import "@heroui/react/styles";
@source "../../node_modules/@heroui/react/dist/**/*.{js,mjs}";
@custom-variant dark (&:is(.dark *));
```

**Provider の設定**:
HeroUI v3 では **`HeroUIProvider` によるラッパーは不要**になりました。
トースト（通知）を使う場合のみ `Toast.Provider` を設置します。

```typescript
// src/app/providers.tsx
'use client'

import { Toast } from '@heroui/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toast.Provider />
    </>
  )
}
```

**ルートレイアウトでの使用**:
```typescript
// src/app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

---

## 3. コンポーネント別リプレイスガイド

### 3.1 フォーム要素

#### Input（テキスト入力）

**Before (Tailwind CSS)**:
```typescript
<input
  type="text"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-md"
  placeholder="ユーザー名"
/>
```

**After (HeroUI v3)**:
```typescript
import { Input } from '@heroui/react'

{/* v3 の Input は「素の入力要素」。ラベルとエラーは外側に自分で置く */}
<div className="flex flex-col gap-1.5">
  <label htmlFor="username" className="text-sm font-medium text-foreground">
    ユーザー名
  </label>
  <Input
    id="username"
    type="text"
    placeholder="ユーザー名を入力"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    aria-label="ユーザー名"
    aria-invalid={!!usernameError}
    className="w-full rounded-medium border border-default-200 bg-default-50 px-3 py-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
  />
  {usernameError && (
    <span className="text-danger text-sm" role="alert">
      {usernameError}
    </span>
  )}
</div>
```

**ポイント（v3 の重要な変更点）**:
- v3 の `Input` は React Aria ベースの**素の入力要素**。v2 にあった `label` /
  `errorMessage` / `isRequired` プロパティは**なくなった**。
- ラベルは外側の `<label htmlFor>`、エラーは外側の `<span role="alert">` で表現する。
- `value` / `onChange`（イベント型 `e.target.value`）はそのまま使える。
- 見た目は `className` で付ける（v2 のような既定の枠線は付かない）。

---

#### Textarea（複数行テキスト）

**Before (Tailwind CSS)**:
```typescript
<textarea
  value={descriptions}
  onChange={(e) => setDescriptions(e.target.value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-md"
  placeholder="説明"
  rows={4}
/>
```

**After (HeroUI v3)**:
```typescript
// v3 では「Textarea」→「TextArea」（大文字 A）に名称変更
import { TextArea } from '@heroui/react'

<div className="flex flex-col gap-1.5">
  <label htmlFor="descriptions" className="text-sm font-medium text-foreground">
    説明
  </label>
  <TextArea
    id="descriptions"
    placeholder="説明を入力"
    value={descriptions}
    onChange={(e) => setDescriptions(e.target.value)}
    rows={4}
    aria-label="説明"
    className="w-full rounded-medium border border-default-200 bg-default-50 px-3 py-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
  />
</div>
```

**ポイント**:
- コンポーネント名が `Textarea` → **`TextArea`**（大文字 A）に変わった。
- `Input` と同じく素の入力要素なので、ラベル・エラーは外側に置く。`rows` で行数指定。

---

#### Button（ボタン）

**Before (Tailwind CSS)**:
```typescript
<button
  onClick={handleSubmit}
  disabled={isLoading}
  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
>
  {isLoading ? '送信中...' : '送信'}
</button>
```

**After (HeroUI v3)**:
```typescript
import { Button } from '@heroui/react'

<Button
  variant="primary"
  onPress={handleSubmit}
  isPending={isLoading}
>
  送信
</Button>
```

**ポイント（v3 の重要な変更点）**:
- v2 の `color` プロパティは廃止 → **`variant`** で色・種類を指定する。
- v2 の `isLoading` は **`isPending`** に、`disabled` は **`isDisabled`** に変わった。

**variant バリエーション（v3）**:
- `primary`: プライマリ（ブランド色）
- `secondary`: セカンダリ
- `danger` / `danger-soft`: 危険（赤系）
- `ghost` / `outline`: 控えめ（背景なし／枠線）

**サイズバリエーション**:
- `sm`: 小
- `md`: 中（デフォルト）
- `lg`: 大

> **リンクをボタン風にしたいとき**（画面遷移する「ボタン」）
> v3 の `Button` は `as={Link}` を受け付けない。Next.js の `Link` に
> `buttonVariants()` のクラスを付ける。
> ```typescript
> import { buttonVariants } from '@heroui/react'
> import Link from 'next/link'
>
> <Link href="/todos" className={buttonVariants({ variant: 'primary' })}>
>   Todo一覧へ
> </Link>
> ```

---

### 3.2 カード

**Before (Tailwind CSS)**:
```typescript
<div className="bg-white shadow-md rounded-lg p-6">
  <h2 className="text-xl font-bold mb-4">タイトル</h2>
  <p>コンテンツ</p>
</div>
```

**After (HeroUI v3)**:
```typescript
// v3 は複合コンポーネント方式。CardBody は Card.Content に、
// CardHeader/CardFooter も Card.Header / Card.Footer に変わった
import { Card } from '@heroui/react'

<Card>
  <Card.Header>
    <h2 className="text-xl font-bold">タイトル</h2>
  </Card.Header>
  <Card.Content>
    <p>コンテンツ</p>
  </Card.Content>
  <Card.Footer>
    {/* フッター要素 */}
  </Card.Footer>
</Card>
```

**ポイント**: `import` するのは `Card` だけ。中身は `Card.Header` / **`Card.Content`**（← 旧 `CardBody`）/ `Card.Footer` のように「ドットで繋いだ」複合 API を使う。

---

### 3.3 モーダル

**Before (Tailwind CSS)**:
```typescript
{isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <h2>モーダルタイトル</h2>
      <p>モーダルコンテンツ</p>
      <button onClick={() => setIsModalOpen(false)}>閉じる</button>
    </div>
  </div>
)}
```

**After (HeroUI v3)**:
```typescript
// v2 の useDisclosure は廃止 → useOverlayState（open / close を使う）
// Modal も複合 API（Modal.Backdrop / Container / Dialog / ...）に変わった
import { Modal, Button, useOverlayState } from '@heroui/react'

const { isOpen, open, close } = useOverlayState()

<>
  <Button onPress={open}>モーダルを開く</Button>

  <Modal isOpen={isOpen} onOpenChange={(o) => !o && close()}>
    <Modal.Backdrop>
      <Modal.Container>
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>モーダルタイトル</Modal.Heading>
            <Modal.CloseTrigger />
          </Modal.Header>
          <Modal.Body>
            <p>モーダルコンテンツ</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onPress={close}>
              キャンセル
            </Button>
            <Button variant="primary" onPress={close}>
              OK
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  </Modal>
</>
```

**ポイント（v3 の重要な変更点）**:
- 開閉フックは `useDisclosure` → **`useOverlayState`**。返り値も `{ isOpen, open, close }`
  （v2 の `onOpen` / `onClose` は `open` / `close`）。
- `Modal` の中身は `Modal.Backdrop → Modal.Container → Modal.Dialog` の入れ子で、
  その中に `Modal.Header`（`Modal.Heading` + `Modal.CloseTrigger`）/ `Modal.Body` / `Modal.Footer`。
- 閉じる制御は `onClose` ではなく **`onOpenChange`** で受ける。

---

### 3.4 ナビゲーション

> **⚠️ HeroUI v3 では `Navbar` コンポーネントは廃止されました。**
> v2 の `Navbar` / `NavbarBrand` / `NavbarContent` / `NavbarItem` は v3 に存在しません。
> ナビゲーションは **素の `<header>` + Tailwind CSS** で自分で組みます（実装もそうなっています）。

**Before (Tailwind CSS)**:
```typescript
<nav className="bg-gray-800 text-white p-4">
  <div className="max-w-7xl mx-auto flex justify-between items-center">
    <div className="text-xl font-bold">Todo App</div>
    <div className="space-x-4">
      <a href="/todos" className="hover:text-gray-300">Todos</a>
      <a href="/profile" className="hover:text-gray-300">Profile</a>
    </div>
  </div>
</nav>
```

**After (HeroUI v3 — 素の header + Button)**:
```typescript
import { Button } from '@heroui/react'
import Link from 'next/link'

<header className="border-b border-gray-200 bg-white">
  <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
    <Link href="/todos" className="text-xl font-bold hover:opacity-80">
      Todo App
    </Link>
    <nav className="hidden sm:flex items-center gap-6">
      <Link href="/todos" className="text-gray-700 hover:text-primary font-medium">
        Todos
      </Link>
      <Link href="/profile" className="text-gray-700 hover:text-primary font-medium">
        Profile
      </Link>
    </nav>
    <Button variant="secondary" onPress={handleLogout} className="font-medium">
      ログアウト
    </Button>
  </div>
</header>
```

**ポイント**: ナビのリンクは Next.js の `Link`、ボタン相当は HeroUI の `Button`。
「HeroUI が Navbar を用意してくれる」時代は終わり、レイアウトは自分で Tailwind で組む。

---

### 3.5 Select（ドロップダウン）

**Before (Tailwind CSS)**:
```typescript
<select
  value={completedFilter}
  onChange={(e) => setCompletedFilter(e.target.value)}
  className="px-3 py-2 border border-gray-300 rounded-md"
>
  <option value="all">すべて</option>
  <option value="completed">完了済み</option>
  <option value="incomplete">未完了</option>
</select>
```

**After (HeroUI v3)**:
```typescript
// v2 の SelectItem は廃止 → Select の複合 API + ListBox.Item を使う
import { Select, ListBox } from '@heroui/react'

<Select
  aria-label="フィルター"
  selectedKey={completedFilter}
  onSelectionChange={(key) => setCompletedFilter(key as string)}
>
  <Select.Trigger className="flex w-full items-center justify-between rounded-medium border border-default-200 bg-default-50 px-3 py-2">
    <Select.Value />
    <Select.Indicator />
  </Select.Trigger>
  <Select.Popover>
    <ListBox>
      <ListBox.Item id="all" textValue="すべて">すべて</ListBox.Item>
      <ListBox.Item id="completed" textValue="完了済み">完了済み</ListBox.Item>
      <ListBox.Item id="incomplete" textValue="未完了">未完了</ListBox.Item>
    </ListBox>
  </Select.Popover>
</Select>
```

**ポイント（v3 の重要な変更点）**:
- `<SelectItem>` は廃止 → **`Select.Trigger`（`Select.Value` + `Select.Indicator`）+
  `Select.Popover`（`ListBox` > `ListBox.Item`）** の構造に変わった。
- 選択値は `selectedKeys`（Set）→ **`selectedKey`（単数の文字列）**。
- `onSelectionChange` は**選択された 1 つの key** を受け取る（`onChange` のイベントではない）。
- 各項目は `ListBox.Item` に `id`（選択値）と `textValue`（表示用テキスト）を渡す。

---

### 3.6 Checkbox

**Before (Tailwind CSS)**:
```typescript
<input
  type="checkbox"
  checked={todo.completed}
  onChange={() => handleToggleComplete(todo.id)}
  className="mr-2"
/>
```

**After (HeroUI v3)**:
```typescript
import { Checkbox } from '@heroui/react'

<Checkbox
  isSelected={todo.completed}
  onChange={() => handleToggleComplete(todo.id)}
>
  {todo.title}
</Checkbox>
```

**ポイント**: v2 の `onValueChange` は v3 では **`onChange`**（真偽値を受け取る）に変わった。
選択状態は `isSelected` のまま。

---

### 3.7 Table（テーブル）

**Before (Tailwind CSS)**:
```typescript
<table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-6 py-3 text-left">タイトル</th>
      <th className="px-6 py-3 text-left">状態</th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {todos.map((todo) => (
      <tr key={todo.id}>
        <td className="px-6 py-4">{todo.title}</td>
        <td className="px-6 py-4">{todo.completed ? '完了' : '未完了'}</td>
      </tr>
    ))}
  </tbody>
</table>
```

**After (HeroUI v3)**:
```typescript
// v3 の Table も複合 API（Table.Header / Column / Body / Row / Cell）
import { Table } from '@heroui/react'

<Table aria-label="Todo一覧">
  <Table.Header>
    <Table.Column>タイトル</Table.Column>
    <Table.Column>状態</Table.Column>
  </Table.Header>
  <Table.Body>
    {todos.map((todo) => (
      <Table.Row key={todo.id}>
        <Table.Cell>{todo.title}</Table.Cell>
        <Table.Cell>{todo.completed ? '完了' : '未完了'}</Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table>
```

> **📌 補足**: 本 Todo アプリの一覧表示は HeroUI の `Table` ではなく、`Card` と
> `map()` による**自前のリスト/カード表示**で実装しています（`TodoList` / `UserList` 等）。
> `Table` の使い方は参考として掲載していますが、本カリキュラムの実装では使いません。

---

### 3.8 Error Boundary（エラー表示）

**Before (Tailwind CSS)**:
```typescript
// error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">エラーが発生しました</h2>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          再試行
        </button>
      </div>
    </div>
  )
}
```

**After (HeroUI v3)**:
```typescript
// error.tsx
'use client'

import { Card, Button } from '@heroui/react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <Card.Header className="flex flex-col items-start gap-1">
          <h2 className="text-2xl font-bold text-danger">エラーが発生しました</h2>
          {error.digest && (
            <p className="text-small text-default-500">エラーID: {error.digest}</p>
          )}
        </Card.Header>
        <Card.Content>
          <p className="text-default-700">{error.message}</p>
        </Card.Content>
        <Card.Footer>
          <Button
            variant="primary"
            onPress={reset}
            className="w-full"
          >
            再試行
          </Button>
        </Card.Footer>
      </Card>
    </div>
  )
}
```

**ポイント**:
- `Card` の中身は複合 API（`Card.Header` / `Card.Content` / `Card.Footer`）で構造化。
- `text-danger` でエラーを視覚的に強調、`error.digest` があればエラーIDを表示。
- `Button` は `variant="primary"`（v2 の `color` ではない）で再試行アクションを明確化。

---

### 3.9 Loading State（ローディング表示）

**Before (Tailwind CSS)**:
```typescript
// loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">読み込み中...</p>
      </div>
    </div>
  )
}
```

**After (HeroUI v3)**:
```typescript
// loading.tsx
import { Spinner, Card } from '@heroui/react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <Card.Content className="flex flex-col items-center justify-center py-12 gap-4">
          <Spinner size="lg" color="accent" />
          <p className="text-default-600">読み込み中...</p>
        </Card.Content>
      </Card>
    </div>
  )
}
```

**Spinner のバリエーション（v3）**:

**サイズ**:
- `sm`: 小（16px）
- `md`: 中（32px、デフォルト）
- `lg`: 大（64px）

**カラー**（v3 では選べる色が変わった。`primary` は無く、ブランド色は **`accent`**）:
- `accent`: アクセント（ブランド色）
- `success`: 成功色
- `warning`: 警告色
- `danger`: 危険色
- `current`: 現在のテキスト色

**シンプルなローディング表示**:
```typescript
// ページ全体ではなく、インライン表示の場合
import { Spinner } from '@heroui/react'

export default function Loading() {
  return (
    <div className="flex justify-center items-center p-8">
      <Spinner />
    </div>
  )
}
```

**カスタムメッセージ付きローディング**:
```typescript
// loading.tsx
// v3 の Spinner は label プロパティを持たない。テキストは隣に自分で置く
import { Spinner } from '@heroui/react'

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" color="accent" />
      <p className="text-default-600">データを取得中...</p>
    </div>
  )
}
```

**ポイント**:
- `Spinner` コンポーネントで統一されたローディングアニメーション。
- v2 の `label` プロパティは**なくなった**ので、テキストは `<p>` などで隣に置く。
- `Card` で囲むことで、より目立つローディング画面にできる。
- サイズ（`sm`/`md`/`lg`）とカラー（`accent` 等）を状況に応じて使い分ける。

---

## 4. ページ別リプレイスガイド

### 4.1 ログインページ

**リプレイス対象**:
- Input（ユーザー名、パスワード）
- Button（ログイン、登録ページへのリンク）
- Card（ログインフォーム全体）

**実装のポイント**:
- フォーム全体を `Card` で囲む
- `Input` の `type="password"` でパスワード入力
- エラーメッセージは `Input` の外側に `<span role="alert">` で表示

---

### 4.2 ユーザー登録ページ

**リプレイス対象**:
- Input（ユーザー名、パスワード、名前）
- Button（登録、ログインページへのリンク）
- Card（登録フォーム全体）

---

### 4.3 Todo 一覧ページ

**リプレイス対象**:
- Input（Todo タイトル）
- Textarea（Todo 説明）
- Button（作成、削除、ページネーション）
- Select（フィルター、ソート）
- Card（各 Todo アイテム）
- Checkbox（完了/未完了切り替え）

**実装のポイント**:
- Todo アイテムは `Card` で表現
- フィルタリングとソートは `Select` を使用
- ページネーションは `Button` の組み合わせで実装

---

### 4.4 Todo 詳細ページ

**リプレイス対象**:
- Input（タイトル編集）
- Textarea（説明編集）
- Button（保存、削除、キャンセル）
- Card（Todo 詳細全体）

**実装のポイント**:
- 編集モードと表示モードの切り替えを `Button` で制御
- 削除確認は `Modal` を使用

---

### 4.5 プロフィールページ

**リプレイス対象**:
- Input（名前編集）
- Input（パスワード変更用）
- Button（保存、キャンセル、ログアウト）
- Card（プロフィール情報、統計情報、Todo一覧）

**実装のポイント**:
- 複数の `Card` でセクションを分ける
- 統計情報は `Card` + テキスト表示
- パスワード変更は別の `Card` で実装

---

### 4.6 ユーザー作成ページ

**リプレイス対象**:
- Input（ユーザー名、パスワード、パスワード確認、名前）
- Select（ロール選択）
- Button（作成、キャンセル）
- Card（作成フォーム全体）
- ヘッダーナビゲーション（v3 に Navbar は無いので素の `<header>` で実装）

**実装のポイント**:
- パスワード確認フィールドも `Input` の `type="password"` を使用
- ロール選択は `Select`（`Select.Trigger` / `Select.Popover`）+ `ListBox.Item` で実装
- ADMINとMANAGERで作成可能なロールを制限
- フォームバリデーションエラーは独自の表示エリアで対応

---

### 4.7 ユーザー詳細ページ

**リプレイス対象**:
- Input（名前編集、ユーザー名表示）
- Select（ロール編集）
- Button（編集、保存、削除、キャンセル）
- Card（ユーザー情報、Todo一覧）
- Modal（削除確認）
- ヘッダーナビゲーション（v3 に Navbar は無いので素の `<header>` で実装）

**実装のポイント**:
- 編集モードと表示モードの切り替え
- ユーザー名は編集不可（`isDisabled` を使用）
- 削除確認は `Modal`（複合API）+ `useOverlayState` で実装
- ADMINのみが編集・削除可能

---

### 4.8 ユーザー一覧ページ

**リプレイス対象**:
- Input（検索フィールド）
- Select（ロールフィルター、ソート項目、ソート順）
- Button（新規作成、詳細、削除、ページネーション）
- Card（フィルターエリア、ユーザー一覧、ページネーション）
- Modal（削除確認）
- ヘッダーナビゲーション（v3 に Navbar は無いので素の `<header>` で実装）

**実装のポイント**:
- 検索・フィルター・ソートを `Card` 内でグリッド配置
- ユーザーカードを `Card` で表現
- ページネーションは `Card` + `Button` の組み合わせ
- 削除確認は `Modal`（複合API）+ `useOverlayState` で実装
- ADMINのみが削除ボタンを表示

---

### 4.9 Error Boundary（エラーページ）の実装

各ページディレクトリに配置する `error.tsx` ファイルの実装パターンを紹介します。

#### 基本的な error.tsx

```typescript
// src/app/todos/error.tsx
'use client'

import { Card, Button } from '@heroui/react'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // エラーログをコンソールに出力（本番環境では外部ログサービスに送信）
    console.error('Todo page error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <Card.Header className="flex flex-col items-start gap-1">
          <h2 className="text-2xl font-bold text-danger">エラーが発生しました</h2>
          {error.digest && (
            <p className="text-small text-default-500">エラーID: {error.digest}</p>
          )}
        </Card.Header>
        <Card.Content>
          <p className="text-default-700 mb-2">
            Todoページの読み込み中にエラーが発生しました。
          </p>
          <p className="text-small text-default-500">{error.message}</p>
        </Card.Content>
        <Card.Footer className="gap-2">
          <Button
            variant="secondary"
            onPress={() => window.location.href = '/todos'}
            className="flex-1"
          >
            Todoページに戻る
          </Button>
          <Button
            variant="primary"
            onPress={reset}
            className="flex-1"
          >
            再試行
          </Button>
        </Card.Footer>
      </Card>
    </div>
  )
}
```

#### 詳細ページ用の error.tsx

```typescript
// src/app/todos/[id]/error.tsx
'use client'

import { Card, Button, buttonVariants } from '@heroui/react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <Card.Header className="flex flex-col items-start gap-1">
          <h2 className="text-2xl font-bold text-danger">Todo詳細の読み込みエラー</h2>
          {error.digest && (
            <p className="text-small text-default-500">エラーID: {error.digest}</p>
          )}
        </Card.Header>
        <Card.Content>
          <p className="text-default-700 mb-4">
            指定されたTodoの詳細を取得できませんでした。
          </p>
          <div className="bg-danger-50 border-l-4 border-danger p-3 rounded">
            <p className="text-small text-danger-800">{error.message}</p>
          </div>
        </Card.Content>
        <Card.Footer className="flex flex-col gap-2">
          <Button
            variant="primary"
            onPress={reset}
            className="w-full"
          >
            再試行
          </Button>
          <Link
            href="/todos"
            className={buttonVariants({ variant: 'secondary', className: 'w-full' })}
          >
            Todo一覧に戻る
          </Link>
        </Card.Footer>
      </Card>
    </div>
  )
}
```

**実装のポイント**:
- ページの種類に応じてエラーメッセージをカスタマイズ
- `error.digest` でエラーIDを表示（デバッグに有用）
- `useEffect` でエラーログを記録
- 複数のアクションボタンを提供（再試行、戻る）
- `bg-danger-50` などでエラー詳細を視覚的に強調

---

### 4.10 Loading State（ローディングページ）の実装

各ページディレクトリに配置する `loading.tsx` ファイルの実装パターンを紹介します。

#### 基本的な loading.tsx（Todo一覧）

```typescript
// src/app/todos/loading.tsx
import { Spinner, Card } from '@heroui/react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <Card.Content className="flex flex-col items-center justify-center py-12 gap-4">
          <Spinner size="lg" color="accent" />
          <div className="text-center">
            <p className="text-default-700 font-medium">Todoを読み込み中...</p>
            <p className="text-small text-default-500 mt-1">しばらくお待ちください</p>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}
```

#### スケルトン表示を含む loading.tsx

```typescript
// src/app/todos/loading.tsx
import { Card, Skeleton } from '@heroui/react'

export default function Loading() {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* ヘッダースケルトン */}
      <div className="mb-6">
        <Skeleton className="w-48 h-8 rounded-lg mb-4" />
        <Skeleton className="w-full h-12 rounded-lg" />
      </div>

      {/* Todoリストスケルトン */}
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <Card key={index}>
            <Card.Header>
              <Skeleton className="w-3/4 h-6 rounded-lg" />
            </Card.Header>
            <Card.Content>
              <Skeleton className="w-full h-4 rounded-lg mb-2" />
              <Skeleton className="w-2/3 h-4 rounded-lg" />
            </Card.Content>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

#### シンプルな loading.tsx（詳細ページ）

```typescript
// src/app/todos/[id]/loading.tsx
import { Spinner } from '@heroui/react'

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" color="accent" />
    </div>
  )
}
```

#### ユーザー管理ページ用の loading.tsx

```typescript
// src/app/users/loading.tsx
import { Card, Skeleton } from '@heroui/react'

export default function Loading() {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* 検索・フィルタースケルトン */}
      <Card className="mb-6">
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="w-full h-10 rounded-lg" />
            <Skeleton className="w-full h-10 rounded-lg" />
            <Skeleton className="w-full h-10 rounded-lg" />
          </div>
        </Card.Content>
      </Card>

      {/* ユーザーカードスケルトン */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index}>
            <Card.Content className="gap-3">
              <Skeleton className="w-full h-6 rounded-lg" />
              <Skeleton className="w-3/4 h-4 rounded-lg" />
              <Skeleton className="w-1/2 h-4 rounded-lg" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="flex-1 h-10 rounded-lg" />
                <Skeleton className="flex-1 h-10 rounded-lg" />
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

**実装のポイント**:
- ページのレイアウトに合わせた `Skeleton` 表示
- `Spinner` の `label` プロパティでわかりやすいメッセージ
- リスト表示の場合は複数のスケルトンを配置
- 実際のコンテンツ構造を模倣することでユーザー体験を向上

**Skeleton のカスタマイズ**:
```typescript
<Skeleton 
  className="w-full h-10 rounded-lg"
  isLoaded={false} // ローディング状態
/>
```

---

## 5. スタイリングのベストプラクティス

### 5.1 レスポンシブデザイン

HeroUI は Tailwind CSS ベースなので、Tailwind のレスポンシブクラスがそのまま使えます。

```typescript
<Card className="w-full sm:w-96 md:w-[500px]">
  {/* コンテンツ */}
</Card>
```

### 5.2 カラーテーマの統一

```typescript
// プライマリアクション
<Button variant="primary">保存</Button>

// 危険なアクション
<Button variant="danger">削除</Button>

// セカンダリアクション
<Button variant="secondary">キャンセル</Button>
```

### 5.3 スペーシングの統一

```typescript
<div className="space-y-4">
  <Input {...props} />
  <TextArea {...props} />
  <Button {...props} />
</div>
```

---

## 6. アクセシビリティの考慮

### 6.1 aria-label の設定

```typescript
<Button aria-label="Todoを削除" onPress={handleDelete}>
  <TrashIcon />
</Button>
```

### 6.2 キーボードナビゲーション

HeroUI のコンポーネントは自動的にキーボードナビゲーションに対応していますが、カスタムハンドラーを追加する場合は考慮が必要です。

---

## 7. 実装チェックリスト

### 7.1 コンポーネント置き換え
- [ ] Input コンポーネントの置き換え
- [ ] Textarea コンポーネントの置き換え
- [ ] Button コンポーネントの置き換え
- [ ] Card コンポーネントの置き換え
- [ ] Modal コンポーネントの置き換え
- [ ] Select コンポーネントの置き換え
- [ ] Checkbox コンポーネントの置き換え
- [ ] Navbar コンポーネントの置き換え
- [ ] Spinner コンポーネントの追加
- [ ] Skeleton コンポーネントの追加

### 7.2 ページごとの確認
- [ ] ログインページの UI 更新
- [ ] ユーザー登録ページの UI 更新
- [ ] Todo 一覧ページの UI 更新
- [ ] Todo 一覧ページの loading.tsx 実装
- [ ] Todo 一覧ページの error.tsx 実装
- [ ] Todo 詳細ページの UI 更新
- [ ] Todo 詳細ページの loading.tsx 実装
- [ ] Todo 詳細ページの error.tsx 実装
- [ ] プロフィールページの UI 更新
- [ ] プロフィールページの loading.tsx 実装
- [ ] プロフィールページの error.tsx 実装
- [ ] ユーザー作成ページの UI 更新
- [ ] ユーザー詳細ページの UI 更新
- [ ] ユーザー詳細ページの loading.tsx 実装
- [ ] ユーザー詳細ページの error.tsx 実装
- [ ] ユーザー一覧ページの UI 更新
- [ ] ユーザー一覧ページの loading.tsx 実装
- [ ] ユーザー一覧ページの error.tsx 実装

### 7.3 スタイリング
- [ ] レスポンシブデザインの確認
- [ ] カラーテーマの統一
- [ ] スペーシングの統一
- [ ] ローディング表示の統一
- [ ] エラー表示の統一

### 7.4 アクセシビリティ
- [ ] aria-label の設定
- [ ] キーボードナビゲーションの確認
- [ ] Spinner の label 属性設定
- [ ] エラーメッセージの視覚的な強調

---

## 8. 動作確認項目

### 8.1 機能確認
- [ ] すべてのフォームが正常に動作する
- [ ] すべてのボタンが正常に動作する
- [ ] モーダルが正常に開閉する（Todo削除、ユーザー削除）
- [ ] ドロップダウンが正常に動作する
- [ ] ユーザー管理機能が正常に動作する（作成、編集、削除）
- [ ] ロールベースのアクセス制御が正常に機能する

### 8.2 UI/UX 確認
- [ ] デザインが統一されている
- [ ] レスポンシブデザインが適切に動作する
- [ ] ローディング状態が適切に表示される
- [ ] エラーメッセージが適切に表示される
- [ ] Skeleton表示が実際のコンテンツ構造と一致している
- [ ] エラーページからの復帰が適切に動作する

### 8.3 エラーハンドリング確認
- [ ] ネットワークエラー時にエラーページが表示される
- [ ] 存在しないIDへのアクセス時にエラーページが表示される
- [ ] エラーページの「再試行」ボタンが正常に動作する
- [ ] エラーページの「戻る」ボタンが正常に動作する
- [ ] エラーIDが適切に表示される（該当する場合）

### 8.4 ローディング状態確認
- [ ] データ取得中にローディングページが表示される
- [ ] Spinner のサイズとカラーが適切である
- [ ] Skeleton表示がちらつかない
- [ ] ローディング完了後、適切にコンテンツが表示される

---

## 9. 次のステップへの準備

Step 3 完了後、以下を確認してください。

- [ ] すべての UI が HeroUI コンポーネントに置き換えられている
- [ ] デザインが統一され、モダンな見た目になっている
- [ ] すべての機能が正常に動作する
- [ ] アクセシビリティが確保されている
- [ ] すべてのページに loading.tsx が実装されている
- [ ] すべてのページに error.tsx が実装されている
- [ ] エラーハンドリングが適切に動作する
- [ ] ローディング状態が適切に表示される

これらが完了したら、**Step 4: UIコンポーネントの分割** に進みましょう。

---

**Document Version**: 2.0.0  
**Last Updated**: 2026-07-19  
**Author**: jugeeem（原著）  
**Reviser**: Genki Hashioka（HeroUI v3・近代化スタックへの改訂）  
**Changes**:
- v2.0.0 (2026-07-19): HeroUI v3 への全面改訂
  - セットアップを v3 方式へ（`HeroUIProvider` 廃止→`Toast.Provider`、`globals.css` の `@import` 方式）
  - 全コンポーネント例を v3 の複合 API へ（`Card.Content` / `Select`+`ListBox.Item` /
    `Modal`+`useOverlayState` / 素の `Input`+外部ラベル / Navbar 廃止→素の `<header>` /
    Button `variant`・`isPending` / Spinner `color="accent"` / `as={Link}`→`buttonVariants` 等）
  - Step 5 削除に伴う参照整理、版数を近代化スタックへ更新
- v1.1.0 (2025-10-27): 初版（HeroUI v2 準拠）
