# Library Tests

このディレクトリは、`src/lib` 配下の全モジュールに対するユニットテストスイートを格納しています。100%のテストカバレッジを維持し、ライブラリ層の品質と信頼性を保証します。

## 概要

ライブラリ層のテストスイートは、以下の原則に基づいて設計されています：

- **包括的カバレッジ**: 全ての関数、分岐、条件を網羅
- **モック駆動テスト**: 外部依存関係の適切なモック化
- **型安全性**: TypeScript型システムを活用したテスト
- **エラーハンドリング**: 異常系の徹底的な検証
- **パフォーマンス**: 高速な実行時間の維持

## テストファイル構成

```
src/lib/__tests__/
├── auth-middleware.test.ts  # 認証ミドルウェアテスト
├── container.test.ts        # 依存性注入コンテナテスト
├── jwt.test.ts             # JWT サービステスト
├── response.test.ts        # API レスポンスヘルパーテスト
├── validation.test.ts      # バリデーション再エクスポートテスト
└── README.md              # このファイル
```

## テストスイート詳細

### 🔐 AuthMiddleware Tests (`auth-middleware.test.ts`)

**目的**: JWT認証ミドルウェアの包括的テスト

**テスト範囲**:
- 有効なJWTトークンの認証成功
- 無効なトークンの認証失敗
- Authorizationヘッダーの抽出
- Bearer形式の検証
- エラーハンドリング

**主要テストケース**:
```typescript
describe('AuthMiddleware', () => {
  it('有効なトークンで認証が成功する')
  it('無効なトークンで認証が失敗する')
  it('Authorizationヘッダーが無い場合の処理')
  it('不正な形式のトークンの拒否')
  it('JWT検証エラーの適切な処理')
});
```

**モック対象**: JWTService

### 📦 Container Tests (`container.test.ts`)

**目的**: 依存性注入コンテナのSingletonパターンとインスタンス管理のテスト

**テスト範囲**:
- Singletonパターンの実装検証
- 依存関係の正しい注入
- インスタンス初期化の確認
- 複数回取得時の同一性保証
- 全サービスの適切な生成

**主要テストケース**:
```typescript
describe('Container', () => {
  it('Singleton インスタンスが正しく動作する')
  it('同じインスタンスが返される')
  it('全ての依存関係が正しく注入される')
  it('リポジトリが正しく初期化される')
  it('ユースケースが正しく初期化される')
});
```

**モック対象**: PostgresRepositories, JWTService, UseCases

### 🔑 JWT Service Tests (`jwt.test.ts`)

**目的**: JWT トークンの生成・検証・解析機能のテスト

**テスト範囲**:
- トークン生成の成功
- 様々なユーザーロールでの生成
- トークン検証の成功・失敗
- 不正なトークンの処理
- ヘッダー抽出の動作

**主要テストケース**:
```typescript
describe('JWTService', () => {
  it('有効なユーザーでトークンを生成する')
  it('管理者ユーザーでトークンを生成する')
  it('有効なトークンの検証が成功する')
  it('無効なトークンの検証が失敗する')
  it('Bearerトークンの抽出が正しく動作する')
});
```

**モック対象**: jose ライブラリ (jest.setup.ts で設定)

### 📤 Response Tests (`response.test.ts`)

**目的**: API レスポンスヘルパー関数の統一形式とHTTPステータスコードのテスト

**テスト範囲**:
- 成功レスポンス (200 OK) の生成
- エラーレスポンス (400, 401, 403, 404, 500) の生成
- レスポンス形式の検証
- HTTPステータスコードの確認
- レガシーサポートの動作

**主要テストケース**:
```typescript
describe('Response Helpers', () => {
  it('成功レスポンスを正しく生成する')
  it('バリデーションエラーレスポンスを生成する')
  it('認証エラーレスポンスを生成する')
  it('認可エラーレスポンスを生成する')
  it('Not Foundエラーレスポンスを生成する')
  it('内部サーバーエラーレスポンスを生成する')
});
```

**モック対象**: NextResponse

### ✅ Validation Tests (`validation.test.ts`)

**目的**: バリデーション再エクスポートモジュールの後方互換性とエイリアス機能のテスト

**テスト範囲**:
- 型定義の再エクスポート
- スキーマの再エクスポート
- レガシーエイリアスの動作
- 後方互換性の確認
- 元モジュールとの一致性

**主要テストケース**:
```typescript
describe('Validation Module', () => {
  it('CreateTodoValidation 型が正しく再エクスポートされている')
  it('createTodoSchema が正しく再エクスポートされている')
  it('レガシーエイリアスが正常に動作する')
  it('元の types/validation と同じオブジェクトを返す')
});
```

