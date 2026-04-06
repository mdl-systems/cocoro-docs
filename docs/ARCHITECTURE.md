# ARCHITECTURE — Cocoro OS / mdl-systems

> **最終更新**: 2026-04-06 | **対象環境**: Production (LAN 192.168.50.0/24)
>
> このドキュメントは mdl-systems 全インフラのシステム構成を正確に記述します。
> ポート・IP・モデル名はすべて実態と一致していること。未確定事項は `[TODO]` で明示。

---

## 1. システム全体構成図

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                       COCORO OS — FULL SYSTEM MAP (2026-04)                    ║
╚══════════════════════════════════════════════════════════════════════════════════╝

 ┌───────────────────────────────────────────────────────────────────────────────┐
 │  クライアント層                                                                │
 │                                                                               │
 │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────┐  │
 │  │  AntGravity    │  │  VS Code       │  │ cocoro-console │  │  curl/API  │  │
 │  │  (AI Agent)    │  │  (開発環境)    │  │  Next.js :3000 │  │  直接呼び出し│  │
 │  │  mdl :167      │  │  mdl :167      │  │  miniPC A :92  │  │            │  │
 │  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘  └─────┬──────┘  │
 └──────────┼───────────────────┼───────────────────┼─────────────────┼─────────┘
            │                   │                   │                 │
            └─────────┬─────────┘                   │                 │
                      │ HTTP / HTTPS / SSE / JWT     │                 │
                      │                             │                 │
 ┌────────────────────▼─────────────────────────────▼─────────────────▼─────────┐
 │  miniPC A (192.168.50.92) — cocoro-core / cocoro-console                     │
 │                                                                               │
 │  ┌──────────────────────────────────────────────────────────────────────┐    │
 │  │                 cocoro-core  FastAPI  :8001                          │    │
 │  │                53 modules / 131 endpoints / 231 tests                │    │
 │  │                                                                      │    │
 │  │   Decision Graph Pipeline (順序変更不可):                             │    │
 │  │   [Memory] → [Value Scoring] → [Emotion修飾] → [Decision/Prompt]    │    │
 │  │                                                                      │    │
 │  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │    │
 │  │   │  PostgreSQL  │  │    Redis     │  │   pgvector               │  │    │
 │  │   │    :5432     │  │    :6379     │  │  (Long-Term Vector DB)   │  │    │
 │  │   │  長期記憶・   │  │  短期記憶    │  │  類似エピソード検索       │  │    │
 │  │   │  人格データ   │  │  TTL 24h    │  │  (cosine similarity)     │  │    │
 │  │   └──────────────┘  └──────────────┘  └──────────────────────────┘  │    │
 │  └─────────────────────────────┬────────────────────────────────────────┘    │
 │                                 │ LLM推論リクエスト (gpt-4o / gpt-4o-mini)   │
 └─────────────────────────────────┼─────────────────────────────────────────────┘
                                   │
 ┌─────────────────────────────────▼─────────────────────────────────────────────┐
 │  cocoro-llm-server (192.168.50.112)  ※ 新規構築中                             │
 │                                                                               │
 │  ┌──────────────────────────────────────────────────────────────────────┐    │
 │  │         LiteLLM Gateway  :8000  (OpenAI互換 API)                    │    │
 │  │         モデルエイリアス / ルーティング / フォールバック判定           │    │
 │  └─────────────────────┬──────────────────────┬────────────────────┘    │    │
 │                         │                      │                          │    │
 │   ┌─────────────────────▼──────┐  ┌────────────▼──────────────────┐     │    │
 │   │  vLLM Primary       :8080  │  │  vLLM Secondary       :8081   │     │    │
 │   │  Llama 4 Scout 109B        │  │  Qwen 3.5 32B Q5_K_M          │     │    │
 │   │  Q4_K_M                    │  │                               │     │    │
 │   │  alias: gpt-4o             │  │  alias: gpt-4o-mini            │     │    │
 │   └────────────────────────────┘  └───────────────────────────────┘     │    │
 │                                                                          │    │
 │   ┌───────────────────────────────────────────────────────────────────┐  │    │
 │   │  Prometheus  :9090  /  Grafana  :3030  (監視・ダッシュボード)     │  │    │
 │   └───────────────────────────────────────────────────────────────────┘  │    │
 │                                                                          │    │
 │   ┌───────────────────────────────────────────────────────────────────┐  │    │
 │   │  NVIDIA RTX PRO 6000 Blackwell  VRAM 96GB                        │  │    │
 │   └───────────────────────────────────────────────────────────────────┘  │    │
 └──────────────────────────────────────────────────────────────────────────┘    │
                                   │
                    フォールバック  │  (LLMサーバー全体障害時)
                                   ▼
                   ┌────────────────────────────────────┐
                   │  Gemini 2.5 Flash  (クラウド)      │
                   │  alias: claude-sonnet              │
                   │  Google API (外部・HTTPS)          │
                   └────────────────────────────────────┘

 ┌───────────────────────────────────────────────────────────────────────────────┐
 │  miniPC B (192.168.50.86) — cocoro-agent                                     │
 │                                                                               │
 │  ┌──────────────────────────────────────────────────────────────────────┐    │
 │  │  cocoro-agent  (エージェント実装・行動ループ拡張)  [TODO: port]       │    │
 │  │  cocoro-core :8001 へ HTTP接続 → LiteLLM :8000 経由でLLM利用        │    │
 │  └──────────────────────────────────────────────────────────────────────┘    │
 └───────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. リクエストフロー詳細

