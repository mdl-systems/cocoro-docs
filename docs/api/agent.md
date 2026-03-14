---
title: POST /agent/run
sidebar_position: 6
description: エージェントタスク実行APIのリファレンス。自律タスク実行・進捗確認・SSEストリーミングの使い方。
---

# POST /agent/run

自律エージェントにタスクを投げて実行させます。
タスクは非同期で実行され、SSE で進捗をリアルタイムに受け取れます。

---

## エンドポイント

```bash
POST /agent/run
Content-Type: application/json
Authorization: Bearer {COCORO_API_KEY}
```

## リクエストボディ

```json
{
  "title": "AIトレンドをリサーチして週次レポートを作成する",
  "type": "research",
  "priority": "normal",
  "deadline": "2026-03-14T18:00:00Z",
  "instructions": "最新のAIニュースを5件調べて、それぞれ2〜3行で要約すること",
  "save_to_memory": true,
  "notify_on_complete": true
}
```

### リクエストパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `title` | string | ✅ | タスクのタイトル（最大 200 文字）|
| `type` | string | ✅ | タスクタイプ（後述）|
| `priority` | string | — | 優先度: `low`/`normal`/`high`/`critical`（デフォルト: `normal`）|
| `deadline` | string | — | 期限（ISO 8601）|
| `instructions` | string | — | 詳細な指示（省略時はタイトルから推論）|
| `save_to_memory` | boolean | — | 結果を記憶に保存するか（デフォルト: true）|
| `notify_on_complete` | boolean | — | 完了時に通知するか |

### タスクタイプ一覧

| type | 説明 | 主なツール |
|------|------|-----------|
| `research` | Web 検索・情報収集・まとめ | `web_search`, `search_learnings` |
| `schedule` | スケジュール管理 | `add_schedule`, `list_schedules` |
| `task_management` | タスク管理 | `create_task`, `list_recent_tasks` |
| `analysis` | データ分析・要約 | `search_memory`, `search_learnings` |
| `memory_curation` | 記憶の整理・引用 | `search_memory` |
| `custom` | カスタムタスク（自由形式）| 全ツール |

---

## レスポンス（タスク作成直後）

```json
{
  "task_id": "task_abc123",
  "title": "AIトレンドをリサーチして週次レポートを作成する",
  "type": "research",
  "priority": "normal",
  "status": "queued",
  "created_at": "2026-03-14T10:30:00Z",
  "estimated_duration_sec": 45,
  "stream_url": "/agent/task/task_abc123/stream"
}
```

---

## GET `/agent/task/{id}` — タスク状態確認

```bash
GET /agent/task/task_abc123
Authorization: Bearer {COCORO_API_KEY}
```

```json
{
  "task_id": "task_abc123",
  "title": "AIトレンドをリサーチして週次レポートを作成する",
  "type": "research",
  "status": "completed",
  "progress": 100,
  "steps": [
    {
      "step": "memory_search",
      "status": "done",
      "result": "過去のAI関連記憶 3件を発見",
      "duration_ms": 420
    },
    {
      "step": "web_search",
      "status": "done",
      "result": "5件のAIニュース記事を取得",
      "duration_ms": 2100
    },
    {
      "step": "analyze",
      "status": "done",
      "result": "各記事を要約",
      "duration_ms": 3400
    },
    {
      "step": "store_memory",
      "status": "done",
      "result": "レポートを記憶に保存",
      "duration_ms": 200
    }
  ],
  "result": {
    "summary": "2026年3月第2週のAIトレンド週次レポート",
    "content": "1. エージェント型AIの台頭...\n2. ローカルLLMの実用化...",
    "sources": [
      "https://techcrunch.com/ai-agents-2026",
      "https://mit.edu/llm-local-2026"
    ]
  },
  "created_at": "2026-03-14T10:30:00Z",
  "completed_at": "2026-03-14T10:31:07Z",
  "duration_sec": 67,
  "memory_id": "mem_result001"
}
```

### ステータス一覧

| status | 説明 |
|--------|------|
| `queued` | キュー待ち |
| `running` | 実行中 |
| `completed` | 完了 |
| `failed` | 失敗 |
| `cancelled` | キャンセル済み |

---

## GET `/agent/task/{id}/stream` — リアルタイム進捗（SSE）

```bash
GET /agent/task/task_abc123/stream
Authorization: Bearer {COCORO_API_KEY}
```

```
data: {"type": "start", "task_id": "task_abc123"}\n\n
data: {"type": "step", "step": "memory_search", "status": "running"}\n\n
data: {"type": "step", "step": "memory_search", "status": "done", "result": "3件発見"}\n\n
data: {"type": "step", "step": "web_search", "status": "running"}\n\n
data: {"type": "step", "step": "web_search", "status": "done", "result": "5記事取得"}\n\n
data: {"type": "progress", "progress": 60}\n\n
data: {"type": "step", "step": "analyze", "status": "running"}\n\n
data: {"type": "step", "step": "analyze", "status": "done"}\n\n
data: {"type": "progress", "progress": 90}\n\n
data: {"type": "step", "step": "store_memory", "status": "done"}\n\n
data: {"type": "complete", "result": {...}, "progress": 100}\n\n
```

---

## GET /agent/tasks — タスク一覧

```bash
GET /agent/tasks?status=running&limit=10
```

```json
{
  "tasks": [
    {
      "task_id": "task_abc123",
      "title": "AIトレンド週次レポート",
      "type": "research",
      "status": "running",
      "progress": 60,
      "created_at": "2026-03-14T10:30:00Z"
    }
  ],
  "total": 3,
  "running": 1,
  "queued": 2
}
```

---

## DELETE `/agent/task/{id}` — タスクをキャンセル

```bash
DELETE /agent/task/task_abc123
Authorization: Bearer {COCORO_API_KEY}
```

```json
{
  "status": "success",
  "task_id": "task_abc123",
  "cancelled_at": "2026-03-14T10:30:30Z"
}
```

---

## 使用例（TypeScript SDK）

```typescript
import { CocoroClient } from 'cocoro-sdk';

const cocoro = new CocoroClient({
  baseUrl: 'http://cocoro.local:8001',
  apiKey: process.env.COCORO_API_KEY,
});

// タスクを投げる
const task = await cocoro.agent.run({
  title: 'AIトレンドをリサーチしてまとめる',
  type: 'research',
  priority: 'normal',
});

console.log(`タスク ID: ${task.task_id}`);

// リアルタイム進捗を受け取る（TaskHandle パターン）
for await (const event of task.stream()) {
  if (event.type === 'step') {
    console.log(`${event.step}: ${event.status}`);
  } else if (event.type === 'progress') {
    console.log(`進捗: ${event.progress}%`);
  }
}

// 完了後に結果を取得
const result = await task.result();
console.log(result.content);
```
