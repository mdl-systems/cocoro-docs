---
title: API リファレンス概要
sidebar_position: 1
description: Cocoro OS (cocoro-core) の REST API 概要。Bearer Token認証・主要エンドポイント一覧・レスポンス形式を解説。
---

# 📡 API リファレンス概要

**cocoro-core** は FastAPI ベースの REST API を提供します。
**131 エンドポイント**を持ち、すべての操作をプログラムから実行できます。

---

## インタラクティブ API ドキュメント（Swagger UI）

cocoro-core 起動後、以下の URL にアクセスすると **Swagger UI** でAPIを試せます。

| ツール | URL |
|--------|-----|
| **Swagger UI** | `http://cocoro.local:8001/docs` |
| **Swagger UI（外部）** | `https://{NODE_ID}.cocoro-os.com/api/docs` |
| **ReDoc** | `http://cocoro.local:8001/redoc` |
| **OpenAPI JSON** | `http://cocoro.local:8001/openapi.json` |

**Swagger UI の使い方:**
1. URL をブラウザで開く
2. 右上「Authorize 🔒」をクリック
3. `Bearer {COCORO_API_KEY}` を入力して「Authorize」
4. 各エンドポイントを展開 → 「Try it out」→「Execute」でテスト

---

## ベース URL

```bash
# LAN 内アクセス（推奨）
http://cocoro.local:8001

# IP アドレス直接
http://192.168.x.xxx:8001

# Cloudflare Tunnel 経由（外部アクセス）
https://{NODE_ID}.cocoro-os.com/api
```

---

## 認証方法（Bearer Token）

すべてのエンドポイントで **Bearer Token 認証**が必要です。

### API キーを直接使う（シンプル）

```bash
curl http://cocoro.local:8001/health \
  -H "Authorization: Bearer YOUR_COCORO_API_KEY"
```

### JWT トークンを取得して使う（推奨）

```bash
# JWT トークンを取得（有効期間: 1時間）
curl -X POST http://cocoro.local:8001/auth/token \
  -H "Content-Type: application/json" \
  -d '{"api_key": "YOUR_COCORO_API_KEY"}'

# レスポンス
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}

# 取得したトークンで API を呼び出す
curl http://cocoro.local:8001/chat \
  -H "Authorization: Bearer eyJhbGci..."
```

:::tip COCORO_API_KEY の確認
```bash
ssh cocoro-admin@cocoro.local
grep COCORO_API_KEY /opt/cocoro/core/infra/docker/.env
```
:::

---

## 主要エンドポイント一覧

### `/chat` — チャット

| メソッド | パス | 説明 |
|---------|------|------|
| `POST` | `/chat` | 通常チャット（同期・JSON レスポンス）|
| `POST` | `/chat/stream` | SSE ストリーミングチャット（リアルタイム）|

```bash
# 通常チャット
curl -X POST http://cocoro.local:8001/chat \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "今日の調子はどう？"}'

# ストリーミングチャット
curl -X POST http://cocoro.local:8001/chat/stream \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "AIトレンドを調べてまとめて"}'
```

→ 詳細: [POST /chat/stream](./chat)

---

### `/sync/rate` — シンクロ率

| メソッド | パス | 説明 |
|---------|------|------|
| `GET` | `/sync/rate` | 現在のシンクロ率を取得 |
| `GET` | `/sync/history` | シンクロ率の推移（過去N日）|
| `GET` | `/sync/ceiling` | Divergence Ceiling の状態 |
| `POST` | `/sync/reset` | シンクロ率をリセット |

```bash
# 現在のシンクロ率
curl http://cocoro.local:8001/sync/rate \
  -H "Authorization: Bearer $COCORO_API_KEY"

# レスポンス
{
  "sync_rate": 73.2,
  "trend": "+0.3",
  "level": "深化期",
  "ceiling": {
    "threshold": 92.0,
    "active": false,
    "remaining": 18.8
  }
}
```

→ 詳細: [GET /sync/rate](./sync)

---

### `/emotion/state` — 感情状態

| メソッド | パス | 説明 |
|---------|------|------|
| `GET` | `/emotion/state` | 現在の感情状態（8要素）|
| `POST` | `/emotion/update` | 感情を手動更新 |
| `GET` | `/emotion/history` | 感情履歴の取得 |

```bash
# 現在の感情状態
curl http://cocoro.local:8001/emotion/state \
  -H "Authorization: Bearer $COCORO_API_KEY"

# レスポンス
{
  "emotion": {
    "primary": "joy",
    "intensity": 0.72,
    "valence": 0.65
  },
  "components": {
    "joy": 0.72,
    "trust": 0.68,
    "fear": 0.12,
    "surprise": 0.23,
    "sadness": 0.08,
    "anger": 0.05,
    "disgust": 0.03,
    "anticipation": 0.41
  },
  "stability": 0.81
}
```

