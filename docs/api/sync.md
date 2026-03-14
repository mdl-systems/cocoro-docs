---
title: GET /sync/rate
sidebar_position: 4
description: シンクロ率APIリファレンス。現在のシンクロ率・推移・Divergence Ceiling状態の取得方法。
---

# GET /sync/rate

現在のシンクロ率（Synchronization Rate）を取得します。

---

## エンドポイント

```
GET /sync/rate
Authorization: Bearer {COCORO_API_KEY}
```

---

## レスポンス

```json
{
  "sync_rate": 73.2,
  "trend": "+0.3",
  "trend_period": "7days",
  "level": "深化期",
  "level_en": "deepening",
  "days_since_start": 48,
  "ceiling": {
    "threshold": 92.0,
    "active": false,
    "remaining": 18.8
  },
  "components": {
    "memory_similarity": 0.78,
    "value_alignment": 0.71,
    "behavior_prediction": 0.69,
    "emotion_resonance": 0.62,
    "language_adaptation": 0.85
  },
  "last_updated": "2026-03-14T10:30:00Z"
}
```

### レスポンスフィールド詳細

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `sync_rate` | float | 現在のシンクロ率（%、0〜92）|
| `trend` | string | 過去7日間の変化量（例: `"+0.3"`, `"-0.1"`）|
| `level` | string | 現在のレベル（日本語）|
| `days_since_start` | integer | Boot Wizard 完了からの日数 |
| `ceiling.threshold` | float | Divergence Ceiling 閾値（デフォルト: 92.0）|
| `ceiling.active` | boolean | Ceiling が発動中かどうか |
| `ceiling.remaining` | float | Ceiling までの残り余裕（%）|
| `components` | object | シンクロ率を構成する5要素それぞれのスコア |

---

## シンクロ率レベル一覧

| レベル | 範囲（%）| 英語 | 解説 |
|--------|---------|------|------|
| 初期段階 | 0〜10 | `initial` | Boot Wizard 完了直後 |
| 認識期 | 10〜30 | `recognition` | 好み・習慣の学習開始 |
| 定着期 | 30〜60 | `establishment` | 個性が安定し始める |
| 深化期 | 60〜80 | `deepening` | 先読み・提案の精度向上 |
| 成熟期 | 80〜92 | `maturity` | 深い相互理解 |
| Ceiling | 92+ | `ceiling` | 学習停止（安全装置）|

---

## シンクロ率履歴の取得

```
GET /sync/history?days=30
```

```json
{
  "history": [
    { "date": "2026-02-25", "rate": 15.3, "change": +2.1 },
    { "date": "2026-03-04", "rate": 34.7, "change": +3.4 },
    { "date": "2026-03-11", "rate": 58.9, "change": +2.8 },
    { "date": "2026-03-14", "rate": 73.2, "change": +0.3 }
  ],
  "period_start": "2026-02-13",
  "period_end": "2026-03-14",
  "total_change": +67.4,
  "avg_daily_change": 1.4
}
```

---

## Divergence Ceiling 状態の確認

```
GET /sync/ceiling
```

```json
{
  "ceiling_active": false,
  "current_rate": 73.2,
  "ceiling_threshold": 92.0,
  "remaining_until_ceiling": 18.8,
  "estimated_days_to_ceiling": 13,
  "protection_mode": "enabled",
  "description": "Divergence Ceiling は未発動です。AIは引き続き学習中です。"
}
```

---

## シンクロ率のリセット

```
POST /sync/reset
Content-Type: application/json

{
  "confirm": true,
  "keep_memories": true
}
```

```json
{
  "status": "success",
  "previous_rate": 73.2,
  "new_rate": 0.0,
  "memories_preserved": true,
  "message": "シンクロ率をリセットしました。記憶は保持されています。"
}
```

---

## 使用例

```typescript
import { CocoroClient } from 'cocoro-sdk';

const cocoro = new CocoroClient({
  baseUrl: 'http://cocoro.local:8001',
  apiKey: process.env.COCORO_API_KEY,
});

// 現在のシンクロ率を取得
const sync = await cocoro.sync.getRate();
console.log(`シンクロ率: ${sync.sync_rate}%`);
console.log(`レベル: ${sync.level}`);

// Ceiling に近づいたら警告
if (sync.ceiling.remaining < 5) {
  console.warn('⚠️ Divergence Ceiling まで残り', sync.ceiling.remaining, '%');
}

// 30日の推移をグラフ用に取得
const history = await cocoro.sync.getHistory({ days: 30 });
const chartData = history.history.map(h => ({
  x: h.date,
  y: h.rate,
}));
```
