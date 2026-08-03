'use client';
import { Button, Card, FieldError, Input, Label, TextField } from '@heroui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useCallback, useState } from 'react';
import { z } from 'zod';

/**
 * ログインフォームのバリデーションスキーマ
 *
 * @type {z.ZodObject} LoginFormSchema
 * @property {z.ZodString} username - ユーザー名のバリデーションルール
 * @property {z.ZodString} password - パスワードのバリデーションルール
 */
const LoginFormSchema = z.object({
  username: z
    .string()
    .min(1, 'ユーザー名を入力してください。')
    .max(50, 'ユーザー名は50文字以内で入力してください。'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください。'),
});

/**
 * ログインフォームコンポーネント。
 * フォームの状態管理と送信処理を行います。
 *
 * @returns {JSX.Element} ログインフォームのJSX要素
 */
export function LoginForm() {
  // ページ遷移用のルーター
  const router = useRouter();
  // ユーザー名のstate
  const [username, setUsername] = useState<string>('');
  // パスワードのstate
  const [password, setPassword] = useState<string>('');
  // サーバーエラー用のstate
  const [error, setError] = useState<string>('');
  // ユーザーネームのエラー用のstate
  const [usernameError, setUsernameError] = useState<string>('');
  // パスワードのエラー用のstate
  const [passwordError, setPasswordError] = useState<string>('');
  // ローディング状態のstate
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * フォーム送信用のハンドラ。
   * フォーム送信イベントを送信します。
   * useCallbackでメモ化し、依存する値が変更されたときのみ再生成されます。
   *
   * @param {FormEvent} e フォームイベント
   */
  // STEP4 指摘箇所 useCallbackを使用して、不要な再レンダリングを防止する。
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setUsernameError('');
      setPasswordError('');
      setError('');
      setIsLoading(true);

      /**
       * 入力バリデーションの実行
       * @param {object} input 入力データ
       * @returns {boolean} バリデーション結果
       */
      const validationInput = LoginFormSchema.safeParse({
        username,
        password,
      });
      // バリデーション失敗時の処理 エラーメッセージを設定して処理を中断する。
      // フィールドごとのエラー状態を設定する。 STEP3 MOD START
      if (!validationInput.success) {
        // エラーメッセージを一覧で取得
        const errors = validationInput.error.issues;

        // err.path[0]でエラー対象のフィールド名を特定して、対応するエラーstateを更新
        errors.forEach((err) => {
          if (err.path[0] === 'username') setUsernameError(err.message);
          if (err.path[0] === 'password') setPasswordError(err.message);
        });
        setIsLoading(false);
        return;
      }
      // ログイン処理
      try {
        // フォームデータを送信
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        // レスポンスチェック。
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'ログインに失敗しました。');
        }
        // ログイン成功時はTODOページへリダイレクト
        router.push('/todos');
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'ログイン中にエラーが発生しました。',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [username, password, router],
  );

  return (
    <Card className="p-8">
      {/* ログインフォーム */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/*ユーザー名の入力 */}
        <TextField
          validationBehavior="aria"
          isRequired
          fullWidth
          isDisabled={isLoading}
          isInvalid={!!usernameError}
          value={username}
          onChange={(next) => {
            setUsername(next);
            setUsernameError(''); // エラーメッセージをクリア
          }}
        >
          <Label>ユーザー名</Label>
          <Input type="text" placeholder="ユーザー名を入力" />
          <FieldError>{usernameError}</FieldError>
        </TextField>
        {/*パスワードの入力 */}
        <TextField
          validationBehavior="aria"
          isRequired
          fullWidth
          isDisabled={isLoading}
          isInvalid={!!passwordError}
          value={password}
          onChange={(next) => {
            setPassword(next);
            setPasswordError(''); // エラーメッセージをクリア
          }}
        >
          <Label>パスワード</Label>
          <Input type="password" placeholder="パスワードを入力" />
          <FieldError>{passwordError}</FieldError>
        </TextField>

        {/*ログイン時エラーメッセージの表示 */}
        {error && (
          <div className="p-3 bg-danger-50 border border-danger-200 rounded-md">
            <p className="text-danger text-sm">{error}</p>
          </div>
        )}
        {/* ログインボタン */}
        <Button
          type="submit"
          variant="primary"
          isPending={isLoading}
          className="w-full px-4 py-2"
        >
          ログイン
        </Button>
      </form>
      {/* 新規登録リンク */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
          アカウントをお持ちでない場合は
          <Link
            href="/register"
            className="text-primary font-medium hover:underline"
          >
            新規登録
          </Link>
        </p>
      </div>
    </Card>
  );
}
