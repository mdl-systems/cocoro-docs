---
title: Chat API
sidebar_position: 2
---

# 💬 Chat API リファレンス

---

## POST /chat

シンプルなチャット（一括レスポンス）。

```bash
curl -X POST http://cocoro.local:8001/chat \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "今日の天気を調べて",
    "session_id": "optional-session-uuid"
  }'
```

### リクエストボディ

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `message` | string | ✅ | ユーザーメッセージ |
| `session_id` | string | - | セッション識別子（省略で自動生成）|
| `context` | string | - | 追加コンテキスト情報 |
| `skip_memory` | bool | - | メモリ検索をスキップ（default: false）|

### レスポンス

```json
{
  "text": "今日の東京の天気は晴れです。...",
  "session_id": "sess_abc123",
  "emotion": {
    "primary": "joy",
    "secondary": null,
    "intensity": 0.65,
    "valence": 0.72
  },
  "sync_rate": 52.3,
  "thinking_time_ms": 1847,
  "memory_updated": true,
  "tools_used": ["web_search", "get_current_time"],
  "timestamp": "2026-03-13T11:00:00Z"
}
```

---

## POST /chat/stream

SSE（Server-Sent Events）によるリアルタイムストリーミング。

```bash
curl -X POST http://cocoro.local:8001/chat/stream \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "量子コンピュータについて詳しく教えて"}'
```

### SSE ストリーム形式

```
data: {"text": "量子", "done": false}

data: {"text": "コンピュータ", "done": false}

data: {"text": "は", "done": false}

...

data: {"text": "", "done": true, "emotion": {"primary": "joy"}, "sync_rate": 52.3}

```

各チャンクの `done: true` でストリーム終了。

---

## GET /chat/history

会話履歴を取得します。

```bash
curl "http://cocoro.local:8001/chat/history?session_id=sess_abc123&limit=20" \
  -H "Authorization: Bearer $COCORO_API_KEY"
```

### クエリパラメータ

| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|---------|------|
| `session_id` | string | - | セッション ID |
| `limit` | int | 20 | 取得件数（最大 100）|
| `offset` | int | 0 | オフセット |

---

## DELETE /chat/history

会話履歴（短期メモリ）をクリアします。

```bash
curl -X DELETE "http://cocoro.local:8001/chat/history?session_id=sess_abc123" \
  -H "Authorization: Bearer $COCORO_API_KEY"
```

---

## TypeScript 型定義

```typescript
interface ChatRequest {
  message: string;
  session_id?: string;
  context?: string;
  skip_memory?: boolean;
}

interface ChatResponse {
  text: string;
  session_id: string;
  emotion: {
    primary: 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust';
    secondary?: string;
    intensity: number;    // 0.0 〜 1.0
    valence: number;      // -1.0 〜 +1.0
  };
  sync_rate: number;         // 0 〜 100
  thinking_time_ms: number;
  memory_updated: boolean;
  tools_used: string[];
  timestamp: string;
}

interface StreamChunk {
  text: string;
  done: boolean;
  emotion?: ChatResponse['emotion'];  // done: true の時のみ
  sync_rate?: number;
}
```