### 2-A. 通常チャットリクエスト（cocoro-console → LLM）

```
ユーザー入力 (cocoro-console UI)
  │
  ▼
POST /api/chat/stream  (Next.js API Route, SSE)
  │
  ▼
cocoro-core  :8001/auth/token  ← JWT取得（1時間キャッシュ）
  │
  ▼
cocoro-core  :8001/chat
  │
  ├─[1] Memory照合
  │       Redis (短期記憶 < 24h)
  │       PostgreSQL + pgvector (長期記憶・類似検索)
  │
  ├─[2] Value Scoring
  │       価値観ベクトル32次元との整合性チェック
  │
  ├─[3] Emotion修飾
  │       Emotion×6 (Joy/Sadness/Anger/Fear/Surprise/Disgust)
  │
  ├─[4] Decision Graph
  │       System Promptを人格フィルタ後に構築
  │
  ▼
POST http://192.168.50.112:8000/v1/chat/completions  (LiteLLM)
  │
  ├─[Primary]   model="gpt-4o"       → vLLM :8080  → Llama 4 Scout 109B Q4_K_M
  ├─[Secondary] model="gpt-4o-mini"  → vLLM :8081  → Qwen 3.5 32B Q5_K_M
  └─[Fallback]  model="claude-sonnet" → Gemini 2.5 Flash (クラウド)
  │
  ▼
SSE ストリーミング (word-by-word) → ブラウザ
  │
  ▼
Memory保存
  Redis      (短期: TTL 24h)
  PostgreSQL (長期・永続)
  pgvector   (ベクトルインデックス更新)
```

### 2-B. LiteLLM モデルルーティング詳細

| リクエストモデル名 | ルーティング先 | 実モデル | 用途 |
|-----------------|-------------|---------|------|
| `gpt-4o` | vLLM Primary :8080 | Llama 4 Scout 109B Q4_K_M | 複雑なリクエスト・長文推論 |
| `gpt-4o-mini` | vLLM Secondary :8081 | Qwen 3.5 32B Q5_K_M | 短文・日本語・高速応答 |
| `claude-sonnet` | Gemini API (クラウド) | Gemini 2.5 Flash | 障害時フォールバック |

> **設計意図**: OpenAIクライアント互換のモデル名エイリアスを使用することで、cocoro-coreのコード変更なしにバックエンドLLMを切り替え可能。

### 2-C. フォールバック判定ロジック（LiteLLM）

```
リクエスト受信 (:8000)
  │
  ├─ vLLM Primary (:8080) にルーティング
  │     │ 失敗/タイムアウト (5s)
  │     ▼
  ├─ vLLM Secondary (:8081) にフォールバック
  │     │ 失敗/タイムアウト (5s)
  │     ▼
  └─ Gemini 2.5 Flash にフォールバック
        │ 失敗
        ▼
      503 Service Unavailable
```

### 2-D. エージェントタスク実行フロー（cocoro-agent）

```
cocoro-agent (192.168.50.86)
  │
  ├─ GET http://192.168.50.92:8001/agent/tasks   ← タスクキュー取得
  │
  ├─ POST http://192.168.50.112:8000/v1/chat/completions
  │        LiteLLM経由でLLM推論
  │
  ├─ Function Calling (Tools×10)
  │       search_memory / create_task / get_org_status
  │       search_learnings / get_personality / get_current_time
  │       web_search / add_schedule / list_schedules / list_recent_tasks
  │
  └─ POST http://192.168.50.92:8001/agent/complete   ← 結果返送
```

---

## 3. VRAM配分図（96GB 内訳）

