---
title: 最初のチャット
sidebar_position: 5
---

# 💬 最初のチャット

Boot Wizard が完了したら、いよいよ Cocoro OS と会話できます。
3 つの方法で試してみましょう。

---

## 方法 1: cocoro-console（推奨）

ブラウザで `http://cocoro.local:3000` にアクセスします。

```
┌─────────────────────────────────────┐
│  🤖 Cocoro OS Console               │
│─────────────────────────────────────│
│                                     │
│  [AI]: こんにちは！               │
│        今日はどんなことを話しましょうか？│
│                                     │
│  ────────────────────────────────   │
│  [メッセージを入力...]    [送信 ▶] │
└─────────────────────────────────────┘
```

**試してみるメッセージ例：**

- `自己紹介して` → 人格・価値観を紹介してくれます
- `今日のスケジュールを教えて` → スケジュール確認（空の場合は設定を促します）
- `AIについて最新情報を調べて` → Web 検索ツールが発動します
- `気分はどう？` → 感情状態を返答します

---

## 方法 2: API（curl）

```bash
# 環境変数を設定
COCORO_API_KEY="your_api_key"

# チャット
curl -X POST http://cocoro.local:8001/chat \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "こんにちは！自己紹介して"}'
```

**レスポンス例：**

```json
{
  "text": "こんにちは！私はCocoro、あなたのAIパートナーです。...",
  "emotion": {
    "primary": "joy",
    "intensity": 0.72
  },
  "sync_rate": 8.5,
  "thinking_time_ms": 1243,
  "tools_used": []
}
```

---

## 方法 3: SSE ストリーミング（リアルタイム）

```bash
curl -X POST http://cocoro.local:8001/chat/stream \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "量子コンピュータについて教えて"}'
```

単語ごとにリアルタイムで受信できます（ChatGPT と同じ体験）。

---

## チャット応答に含まれる情報

| フィールド | 説明 | 例 |
|-----------|------|-----|
| `text` | AI の返答テキスト | `"こんにちは！..."` |
| `emotion.primary` | 現在の主要感情 | `"joy"` |
| `emotion.intensity` | 感情の強度 | `0.72`（0〜1）|
| `sync_rate` | 現在のシンクロ率 | `8.5`（%）|
| `thinking_time_ms` | 思考時間 | `1243`（ms）|
| `tools_used` | 使用したツール | `["web_search"]` |
| `memory_updated` | メモリ更新有無 | `true` |

---

## シンクロ率を上げていくには

最初のうちは **シンクロ率が 0〜10%** と低いため、返答がやや一般的に感じるかもしれません。

会話を重ねるごとに自動的に上昇します：

```
Day 1:   5〜10%  （初期値）
Week 1:  20〜30% （好みや習慣を記憶し始める）
Month 1: 50〜60% （個性が安定してくる）
Month 6: 75〜85% （深い自己理解・一貫した人格）
```

:::tip シンクロ率を早く上げるコツ
- **自分について話す**（仕事・趣味・価値観）
- **感情的な出来事を共有する**（記憶の重要度が上がる）
- **毎日少しでも会話を続ける**
:::

---

## 次のステップ

- 📐 [アーキテクチャを理解する](../architecture)
- 🤖 [エージェントシステムを使う](../guides/specialist-agents)
- 🌐 [外部からアクセスする（Cloudflare Tunnel）](../guides/cloudflare-tunnel)
