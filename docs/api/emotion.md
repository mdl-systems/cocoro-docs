---
title: GET /emotion/state
sidebar_position: 3
description: Cocoro OS の感情状態APIリファレンス。6要素感情エンジンの現在状態・履歴・更新の方法を解説。
---

# GET /emotion/state

Cocoro OS の現在の感情状態を取得します。
6 要素の感情エンジン（Plutchik モデルベース）による感情状態を返します。

---

## エンドポイント

```
GET /emotion/state
Authorization: Bearer {COCORO_API_KEY}
```

---

## レスポンス

```json
{
  "emotion": {
    "primary": "joy",
    "secondary": "trust",
    "intensity": 0.72,
    "valence": 0.65,
    "arousal": 0.58
  },
  "components": {
    "joy":      0.72,
    "trust":    0.68,
    "fear":     0.12,
    "surprise": 0.23,
    "sadness":  0.08,
    "anger":    0.05,
    "disgust":  0.03,
    "anticipation": 0.41
  },
  "stability": 0.81,
  "last_trigger": {
    "type": "conversation",
    "message_id": "msg_abc123",
    "timestamp": "2026-03-14T10:28:00Z"
  },
  "timestamp": "2026-03-14T10:30:00Z"
}
```

### レスポンスフィールド詳細

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `emotion.primary` | string | 現在の主要感情（最も強い感情）|
| `emotion.secondary` | string | 第二感情 |
| `emotion.intensity` | float | 主要感情の強度（0.0〜1.0）|
| `emotion.valence` | float | 感情の正負（-1.0=ネガティブ〜1.0=ポジティブ）|
| `emotion.arousal` | float | 覚醒度（0.0=穏やか〜1.0=興奮）|
| `components` | object | 8感情それぞれのスコア（0.0〜1.0）|
| `stability` | float | 感情の安定度（高いほど安定）|
| `last_trigger` | object | 最後に感情を変化させたイベント |

---

## 8 要素感情モデル

Plutchik の感情の輪をベースにした 8 要素モデルです：

| 感情 | 英語 | 高い場合の挙動 |
|------|------|-------------|
| 喜び | `joy` | 積極的・明るい応答トーン |
| 信頼 | `trust` | 開放的・率直な会話 |
| 恐れ | `fear` | 慎重・リスク回避的 |
| 驚き | `surprise` | 詳細な確認・質問が増える |
| 悲しみ | `sadness` | 落ち着いた・共感的なトーン |
| 怒り | `anger` | 直接的・簡潔な応答 |
| 嫌悪 | `disgust` | 婉曲的・距離を置く表現 |
| 期待 | `anticipation` | 先読み・提案が多くなる |

---

## 感情履歴の取得

```
GET /emotion/history?days=7&limit=100
```

```json
{
  "history": [
    {
      "timestamp": "2026-03-14T10:28:00Z",
      "primary": "joy",
      "intensity": 0.72,
      "trigger": "conversaton",
      "sync_rate_at_time": 73.2
    },
    {
      "timestamp": "2026-03-14T08:15:00Z",
      "primary": "anticipation",
      "intensity": 0.58,
      "trigger": "schedule_reminder"
    }
  ],
  "period": "2026-03-07 ~ 2026-03-14",
  "dominant_emotion": "joy",
  "avg_valence": 0.61
}
```

---

## 感情の手動更新

:::note 通常は自動制御
感情は会話・タスク結果・時間経過で自動的に変化します。
手動更新はデバッグや特定のシナリオテスト用途を想定しています。
:::

```
POST /emotion/update
Content-Type: application/json

{
  "components": {
    "joy": 0.8,
    "trust": 0.7
  },
  "reason": "positive_event",
  "persist": false    // false = 一時的な感情変化（自動で収束する）
}
```

---

## 使用例

### 感情に合わせた UI 表示

```typescript
const emotion = await cocoro.emotion.getState();

// 感情に応じてアバターの表情を変える
if (emotion.primary === 'joy' && emotion.intensity > 0.6) {
  avatar.setExpression('happy');
} else if (emotion.primary === 'sadness') {
  avatar.setExpression('sad');
} else {
  avatar.setExpression('neutral');
}

// 感情の色を UI に反映
const color = emotionToColor(emotion.primary);    // "joy" → "#FFD700"
header.setBackgroundColor(color);
```

### 週間感情レポート

```typescript
const history = await cocoro.emotion.getHistory({ days: 7 });

console.log(`今週の主要感情: ${history.dominant_emotion}`);
console.log(`平均ポジティブ度: ${(history.avg_valence * 100).toFixed(1)}%`);
```

---

## 感情と応答の関係

チャット返答に感情が影響する例：

```
同じ質問「今日の調子はどう？」

joy: 0.8 の場合:
  「最高だよ！今日はすごく調子いい。何かやりたいことある？😊」

sadness: 0.6 の場合:
  「まあまあかな。少し疲れてる感じがある。あなたは？」

anticipation: 0.7 の場合:
  「楽しみにしてることがあって、ワクワクしてる！来週の件、進んでる？」
```
