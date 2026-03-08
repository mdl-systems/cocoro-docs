---
title: Decision Graph の仕組み
sidebar_position: 3
---

# 🔀 Decision Graph の仕組み

---

## Decision Graph とは

**Decision Graph** は、Cocoro OS における「思考・判断」の根幹となるパイプラインです。
人間の意思決定プロセスを模倣し、4 段階のフィルタリングを経て最終的な返答を生成します。

---

## 4 段階パイプライン

```
│ 入力メッセージ
▼
┌─────────────────────────────────┐
│ Stage 1: Memory Retrieval       │
│ 過去の記憶から関連情報を検索     │
│ pgvector でベクトル類似検索       │
└──────────────────┬──────────────┘
                   │ 関連記憶 × N件
                   ▼
┌─────────────────────────────────┐
│ Stage 2: Value Scoring          │
│ 候補応答を価値観ベクトルで評価   │
│ 価値観に反する応答は除外される   │
└──────────────────┬──────────────┘
                   │ 価値観スコア
                   ▼
┌─────────────────────────────────┐
│ Stage 3: Emotion Modulation     │
│ 現在の感情状態で応答を修飾       │
│ 喜び → 明るく / 悲しみ → 慎重に │
└──────────────────┬──────────────┘
                   │ 感情修飾済みコンテキスト
                   ▼
┌─────────────────────────────────┐
│ Stage 4: Decision               │
│ 最終的な応答戦略を決定           │
│ LLM への指示（System Prompt）生成│
└──────────────────┬──────────────┘
                   │ System Prompt
                   ▼
              LLM（Gemini / Ollama）
                   │ 生成された文章
                   ▼
                出力
```

---

## Stage 1: Memory Retrieval の詳細

```python
# 入力テキストをベクトル化
query_vector = embed(input_message)

# pgvector で類似記憶を検索
memories = db.search_similar(
    vector=query_vector,
    threshold=0.7,
    limit=5
)

# キーワード検索も併用
keyword_memories = db.keyword_search(input_message, limit=3)
```

---

## Stage 2: Value Scoring の詳細

```python
# 候補応答を 32 次元価値観ベクトルで評価
def score_response(response: str, values: dict) -> float:
    score = 0.0

    # 誠実さチェック
    if contains_deception(response):
        score -= values["reliability"] * 2.0

    # 共感性チェック
    if is_dismissive(response):
        score -= values["empathy"] * 1.5

    # 好奇心チェック（学習的な応答を優先）
    if is_informative(response):
        score += values["curiosity"] * 1.0

    return score
```

---

## Stage 3: Emotion Modulation の詳細

| 感情 | 応答への影響 |
|------|------------|
| 高い喜び（joy > 0.7） | より積極的・明るいトーン |
| 高い悲しみ（sadness > 0.5） | 慎重・落ち着いたトーン |
| 高い怒り（anger > 0.5） | 直接的・簡潔な応答 |
| 高い驚き（surprise > 0.6） | より詳細な確認・質問 |

---

## パイプライン順序の重要性

:::danger 順序変更禁止
Memory → Value → Emotion → Decision の順序は変更できません。

**理由:**
- Memory なしで Value Scoring するとコンテキストが欠落
- Emotion を先に適用すると価値観チェックをバイパスできてしまう
- Decision は必ず最後（全情報を統合してから判断）
:::
