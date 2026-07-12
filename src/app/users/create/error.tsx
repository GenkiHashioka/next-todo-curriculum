'use client';

import { Button, Card } from '@heroui/react';
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
            <p className="text-small text-default-500">エラーID: {error.digest}</p>
          )}
        </Card.Header>
        <Card.Content>
          <p className="text-default-700 mb-2">
            ユーザー作成ページの読み込みに失敗しました。
          </p>
          <div className="bg-danger-50 border-l-4 border-danger p-3 rounded">
            <p className="text-small text-danger-800">{error.message}</p>
          </div>
        </Card.Content>
        <Card.Footer className="flex flex-col gap-2">
          <Button variant="primary" onPress={reset} className="w-full">
            再試行
          </Button>
          <Button
            as={Link}
            href="/users"
            variant="secondary"
            className="w-full"
          >
            ユーザー一覧に戻る
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
}
