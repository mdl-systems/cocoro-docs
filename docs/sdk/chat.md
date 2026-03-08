---
title: チャット API
sidebar_position: 3
---

# 💬 チャット API

---

## エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| `POST` | `/chat` | シンプルなチャット（一括返答） |
| `POST` | `/chat/stream` | SSE ストリーミング |
| `GET` | `/chat/history` | 会話履歴取得 |
| `DELETE` | `/chat/history` | 会話履歴クリア |

---

## POST /chat

```bash
curl -X POST http://localhost:8001/chat \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "今日の気分はどう？", "session_id": "optional-session-id"}'
```

**レスポンス:**

```json
{
  "text": "今日はとても元気です！何かお手伝いできることはありますか？",
  "emotion": {
    "primary": "joy",
    "secondary": "excitement",
    "intensity": 0.75,
    "valence": 0.8
  },
  "sync_rate": 52.3,
  "thinking_time_ms": 1234,
  "memory_updated": true,
  "tools_used": []
}
```

---

## POST /chat/stream（SSE）

```bash
curl -X POST http://localhost:8001/chat/stream \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "量子コンピュータについて説明して"}'
```

**SSE レスポンス（単語ごとにストリーム）:**

```
data: {"text": "量子", "done": false}

data: {"text": "コンピュータ", "done": false}

data: {"text": "は", "done": false}

...

data: {"text": "", "done": true, "emotion": {...}, "sync_rate": 48.1}
```

---

## TypeScript 型定義

```typescript
// リクエスト
type ChatRequest = {
  message: string;
  session_id?: string;   // セッション識別子
  context?: string;      // 追加コンテキスト
};

// レスポンス
type ChatResponse = {
  text: string;
  emotion: EmotionState;
  sync_rate: number;
  thinking_time_ms: number;
  memory_updated: boolean;
  tools_used: string[];
};

type EmotionState = {
  primary: EmotionType;
  secondary?: EmotionType;
  intensity: number;     // 0.0 〜 1.0
  valence: number;       // -1.0（ネガティブ）〜 +1.0（ポジティブ）
};

type EmotionType =
  | 'joy' | 'sadness' | 'anger'
  | 'fear' | 'surprise' | 'disgust';
```

---

## Function Calling ツール

チャット中に以下のツールが自動使用されます：

| ツール | 説明 |
|--------|------|
| `search_memory` | 過去の記憶を検索 |
| `create_task` | タスクを作成・登録 |
| `get_org_status` | 組織・部署の状態確認 |
| `search_learnings` | 学習内容を検索 |
| `get_personality` | 現在の人格状態取得 |
| `get_current_time` | 現在時刻取得 |
| `web_search` | Web 検索実行 |
| `add_schedule` | スケジュール追加 |
| `list_schedules` | スケジュール一覧 |
| `list_recent_tasks` | 最近のタスク一覧 |
