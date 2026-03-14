---
title: API リファレンス概要
sidebar_position: 1
description: Cocoro OS (cocoro-core) の REST API リファレンス。認証方法・エンドポイント一覧・共通仕様を解説。
---

# 📡 API リファレンス

**cocoro-core** は FastAPI ベースの REST API を提供します。
131 エンドポイントを持ち、すべての操作をプログラムから実行できます。

---

## ベース URL

```
http://cocoro.local:8001    # mDNS 経由（推奨）
http://192.168.x.xxx:8001   # IP アドレス直接
```

---

## 認証

すべてのエンドポイントは **Bearer Token 認証** が必要です。

```bash
# API キーをそのまま使用
curl http://cocoro.local:8001/health \
  -H "Authorization: Bearer YOUR_COCORO_API_KEY"

# または JWT トークンを取得して使用
curl -X POST http://cocoro.local:8001/auth/token \
  -H "Content-Type: application/json" \
  -d '{"api_key": "YOUR_COCORO_API_KEY"}'
# → {"access_token": "eyJ...", "expires_in": 3600}
```

:::tip COCORO_API_KEY の確認方法
```bash
ssh cocoro-admin@cocoro.local
cat /opt/cocoro/core/infra/docker/.env | grep COCORO_API_KEY
```
:::

---

## エンドポイント一覧

### チャット

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/chat` | 通常チャット（同期）|
| POST | `/chat/stream` | SSE ストリーミングチャット |

### 感情

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/emotion/state` | 現在の感情状態を取得 |
| POST | `/emotion/update` | 感情を手動更新 |
| GET | `/emotion/history` | 感情履歴を取得 |

### シンクロ率

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/sync/rate` | 現在のシンクロ率 |
| GET | `/sync/history` | シンクロ率の推移 |
| GET | `/sync/ceiling` | Divergence Ceiling 状態 |

### 記憶

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/memory/list` | 記憶一覧 |
| POST | `/memory/search` | セマンティック検索 |
| POST | `/memory/add` | 記憶を手動追加 |
| DELETE | `/memory/{id}` | 記憶を削除 |
| GET | `/memory/stats` | 記憶統計情報 |
| GET | `/memory/learnings` | 学習事項一覧 |
| POST | `/memory/archive` | 古い記憶をアーカイブ |

### エージェント

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/agent/run` | エージェントタスクを実行 |
| GET | `/agent/task/{id}` | タスク状態確認 |
| GET | `/agent/tasks` | タスク一覧 |
| DELETE | `/agent/task/{id}` | タスクをキャンセル |
| GET | `/org/status` | 組織・エージェント状態 |

### スケジュール

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/schedules` | 予定を追加 |
| GET | `/schedules` | 予定一覧 |
| PUT | `/schedules/{id}` | 予定を更新 |
| DELETE | `/schedules/{id}` | 予定を削除 |

### タスク

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/tasks` | タスクを作成 |
| GET | `/tasks` | タスク一覧 |
| PUT | `/tasks/{id}` | タスクを更新 |
| DELETE | `/tasks/{id}` | タスクを削除 |

### ファイル

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/files/upload` | ファイルをアップロード |
| GET | `/files` | ファイル一覧 |
| DELETE | `/files/{id}` | ファイルを削除 |

### 人格

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/personality` | 現在の人格設定を取得 |
| PUT | `/personality` | 人格設定を更新 |
| GET | `/personality/values` | 価値観パラメータ |
| GET | `/personality/evolution` | 成長・進化履歴 |

### システム

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/health` | ヘルスチェック |
| GET | `/dashboard` | Web ダッシュボード |
| GET | `/metrics` | パフォーマンス指標 |

---

## 共通レスポンス形式

### 成功レスポンス

```json
{
  "status": "success",
  "data": { ... },
  "timestamp": "2026-03-14T10:30:00Z"
}
```

### エラーレスポンス

```json
{
  "status": "error",
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid API key",
    "detail": "..."
  },
  "timestamp": "2026-03-14T10:30:00Z"
}
```

### HTTP ステータスコード

| コード | 意味 |
|--------|------|
| 200 | 成功 |
| 201 | 作成成功 |
| 400 | リクエストエラー |
| 401 | 認証エラー |
| 403 | アクセス拒否（IP フィルタ等）|
| 404 | リソースが見つからない |
| 429 | レートリミット超過 |
| 500 | サーバーエラー |

---

## レートリミット

```
デフォルト制限:
- チャット: 60 リクエスト / 分
- その他: 120 リクエスト / 分
- ファイルアップロード: 10 リクエスト / 分

レートリミット超過時:
HTTP 429 Too Many Requests
Retry-After: 30  (秒後に再試行可能)
```

---

## OpenAPI / Swagger

インタラクティブな API ドキュメントがローカルで確認できます：

```
http://cocoro.local:8001/docs     # Swagger UI
http://cocoro.local:8001/redoc   # ReDoc
http://cocoro.local:8001/openapi.json  # OpenAPI スキーマ
```

---

## SDK での利用

TypeScript SDK を使うと型安全に API を呼び出せます：

```typescript
import { CocoroClient } from 'cocoro-sdk';

const cocoro = new CocoroClient({
  baseUrl: 'http://cocoro.local:8001',
  apiKey: process.env.COCORO_API_KEY,
});

// チャット
const response = await cocoro.chat.send('こんにちは！');

// 感情状態の取得
const emotion = await cocoro.emotion.getState();

// シンクロ率の取得
const syncRate = await cocoro.sync.getRate();
```

→ [SDK リファレンスを見る](../sdk/overview)
