/**
 * @fileoverview 日時ユーティリティ
 *
 * このアプリは日時を JST（日本標準時）で表示します。
 * ただし **保存する値そのものは変換しません**。
 *
 * 設計方針:
 * - **保存・受け渡しは「絶対時刻」のまま**扱う（`Date` は本来 UTC 基準の絶対時刻）
 * - **JST になるのは画面に出す瞬間だけ**（`timeZone: 'Asia/Tokyo'` を指定して整形）
 *
 * なぜこうするか:
 * 「保存する時点で JST にずらす」という作り方をすると、**実行環境のタイムゾーンで
 * 結果が変わってしまいます**。開発機（日本）では正しく見えるのに、UTC で動く
 * サーバー（Vercel など）では時刻がずれる、という状態になります。
 * 絶対時刻のまま持ち回れば、どこで動かしても同じ瞬間を指します。
 *
 * DB のカラムは `TIMESTAMPTZ`（絶対時刻）なので、この方針と一致しています。
 *
 * @author jugeeem
 * @since 1.0.0
 */

/**
 * 表示に使うタイムゾーン
 *
 * 画面に出すときだけ使います。保存する値には影響しません。
 */
export const DISPLAY_TIMEZONE = 'Asia/Tokyo';

/**
 * 現在時刻を取得
 *
 * 実行環境のタイムゾーンに関係なく、常に「今この瞬間」を返します。
 *
 * @returns {Date} 現在時刻
 *
 * @example
 * ```typescript
 * const user = {
 *   createdAt: dbNow(),
 *   updatedAt: dbNow()
 * };
 * ```
 */
export function dbNow(): Date {
  return new Date();
}

/**
 * 日時が有効かチェック
 *
 * 指定された値が有効なDateオブジェクトかどうかを検証します。
 *
 * @param {unknown} date - チェック対象の値
 * @returns {boolean} 有効なDateオブジェクトの場合true
 *
 * @example
 * ```typescript
 * isValidDate(new Date()); // true
 * isValidDate(new Date('invalid')); // false
 * isValidDate('2024-01-01'); // false
 * isValidDate(null); // false
 * ```
 */
export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

/**
 * データベース取得値を Date に変換
 *
 * データベースから取得した日時値を `Date` に変換します。
 * 文字列、Date、null など様々な形式に対応します。
 *
 * **時刻はずらしません。** 取得した瞬間をそのまま保ちます。
 *
 * @param {unknown} value - データベースから取得した日時値
 * @returns {Date | null} 日時オブジェクト、無効な値の場合はnull
 *
 * @example
 * ```typescript
 * const row = await db.query('SELECT created_at FROM users WHERE id = $1', [userId]);
 * const createdAt = dbValueToDate(row.created_at);
 * ```
 */
export function dbValueToDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return isValidDate(value) ? value : null;
  }

  if (typeof value === 'string') {
    const date = new Date(value);
    return isValidDate(date) ? date : null;
  }

  return null;
}

/**
 * 日時を JST の文字列に整形する
 *
 * **表示専用**です。実行環境のタイムゾーンや、閲覧者の端末の設定に関係なく、
 * 常に日本時間で表示されます。
 *
 * @param {Date | string | null | undefined} value - 整形する日時
 * @param {Intl.DateTimeFormatOptions} [options] - 表示形式の指定
 * @returns {string} JST の日時文字列。無効な値の場合は空文字
 *
 * @example
 * ```typescript
 * formatJST(todo.createdAt);                          // '2024/1/1 9:00:00'
 * formatJST(todo.createdAt, { dateStyle: 'medium' }); // '2024/01/01'
 * ```
 */
export function formatJST(
  value: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const date = dbValueToDate(value);
  if (!date) {
    return '';
  }

  return date.toLocaleString('ja-JP', {
    timeZone: DISPLAY_TIMEZONE,
    ...options,
  });
}
