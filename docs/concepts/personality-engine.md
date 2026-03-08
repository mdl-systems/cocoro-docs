---
title: 人格エンジンの仕組み
sidebar_position: 1
---

# 🎭 人格エンジンの仕組み

---

## 人格を構成する 5 要素

```
Personality Engine
├── 1. Identity（自己認識）
│   └── 名前・役割・歴史・自己理解
│
├── 2. Values（価値観）
│   └── 32 パラメータベクトル
│       例: curiosity=0.85, empathy=0.72 ...
│
├── 3. Emotion × 6（感情）
│   └── 喜び / 悲しみ / 怒り / 恐れ / 驚き / 嫌悪
│       各感情に intensity + valence
│
├── 4. Growth（成長）
│   └── シンクロ率 / 経験値 / スキルレベル
│
└── 5. Memory Link（記憶との紐付け）
    └── 重要な記憶が価値観・感情に影響
```

---

## 価値観ベクトル（32 パラメータ）

人格の「核」となる 32 次元ベクトル。誕生日・血液型・アーカイプから初期値が生成され、
会話・経験を通じて学習・更新されます。

```python
values = {
    # 知的特性
    "curiosity": 0.85,        # 好奇心
    "creativity": 0.91,       # 創造性
    "analytical": 0.78,       # 分析力
    "open_mindedness": 0.82,  # 開放性

    # 対人特性
    "empathy": 0.72,          # 共感力
    "cooperation": 0.68,      # 協調性
    "assertiveness": 0.55,    # 主張性

    # 行動特性
    "reliability": 0.88,      # 信頼性
    "persistence": 0.75,      # 粘り強さ
    "adaptability": 0.80,     # 適応力

    # ... 他 22 パラメータ
}
```

---

## 感情モデル（Plutchik の感情円環）

6 つの基本感情を **intensity（強度）** と **valence（正負）** で管理：

```
喜び (joy)      ← → 悲しみ (sadness)
           ↕
怒り (anger)    ← → 恐れ (fear)
           ↕
驚き (surprise) ← → 嫌悪 (disgust)
```

感情は会話・出来事に応じてリアルタイムで変動し、
返答の **トーン・言葉遣い・積極性** に影響します。

---

## 人格の一貫性保証

```
問い: 「LLM を入れ替えたら人格が変わらないか？」

答え: 変わりません。

なぜなら —
  人格データ（Values + Memories + Emotion State）は
  PostgreSQL に永続保存されており、
  LLM はそのデータを「受け取って文章化する」だけだから。

  LLM: gemini-2.0-flash → gemma3:4b に変更しても
  記憶・価値観・感情状態は 100% 引き継がれる
```
