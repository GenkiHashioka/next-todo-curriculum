'use client';

import { Button, Card, Input, ListBox, Select } from '@heroui/react';
import { useState } from 'react';
import type { User } from './types';
import { roleLabels } from './types';

/** 入力欄の共通クラス（HeroUI v2 bordered 相当） */
const inputClass =
  'w-full rounded-medium border border-default-200 bg-default-50 px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30';

/**
 * UserInfoEditFormのPropsタイプ定義
 *
 * @interface UserInfoEditFormProps - UserInfoEditFormコンポーネントのプロパティタイプ定義
 * @property {User} user - 編集するユーザー情報
 * @property {number} currentUserRole - 現在のログインユーザーの権限情報
 * @property {boolean} isSaving - 保存中フラグ
 * @property {(firstName: string, lastName: string, role: number) => Promise<void>} onSave - 保存ボタン押下時のコールバック関数
 * @property {() => void} onCancel - キャンセルボタン押下時のコールバック関数
 *
 */
interface UserInfoEditFormProps {
  user: User;
  currentUserRole: number;
  isSaving: boolean;
  onSave: (firstName: string, lastName: string, role: number) => Promise<void>;
  onCancel: () => void;
}

/**
 * ユーザー情報編集フォームコンポーネント。
 * ユーザーの詳細情報を編集するためのフォームを提供します。
 *
 * @param {UserInfoEditFormProps} props - コンポーネントのプロパティ
 * @return {JSX.Element} - ユーザー情報編集フォームコンポーネント
 */
export function UserInfoEditForm({
  user,
  currentUserRole,
  isSaving,
  onSave,
  onCancel,
}: UserInfoEditFormProps) {
  // ステートの定義
  // 名前の情報
  const [firstName, setFirstName] = useState<string>(user.firstName || '');
  // 姓の情報
  const [lastName, setLastName] = useState<string>(user.lastName || '');
  // ユーザー権限
  const [role, setRole] = useState<number>(user.role);

  /**
   * 保存ボタン押下時のハンドラー
   *
   * @return {Promise<void>} - 保存処理の完了を示すPromise
   */
  const handleSave = async () => {
    await onSave(firstName, lastName, role);
  };

  /**
   * 編集時に選択可能な権限オプションを生成する。
   * ADMIN: すべての権限を選択可能
   */
  const editableRoles = (currentUserRole === 1 ? [1, 2, 3, 4] : [2, 3, 4]).map(
    (roleValue) => ({
      value: roleValue,
      label: roleLabels[roleValue],
    }),
  );

  return (
    <Card className="p-8 mb-8">
      <Card.Header className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-gray-900">ユーザー情報編集</h3>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onPress={handleSave}
            variant="primary"
            isPending={isSaving}
            className="font-medium"
          >
            {isSaving ? '保存中' : '保存'}
          </Button>
          <Button
            type="button"
            onPress={() => {
              onCancel();
            }}
            isDisabled={isSaving}
            className="font-medium"
          >
            キャンセル
          </Button>
        </div>
      </Card.Header>
      <Card.Content className="space-y-6">
        {/* 名前編集 */}

        {/* ユーザー名 */}
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
            disabled
            readOnly
            aria-label="ユーザー名"
            defaultValue={user.username}
            className="w-full rounded-medium border border-default-200 bg-default-100 px-3 py-2 text-foreground outline-none"
          />
        </div>

        {/* 姓 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="姓"
              aria-label="姓"
              className={inputClass}
            />
          </div>

          {/* 名 */}
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
              placeholder="名"
              aria-label="名"
              className={inputClass}
            />
          </div>
        </div>

        {/* 権限編集 */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="role" className="text-sm font-medium text-foreground">
            ロール
          </label>
          <Select
            aria-label="ロール"
            selectedKey={String(role)}
            onSelectionChange={(key) => setRole(Number(key))}
          >
            <Select.Trigger className={inputClass}>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {editableRoles.map((roleOption) => (
                  <ListBox.Item
                    key={String(roleOption.value)}
                    id={String(roleOption.value)}
                    textValue={roleOption.label}
                  >
                    {roleOption.label}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </Card.Content>
    </Card>
  );
}
