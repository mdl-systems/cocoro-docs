---
title: GET /memory/list
sidebar_position: 5
description: 記憶一覧・検索・追加・削除APIのリファレンス。セマンティック検索と学習事項の取得方法を解説。
---

# GET /memory/list

記憶の一覧取得・検索・追加・削除を行う API リファレンスです。

---

## GET /memory/list — 記憶一覧

```bash
GET /memory/list?limit=20&offset=0&type=conversation&min_importance=0.5
Authorization: Bearer {COCORO_API_KEY}
```

### クエリパラメータ

| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|---------|------|
| `limit` | integer | 20 | 取得件数（最大 100）|
| `offset` | integer | 0 | オフセット（ページング用）|
| `type` | string | — | 記憶タイプでフィルタ（後述）|
| `min_importance` | float | 0.0 | 最小重要度スコア |
| `since` | string | — | 指定日時以降の記憶（ISO 8601）|
| `until` | string | — | 指定日時以前の記憶（ISO 8601）|
| `tag` | string | — | タグでフィルタ |

### 記憶タイプ一覧

| type | 説明 |
|------|------|
| `conversation` | 会話の記憶 |
| `user_info` | ユーザー個人情報 |
| `learning` | 学習事項 |
| `task` | タスク・予定の記録 |
| `emotional` | 感情的な出来事 |

### レスポンス

```json
{
  "memories": [
    {
      "id": "mem_abc123",
      "content": "cocoro-docs のドキュメント拡充作業について話した。15ページを追加する計画。",
      "importance": 0.85,
      "memory_type": "conversation",
      "tags": ["work", "cocoro-docs", "documentation"],
      "created_at": "2026-03-14T10:30:00Z",
      "last_accessed": "2026-03-14T10:30:00Z",
      "access_count": 3
    }
  ],
  "total": 1482,
  "limit": 20,
  "offset": 0,
  "has_more": true
}
```

---

## POST /memory/search — セマンティック検索

pgvector によるベクトル類似検索です。

```json
POST /memory/search
Content-Type: application/json

{
  "query": "プロジェクトの進捗",
  "limit": 5,
  "threshold": 0.7,
  "type": "conversation",
  "since": "2026-01-01T00:00:00Z"
}
```

### リクエストパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `query` | string | ✅ | 検索クエリ（自然言語）|
| `limit` | integer | — | 取得件数（デフォルト: 5）|
| `threshold` | float | — | 類似度の閾値（0.0〜1.0、デフォルト: 0.7）|
| `type` | string | — | 記憶タイプでフィルタ |
| `since` | string | — | 指定日時以降を検索 |

### レスポンス

```json
{
  "results": [
    {
      "id": "mem_xyz789",
      "content": "cocoro-docs に15ページ追加する作業が完了した",
      "similarity": 0.94,
      "importance": 0.85,
      "created_at": "2026-03-13T15:00:00Z"
    },
    {
      "id": "mem_def456",
      "content": "sidebars.ts の設定を完了させた",
      "similarity": 0.81,
      "importance": 0.72,
      "created_at": "2026-03-13T16:30:00Z"
    }
  ],
  "query": "プロジェクトの進捗",
  "total_searched": 1482
}
```

---

## POST /memory/add — 記憶を手動追加

```json
POST /memory/add
Content-Type: application/json

{
  "content": "MDLシステムズの主力製品はCocoro OS（AI意識OS）",
  "importance": 0.9,
  "memory_type": "user_info",
  "tags": ["work", "company"],
  "metadata": {
    "source": "manual"
  }
}
```

### レスポンス

```json
{
  "id": "mem_new001",
  "content": "MDLシステムズの主力製品はCocoro OS（AI意識OS）",
  "importance": 0.9,
  "created_at": "2026-03-14T10:30:00Z",
  "vector_indexed": true
}
```

---

## DELETE `/memory/{id}` — 記憶を削除

```bash
DELETE /memory/mem_abc123
Authorization: Bearer {COCORO_API_KEY}
```

```json
{
  "status": "success",
  "deleted_id": "mem_abc123",
  "message": "記憶を削除しました。"
}
```

---

## GET /memory/learnings — 学習事項一覧

会話から自動抽出された学習事項を取得します。

```bash
GET /memory/learnings?topic=AI&limit=10
```

```json
{
  "learnings": [
    {
      "id": "learn_001",
      "topic": "Cocoro OS",
      "content": "シンクロ率が92%を超えると Divergence Ceiling が発動し学習停止",
      "confidence": 0.95,
      "source_memory_id": "mem_abc123",
      "created_at": "2026-03-08T10:00:00Z"
    }
  ],
  "total": 387
}
```

---

## GET /memory/stats — 統計情報

```bash
GET /memory/stats
```

```json
{
  "total_memories": 1482,
  "by_type": {
    "conversation": 1102,
    "user_info": 48,
    "learning": 234,
    "task": 78,
    "emotional": 20
  },
  "storage_mb": 124.5,
  "oldest_memory": "2026-01-15T08:00:00Z",
  "avg_importance": 0.62,
  "learnings_count": 387,
  "last_archive": "2026-03-14T04:00:00Z"
}
```

---

## POST /memory/archive — アーカイブ実行

重要度の低い古い記憶を圧縮・削除します（スケジューラーによる自動実行もあります）。

```json
POST /memory/archive
Content-Type: application/json

{
  "older_than_days": 90,
  "min_importance_to_keep": 0.4,
  "dry_run": true
}
```

```json
{
  "status": "dry_run",
  "would_archive": 234,
  "would_delete": 89,
  "storage_freed_mb": 12.3,
  "message": "dry_run=true のため実際の変更はありません"
}
```
