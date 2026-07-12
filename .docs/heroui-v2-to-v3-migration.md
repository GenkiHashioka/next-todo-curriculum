# HeroUI v2 → v3 移行仕様書（実アプリ準拠）

本プロジェクトの UI を HeroUI **v2.8** から **v3.2** へ移行するための対応表と方針。
参照元は実運用アプリ `shiftapp-web`（`@heroui/react@3.2.1` / Next 16 / React 19.2 / Zod 4）の
実コード。**受講者が実務で触れる書き方に教材を一致させる**ことを目的とする。

> ⚠️ HeroUI v3 は v2 からの「バージョンアップ」ではなく **React Aria ベースの再設計**。
> フラットなコンポーネント（`CardBody` 等）が廃止され、複合コンポーネント
> （`Card.Content` 等）へ移行している。

---

## 0. 移行の基本戦略

1. **className（Tailwind ユーティリティ）は極力書き換えない。**
   v3 ネイティブには `primary-500` / `content1` / `default-100` 等の色スケールが無いため、
   `globals.css` の `@theme` に **v2 互換シム**を定義して旧クラス名のまま動かす（実アプリ準拠）。
2. **変えるのはコンポーネント API（JSX 構造と一部 props）のみ。**
3. 各段階で `npm run build` / `npm test` を緑に保つ。

---

## 1. 基盤（globals.css / providers / plugin）

### globals.css

```css
/* v2（旧） */
@import "tailwindcss";
@plugin './hero.ts';
@source '../../node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}';
@custom-variant dark (&:is(.dark *));
```

```css
/* v3（新） */
@import "tailwindcss";
@import "@heroui/react/styles";
@source "../../node_modules/@heroui/react/dist/**/*.{js,mjs}";
@custom-variant dark (&:is(.dark *));

@theme {
  /* v2 互換シム：v3 ネイティブに無い semantic color scale を補う */
  /* primary / danger / success / warning / content* / default-* を定義 */
}
```

- `@plugin './hero.ts'`（`heroui()` 関数）は **廃止**。`src/app/hero.ts` を削除。
- `@heroui/theme` パッケージは廃止 → `@heroui/react/styles` を `@import`。

### providers.tsx

```tsx
/* v2（旧） */
import { HeroUIProvider } from '@heroui/react';
import { ToastProvider } from '@heroui/toast';
<HeroUIProvider><ToastProvider />{children}</HeroUIProvider>
```

```tsx
/* v3（新）: HeroUIProvider 廃止（Provider ラッパー不要） */
import { Toast } from '@heroui/react';
export function Providers({ children }) {
  return (<>{children}<Toast.Provider /></>);
}
```

---

## 2. コンポーネント API 対応表

| v2 | v3 | 備考 |
|---|---|---|
| `<Card>` | `<Card>` | そのまま可（コンテナ） |
| `<CardHeader>` | `<Card.Header>` | 複合 API |
| `<CardBody>` | `<Card.Content>` | **`CardBody` は廃止** |
| `<CardFooter>` | `<Card.Footer>` | 複合 API |
| `<Input label errorMessage isInvalid>` | `<Input>` + 外部 `<label htmlFor>` + エラー `<div>` | v3 の `Input` は素の入力要素。`onChange` は**イベント型 `(e)=>e.target.value` を維持** |
| `<Textarea>` | `<TextArea>` | 名称変更（大文字 A） |
| `<Select><SelectItem>` | `<Select><Select.Trigger><Select.Value/><Select.Indicator/></Select.Trigger><Select.Popover><ListBox><ListBox.Item></ListBox></Select.Popover></Select>` | **構造ごと再構築**。`onSelectionChange={(key)=>...}` |
| `<Navbar><NavbarBrand><NavbarContent><NavbarItem>` | 複合 API 無し → 素の `<header>` + Tailwind + `Button`/リンクで再構成 | **全書き直し** |
| `<Button color="primary">` | `<Button variant="primary">` | `color` → `variant` |
| `<Button isLoading>` | `<Button isPending>` | prop 名変更 |
| `<Checkbox>` | `<Checkbox>` | React Aria 化（`isSelected`/`onChange` 要確認） |
| `<Chip>` / `<Spinner>` / `<Skeleton>` | 同名で存続 | |

### toast

```tsx
/* v2 */ addToast({ title: '...', color: 'success' });
/* v3 */ toast('メッセージ', { variant: 'success' | 'danger' });
```

### フォーム（実アプリのログイン画面準拠）

- `<Form onSubmit={handleSubmit}>`（`@heroui/react` の `Form`）
- 各フィールドは `<div>` + `<label htmlFor>` + `<Input>` + エラー `<div role="alert">` の手組み
- `Input` の `onChange={(e) => setX(e.target.value)}` はイベント型のまま
- 送信ボタンは `<Button type="submit" isPending={loading} variant="primary" fullWidth>`

---

## 3. 影響ファイル（本プロジェクト）

HeroUI 使用は **48 ファイル**。出現数の多い順に対応：
Button(147) / CardBody(121) / Card(115) / CardHeader(66) / Skeleton(53) /
CardFooter(50) / SelectItem(48) / Input(36) / Select(21) / NavbarItem(9) 他。

- 大量: `CardBody→Card.Content`, `CardHeader→Card.Header`, `CardFooter→Card.Footer`
- 要再構築: `Select`/`SelectItem`（TodoFilter, UserSearchFilter 等）, `Header.tsx`（Navbar）
- 一括置換可: `Textarea→TextArea`, `color=→variant=`(Button), `isLoading→isPending`

---

## 4. 教材への反映（Step3 / Step4）

- **Step3**（`03_step3_ui_library.md`, 1,149 行）: フラット API 前提の記述を上表の複合 API へ全面改訂
- **Step4**（`04_step4_component_division.md`）: 分割対象コンポーネントの API 追随

---

**参照実アプリ**: `shiftapp-orchestra/services/shiftapp-web`（HeroUI v3 本番運用）
**作成**: 2026-07-12
