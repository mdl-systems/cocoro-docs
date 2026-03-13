---
title: cocoro-core 内部構造
sidebar_position: 2
---

# 🔧 cocoro-core 内部構造

cocoro-core は **53 のモジュール**で構成された Personality AI OS のコアエンジンです。
このページでは各モジュール群の役割と連携を解説します。

---

## ディレクトリ別モジュール構成

```
cocoro-core/
├── api/          (7モジュール)   FastAPI エンドポイント群
├── brain/        (8モジュール)   LLM統合・思考・判断
├── personality/  (9モジュール)   人格・感情・成長
├── memory/       (6モジュール)   記憶システム
├── evolution/    (7モジュール)   自己進化
├── governance/   (4モジュール)   倫理・セキュリティ
├── agent/        (6モジュール)   タスク実行
└── infra/        (6モジュール)   DB・Docker・設定
```

---

## api/ — API Gateway（Layer 10）

| モジュール | 役割 |
|-----------|------|
| `server.py` | FastAPI アプリケーション本体 |
| `auth.py` | API Key / JWT 認証 |
| `chat_router.py` | `/chat` / `/chat/stream` エンドポイント |
| `personality_router.py` | `/personality` エンドポイント群 |
| `memory_router.py` | `/memory` エンドポイント群 |
| `agent_router.py` | `/agent` エンドポイント群 |
| `dashboard.py` | Web ダッシュボード（HTML 返却） |

**131 エンドポイント**はこの layer で定義されます。

---

## brain/ — AI Brain（Layer 6）

| モジュール | 役割 |
|-----------|------|
| `llm_client.py` | Gemini / Ollama の統一クライアント |
| `reasoning_engine.py` | 入力の意図解析・推論 |
| `decision_engine.py` | Decision Graph の実装（4ステージ） |
| `planning_engine.py` | 複数ステップタスクの計画立案 |
| `tool_executor.py` | Function Calling ツールの実行管理 |
| `tools/` | 10種のツール実装（search / task / schedule…）|
| `prompt_builder.py` | System Prompt の動的生成 |
| `context_manager.py` | 会話コンテキストの管理 |

### Decision Graph の実装

```python
# decision_engine.py より（概略）
async def process(input: str, session: Session) -> Response:
    # Stage 1: Memory Retrieval
    memories = await memory.search_similar(input, limit=5)

    # Stage 2: Value Scoring
    candidates = await reasoning.generate_candidates(input, memories)
    scored = value_scorer.score(candidates, personality.values)

    # Stage 3: Emotion Modulation
    context = emotion.modulate(scored, personality.emotion_state)

    # Stage 4: Decision → LLM
    prompt = prompt_builder.build(context, memories, personality)
    return await llm_client.generate(prompt)
```

---

## personality/ — 人格エンジン（Layer 4）

| モジュール | 役割 |
|-----------|------|
| `identity.py` | 名前・役割・自己認識の管理 |
| `values.py` | 32次元価値観ベクトルの CRUD |
| `emotion.py` | 6感情の状態管理・更新 |
| `emotion_rules.py` | 感情遷移ルール定義 |
| `growth.py` | シンクロ率・経験値・スキルレベル |
| `clone.py` | 人格バックアップ・リストア |
| `voice.py` | Web Speech API 連携 |
| `compatibility.py` | 人格間互換性計算 |
| `boot_wizard.py` | 初回セットアップウィザード |

---

## memory/ — メモリシステム（Layer 3）

| モジュール | 役割 |
|-----------|------|
| `short_term.py` | Redis による会話コンテキスト管理 |
| `long_term.py` | PostgreSQL への重要記憶の永続化 |
| `vector_store.py` | pgvector による意味検索 |
| `archiver.py` | 夜間メモリ統合（重要度によるフィルタリング）|
| `importance_scorer.py` | 記憶の重要度スコア計算 |
| `retriever.py` | ハイブリッド検索（ベクトル + キーワード）|

---

## governance/ — 倫理・安全（Layer 9）

| モジュール | 役割 |
|-----------|------|
| `ethics_checker.py` | レスポンスの倫理チェック |
| `safety_filter.py` | 有害コンテンツフィルタリング |
| `value_scorer.py` | 価値観に基づく応答評価 |
| `rate_limiter.py` | API レート制限 |

---

## テストカバレッジ

```
tests/
├── test_e2e.py        99 テスト  (E2E・統合テスト)
├── test_emotion.py    28 テスト  (感情システム)
├── test_security.py   19 テスト  (認証・セキュリティ)
├── test_next_gen.py   42 テスト  (C-2〜C-8 高度機能)
├── test_memory.py     18 テスト  (メモリシステム)
├── test_personality.py 12 テスト (人格エンジン)
├── test_brain.py      7 テスト   (推論・判断)
├── test_governance.py  4 テスト  (倫理チェック)
└── test_agent.py       2 テスト  (エージェント)
              ─────────────────────
              合計  231 テスト
```

```bash
# 全テスト実行
docker exec cocoro-core python -m pytest tests/ -v --tb=short

# カバレッジ確認
docker exec cocoro-core python -m pytest tests/ --cov=. --cov-report=term
```
