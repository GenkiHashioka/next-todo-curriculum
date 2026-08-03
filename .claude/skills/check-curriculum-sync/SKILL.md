---
name: check-curriculum-sync
description: 教材のコード例が実際の実装と食い違っていないかを検査する。教材やUIコンポーネントを変更した後、受講者に配る前に実行する。Use when curriculum docs or UI code changed, to verify the teaching material still matches the working implementation.
---

# 教材と実装の整合チェック

教材（`.docs/curriculum/`）のコード例が、実際に動く実装と食い違っていないかを検査します。

> **なぜ必要か**
> 教材のコード例が実装とズレると、**受講者はそのとおり書いて動かず詰まります**。
> 過去に「教材のとおり書くと画面が崩れる／バリデーションが出ない」という事故が起きました。
> 教材を直したら実装も、実装を直したら教材も——この対応漏れを機械的に検出します。

---

## 手順

### 1. 使ってはいけない API・クラスが教材に残っていないか

HeroUI は v3 です。**v2 の書き方が教材に残っていると受講者が必ずハマります。**

```bash
grep -rnE "CardBody|CardHeader|CardFooter|SelectItem|HeroUIProvider|useDisclosure|ModalContent|ModalBody|ModalHeader|ModalFooter|NavbarBrand|NavbarContent|NavbarItem|<Navbar|<Textarea|onValueChange|selectedKeys|as=\{Link\}|color=\"(primary|danger|default|secondary)\"|isLoading=" .docs/curriculum/
```

ヒットした場合、**解説文として「v2 ではこうだった」と書いている箇所は問題ありません**。
コード例（``` で囲まれたブロック）の中にあるものだけが修正対象です。

### 2. v3 に存在しない Tailwind クラスが使われていないか

v3 のテーマトークンに無いクラスは**何も適用されず、しかも HeroUI の既定スタイルを
打ち消して**レイアウトを壊します。

```bash
grep -rnE "rounded-medium|default-[0-9]+|text-small|focus:ring-primary|border-primary|bg-default-" .docs/curriculum/ src/
```

v3 に**存在しない**もの: `rounded-medium` / `default-<数値>` / `primary`（ブランド色は `accent`）/
`text-small` / `text-default-500`
v3 に**ある**もの: `accent` `background` `border` `danger` `field-*` `focus` `foreground`
`muted` `surface-secondary` `surface-tertiary` `rounded-field` `rounded-md`

### 3. 教材のコード例と実装を突き合わせる

教材で説明している主要コンポーネントについて、**実装がどう書かれているか**を確認し、
教材のコード例と同じ書き方になっているかを見ます。

| 教材の節 | 突き合わせる実装 |
|---|---|
| Step3 フォーム（Input / TextArea） | `src/features/auth/components/LoginForm.tsx` |
| Step3 Select | `src/features/todos/components/TodoFilter.tsx` |
| Step3 モーダル | `src/features/users/UserListPage.tsx` |
| Step3 Checkbox | `src/features/todos/components/TodoItem.tsx` |
| Step3 ナビゲーション | `src/components/Header.tsx` |
| Step4 コンポーネント分割 | `src/features/*/components/` |

特に見る点:
- `TextField` に **`validationBehavior="aria"`** が付いているか（無いと検証が動かない）
- `Checkbox` が **複合構造**（`Content > Control > Indicator`）になっているか
- `Card.Header` で横並びが必要な箇所に **`flex-row`** が指定されているか

### 4. 実装が実際に動くか

教材が正しくても、実装が壊れていたら意味がありません。

```bash
npm run build   # 型エラーの検出
npm test        # API 側のテスト
```

### 5. 教材の版数記述が古くなっていないか

```bash
grep -rnE "Next\.js 1[0-5]|React 19\.1|HeroUI 2|Zod 3|TypeScript 5" .docs/curriculum/
```

`package.json` の実際のバージョンと突き合わせます。

### 6. 両ブランチに反映されているか

教材は **`main`（スターター）と `reference/v3-complete` の両方**に必要です。
受講者が読むのは `main` 側なので、こちらへの反映漏れが致命的です。

```bash
git diff origin/main origin/reference/v3-complete -- .docs/curriculum/
```

差分が出た場合、**意図した差分か**を確認してください（基本は一致しているはず）。

---

## 結果のまとめ方

```markdown
## 教材と実装の整合チェック

| 検査項目 | 結果 |
|---|---|
| v2 API の残存（コード例内） | ✅ なし / ❌ N件 |
| v3 に無い Tailwind クラス | ✅ なし / ❌ N件 |
| 教材と実装の書き方の一致 | ✅ 一致 / ⚠️ 差異あり |
| ビルド / テスト | ✅ 緑 / ❌ 失敗 |
| 版数記述 | ✅ 最新 / ⚠️ 古い |
| main と reference の教材差分 | ✅ 一致 / ⚠️ 差分あり |

### 要対応
- （ファイル:行 と、何が問題かを具体的に）
```

問題が見つかった場合は、**教材と実装のどちらが正しいか**を判断してから直してください。
基本は「**実際に動く実装が正**」で、教材をそれに合わせます。
