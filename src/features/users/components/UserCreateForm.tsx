'use client';
import {
  Button,
  buttonVariants,
  Card,
  Input,
  ListBox,
  Select,
} from '@heroui/react';
import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import { z } from 'zod';
import { createUser } from '@/lib/api';

/** 入力欄の共通クラス（HeroUI v2 bordered 相当） */
const inputClass =
  'w-full rounded-medium border border-default-200 bg-default-50 px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30';

/**
 * ロール番号とラベルの対応表。
 * ユーザー作成フォームのロール選択で使用します。
 */
const roleLabels: Record<number, string> = {
  1: 'ADMIN',
  2: 'MANAGER',
  3: 'USER',
  4: 'GUEST',
};

/**
 * UserCreateFormコンポーネントのpropsの型定義。
 *
 * @interface UserCreateFormProps
 * @property {number} currentUserRole - 現在のユーザーのロール番号。
 * @property {() => void} onSuccess - ユーザー作成成功時のコールバック関数。
 */
interface UserCreateFormProps {
  currentUserRole: number;
  onSuccess: () => void;
}

/**
 * バリデーションスキーマ。
 * ユーザー作成フォームの各フィールドに対するバリデーションルールを定義します。
 *
 * @returns {z.ZodObject} バリデーションスキーマ
 */
const validationSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'ユーザー名は1文字以上で入力してください。')
    .max(50, 'ユーザー名は50文字以下で入力してください。'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください。'),
  confirmPassword: z.string().min(6, '確認用パスワードは6文字以上で入力してください。'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

/**
 * ユーザー作成フォームコンポーネント。
 * ユーザーの作成を行うフォームを表示します。
 *
 * @param {UserCreateFormProps} props - コンポーネントのprops。
 * @return {JSX.Element} ユーザー作成フォームのJSX要素。
 */
export function UserCreateForm({ currentUserRole, onSuccess }: UserCreateFormProps) {
  // ステートの定義
  // ユーザー名
  const [username, setUsername] = useState<string>('');
  // パスワード
  const [password, setPassword] = useState<string>('');
  // 確認用パスワード
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  // 名前
  const [firstName, setFirstName] = useState<string>('');
  // 姓
  const [lastName, setLastName] = useState<string>('');
  // 権限情報
  const [role, setRole] = useState<number>(4);
  // 作成中フラグ
  const [isCreating, setIsCreating] = useState<boolean>(false);
  // ユーザー名エラーメッセージ
  const [usernameError, setUsernameError] = useState<string>('');
  // パスワードエラーメッセージ
  const [passwordError, setPasswordError] = useState<string>('');
  // 確認用パスワードエラーメッセージ
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');
  // 共通エラーメッセージ
  const [error, setError] = useState<string>('');

  /**
   * 権限制約。
   * ADMIN: すべての権限で作成可能。
   * MANAGER: ADMIN以外で作成可能。
   *
   * @returns {Array<{value: number; label: string}>} 作成可能なロールの配列
   */
  // 配列の中身をオブジェクトに変換します。
  const canCreateRole = (currentUserRole === 1 ? [1, 2, 3, 4] : [2, 3, 4]).map(
    (roleValue) => ({
      value: roleValue,
      label: roleLabels[roleValue],
    }),
  );

  /**
   * フォーム送信ハンドラー。
   * ユーザー作成フォームの送信時に呼び出され、入力データのバリデーションとユーザー作成APIの呼び出しを行います。
   *
   * @param {React.FormEvent} e フォーム送信イベント
   * @returns {Promise<void>}
   * @throws {Error} ユーザー作成に失敗した場合にスローされます。
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // 作成中フラグを設定
    setIsCreating(true);
    // エラーメッセージの初期化
    setError('');
    setUsernameError('');
    setPasswordError('');
    setConfirmPasswordError('');

    /**
     * バリデーションの実行。
     * 入力データがバリデーションスキーマに準拠しているかを確認します。
     *
     * @returns {z.SafeParseReturnType<any, any>} バリデーション結果
     */
    const validationInput = validationSchema.safeParse({
      username,
      password,
      confirmPassword,
      firstName,
      lastName,
    });

    // バリデーションエラー時の処理
    // フィールドごとにエラー状態を設定する
    if (!validationInput.success) {
      // エラーメッセージを一覧で取得
      const errors = validationInput.error.issues;

      // err.path[0]でフィールド名を特定し、対応するエラーステートにメッセージを設定
      errors.forEach((err) => {
        if (err.path[0] === 'username') setUsernameError(err.message);
        if (err.path[0] === 'password') setPasswordError(err.message);
        if (err.path[0] === 'confirmPassword') {
          setConfirmPasswordError(err.message);
        }
      });
      setIsCreating(false);
      return;
    }

    // パスワードと確認用パスワードの一致チェック
    if (password !== confirmPassword) {
      setError('パスワードと確認用パスワードが一致しません');
      setIsCreating(false);
      return;
    }

    try {
      // ユーザー作成APIの呼び出し
      const response = await createUser({
        username: username.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
      });
      // レスポンスのエラーチェック
      if (!response.success) {
        throw new Error(response.error || 'ユーザーの作成に失敗しました');
      }

      // 成功時の処理
      onSuccess();
    } catch (err) {
      // エラー発生時の処理
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      {/* エラーメッセージ */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* ユーザー作成フォーム */}
      {/* ユーザー作成フォーム */}
      <Card className="p-8">
        <Card.Header>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            ユーザー情報入力
          </h3>
        </Card.Header>

        {/* 入力フォーム */}
        <form onSubmit={handleSubmit} className="space-y-2">
          {/* ユーザー入力 */}
          <Card.Content>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="username"
                className="text-sm font-medium text-foreground"
              >
                ユーザー名
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError('');
                }}
                placeholder="username"
                aria-label="ユーザー名"
                aria-invalid={!!usernameError}
                className={inputClass}
              />
              {usernameError && (
                <span className="text-danger text-sm" role="alert">
                  {usernameError}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">1～50文字で入力してください</p>
          </Card.Content>

          {/* パスワード入力 */}
          <Card.Content className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                パスワード
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="6文字以上"
                aria-label="パスワード"
                aria-invalid={!!passwordError}
                className={inputClass}
              />
              {passwordError && (
                <span className="text-danger text-sm" role="alert">
                  {passwordError}
                </span>
              )}
              <p className="text-xs text-gray-500 mt-1">最小6文字</p>
            </div>

            {/* 確認用パスワード */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-foreground"
              >
                確認用パスワード
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setConfirmPasswordError('');
                }}
                disabled={isCreating}
                placeholder="パスワードを再入力"
                aria-label="確認用パスワード"
                aria-invalid={!!confirmPasswordError}
                className={inputClass}
              />
              {confirmPasswordError && (
                <span className="text-danger text-sm" role="alert">
                  {confirmPasswordError}
                </span>
              )}
            </div>
          </Card.Content>

          {/* 名前入力 */}
          <Card.Content className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 姓 */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="lastName"
                className="text-sm font-medium text-foreground"
              >
                姓
              </label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="姓"
                aria-label="姓"
                className={inputClass}
              />
            </div>

            {/* 名 */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="firstName"
                className="text-sm font-medium text-foreground"
              >
                名
              </label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="名"
                aria-label="名"
                className={inputClass}
              />
            </div>
          </Card.Content>

          {/* 権限選択 */}
          <Card.Content>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="role"
                className="text-sm font-medium text-foreground"
              >
                ロール
              </label>
              <Select
                aria-label="ロール"
                selectedKey={String(role)}
                onSelectionChange={(key) => setRole(Number(key))}
              >
                <Select.Trigger className={inputClass}>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {canCreateRole.map((r) => (
                      <ListBox.Item
                        key={String(r.value)}
                        id={String(r.value)}
                        textValue={r.label}
                      >
                        {r.label}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
          </Card.Content>

          {/* 送信ボタン */}
          <Card.Footer className="justify-end gap-4 pt-6">
            <Link
              href="/users"
              className={buttonVariants({
                variant: 'secondary',
                className: 'font-medium',
              })}
            >
              キャンセル
            </Link>
            <Button
              type="submit"
              variant="primary"
              isPending={isCreating}
              className="font-medium"
            >
              {isCreating ? '作成中' : 'ユーザーを作成'}
            </Button>
          </Card.Footer>
        </form>
      </Card>
    </div>
  );
}