**モック対象**: なし（pure module re-export tests）

## テスト実行

### 全テスト実行
```bash
npm test src/lib/__tests__
```

### 個別テスト実行
```bash
# 認証ミドルウェアのみ
npm test src/lib/__tests__/auth-middleware.test.ts

# コンテナのみ
npm test src/lib/__tests__/container.test.ts

# JWTサービスのみ
npm test src/lib/__tests__/jwt.test.ts

# レスポンスヘルパーのみ
npm test src/lib/__tests__/response.test.ts

# バリデーションのみ
npm test src/lib/__tests__/validation.test.ts
```

### カバレッジ付きテスト
```bash
npm test -- --coverage src/lib/__tests__
```

## テスト環境設定

### Jest 設定
- **フレームワーク**: Jest
- **環境**: Node.js with polyfills
- **TypeScript**: ts-jest
- **モック**: jest.mock()

### グローバル設定 (jest.setup.ts)
```typescript
// Web API polyfills
Object.assign(global, { 
  TextDecoder, 
  TextEncoder 
});

// jose ライブラリのモック
jest.mock('jose');
```

### 環境変数
```bash
# テスト環境用の環境変数
NODE_ENV=test
JWT_SECRET=test-secret-key
```

## モック戦略

### 1. 外部ライブラリ
- **jose**: JWT operations
- **next/server**: NextResponse
- **bcryptjs**: Password hashing

### 2. インフラストラクチャ
- **Database Connection**: PostgreSQL接続
- **Repositories**: データアクセス層

### 3. ビジネスロジック
- **Use Cases**: アプリケーションロジック
- **Services**: 外部サービス連携

## テストデータ

### サンプルユーザー
```typescript
const mockUser: JWTPayload = {
  userId: 'user-123',
  username: 'testuser',
  role: 1,
};

const adminUser: User = {
  id: '2',
  username: 'admin',
  role: UserRole.ADMIN,
  // ... other fields
};
```

### サンプルリクエスト
```typescript
const createMockRequest = (headers: Record<string, string> = {}) => ({
  headers: {
    get: jest.fn((name: string) => headers[name.toLowerCase()] || null),
  },
}) as unknown as NextRequest;
```

## エラーテストパターン

### 1. 認証エラー
- 無効なトークン
- 期限切れトークン
- 不正な形式

### 2. バリデーションエラー
- 不正なデータ形式
- 必須フィールドの欠如
- 型不一致

### 3. システムエラー
- データベース接続エラー
- 外部サービスエラー
- 予期しない例外

## パフォーマンス指標

### テスト実行時間
- **全テスト**: < 5秒
- **個別ファイル**: < 1秒
- **カバレッジ付き**: < 10秒

### カバレッジ目標
- **Statements**: 100%
- **Branches**: 100%
- **Functions**: 100%
- **Lines**: 100%

## CI/CD 統合

### GitHub Actions
```yaml
- name: Run Library Tests
  run: npm test src/lib/__tests__
  
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

### 品質ゲート
- テストカバレッジ: 100%必須
- 全テスト通過: 必須
- Lint エラー: ゼロ必須

## トラブルシューティング

### よくある問題

#### 1. TextEncoder/TextDecoder エラー
```bash
# 解決策: jest.setup.ts でpolyfillを設定
Object.assign(global, { TextDecoder, TextEncoder });
```

#### 2. JWT モックエラー
```bash
# 解決策: jest.setup.ts でjoseライブラリをモック化
jest.mock('jose');
```

#### 3. NextResponse モックエラー
```bash
# 解決策: テストファイル内でNextResponseをモック化
jest.mock('next/server');
```

### デバッグ方法

#### 詳細ログ出力
```bash
npm test -- --verbose src/lib/__tests__
```

#### 特定テストのデバッグ
```bash
npm test -- --testNamePattern="特定のテスト名"
```

#### カバレッジの詳細確認
```bash
npm test -- --coverage --coverageDirectory=coverage-lib src/lib/__tests__
```

## 継続的改善

### 今後の予定
- [ ] E2Eテストとの統合
- [ ] パフォーマンステストの追加
- [ ] 視覚的回帰テストの導入
- [ ] APIコントラクトテストの統合

### メトリクス監視
- テスト実行時間の推移
- カバレッジの変動
- 失敗率の追跡
- 技術的負債の測定

---

このテストスイートは、`src/lib` ライブラリ層の品質と信頼性を保証し、継続的なリファクタリングと機能追加を安全に行えるよう設計されています。
