---
title: エージェントシステム
sidebar_position: 3
---

# 🤖 エージェントシステム

Cocoro OS のエージェントシステムは、複雑なタスクを自律的に**計画・実行・完了報告**する仕組みです。

---

## 全体フロー

```
ユーザー入力（自然言語）
        │
        ▼
   Task Router
  「このタスクを誰が担当？」
        │
  ┌─────┴──────────────────┐
  ▼                        ▼
専門職 Worker              汎用 Worker
（医療 / 法律 / 会計 等）  （リサーチ / スケジュール等）
        │                        │
        └────────┬───────────────┘
                 ▼
           Task Queue（Redis）
                 │
        ┌────────┴────────┐
        ▼                 ▼
   Tool Executor      Planner
  （ツール実行）      （複数ステップ計画）
        │                 │
        └────────┬────────┘
                 ▼
           結果の集約・整形
                 │
                 ▼
           ユーザーへの返答
```

---

## Task Router

入力を解析し、適切な Worker にルーティングします。

```python
# 内部ロジック（概略）
class TaskRouter:
    def route(self, input: str) -> Worker:
        intent = reasoning.classify_intent(input)

        if intent.domain == "medical":
            return MedicalSpecialistWorker()
        elif intent.domain == "legal":
            return LegalSpecialistWorker()
        elif intent.type == "research":
            return ResearchWorker()
        else:
            return GeneralWorker()
```

---

## 組み込みワーカー

| Worker | 得意タスク | 使用ツール |
|--------|-----------|-----------|
| `ResearchWorker` | Web 検索・情報収集 | `web_search`, `search_memory` |
| `ScheduleWorker` | スケジュール管理 | `add_schedule`, `list_schedules` |
| `TaskManager` | タスク作成・追跡 | `create_task`, `list_recent_tasks` |
| `OrgWorker` | 組織状態確認 | `get_org_status` |
| `MemoryWorker` | 記憶の検索・保存 | `search_memory`, `search_learnings` |
| `PersonalityWorker` | 人格・感情操作 | `get_personality` |

---

## Function Calling ツール（10種）

各 Worker が呼び出せる組み込みツール：

| ツール | 説明 | 引数 |
|--------|------|------|
| `search_memory` | 過去の記憶をベクトル検索 | `query`, `limit` |
| `create_task` | タスクを作成・登録 | `title`, `priority`, `due_date` |
| `get_org_status` | 組織・部署の状態確認 | なし |
| `search_learnings` | 学習内容を検索 | `query` |
| `get_personality` | 現在の人格状態 | なし |
| `get_current_time` | 現在時刻 | `timezone` |
| `web_search` | DuckDuckGo 検索 | `query`, `max_results` |
| `add_schedule` | スケジュール追加 | `title`, `date`, `time` |
| `list_schedules` | スケジュール一覧 | `days` |
| `list_recent_tasks` | 最近のタスク一覧 | `limit`, `status` |

### Plugins（追加ツール）

| Plugin | 機能 |
|--------|------|
| `math` | 数値計算 |
| `time` | 時刻・日付計算 |
| `format` | テキスト整形 |
| `random` | 乱数生成 |

---

## タスクの状態管理

```
pending → running → completed
                 ↘ failed
                 ↘ cancelled
```

```bash
# タスク状態確認
curl http://localhost:8001/agent/tasks \
  -H "Authorization: Bearer $COCORO_API_KEY"

# 特定タスクの詳細
curl http://localhost:8001/agent/task/TASK_ID \
  -H "Authorization: Bearer $COCORO_API_KEY"
```

---

## カスタムツールの追加

`brain/tools/` に新しいツールを追加できます：

```python
# brain/tools/my_tool.py
from .base import BaseTool

class MyCustomTool(BaseTool):
    name = "my_custom_tool"
    description = "カスタムツールの説明"

    async def execute(self, param: str) -> dict:
        # ツールの処理
        result = await some_api_call(param)
        return {"result": result}
```

→ 詳細は **[カスタムエージェントの作成](../guides/custom-agent)** を参照
