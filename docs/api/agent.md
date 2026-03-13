---
title: Agent API
sidebar_position: 5
---

# 🤖 Agent API リファレンス

---

## POST /agent/task

タスクを作成してエージェントに自律実行させます。

```bash
curl -X POST http://cocoro.local:8001/agent/task \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AIトレンドを調査して3点にまとめて",
    "type": "research",
    "priority": "normal",
    "deadline": "2026-03-14T18:00:00Z"
  }'
```

```json
{
  "task_id": "task_xyz789",
  "status": "pending",
  "created_at": "2026-03-13T11:00:00Z",
  "estimated_duration_seconds": 45
}
```

### タスクタイプ

| `type` | 説明 | 主なツール |
|--------|------|-----------|
| `research` | Web 検索・情報収集・まとめ | `web_search`, `search_memory` |
| `schedule` | スケジュール管理・調整 | `add_schedule`, `list_schedules` |
| `task_management` | タスク管理と追跡 | `create_task`, `list_recent_tasks` |
| `analysis` | データ分析・要約 | `search_learnings`, `search_memory` |
| `custom` | 自由記述（システムが判断） | 自動選択 |

---

## GET /agent/task/&#123;task_id&#125;

タスクの詳細・進捗を取得します。

```bash
curl http://cocoro.local:8001/agent/task/task_xyz789 \
  -H "Authorization: Bearer $COCORO_API_KEY"
```

```json
{
  "task_id": "task_xyz789",
  "title": "AIトレンドを調査して3点にまとめて",
  "status": "completed",
  "progress": 100,
  "steps": [
    {
      "step": "web_search",
      "status": "done",
      "duration_ms": 2100,
      "result_summary": "5件の記事を取得"
    },
    {
      "step": "analyze",
      "status": "done",
      "duration_ms": 3400,
      "result_summary": "3つのトレンドを抽出"
    },
    {
      "step": "store_memory",
      "status": "done",
      "duration_ms": 200
    }
  ],
  "result": {
    "text": "2026年のAIトレンド3点:\n1. エージェント型AI...\n2. ...\n3. ...",
    "sources": [
      "https://example.com/ai-trend-1",
      "https://example.com/ai-trend-2"
    ]
  },
  "created_at": "2026-03-13T11:00:00Z",
  "completed_at": "2026-03-13T11:00:58Z",
  "duration_total_ms": 5700
}
```

---

## GET /agent/tasks

タスク一覧を取得します。

```bash
# 実行中のタスク
curl "http://cocoro.local:8001/agent/tasks?status=running&limit=10" \
  -H "Authorization: Bearer $COCORO_API_KEY"

# 全タスク（完了含む）
curl "http://cocoro.local:8001/agent/tasks?limit=50" \
  -H "Authorization: Bearer $COCORO_API_KEY"
```

### クエリパラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `status` | string | `pending` / `running` / `completed` / `failed` |
| `limit` | int | 取得件数（default: 20）|
| `offset` | int | オフセット |
| `type` | string | タスクタイプでフィルター |

---

## DELETE /agent/task/&#123;task_id&#125;

実行中のタスクをキャンセルします。

```bash
curl -X DELETE http://cocoro.local:8001/agent/task/task_xyz789 \
  -H "Authorization: Bearer $COCORO_API_KEY"
```

---

## GET /agent/status

エージェントシステム全体の状態を確認します。

```bash
curl http://cocoro.local:8001/agent/status \
  -H "Authorization: Bearer $COCORO_API_KEY"
```

```json
{
  "active_tasks": 2,
  "queued_tasks": 5,
  "completed_today": 18,
  "failed_today": 1,
  "worker_count": 3,
  "queue_latency_ms": 120
}
```
