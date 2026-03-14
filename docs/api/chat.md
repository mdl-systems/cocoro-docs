---
title: POST /chat/stream
sidebar_position: 2
description: Cocoro OS のリアルタイムSSEストリーミングチャットAPIの完全リファレンス。
---

# POST /chat/stream

リアルタイム SSE（Server-Sent Events）ストリーミングチャット。
ChatGPT と同様のワード単位のストリーミング応答を実現します。

---

## エンドポイント

```
POST /chat/stream
Content-Type: application/json
Authorization: Bearer {COCORO_API_KEY}
```

---

## リクエストボディ

```json
{
  "message": "量子コンピュータの原理を教えて",
  "session_id": "session_abc123",    // 省略可（省略時は自動生成）
  "context": {                        // 省略可
    "location": "Tokyo",
    "time_zone": "Asia/Tokyo"
  },
  "options": {                        // 省略可
    "use_memory": true,               // 記憶システムを使用（デフォルト: true）
    "use_tools": true,                // Function Calling を使用（デフォルト: true）
    "max_tokens": 2048,               // 最大トークン数
    "temperature": 0.7                // 創造性（0.0〜1.0）
  }
}
```

### パラメータ詳細

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `message` | string | ✅ | ユーザーのメッセージ（最大 4000 文字）|
| `session_id` | string | — | セッション ID。同一セッション内で会話の文脈を維持 |
| `context` | object | — | 追加コンテキスト情報（位置・時刻など）|
| `options.use_memory` | boolean | — | 記憶システムの使用（デフォルト: true）|
| `options.use_tools` | boolean | — | Function Calling ツールの使用（デフォルト: true）|
| `options.max_tokens` | integer | — | 最大出力トークン数（デフォルト: 2048）|
| `options.temperature` | float | — | 応答の多様性（0.0=決定論的, 1.0=創造的）|

---

## レスポンス（SSE ストリーム）

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

### SSE イベント形式

```
data: {"type": "start", "session_id": "session_abc123", "timestamp": "2026-03-14T10:30:00Z"}\n\n

data: {"type": "token", "content": "量"}\n\n
data: {"type": "token", "content": "子"}\n\n
data: {"type": "token", "content": "コン"}\n\n
data: {"type": "token", "content": "ピュータ"}\n\n
data: {"type": "token", "content": "は"}\n\n
...（省略）...

data: {"type": "tool_call", "tool": "web_search", "args": {"query": "量子コンピュータ 原理"}}\n\n
data: {"type": "tool_result", "tool": "web_search", "status": "done"}\n\n

data: {"type": "end", "metadata": {
  "sync_rate": 73.2,
  "sync_rate_change": 0.1,
  "emotion": {"primary": "curiosity", "intensity": 0.65},
  "tools_used": ["web_search"],
  "memory_updated": true,
  "thinking_time_ms": 1243,
  "total_tokens": 512
}}\n\n
```

### イベントタイプ一覧

| type | 説明 | 含まれるフィールド |
|------|------|----------------|
| `start` | ストリーム開始 | `session_id`, `timestamp` |
| `token` | テキストトークン | `content` |
| `tool_call` | Function Calling 開始 | `tool`, `args` |
| `tool_result` | Function Calling 完了 | `tool`, `status`, `result` |
| `end` | ストリーム終了 | `metadata`（詳細情報）|
| `error` | エラー発生 | `code`, `message` |

### metadata フィールド詳細

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `sync_rate` | float | 現在のシンクロ率（%）|
| `sync_rate_change` | float | この会話でのシンクロ率変化量 |
| `emotion.primary` | string | 現在の主要感情 |
| `emotion.intensity` | float | 感情の強度（0.0〜1.0）|
| `tools_used` | string[] | 使用した Function Calling ツール |
| `memory_updated` | boolean | 記憶が更新されたか |
| `thinking_time_ms` | integer | AI の思考時間（ms）|
| `total_tokens` | integer | 使用トークン数 |

---

## 使用例

### curl

```bash
COCORO_API_KEY="your_api_key"

curl -X POST http://cocoro.local:8001/chat/stream \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "最近のAIトレンドを調べてまとめて",
    "options": {
      "use_tools": true
    }
  }'
```

### JavaScript（EventSource）

```javascript
const response = await fetch('http://cocoro.local:8001/chat/stream', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ message: 'こんにちは！' }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const lines = decoder.decode(value).split('\n');
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const event = JSON.parse(line.slice(6));

      if (event.type === 'token') {
        process.stdout.write(event.content);
      } else if (event.type === 'end') {
        console.log('\n\nシンクロ率:', event.metadata.sync_rate);
      }
    }
  }
}
```

### TypeScript SDK

```typescript
import { CocoroClient } from 'cocoro-sdk';

const cocoro = new CocoroClient({
  baseUrl: 'http://cocoro.local:8001',
  apiKey: process.env.COCORO_API_KEY,
});

// ストリーミング
for await (const event of cocoro.chat.stream('最近の気分は？')) {
  if (event.type === 'token') {
    process.stdout.write(event.content);
  }
}
```

---

## /chat との違い

| | /chat | /chat/stream |
|--|-------|-------------|
| レスポンス形式 | JSON（一括）| SSE（逐次）|
| 体験 | 返答が一度に表示 | ワード単位でリアルタイム表示 |
| 推奨用途 | スクリプト・バッチ処理 | UI・インタラクティブチャット |
| レスポンス速度 | 遅い（全文完成後）| 速い（すぐに始まる）|

---

## エラーコード

| コード | HTTP | 説明 |
|--------|------|------|
| `UNAUTHORIZED` | 401 | API キーが無効 |
| `RATE_LIMITED` | 429 | レートリミット超過 |
| `MESSAGE_TOO_LONG` | 400 | メッセージが 4000 文字超 |
| `LLM_ERROR` | 500 | LLM API エラー |
| `MEMORY_ERROR` | 500 | 記憶システムエラー |
