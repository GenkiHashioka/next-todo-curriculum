'use client';

import { Input, ListBox, Select } from '@heroui/react';
import type { RoleFilter, SortBy, SortOrder } from './types';

/** 入力・Select トリガーの共通クラス（HeroUI v2 bordered 相当） */
const fieldClass =
  'flex w-full items-center justify-between rounded-medium border border-default-200 bg-default-50 px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30';

/**
 * UserSearchFilterのPropsタイプ定義
 *
 * @interface UserSearchFilterProps - UserSearchFilterコンポーネントのプロパティタイプ定義
 * @property {string} searchQuery - 現在の検索クエリ
 * @property {RoleFilter} roleFilter - 現在のロールフィルター
 * @property {SortBy} sortBy - 現在のソート基準
 * @property {SortOrder} sortOrder - 現在のソート順序
 * @property {(query: string) => void} onSearchChange - 検索クエリ変更時のコールバック関数
 * @property {(role: RoleFilter) => void} onRoleFilterChange - ロールフィルター変更時のコールバック関数
 * @property {(sortBy: SortBy) => void} onSortByChange - ソート基準変更時のコールバック関数
 * @property {(sortOrder: SortOrder) => void} onSortOrderChange - ソート順序変更時のコールバック関数
 *
 */
interface UserSearchFilterProps {
  searchQuery: string;
  roleFilter: RoleFilter;
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSearchChange: (query: string) => void;
  onRoleFilterChange: (role: RoleFilter) => void;
  onSortByChange: (sortBy: SortBy) => void;
  onSortOrderChange: (sortOrder: SortOrder) => void;
}

/**
 * ユーザー検索フィルターコンポーネント。
 * ユーザー名での検索とロールによるフィルタリングを提供します。
 *
 * @param {UserSearchFilterProps} props - コンポーネントのプロパティ
 * @return {JSX.Element} - ユーザー検索フィルターコンポーネント
 */
export function UserSearchFilter({
  searchQuery,
  roleFilter,
  sortBy,
  sortOrder,
  onSearchChange,
  onRoleFilterChange,
  onSortByChange,
  onSortOrderChange,
}: UserSearchFilterProps) {
  return (
    <div className="space-y-4">
      {/* 検索ボックス */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="search" className="text-sm font-medium text-foreground">
          ユーザー名
        </label>
        <Input
          id="search"
          type="text"
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
          }}
          placeholder="ユーザー名で検索"
          aria-label="ユーザー名"
          className={fieldClass}
        />
      </div>

      {/* ロールフィルター */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="roleFilter"
            className="text-sm font-medium text-foreground"
          >
            ロールフィルター
          </label>
          <Select
            aria-label="ロールフィルター"
            selectedKey={String(roleFilter)}
            onSelectionChange={(key) =>
              onRoleFilterChange(key === 'all' ? 'all' : Number(key))
            }
          >
            <Select.Trigger className={fieldClass}>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="all" textValue="すべて">
                  すべて
                </ListBox.Item>
                <ListBox.Item id="1" textValue="ADMIN">
                  ADMIN
                </ListBox.Item>
                <ListBox.Item id="2" textValue="MANAGER">
                  MANAGER
                </ListBox.Item>
                <ListBox.Item id="3" textValue="USER">
                  USER
                </ListBox.Item>
                <ListBox.Item id="4" textValue="GUEST">
                  GUEST
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
        {/* ソート項目 */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="sortBy"
            className="text-sm font-medium text-foreground"
          >
            並び順
          </label>
          <Select
            aria-label="並び順"
            selectedKey={sortBy}
            onSelectionChange={(key) => onSortByChange(key as SortBy)}
          >
            <Select.Trigger className={fieldClass}>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="createdAt" textValue="作成日時">
                  作成日時
                </ListBox.Item>
                <ListBox.Item id="username" textValue="ユーザー名">
                  ユーザー名
                </ListBox.Item>
                <ListBox.Item id="firstName" textValue="名前">
                  名前
                </ListBox.Item>
                <ListBox.Item id="lastName" textValue="姓">
                  姓
                </ListBox.Item>
                <ListBox.Item id="role" textValue="ロール">
                  ロール
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="sortOrder"
            className="text-sm font-medium text-foreground"
          >
            順序
          </label>
          <Select
            aria-label="順序"
            selectedKey={sortOrder}
            onSelectionChange={(key) => onSortOrderChange(key as SortOrder)}
          >
            <Select.Trigger className={fieldClass}>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="desc" textValue="降順">
                  降順
                </ListBox.Item>
                <ListBox.Item id="asc" textValue="昇順">
                  昇順
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>
    </div>
  );
}
