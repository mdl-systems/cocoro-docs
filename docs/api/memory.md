---
title: Memory API
sidebar_position: 4
---

# 🧠 Memory API リファレンス

---

## POST /memory/search

意味的類似検索でメモリを検索します（pgvector）。

```bash
curl -X POST http://cocoro.local:8001/memory/search \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "好きな食べ物",
    "limit": 5,
    "threshold": 0.7,
    "category": "personal"
  }'
```

```json
{
  "results": [
    {
      "id": "mem_abc123",
      "content": "ユーザーはラーメンが好きだと話していた。特に博多系が好みとのこと。",
      "similarity": 0.92,
      "importance": 0.8,
      "category": "personal",
      "created_at": "2026-02-15T10:30:00Z",
      "access_count": 5
    }
  ],
  "total": 1
}
```

### クエリパラメータ

| フィールド | 型 | デフォルト | 説明 |
|-----------|-----|---------|------|
| `query` | string | 必須 | 検索クエリ |
| `limit` | int | 5 | 最大取得件数 |
| `threshold` | float | 0.7 | 類似度閾値（0〜1）|
| `category` | string | - | カテゴリフィルター |

---

## POST /memory/store

新しいメモリを手動で保存します。

```bash
curl -X POST http://cocoro.local:8001/memory/store \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "ユーザーの誕生日は3月15日。毎年お祝いの言葉を準備すること。",
    "category": "personal",
    "importance": 0.95
  }'
```

### メモリカテゴリ

| カテゴリ | 説明 | TTL |
|---------|------|-----|
| `personal` | 個人情報・好み | 永続 |
| `knowledge` | 学習した知識 | 永続 |
| `experience` | 体験・出来事 | 永続 |
| `preference` | 好みや傾向 | 永続 |
| `task` | タスク関連 | 完了後 30 日 |

---

## GET /memory/list

メモリの一覧を取得します。

```bash
curl "http://cocoro.local:8001/memory/list?category=personal&limit=20&page=1" \
  -H "Authorization: Bearer $COCORO_API_KEY"
```

---

## DELETE /memory/&#123;id&#125;

特定のメモリを削除します。

```bash
curl -X DELETE http://cocoro.local:8001/memory/mem_abc123 \
  -H "Authorization: Bearer $COCORO_API_KEY"
```

---

## GET /memory/context

現在のセッションの短期メモリ（会話コンテキスト）を取得します。

```bash
curl "http://cocoro.local:8001/memory/context?session_id=sess_abc123" \
  -H "Authorization: Bearer $COCORO_API_KEY"
```

---

## DELETE /memory/context

短期メモリをクリアします（会話リセット）。

```bash
curl -X DELETE "http://cocoro.local:8001/memory/context?session_id=sess_abc123" \
  -H "Authorization: Bearer $COCORO_API_KEY"
```

---

## GET /memory/stats

メモリストアの統計情報を取得します。

```bash
curl http://cocoro.local:8001/memory/stats \
  -H "Authorization: Bearer $COCORO_API_KEY"
```

```json
{
  "total_memories": 1247,
  "by_category": {
    "personal": 523,
    "knowledge": 412,
    "experience": 312
  },
  "vector_dimensions": 1536,
  "storage_mb": 245.6,
  "oldest_memory": "2026-01-01T00:00:00Z",
  "last_consolidation": "2026-03-13T03:00:00Z"
}
```