NVIDIA RTX PRO 6000 Blackwell — VRAM 96GB

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  VRAM 96GB 配分                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ██████████████████████████████████████████████  55GB                       │
│  Llama 4 Scout 109B Q4_K_M                                                  │
│  vLLM Primary  :8080   (alias: gpt-4o)                                      │
│  モデルウェイト: 109B × 4.5bit/8 ≈ 61.3GB → テンソル並列化で55GBに圧縮       │
│                                                                              │
│  ─────────────────────────────────────────────────                          │
│                                                                              │
│  ██████████████████  22GB                                                   │
│  Qwen 3.5 32B Q5_K_M                                                        │
│  vLLM Secondary  :8081   (alias: gpt-4o-mini)                               │
│  モデルウェイト: 32B × 5.5bit/8 ≈ 22.0GB                                    │
│                                                                              │
│  ─────────────────────────────────────────────────                          │
│                                                                              │
│  ██████████  10GB                                                            │
│  KVキャッシュプール                                                           │
│  (両モデル共有 / GPU_MEMORY_UTILIZATION=0.90 で制御)                         │
│                                                                              │
│  ─────────────────────────────────────────────────                          │
│                                                                              │
│  █████████  9GB                                                              │
│  予備 / システム / オーバーフローバッファ                                     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

 合計: 55 + 22 + 10 + 9 = 96GB

 モデル計算根拠:
   Q4_K_M: 約 4.5 bits/param  → 109,000M × 4.5 / 8 / 1024 ≈ 61.3 GB (テンソル並列で削減)
   Q5_K_M: 約 5.5 bits/param  →  32,000M × 5.5 / 8 / 1024 ≈ 22.0 GB

 注意事項:
   - 実際の使用量はシーケンス長・バッチサイズにより変動
   - vLLMのKVキャッシュはGPU_MEMORY_UTILIZATION=0.90 で制御
   - 両モデル同時ロードでVRAMが逼迫する場合はQwenをCPUオフロード検討 [TODO]
```

---

## 4. 社内ネットワーク構成（IPアドレス対応表）

### ホスト一覧

| ホスト名 | IPアドレス | ハードウェア | OS | 役割 |
|---------|-----------|------------|-----|------|
| `cocoro-llm-server` | 192.168.50.112 | NVIDIA RTX PRO 6000 Blackwell (96GB VRAM) / 高性能CPU | Debian 13 | LLM推論専用サーバー ※新規構築中 |
| `miniPC-A` | 192.168.50.92 | Intel N95 / 16GB RAM / 512GB SSD NVMe | Debian 13 | cocoro-core / cocoro-console |
| `miniPC-B` | 192.168.50.86 | Intel N95 / 16GB RAM / 512GB SSD NVMe | Debian 13 | cocoro-agent |
| `mdl`（開発機） | 192.168.50.167 | 開発用ワークステーション | Linux | AntGravity / 開発環境 |

### ポートマップ

| ホスト | IPアドレス | ポート | サービス | 状態 |
|--------|-----------|--------|---------|------|
| cocoro-llm-server | 192.168.50.112 | :8000 | LiteLLM Gateway (OpenAI互換) | 構築中 |
| cocoro-llm-server | 192.168.50.112 | :8080 | vLLM Primary — Llama 4 Scout 109B Q4_K_M | 構築中 |
| cocoro-llm-server | 192.168.50.112 | :8081 | vLLM Secondary — Qwen 3.5 32B Q5_K_M | 構築中 |
| cocoro-llm-server | 192.168.50.112 | :9090 | Prometheus (メトリクス収集) | 構築中 |
| cocoro-llm-server | 192.168.50.112 | :3030 | Grafana (ダッシュボード) | 構築中 |
| miniPC-A | 192.168.50.92 | :8001 | cocoro-core (FastAPI) | 稼働中 |
| miniPC-A | 192.168.50.92 | :3000 | cocoro-console (Next.js) | 稼働中 |
| miniPC-A | 192.168.50.92 | :5432 | PostgreSQL + pgvector | 稼働中 |
| miniPC-A | 192.168.50.92 | :6379 | Redis | 稼働中 |
| miniPC-B | 192.168.50.86 | :8010 | cocoro-agent | [TODO] |

### ネットワーク構成図

```
  インターネット (外部)
        │
    ルーター (192.168.50.1)
        │
        │  192.168.50.0/24  (LAN)
  ──────┼──────────────────────────────────────────────────────────
        │          │                   │                │
        │          │                   │                │
        ▼          ▼                   ▼                ▼
      .112        .92                .86              .167
  cocoro-        miniPC A          miniPC B          mdl
  llm-server     cocoro-core :8001  cocoro-agent     AntGravity
                 cocoro-console     [TODO :8010]     開発環境
  LiteLLM :8000  :3000
  vLLM :8080     PostgreSQL :5432
  vLLM :8081     Redis :6379
  Prometheus :9090
  Grafana :3030
