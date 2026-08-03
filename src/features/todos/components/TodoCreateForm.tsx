'use client';

import {
  Button,
  Card,
  FieldError,
  Input,
  Label,
  TextArea,
  TextField,
} from '@heroui/react';
import { type FormEvent, useCallback, useState } from 'react';
import { z } from 'zod';

/**
 * TodoCreateFormのPropsインターフェース。
 *
 * @property {(title: string, description: string) => Promise<void>} onSubmit - フォーム送信時のハンドラ関数
 * @property {boolean} isCreating - Todo作成中かどうかを示すフラグ
 */
interface TodoCreateFormProps {
  onSubmit: (title: string, description: string) => Promise<void>;
  isCreating: boolean;
}

/**
 * Todo作成用のバリデーションスキーマ。
 * タイトルは1文字以上32文字以下、説明は128文字以下であることを検証します。
 */
const createTodoSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(32, 'タイトルは32文字以内で入力してください'),
  descriptions: z.string().max(128, '説明は128文字以内で入力してください').optional(),
});

/**
 * Todo作成フォームコンポーネント。
 *
 */
export function TodoCreateForm({ onSubmit, isCreating }: TodoCreateFormProps) {
  // ステートの定義
  // タイトルの状態
  const [title, setTitle] = useState<string>('');
  // 説明の状態
  const [description, setDescription] = useState<string>('');

  // エラーメッセージの状態
  const [titleError, setTitleError] = useState<string>('');
  const [descriptionError, setDescriptionError] = useState<string>('');

  /**
   * フォーム送信ハンドラ。
   * バリデーション処理を行い、エラーがなければonSubmitを呼び出します。送信成功後にフォームをリセットします。
   */
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      // エラーメッセージをリセット
      setTitleError('');
      setDescriptionError('');

      // バリデーションの実行
      const result = createTodoSchema.safeParse({
        title,
        descriptions: description,
      });

      // バリデーション失敗時の処理
      if (!result.success) {
        // エラーメッセージを一覧で取得
        const errors = result.error.issues;
        // 各フィールドのエラーメッセージを設定
        errors.forEach((err) => {
          if (err.path[0] === 'title') {
            setTitleError(err.message);
          }
          if (err.path[0] === 'descriptions') {
            setDescriptionError(err.message);
          }
        });
        return;
      }

      // 親コンポーネントに送信処理を移譲。(descriptionが空文字の場合は親側でundefinedとして処理する。)
      await onSubmit(title.trim(), description.trim());

      // フォームのリセット
      setTitle('');
      setDescription('');
    },
    [title, description, onSubmit],
  );

  return (
    <Card className="mb-10 p-4">
      <Card.Header>
        <h2 className="text-2xl font-semibold text-gray-900">新しいTodoを作成</h2>
      </Card.Header>
      <Card.Content>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* タイトル入力欄 */}
          <TextField
            validationBehavior="aria"
            isRequired
            fullWidth
            maxLength={32}
            isInvalid={!!titleError}
            value={title}
            onChange={(next) => {
              setTitle(next);
              setTitleError(''); // エラーメッセージをクリア
            }}
          >
            <Label>タイトル</Label>
            <Input type="text" placeholder="Todoのタイトル（32文字以内）" />
            <FieldError>{titleError}</FieldError>
          </TextField>

          {/* 説明入力欄 */}
          <TextField
            validationBehavior="aria"
            fullWidth
            maxLength={128}
            isInvalid={!!descriptionError}
            value={description}
            onChange={(next) => {
              setDescription(next);
              setDescriptionError(''); // エラーメッセージをクリア
            }}
          >
            <Label>説明</Label>
            <TextArea placeholder="Todoの説明（128文字以内）" rows={4} />
            <FieldError>{descriptionError}</FieldError>
          </TextField>

          {/* Todo作成ボタン */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isPending={isCreating}
              className="px-8 py-2.5 font-medium"
            >
              {isCreating ? '作成中' : '作成'}
            </Button>
          </div>
        </form>
      </Card.Content>
    </Card>
  );
}
