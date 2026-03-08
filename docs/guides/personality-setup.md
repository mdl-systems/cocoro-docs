---
title: 人格セットアップ
sidebar_position: 2
---

# 🎭 人格セットアップ

---

## 初回起動時の人格初期化

cocoro-core を初めて起動すると、デフォルトの人格が自動生成されます。

```bash
curl http://localhost:8001/personality
```

```json
{
  "name": "Cocoro",
  "sync_rate": 0.0,
  "status": "initializing"
}
```

---

## 人格パラメータのカスタマイズ

```bash
PUT /personality/configure
Content-Type: application/json

{
  "name": "Aria",
  "base_personality": "curious_empathetic",
  "values": {
    "curiosity": 0.9,
    "empathy": 0.8,
    "creativity": 0.85,
    "reliability": 0.75
  },
  "communication_style": "friendly_casual"
}
```

---

## シンクロ率を上げる方法

シンクロ率は**会話・学習・経験**を通じて自動的に上昇します。

| 行動 | シンクロ率上昇 |
|------|-------------|
| 日常会話 | +0.1〜0.3% / 回 |
| 重要な出来事の共有 | +0.5〜1.0% / 回 |
| 価値観に関する対話 | +0.5〜2.0% / 回 |
| タスク完了 | +0.1〜0.5% / 回 |

---

## 人格のバックアップ・リストア

```bash
# バックアップ
curl http://localhost:8001/personality/export > cocoro_personality_backup.json

# リストア
curl -X POST http://localhost:8001/personality/import \
  -H "Content-Type: application/json" \
  -d @cocoro_personality_backup.json
```

---

## cocoro-console からの設定

cocoro-console の **メモリブラウザ** から GUI で人格パラメータを確認・編集できます：

1. `http://localhost:3000` にアクセス
2. サイドバー → **「メモリ」**
3. 「人格」タブを選択
4. パラメータを編集して保存
