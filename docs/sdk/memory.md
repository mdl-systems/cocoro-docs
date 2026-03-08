---
title: メモリ API
sidebar_position: 5
---

# 🧠 メモリ API

---

## 3 層メモリシステム

Cocoro OS は 3 種類のメモリを使い分けます：

| 種類 | ストレージ | 用途 | TTL |
|------|----------|------|-----|
| **短期メモリ** | Redis | 会話中の作業記憶 | セッション終了まで |
| **長期メモリ** | PostgreSQL | 重要な経験・知識 | 永続 |
| **ベクトルメモリ** | pgvector | 意味検索・類似検索 | 永続 |

---

## メモリ検索

```bash
POST /memory/search
Content-Type: application/json

{
  "query": "好きな食べ物",
  "limit": 5,
  "threshold": 0.7
}
```

```json
{
  "results": [
    {
      "id": "mem_abc123",
      "content": "ユーザーはラーメンが好きだと話していた",
      "similarity": 0.92,
      "created_at": "2026-02-15T10:30:00Z",
      "importance": 0.8
    }
  ]
}
```

---

## メモリ追加

```bash
POST /memory/store
Content-Type: application/json

{
  "content": "ユーザーの誕生日は3月15日",
  "category": "personal",
  "importance": 0.9
}
```

---

## メモリ一覧

```bash
GET /memory/list?category=personal&limit=20&page=1
```

---

## 短期メモリ（会話コンテキスト）

```bash
# 現在の会話コンテキスト取得
GET /memory/context

# コンテキストクリア
DELETE /memory/context
```

---

## TypeScript 型定義

```typescript
type MemoryEntry = {
  id: string;
  content: string;
  category: 'personal' | 'knowledge' | 'experience' | 'preference';
  importance: number;   // 0.0 〜 1.0
  created_at: string;
  access_count: number;
  last_accessed: string;
};

type MemorySearchResult = {
  results: Array<MemoryEntry & { similarity: number }>;
  total: number;
};
```
