---
title: エージェント API
sidebar_position: 6
---

# 🤖 エージェント API

---

## エージェントとは

Cocoro OS の **エージェント** は、複雑なタスクを自律的に計画・実行する仕組みです。
「リサーチして」「まとめて」「スケジュールに入れて」といった複合タスクを、
AI が自分で分解して順番に実行します。

---

## タスク実行

```bash
POST /agent/task
Content-Type: application/json

{
  "title": "AIトレンドをリサーチしてまとめる",
  "type": "research",
  "priority": "normal"
}
```

```json
{
  "task_id": "task_xyz789",
  "status": "running",
  "created_at": "2026-03-08T12:00:00Z"
}
```

---

## タスク状態確認

```bash
GET /agent/task/task_xyz789
```

```json
{
  "task_id": "task_xyz789",
  "title": "AIトレンドをリサーチしてまとめる",
  "status": "completed",
  "progress": 100,
  "steps": [
    {"step": "web_search", "status": "done", "duration_ms": 2100},
    {"step": "summarize", "status": "done", "duration_ms": 3400},
    {"step": "store_memory", "status": "done", "duration_ms": 200}
  ],
  "result": {
    "summary": "2026年のAIトレンドは...",
    "sources": ["https://...", "https://..."]
  },
  "completed_at": "2026-03-08T12:00:45Z"
}
```

---

## タスク一覧

```bash
GET /agent/tasks?status=running&limit=10
```

---

## タスクキャンセル

```bash
DELETE /agent/task/task_xyz789
```

---

## SDK での使用例（設計仕様）

```typescript
const cocoro = new CocoroClient({ baseUrl: '...', apiKey: '...' });

// タスクを投げてAIが自律実行
const task = await cocoro.agent.run({
  title: 'AIトレンドをリサーチして',
  type: 'research',
});

// リアルタイム進捗（SSE）
for await (const event of task.stream()) {
  console.log(`${event.step}: ${event.progress}%`);
}

// 結果取得
const result = await task.result();
console.log(result.summary);
```

---

## タスクタイプ

| タイプ | 説明 | 代表ツール |
|--------|------|----------|
| `research` | Web 検索・情報収集 | `web_search`, `search_memory` |
| `schedule` | スケジュール管理 | `add_schedule`, `list_schedules` |
| `task_management` | タスク管理 | `create_task`, `list_recent_tasks` |
| `analysis` | データ分析・要約 | `search_memory`, `search_learnings` |
| `custom` | カスタムタスク | 任意 |
