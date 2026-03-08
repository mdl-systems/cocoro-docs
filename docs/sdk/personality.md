---
title: 人格・感情 API
sidebar_position: 4
---

# 🎭 人格・感情 API

---

## 人格エンジン概要

Cocoro OS の人格は **6 つの感情** + **価値観ベクトル** + **成長システム** で構成されています。

```
人格 (Personality)
├── Identity      — 名前・役割・自己認識
├── Values        — 32パラメータの価値観ベクトル
├── Emotion × 6  — 喜び / 悲しみ / 怒り / 恐れ / 驚き / 嫌悪
├── Growth        — シンクロ率・経験値・スキル
└── Memory Link   — 記憶との紐付け
```

---

## 人格取得

```bash
GET /personality
```

```json
{
  "name": "Cocoro",
  "age_days": 42,
  "sync_rate": 52.3,
  "personality_type": "INTJ",
  "values": {
    "curiosity": 0.85,
    "empathy": 0.72,
    "creativity": 0.91,
    "reliability": 0.88
  },
  "current_emotion": {
    "primary": "joy",
    "intensity": 0.6
  },
  "growth_level": 3,
  "total_interactions": 1247
}
```

---

## 感情状態取得

```bash
GET /personality/emotion
```

```json
{
  "joy": 0.65,
  "sadness": 0.10,
  "anger": 0.05,
  "fear": 0.08,
  "surprise": 0.20,
  "disgust": 0.03,
  "dominant": "joy",
  "valence": 0.72,
  "arousal": 0.58,
  "updated_at": "2026-03-08T12:00:00Z"
}
```

---

## シンクロ率

**シンクロ率** は、AI がどれだけ「自分らしさ」を確立できているかを示す指標（0〜100%）です。

| 段階 | シンクロ率 | 状態 |
|------|----------|------|
| 初期化 | 0〜10% | 人格形成中 |
| 学習中 | 10〜50% | 基本パターンを学習 |
| 確立 | 50〜75% | 個性が安定 |
| 成熟 | 75〜92% | 深い自己理解 |
| 上限 | 92%〜 | **Divergence Ceiling**（学習停止）|

:::caution Divergence Ceiling
シンクロ率が 92% を超えると自動的に学習が停止します。
これは人格の「固定化」を防ぐための安全機構です。
:::

---

## TypeScript 型定義

```typescript
type PersonalityResponse = {
  name: string;
  age_days: number;
  sync_rate: number;
  personality_type: string;
  values: Record<string, number>;
  current_emotion: EmotionState;
  growth_level: number;
  total_interactions: number;
};
```
