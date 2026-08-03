'use client';

import { Label, ListBox, Select } from '@heroui/react';
import type { CompletedFilter, SortBy, SortOrder } from './types';

/**
 * TodoFilterのPropsインターフェース。
 *
 * @property {CompletedFilter} completedFilter - 現在の完了状態フィルター
 * @property {SortBy} sortBy - 現在のソート基準
 * @property {SortOrder} sortOrder - 現在のソート順序
 * @property {(filter: CompletedFilter) => void} onFilterChange - フィルター変更ハンドラ
 * @property {(sortBy: SortBy) => void} onSortByChange - ソート基準変更ハンドラ
 * @property {(sortOrder: SortOrder) => void} onSortOrderChange - ソート順序変更ハンドラ
 */
interface TodoFilterProps {
  completedFilter: CompletedFilter;
  sortBy: SortBy;
  sortOrder: SortOrder;
  onFilterChange: (filter: CompletedFilter) => void;
  onSortByChange: (sortBy: SortBy) => void;
  onSortOrderChange: (sortOrder: SortOrder) => void;
}

/**
 * フィルター・ソートコンポーネント。
 * フィルターソートの選択肢を提供し、選択変更を親コンポーネントに通知します。
 *
 * @param {TodoFilterProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} フィルター・ソートコンポーネント
 */
export function TodoFilter({
  completedFilter,
  sortBy,
  sortOrder,
  onFilterChange,
  onSortByChange,
  onSortOrderChange,
}: TodoFilterProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 表示フィルター */}
      <Select
        fullWidth
        selectedKey={completedFilter}
        onSelectionChange={(key) => onFilterChange(key as CompletedFilter)}
      >
        <Label>表示フィルター</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id="all" textValue="すべて">
              すべて
            </ListBox.Item>
            <ListBox.Item id="completed" textValue="完了済み">
              完了済み
            </ListBox.Item>
            <ListBox.Item id="incomplete" textValue="未完了">
              未完了
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
            <ListBox.Item id="updatedAt" textValue="更新日時">
              更新日時
            </ListBox.Item>
            <ListBox.Item id="title" textValue="タイトル">
              タイトル
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
  );
}