→ 詳細: [GET /emotion/state](./emotion)

---

### `/nodes` — ノード管理

複数ノード構成時のノード情報を管理します。

| メソッド | パス | 説明 |
|---------|------|------|
| `GET` | `/nodes` | 登録済みノード一覧 |
| `POST` | `/nodes/register` | 新しいノードを登録 |
| `GET` | `/nodes/{node_id}` | 特定ノードの情報 |
| `GET` | `/nodes/{node_id}/health` | ノードのヘルスチェック |
| `DELETE` | `/nodes/{node_id}` | ノードを削除 |

```bash
# ノード一覧の取得
curl http://cocoro.local:8001/nodes \
  -H "Authorization: Bearer $COCORO_API_KEY"

# レスポンス
{
  "nodes": [
    {
      "node_id": "home",
      "name": "ホームノード",
      "url": "https://home.cocoro-os.com/api",
      "status": "healthy",
      "role": "primary",
      "sync_rate": 73.2,
      "last_seen": "2026-03-18T14:50:00+09:00"
    }
  ],
  "total": 1
}
```

### 新しいノードを登録

```bash
curl -X POST http://cocoro.local:8001/nodes/register \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "node_id": "office",
    "name": "オフィスノード",
    "url": "https://office.cocoro-os.com/api",
    "api_key": "OFFICE_NODE_API_KEY",
    "role": "specialist",
    "specialization": "research"
  }'
```

---

### その他の主要エンドポイント

| カテゴリ | パス | 説明 |
|---------|------|------|
| **記憶** | `GET /memory/list` | 記憶の一覧取得 |
| **記憶** | `POST /memory/search` | セマンティック検索 |
| **記憶** | `POST /memory/add` | 記憶を手動追加 |
| **エージェント** | `POST /agent/run` | タスクを自律実行 |
| **エージェント** | `GET /agent/tasks` | タスク一覧 |
| **スケジュール** | `POST /schedules` | 予定を追加 |
| **スケジュール** | `GET /schedules` | 予定一覧 |
| **タスク** | `POST /tasks` | タスクを作成 |
| **人格** | `GET /personality` | 人格設定の取得 |
| **人格** | `PUT /personality` | 人格設定を更新 |
| **ファイル** | `POST /files/upload` | ファイルをアップロード |
| **セットアップ** | `GET /setup/status` | Boot Wizard の状態 |
| **システム** | `GET /health` | ヘルスチェック |
| **システム** | `GET /metrics` | パフォーマンス指標 |

---

## レスポンス形式

### 成功レスポンス

```json
{
  "status": "success",
  "data": {
    "...": "レスポンスデータ"
  },
  "timestamp": "2026-03-18T14:50:00+09:00"
}
```

### エラーレスポンス

```json
{
  "status": "error",
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid API key",
    "detail": "The provided API key is invalid or expired."
  },
  "timestamp": "2026-03-18T14:50:00+09:00"
}
```

### SSE ストリーミング形式（`/chat/stream`）

```
data: {"type": "start", "session_id": "sess_abc123"}\n\n
data: {"type": "token", "content": "こんにちは"}\n\n
data: {"type": "token", "content": "！"}\n\n
data: {"type": "end", "metadata": {"sync_rate": 73.2, "emotion": {"primary": "joy"}}}\n\n
```

### HTTP ステータスコード

| コード | 意味 |
|--------|------|
| `200` | 成功 |
| `201` | 作成成功 |
| `400` | リクエストエラー（パラメータ不正）|
| `401` | 認証エラー（API キー無効）|
| `403` | アクセス拒否（IP フィルタ等）|
| `404` | リソースが見つからない |
| `429` | レートリミット超過 |
| `500` | サーバー内部エラー |

---

## レートリミット

| エンドポイント | 制限 |
|-------------|------|
| `/chat`, `/chat/stream` | 60 リクエスト / 分 |
| その他のAPI | 120 リクエスト / 分 |
| `/files/upload` | 10 リクエスト / 分 |

レートリミット超過時:
```json
HTTP 429 Too Many Requests
Retry-After: 30

{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please wait 30 seconds."
  }
}
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

// チャット（ストリーミング）
for await (const event of cocoro.chat.stream('こんにちは！')) {
  if (event.type === 'token') process.stdout.write(event.content);
}

// シンクロ率の取得
const sync = await cocoro.sync.getRate();
console.log(`シンクロ率: ${sync.sync_rate}%`);

// 感情状態の取得
const emotion = await cocoro.emotion.getState();
console.log(`感情: ${emotion.emotion.primary}`);

// ノード一覧の取得
const nodes = await cocoro.nodes.list();
console.log(`ノード数: ${nodes.total}`);
```

→ [SDK リファレンスを見る](../sdk/overview)
