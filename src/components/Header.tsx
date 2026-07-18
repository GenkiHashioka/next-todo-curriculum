'use client';

import { Button } from '@heroui/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * ヘッダーコンポーネント。
 * 認証状態に基づいてヘッダーを表示し、ログアウト機能を提供します。
 *
 * @returns {JSX.Element | null} ヘッダーコンポーネントまたはnull
 */
export function Header() {
  // ページ遷移用のルーター
  const router = useRouter();
  // パスネームの取得(現在のURLパス)
  const pathname = usePathname();
  // 認証状態の取得
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // 権限状態の取得
  const [userRole, setUserRole] = useState<number>(4); // 初期値はゲスト (仕様書の権限状態を参照)
  // 認証確認中フラグ
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // ページ遷移が行われるときに認証状態と権限状態を確認する副作用
  useEffect(() => {
    /**
     * 認証状態と権限状態を確認する非同期関数。
     * APIエンドポイントから認証情報を取得し、状態を更新します。
     *
     * @returns {Promise<void>} 非同期処理完了を表すPromise
     */
    const checkAuth = async () => {
      try {
        // APIエンドポイントから認証情報を取得
        const response = await fetch('/api/users/me');

        // レスポンスが正常であれば認証状態と権限状態を更新
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUserRole(data.data.role);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        // エラー発生時は未認証とする
        setIsAuthenticated(false);
        console.error('認証確認エラー:', err);
      } finally {
        // 認証確認完了
        setIsCheckingAuth(false);
      }
    };

    // ログインページとユーザー新規作成ページは認証不要なのでスキップ
    if (pathname === '/login' || pathname === '/register') {
      setIsAuthenticated(false);
      setIsCheckingAuth(false);
      return;
    }

    // 認証チェックを実行
    checkAuth();
  }, [pathname]);

  /**
   * ログアウト処理を行う非同期関数。
   * サーバーにログアウトリクエストを送信し、成功した場合はログインページにリダイレクトします。
   *
   * @returns {Promise<void>} 非同期処理完了を表すPromise
   */
  const handleLogout = async () => {
    try {
      // サーバーにログアウトリクエストを送信
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      // 認証状態を更新し、ログインページにリダイレクト
      setIsAuthenticated(false);
      router.push('/login');
    } catch (err) {
      // ログアウトエラーをコンソールに表示
      console.error('ログアウトエラー:', err);
    }
  };
  // 認証確認中は何も表示しない
  if (isCheckingAuth) {
    return null;
  }

  // 未認証時は何も表示しない
  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* ブランド */}
        <Link href="/todos" className="hover:opacity-80 transition-opacity">
          <h1 className="text-3xl font-bold text-gray-900">Todoアプリ</h1>
        </Link>

        {/* ナビゲーション */}
        <nav className="hidden sm:flex items-center gap-6">
          <Link
            href="/todos"
            className={
              pathname.startsWith('/todos')
                ? 'text-blue-500 font-medium'
                : 'text-gray-700 hover:text-blue-500 font-medium'
            }
          >
            Todo一覧
          </Link>
          <Link
            href="/profile"
            className={
              pathname.startsWith('/profile')
                ? 'text-blue-500 font-medium'
                : 'text-gray-700 hover:text-blue-500 font-medium'
            }
          >
            プロフィール
          </Link>
          {userRole <= 2 && (
            <Link
              href="/users"
              className={
                pathname.startsWith('/users')
                  ? 'text-blue-500 font-medium'
                  : 'text-gray-700 hover:text-blue-500 font-medium'
              }
            >
              ユーザー管理
            </Link>
          )}
        </nav>

        {/* ログアウト */}
        <Button
          type="button"
          onPress={handleLogout}
          variant="secondary"
          className="font-medium"
        >
          ログアウト
        </Button>
      </div>
    </header>
  );
}
