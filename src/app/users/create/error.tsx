'use client';

import { Button, buttonVariants, Card } from '@heroui/react';
import Link from 'next/link';

/**
 * ユーザー作成ページのエラー表示コンポーネント
 *
 * @param error 発生したエラーオブジェクト
 * @param reset リセット関数
 * @returns エラー表示用のReactコンポーネント
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <Card.Header className="flex flex-col items-start gap-1">
          <h2 className="text-2xl font-bold text-danger">ユーザー作成ページのエラー</h2>
          {error.digest && (
            <p className="text-xs text-muted">エラーID: {error.digest}</p>
          )}
        </Card.Header>
        <Card.Content>
          <p className="text-foreground mb-2">
            ユーザー作成ページの読み込みに失敗しました。
          </p>
          <div className="bg-danger-soft border-l-4 border-danger p-3 rounded">
            <p className="text-sm text-danger-soft-foreground">{error.message}</p>
          </div>
        </Card.Content>
        <Card.Footer className="flex flex-col gap-2">
          <Button variant="primary" onPress={reset} className="w-full">
            再試行
          </Button>
          <Link
            href="/users"
            className={buttonVariants({ variant: 'secondary', className: 'w-full' })}
          >
            ユーザー一覧に戻る
          </Link>
        </Card.Footer>
      </Card>
    </div>
  );
}
