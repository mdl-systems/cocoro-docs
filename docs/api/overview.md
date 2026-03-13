---
title: API 概要
sidebar_position: 1
---

# 📡 API リファレンス概要

cocoro-core は **FastAPI** で実装された REST API を提供します。
131 エンドポイントを 6 カテゴリに分類しています。

---

## ベース URL

```
http://<miniPC-IP>:8001
例: http://cocoro.local:8001
    http://192.168.1.100:8001
```

---

## 認証

すべての API は認証が必要です。2 種類の方式をサポートしています。

### API Key 認証（推奨）

```bash
curl http://cocoro.local:8001/chat \
  -H "Authorization: Bearer YOUR_COCORO_API_KEY"
```

### JWT 認証（セッション管理が必要な場合）

```bash
# Step 1: トークン取得
TOKEN=$(curl -s -X POST http://cocoro.local:8001/auth/token \
  -H "Content-Type: application/json" \
  -d '{"api_key": "YOUR_COCORO_API_KEY"}' | jq -r '.access_token')

# Step 2: JWT を使ってリクエスト
curl http://cocoro.local:8001/chat \
  -H "Authorization: Bearer $TOKEN"
```

JWT の有効期限は **1時間**です（自動更新なし）。

---

## エンドポイント一覧

| カテゴリ | エンドポイント数 | 説明 |
|---------|--------------|------|
| **Chat** | 4 | チャット・SSE ストリーミング |
| **Personality** | 12 | 人格・感情・シンクロ率 |
| **Memory** | 8 | 記憶の CRUD・検索 |
| **Agent / Task** | 6 | タスク管理・実行 |
| **Auth** | 3 | 認証・API キー管理 |
| **System** | 8 | ヘルスチェック・設定・ダッシュボード |
| **その他** | 90 | 各種サブエンドポイント |

---

## 共通レスポンス形式

```json
{
  "status": "success",
  "data": { ... },
  "timestamp": "2026-03-13T11:00:00Z"
}
```

### エラーレスポンス

```json
{
  "status": "error",
  "code": "UNAUTHORIZED",
  "message": "API キーが無効です",
  "timestamp": "2026-03-13T11:00:00Z"
}
```

---

## エラーコード一覧

| HTTP | コード | 説明 |
|------|--------|------|
| 400 | `INVALID_REQUEST` | リクエストパラメータ不正 |
| 401 | `UNAUTHORIZED` | 認証失敗 |
| 403 | `FORBIDDEN` | アクセス権限なし |
| 404 | `NOT_FOUND` | リソースが存在しない |
| 429 | `RATE_LIMITED` | レート制限超過 |
| 500 | `INTERNAL_ERROR` | サーバー内部エラー |
| 503 | `LLM_UNAVAILABLE` | LLM プロバイダーへの接続失敗 |

---

## レート制限

| エンドポイント | 制限 |
|-------------|------|
| `/chat` | 60 回 / 分 |
| `/chat/stream` | 20 回 / 分 |
| その他 | 120 回 / 分 |

`RATE_LIMIT_ENABLED=false` で無効化できます（開発環境向け）。

---

## ヘルスチェック

```bash
curl http://cocoro.local:8001/health
```

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime_seconds": 86400,
  "llm_provider": "gemini",
  "llm_status": "connected",
  "db_status": "connected",
  "redis_status": "connected"
}
```

---

## OpenAPI ドキュメント

Swagger UI: `http://cocoro.local:8001/docs`  
ReDoc:       `http://cocoro.local:8001/redoc`
