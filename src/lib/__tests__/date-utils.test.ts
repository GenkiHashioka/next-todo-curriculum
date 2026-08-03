/**
 * @fileoverview 日時ユーティリティのテスト
 *
 * このユーティリティで一番大事なのは「**実行環境のタイムゾーンで結果が変わらない**」ことです。
 * 以前は保存時に JST へずらす作りだったため、開発機（日本）では正しく見えるのに
 * UTC で動くサーバーでは時刻がずれていました。
 *
 * 型が Date であることだけを確認するテストではこの不具合を検出できなかったので、
 * ここでは**値そのもの**を検証します。
 */

import {
  DISPLAY_TIMEZONE,
  dbNow,
  dbValueToDate,
  formatJST,
  isValidDate,
} from '../date-utils';

/** 指定したタイムゾーンで処理を実行する（実行後は元に戻す） */
function withTimeZone(timeZone: string, fn: () => void): void {
  const original = process.env.TZ;
  process.env.TZ = timeZone;
  try {
    fn();
  } finally {
    process.env.TZ = original;
  }
}

describe('日時ユーティリティ', () => {
  describe('dbNow', () => {
    it('現在時刻を返すこと', () => {
      const before = Date.now();
      const now = dbNow();
      const after = Date.now();

      expect(isValidDate(now)).toBe(true);
      expect(now.getTime()).toBeGreaterThanOrEqual(before);
      expect(now.getTime()).toBeLessThanOrEqual(after);
    });

    it('実行環境のタイムゾーンで値がずれないこと', () => {
      // 保存する値をタイムゾーンでずらしてしまうと、UTC のサーバーで時刻が狂う
      let jst: number | undefined;
      let utc: number | undefined;

      withTimeZone('Asia/Tokyo', () => {
        jst = dbNow().getTime();
      });
      withTimeZone('UTC', () => {
        utc = dbNow().getTime();
      });

      // 同じ瞬間を指すはず（実行間隔ぶんの数ミリ秒しか違わない）
      expect(Math.abs((utc as number) - (jst as number))).toBeLessThan(1000);
    });
  });

  describe('dbValueToDate', () => {
    it('Date を受け取ったとき、時刻をずらさずそのまま返すこと', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      expect(dbValueToDate(date)?.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });

    it('ISO 文字列を受け取ったとき、時刻をずらさず変換すること', () => {
      expect(dbValueToDate('2024-01-01T00:00:00.000Z')?.toISOString()).toBe(
        '2024-01-01T00:00:00.000Z',
      );
    });

    it('実行環境のタイムゾーンによって結果が変わらないこと', () => {
      const iso = '2024-06-15T12:34:56.000Z';

      for (const tz of ['Asia/Tokyo', 'UTC', 'America/New_York']) {
        withTimeZone(tz, () => {
          expect(dbValueToDate(iso)?.toISOString()).toBe(iso);
        });
      }
    });

    it('null / undefined に対して null を返すこと', () => {
      expect(dbValueToDate(null)).toBeNull();
      expect(dbValueToDate(undefined)).toBeNull();
    });

    it('無効な文字列に対して null を返すこと', () => {
      expect(dbValueToDate('invalid-date')).toBeNull();
      expect(dbValueToDate('not a date')).toBeNull();
    });

    it('無効な型に対して null を返すこと', () => {
      expect(dbValueToDate(123456)).toBeNull();
      expect(dbValueToDate({})).toBeNull();
      expect(dbValueToDate([])).toBeNull();
    });

    it('無効な Date に対して null を返すこと', () => {
      expect(dbValueToDate(new Date('invalid'))).toBeNull();
    });
  });

  describe('formatJST', () => {
    it('UTC の 0 時を、日本時間の 9 時として表示すること', () => {
      // JST は UTC+9
      expect(formatJST('2024-01-01T00:00:00.000Z')).toBe('2024/1/1 9:00:00');
    });

    it('実行環境のタイムゾーンに関係なく、常に日本時間で表示すること', () => {
      const iso = '2024-01-01T00:00:00.000Z';

      for (const tz of ['Asia/Tokyo', 'UTC', 'America/New_York']) {
        withTimeZone(tz, () => {
          expect(formatJST(iso)).toBe('2024/1/1 9:00:00');
        });
      }
    });

    it('日付をまたぐ場合も正しく表示すること', () => {
      // UTC 2023-12-31 15:00 = JST 2024-01-01 00:00
      expect(formatJST('2023-12-31T15:00:00.000Z')).toBe('2024/1/1 0:00:00');
    });

    it('表示形式を指定できること', () => {
      expect(formatJST('2024-01-01T00:00:00.000Z', { dateStyle: 'medium' })).toBe(
        '2024/01/01',
      );
    });

    it('無効な値に対して空文字を返すこと', () => {
      expect(formatJST(null)).toBe('');
      expect(formatJST(undefined)).toBe('');
      expect(formatJST('invalid-date')).toBe('');
    });
  });

  describe('isValidDate', () => {
    it('有効な Date に対して true を返すこと', () => {
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate(new Date('2024-01-01'))).toBe(true);
    });

    it('無効な値に対して false を返すこと', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false);
      expect(isValidDate('2024-01-01')).toBe(false);
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate(undefined)).toBe(false);
      expect(isValidDate(123456789)).toBe(false);
      expect(isValidDate({})).toBe(false);
    });
  });

  describe('DISPLAY_TIMEZONE', () => {
    it('日本標準時であること', () => {
      expect(DISPLAY_TIMEZONE).toBe('Asia/Tokyo');
    });
  });
});
