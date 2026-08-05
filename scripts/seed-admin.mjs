#!/usr/bin/env node
/**
 * 初期管理者アカウントの作成
 *
 *   bun run seed:admin
 *
 * データベースはスキーマだけの空の状態から始まります（.docker/db/init.sql）。
 * 一方カリキュラムの Step 1 には、ADMIN・MANAGER だけが入れる管理者機能ページ
 * （/users）を作る課題があります。自分で登録したアカウントは role: 4（USER）なので、
 * そのままでは自分が作った画面に一度も入れません。
 * そこで、動作確認用の ADMIN アカウントをここで用意します。
 *
 * このスクリプトは Dev Container の初回セットアップから自動で実行されますが、
 * 何度実行しても安全です（既にあれば何もしません）。
 *
 * 【パスワードについて】
 * 学習用のローカル環境なので、あえて分かりやすい固定値にしています。
 * 実際のプロダクトで、既知のパスワードを持つアカウントを自動作成してはいけません。
 */

import bcrypt from 'bcryptjs';
import pg from 'pg';

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
};

/** 作成するアカウント。role: 1 は ADMIN（src/domain/entities/User.ts の UserRole） */
const ADMIN = {
  username: 'admin',
  password: 'password',
  role: 1,
};

/** ハッシュのコストは PostgresUserRepository と揃える */
const SALT_ROUNDS = 12;

function log(msg) {
  console.log(`${C.green}[seed]${C.reset} ${msg}`);
}

function fail(msg, detail) {
  console.error(`${C.red}[seed]${C.reset} ${msg}`);
  if (detail) console.error(`${C.dim}${detail}${C.reset}`);
  process.exit(1);
}

const connectionString =
  process.env.DB_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  fail(
    'DB_URL が設定されていません。',
    '.env がまだ無い可能性があります。cp .env.example .env を実行してください。',
  );
}

// SSL の判定は src/infrastructure/database/connection.ts と同じ規則にする。
const needsSsl =
  /[?&]sslmode=(require|verify-ca|verify-full)/.test(connectionString) ||
  process.env.DB_SSL === 'true';

const client = new pg.Client({
  connectionString,
  ssl: needsSsl ? { rejectUnauthorized: false } : false,
});

try {
  await client.connect();
} catch (err) {
  fail(
    'データベースに接続できませんでした。',
    `${err.message}\n\nDB コンテナが起動しているか確認してください（docker compose ps）。\n接続先: ${connectionString.replace(/:[^:@]*@/, ':****@')}`,
  );
}

try {
  const passwordHash = await bcrypt.hash(ADMIN.password, SALT_ROUNDS);

  // username には UNIQUE 制約があるので、競合したら何もしない＝冪等になる。
  // 既存アカウントのパスワードやロールは書き換えない（受講者が変更しているかもしれないため）。
  const result = await client.query(
    `INSERT INTO users (username, password_hash, role, created_by, updated_by)
     VALUES ($1, $2, $3, 'seed', 'seed')
     ON CONFLICT (username) DO NOTHING
     RETURNING id`,
    [ADMIN.username, passwordHash, ADMIN.role],
  );

  if (result.rowCount === 0) {
    log(`${C.bold}${ADMIN.username}${C.reset} は既にあるのでそのまま使います`);
  } else {
    log(
      `初期管理者アカウントを作成しました: ${C.bold}${ADMIN.username}${C.reset} / ${C.bold}${ADMIN.password}${C.reset}`,
    );
  }
} catch (err) {
  fail('初期管理者アカウントの作成に失敗しました。', err.message);
} finally {
  await client.end();
}