```

### 外部通信

| 接続先 | プロトコル | 用途 | 発信元 |
|--------|-----------|------|--------|
| `generativelanguage.googleapis.com` | HTTPS | Gemini 2.5 Flash (フォールバック) | cocoro-llm-server |
| `huggingface.co` / `hf.co` | HTTPS | モデルダウンロード | cocoro-llm-server |
| `pypi.org` | HTTPS | Pythonパッケージ | 全ホスト |
| `registry.npmjs.org` | HTTPS | npmパッケージ | miniPC-A / mdl |

---

## 5. 各Repo役割一覧（14 repo）

### 開発済み（5 repo）

| Repo | ホスト | ポート | 役割 | 言語 |
|------|--------|--------|------|------|
| `cocoro-core` | miniPC A (192.168.50.92) | :8001 | Personality AI OSコアエンジン。Memory/Values/Emotion/Decision Graphで人格の一貫性を保証。53モジュール / 131エンドポイント / 231テスト | Python 3.11 |
| `cocoro-console` | miniPC A (192.168.50.92) | :3000 | LAN内専用管理UI。SSEストリーミングチャット・メモリブラウザ・エージェント管理・ノード監視 | Next.js 16 / TypeScript |
| `cocoro-website` | クラウド | :3000 | インターネット公開SNS×AIプラットフォーム。ソーシャルフィード・コミュニティ・チャット | Next.js 16 / TypeScript |
| `cocoro-installer` | — (USB) | — | 工場キッティング用Debian 13自動インストールUSB。ゼロタッチOSセットアップ + cocoro-coreデプロイ | Shell |
| `cocoro-docs` | GitHub Pages | :443 | 公式ドキュメントサイト (Docusaurus 3)。全repo統合ドキュメント管理 | TypeScript / MDX |

### 開発中（1 repo）

| Repo | ホスト | ポート | 役割 | 言語 |
|------|--------|--------|------|------|
| `cocoro-agent` | miniPC B (192.168.50.86) | :8010 [TODO] | エージェント実装・行動ループ拡張。cocoro-coreのタスクルーターと連携 | Python [TODO] |

### 未開発（将来実装予定）（8 repo）

| Repo | 想定役割 | 優先度 |
|------|---------|--------|
| `cocoro-sdk` | 外部開発者向けSDK（cocoro-core APIラッパー） | P2 |
| `cocoro-cli` | コマンドラインインターフェース | P3 |
| `cocoro-apps` | cocoro上で動くアプリケーション群 | P3 |
| `cocoro-models` | AIモデル定義・管理 | P2 |
| `cocoro-network` | ノード間ネットワーク通信プロトコル | P2 |
| `cocoro-node` | ノード管理・クラスタ通信 | P2 |
| `cocoro-cloud` | クラウド連携・リモート同期 | P3 |
| `cocoro-examples` | サンプルコード・チュートリアル | P3 |

---

## 補足：Decision Graph パイプライン（必守）

```
入力メッセージ
  │
  ▼
[1] Memory照合
   ├─ Redis: 短期記憶 (TTL 24h)
   ├─ PostgreSQL: 長期記憶 (永続)
   └─ pgvector: 類似エピソード検索 (cosine similarity)
  │
  ▼
[2] Value Scoring
   └─ 価値観ベクトル32次元との整合スコア算出
  │
  ▼
[3] Emotion修飾
   └─ Joy / Sadness / Anger / Fear / Surprise / Disgust
  │
  ▼
[4] Decision
   └─ System Prompt構築 → LiteLLM :8000 → vLLM / Gemini

⚠ この順序は変更不可。順序を変えると人格の一貫性が崩壊する。
⚠ シンクロ率 92% 超え（Divergence Ceiling）で学習停止。
```

---

## 更新履歴

| 日付 | 更新内容 |
|------|---------|
| 2026-04-06 | 初版作成。ローカルLLMスタック（Llama 4 Scout / Qwen 3.5 / LiteLLM）を反映。VRAM配分・LiteLLMエイリアス・開発機mdl追加 |

---

*このドキュメントはインフラ実態の変化に追随して更新すること。未確定事項は `[TODO]` で明示し、「完了」と書かない。*
