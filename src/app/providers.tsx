'use client';

import { Toast } from '@heroui/react';

// HeroUI v3 は Provider ラッパー不要。トースト表示のため Toast.Provider のみ設置する。
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toast.Provider />
    </>
  );
}
