---
title: Personality API
sidebar_position: 3
---

# 🎭 Personality API リファレンス

---

## GET /personality

現在の人格状態を取得します。

```bash
curl http://cocoro.local:8001/personality \
  -H "Authorization: Bearer $COCORO_API_KEY"
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
    "reliability": 0.88,
    "assertiveness": 0.55
  },
  "current_emotion": {
    "primary": "joy",
    "intensity": 0.65,
    "valence": 0.72
  },
  "growth_level": 3,
  "total_interactions": 1247,
  "divergence_ceiling_reached": false
}
```

---

## PUT /personality/configure

人格パラメータを更新します。

```bash
curl -X PUT http://cocoro.local:8001/personality/configure \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aria",
    "base_personality": "curious_empathetic",
    "values": {
      "curiosity": 0.9,
      "empathy": 0.8
    },
    "communication_style": "friendly_casual"
  }'
```

### base_personality の選択肢

| 値 | 説明 |
|----|------|
| `curious_empathetic` | 好奇心 + 共感重視 |
| `logical_analytical` | 論理 + 分析重視 |
| `creative_expressive` | 創造性 + 表現重視 |
| `reliable_supportive` | 信頼性 + サポート重視 |

---

## GET /personality/emotion

現在の感情状態を取得します。

```bash
curl http://cocoro.local:8001/personality/emotion \
  -H "Authorization: Bearer $COCORO_API_KEY"
```

```json
{
  "joy": 0.65,
  "sadness": 0.08,
  "anger": 0.03,
  "fear": 0.05,
  "surprise": 0.15,
  "disgust": 0.04,
  "dominant": "joy",
  "valence": 0.72,
  "arousal": 0.58,
  "updated_at": "2026-03-13T11:00:00Z"
}
```

---

## GET /personality/growth-log

シンクロ率の推移ログを取得します。

```bash
curl "http://cocoro.local:8001/personality/growth-log?days=30" \
  -H "Authorization: Bearer $COCORO_API_KEY"
```

```json
{
  "current_sync_rate": 52.3,
  "growth_history": [
    {"date": "2026-02-10", "sync_rate": 5.2, "interactions": 12},
    {"date": "2026-02-17", "sync_rate": 18.5, "interactions": 87},
    {"date": "2026-02-24", "sync_rate": 35.1, "interactions": 243}
  ],
  "total_xp": 12450,
  "growth_level": 3,
  "divergence_ceiling": 92.0
}
```

---

## POST /personality/export

人格データをエクスポートします（バックアップ用）。

```bash
curl -X POST http://cocoro.local:8001/personality/export \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -o cocoro_backup_$(date +%Y%m%d).json
```

---

## POST /personality/import

人格データをインポートします（リストア用）。

```bash
curl -X POST http://cocoro.local:8001/personality/import \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -H "Content-Type: application/json" \
  -d @cocoro_backup_20260313.json
```

:::caution データ上書き注意
インポートは現在の人格データを完全に上書きします。
事前に export してバックアップを取ってください。
:::
