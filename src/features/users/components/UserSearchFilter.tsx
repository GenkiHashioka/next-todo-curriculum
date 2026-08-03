'use client';

import { Input, Label, ListBox, Select, TextField } from '@heroui/react';
import type { RoleFilter, SortBy, SortOrder } from './types';


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
      <TextField fullWidth value={searchQuery} onChange={onSearchChange}>
        <Label>ユーザー名</Label>
        <Input type="text" placeholder="ユーザー名で検索" />
      </TextField>

      {/* ロールフィルター */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Select
          fullWidth
          selectedKey={String(roleFilter)}
          onSelectionChange={(key) =>
            onRoleFilterChange(key === 'all' ? 'all' : Number(key))
          }
        >
          <Label>ロールフィルター</Label>
            <Select.Trigger>
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

        {/* ソート項目 */}
        <Select
          fullWidth
          selectedKey={sortBy}
          onSelectionChange={(key) => onSortByChange(key as SortBy)}
        >
          <Label>並び順</Label>
            <Select.Trigger>
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

        {/* ソート順序 */}
        <Select
          fullWidth
          selectedKey={sortOrder}
          onSelectionChange={(key) => onSortOrderChange(key as SortOrder)}
        >
          <Label>順序</Label>
          <Select.Trigger>
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
  );
}
