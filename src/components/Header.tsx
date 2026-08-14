'use client';

import { Button } from '@heroui/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

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

  /**
   * ログアウト処理を行う非同期関数。
   * サーバーにログアウトリクエストを送信し、成功した場合はログインページにリダイレクトします。
   *
   * @returns {Promise<void>} 非同期処理完了を表すPromise
   */
  const handleLogout = useCallback(async () => {
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
  }, [router]);

  // ページ遷移が行われるときに認証状態と権限状態を確認する副作用
  useEffect(() => {
    // 画面遷移時に状態書き換えを防ぐための破棄フラグ
    let cancelled = false;
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
        if (cancelled) return;

        // 401(認証切れ・無効なトークン)の場合、強制的にログアウト
        if (response.status === 401) {
          await handleLogout();
          return;
        }

        // レスポンスが正常であれば認証状態と権限状態を更新
        if (response.ok) {
          const data = await response.json();
          if (cancelled) return;

          setIsAuthenticated(true);
          setUserRole(data.data.role);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        if (cancelled) return;
        // エラー発生時は未認証とする
        setIsAuthenticated(false);
        console.error('認証確認エラー:', err);
      } finally {
        if (!cancelled) {
          // 認証確認完了
          setIsCheckingAuth(false);
        }
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

    // コンポーネント破棄（画面遷移など）が行われた場合、フラグをtrueにする
    return () => {
      cancelled = true;
    };
  }, [pathname, handleLogout]);

  // 認証確認中は何も表示しない
  if (isCheckingAuth) {
    return null;
  }

  // 未認証時は何も表示しない
  if (!isAuthenticated) {
    return null;
  }

  // ナビゲーションの項目。ユーザー管理は ADMIN・MANAGER のみ表示する
  const navItems = [
    { href: '/todos', label: 'Todo一覧' },
    { href: '/profile', label: 'プロフィール' },
    ...(userRole <= 2 ? [{ href: '/users', label: 'ユーザー管理' }] : []),
  ];

  return (
    // sticky top-0: 下にスクロールしてもヘッダーが画面上部に留まる
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      {/* flex-wrap: 画面が狭いときはナビゲーションが 2 段目に折り返す */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6 sm:py-4">
        {/* ブランド */}
        <Link href="/todos" className="order-1 hover:opacity-80 transition-opacity">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Todoアプリ</h1>
        </Link>

        {/*
          ナビゲーション
          狭い画面では w-full で 2 段目に回し、広い画面では 1 段目に並べる。
          （以前は hidden sm:flex で消していたため、スマホからメニューに到達できなかった）
        */}
        <nav className="order-3 flex w-full items-center gap-6 sm:order-2 sm:w-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname.startsWith(item.href)
                  ? 'text-blue-500 font-medium'
                  : 'text-gray-700 hover:text-blue-500 font-medium'
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* ログアウト（狭い画面では 1 段目の右端に置く） */}
        <div className="order-2 sm:order-3">
          <Button
            type="button"
            onPress={handleLogout}
            variant="secondary"
            className="font-medium"
          >
            ログアウト
          </Button>
        </div>
      </div>
    </header>
  );
}
