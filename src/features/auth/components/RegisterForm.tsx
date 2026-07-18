'use client';

import { Button, Card, Input } from '@heroui/react';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { z } from 'zod';

/**
 * RegisterForm の Props
 *
 * @interface RegisterFormProps - RegisterFormコンポーネントのプロパティタイプ定義
 * @property {() => void} onSuccess - 登録成功時のコールバック関数
 */
interface RegisterFormProps {
  /** 登録成功時のコールバック */
  onSuccess: () => void;
}

/**
 * ユーザー新規登録フォームコンポーネント
 *
 * ユーザー登録フォームを表示し、バリデーションと登録処理を行います。
 *
 * @param {RegisterFormProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} 登録フォーム
 */
export function RegisterForm({ onSuccess }: RegisterFormProps) {
  // フォームの状態管理
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [usernameError, setUsernameError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * バリデーションスキーマ
   */
  const schema = z.object({
    username: z
      .string()
      .min(1, 'ユーザー名は1文字以上で入力してください。')
      .max(50, 'ユーザー名は50文字以下で入力してください。'),
    password: z.string().min(6, 'パスワードは6文字以上で入力してください。'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  });

  /**
   * フォーム送信ハンドラー
   *
   * @param {FormEvent} e - フォームイベント
   * @returns {Promise<void>} 非同期処理
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');
      setUsernameError('');
      setPasswordError('');

      // バリデーションの実行
      const validationInput = schema.safeParse({
        username,
        password,
        firstName,
        lastName,
      });

      // バリデーションエラー時の処理
      if (!validationInput.success) {
        const errors = validationInput.error.issues;
        errors.forEach((err) => {
          if (err.path[0] === 'username') setUsernameError(err.message);
          if (err.path[0] === 'password') setPasswordError(err.message);
        });
        setIsLoading(false);
        return;
      }

      // 登録APIの呼び出し
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username.trim(),
            password: password,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '登録に失敗しました');
        }

        // 成功時のコールバック実行（親コンポーネントがリダイレクトを担当）
        onSuccess();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    },
    [username, password, firstName, lastName, onSuccess, schema],
  );

  return (
    <Card className="p-8">
      {/* 登録フォーム */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ユーザー名入力 */}
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
            disabled={isLoading}
            placeholder="ユーザー名を入力"
            aria-label="ユーザー名"
            aria-invalid={!!usernameError}
            className="w-full rounded-medium border border-default-200 bg-default-50 px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          {usernameError && (
            <span className="text-danger text-sm" role="alert">
              {usernameError}
            </span>
          )}
        </div>

        {/* パスワード入力 */}
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
            disabled={isLoading}
            placeholder="パスワードを入力"
            aria-label="パスワード"
            aria-invalid={!!passwordError}
            className="w-full rounded-medium border border-default-200 bg-default-50 px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          {passwordError && (
            <span className="text-danger text-sm" role="alert">
              {passwordError}
            </span>
          )}
        </div>

        {/* 名前入力 */}
        <div className="grid grid-cols-2 gap-3">
          {/* 姓の入力 */}
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
              disabled={isLoading}
              placeholder="姓（任意）"
              aria-label="姓"
              className="w-full rounded-medium border border-default-200 bg-default-50 px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* 名の入力 */}
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
              disabled={isLoading}
              placeholder="名（任意）"
              aria-label="名"
              className="w-full rounded-medium border border-default-200 bg-default-50 px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* エラーメッセージ表示 */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 登録ボタン */}
        <Button
          type="submit"
          variant="primary"
          isPending={isLoading}
          className="w-full px-4 py-2"
        >
          {isLoading ? '登録中' : '登録'}
        </Button>
      </form>

      {/* ログインリンク */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
          すでにアカウントをお持ちの場合は
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            ログイン
          </Link>
        </p>
      </div>
    </Card>
  );
}
