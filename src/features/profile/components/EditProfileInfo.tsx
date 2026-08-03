'use client';

import { Button, Card, FieldError, Input, Label, TextField } from '@heroui/react';
import { type FormEvent, useCallback, useState } from 'react';
import { z } from 'zod';
import { updateCurrentUserProfile } from '@/lib/api';
import type { User } from './types';

/**
 * ProfileInfoのPropsインターフェース。
 * ユーザー情報の表示と編集を行うコンポーネントのプロパティを定義します。
 *
 * @interface EditProfileInfoProps
 * @property {User} user - 編集対象のユーザー情報
 * @property {(updateUser: User) => void} onSuccess - プロフィール更新成功時のコールバック関数
 * @property {() => void} onCancel - プロフィール編集キャンセル時のコールバック関数
 */
interface EditProfileInfoProps {
  user: User;
  onSuccess: (updateUser: User) => void;
  onCancel: () => void;
}

/**
 * プロフィール更新用のバリデーションスキーマ。
 * 名前と姓はそれぞれ50文字以内であることを検証します。
 *
 * @property {string} [firstName] - ユーザーの名前（任意）
 * @property {string} [lastName] - ユーザーの姓（任意）
 */
const profileUpdateSchema = z.object({
  firstName: z.string().max(50, '名前は50文字以内で入力してください').optional(),
  lastName: z.string().max(50, '姓は50文字以内で入力してください').optional(),
});

/**
 * プロフィール編集フォームコンポーネント。
 * ユーザーのプロフィール情報を編集するためのフォームを提供します。
 *
 * @param {EditProfileInfoProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} プロフィール編集フォーム
 */
export function EditProfileInfo({ user, onSuccess, onCancel }: EditProfileInfoProps) {
  // 名前の状態
  const [firstName, setFirstName] = useState<string>(user.firstName || '');
  // 姓の状態
  const [lastName, setLastName] = useState<string>(user.lastName || '');
  // 保存中の状態
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // エラーメッセージの状態
  // 全体のエラーメッセージ
  const [error, setError] = useState<string>('');
  // 名前のエラーメッセージ
  const [firstNameError, setFirstNameError] = useState<string>('');
  // 姓のエラーメッセージ
  const [lastNameError, setLastNameError] = useState<string>('');

  /**
   * プロフィール更新ハンドラ。
   * フォーム送信時に呼び出され、プロフィール情報の更新を行います。
   *
   * @param {FormEvent} e - フォーム送信イベント
   * @returns {Promise<void>}
   */
  const handleUpdate = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      // エラーメッセージをクリア
      setError('');
      setFirstNameError('');
      setLastNameError('');

      // バリデーションの実行
      const result = profileUpdateSchema.safeParse({
        firstName,
        lastName,
      });

      // バリデーション失敗時の処理
      if (!result.success) {
        // エラーメッセージを一覧で取得
        const errors = result.error.issues;
        // 各フィールドのエラーメッセージを設定
        errors.forEach((err) => {
          if (err.path[0] === 'firstName') {
            setFirstNameError(err.message);
          }
          if (err.path[0] === 'lastName') {
            setLastNameError(err.message);
          }
        });
        return;
      }

      // 保存処理の開始
      setIsSaving(true);
      try {
        // APIを呼び出してプロフィールを更新
        const response = await updateCurrentUserProfile({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });

        // エラー発生時の処理
        if (!response.success) {
          throw new Error(response.error || 'プロフィールの更新に失敗しました');
        }

        // 更新成功時のコールバックを呼び出し
        onSuccess(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        // 保存処理の終了
        setIsSaving(false);
      }
    },
    [firstName, lastName, onSuccess],
  );

  /**
   * 編集キャンセル処理。
   *
   * @returns {void}
   */
  const handleCancel = () => {
    // フォームを元の値にリセット
    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');

    // エラーメッセージをリセット
    setFirstNameError('');
    setLastNameError('');
    setError('');

    // 親コンポーネントにキャンセルを通知
    onCancel();
  };

  return (
    <Card className="p-6 mb-8">
      <Card.Header className="flex-row items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">プロフィール情報</h2>
      </Card.Header>
      {/* エラーメッセージ */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleUpdate}>
        <Card.Content className="space-y-6">
          {/* ユーザー名は変更不可のため読み取り専用 */}
          <TextField validationBehavior="aria" fullWidth isDisabled value={user.username}>
            <Label>ユーザー名</Label>
            <Input type="text" readOnly />
          </TextField>

          <TextField
            validationBehavior="aria"
            fullWidth
            isInvalid={!!lastNameError}
            value={lastName}
            onChange={(next) => {
              setLastName(next);
              setLastNameError('');
            }}
          >
            <Label>姓</Label>
            <Input type="text" placeholder="姓を入力" />
            <FieldError>{lastNameError}</FieldError>
          </TextField>

          <TextField
            validationBehavior="aria"
            fullWidth
            isInvalid={!!firstNameError}
            value={firstName}
            onChange={(next) => {
              setFirstName(next);
              setFirstNameError('');
            }}
          >
            <Label>名</Label>
            <Input type="text" placeholder="名を入力" />
            <FieldError>{firstNameError}</FieldError>
          </TextField>
        </Card.Content>

        <Card.Footer className="justify-end gap-3 pt-6">
          <Button
            type="button"
            onPress={handleCancel}
            isDisabled={isSaving}
            className="font-medium"
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            isPending={isSaving}
            variant="primary"
            className="font-medium"
          >
            {isSaving ? '保存中' : '保存'}
          </Button>
        </Card.Footer>
      </form>
    </Card>
  );
}
