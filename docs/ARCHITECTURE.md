# ARCHITECTURE — Cocoro OS / mdl-systems

> **最終更新**: 2026-04-06 | **対象環境**: Production (LAN 192.168.50.0/24)
>
> このドキュメントは mdl-systems 全インフラのシステム構成を正確に記述します。
> ポート・IP・モデル名はすべて実態と一致していること。未確定事項は `[TODO]` で明示。

---

## 1. システム全体構成図

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                         COCORO OS — FULL SYSTEM MAP                        ║
╚══════════════════════════════════════════════════════════════════════════════╝

 ┌─────────────────────────────────────────────────────────────────────────┐
 │  クライアント層                                                           │
 │                                                                         │
 │  ┌──────────────────┐      ┌──────────────────┐     ┌──────────────┐   │
 │  │  cocoro-console  │      │  cocoro-website   │     │  直接API     │   │
 │  │  Next.js :3000   │      │  Next.js :3000    │     │  呼び出し    │   │
 │  │  (LAN内専用)     │      │  (インターネット)  │     │  (curl等)   │   │
 │  └────────┬─────────┘      └────────┬──────────┘     └──────┬───────┘   │
 └───────────┼────────────────────────┼───────────────────────┼───────────┘
             │ HTTP/SSE/JWT           │ HTTPS                  │ HTTP
             │                        │                        │
 ┌───────────▼────────────────────────▼────────────────────────▼───────────┐
 │  miniPC A (192.168.50.92) — cocoro-core / cocoro-console               │
 │                                                                         │
 │  ┌─────────────────────────────────────────────────────────────┐       │
 │  │           cocoro-core  FastAPI :8001                        │       │
 │  │                                                             │       │
 │  │   Layer 4: Personality (Values×32 + Emotion×6)              │       │
 │  │      ↓  Memory → Value → Emotion → Decision  ↓             │       │
 │  │   Layer 6: AI Brain (Reasoning + Tools×10)                  │       │
 │  │                                                             │       │
 │  │   ┌─────────────┐   ┌─────────────┐   ┌─────────────────┐ │       │
 │  │   │ PostgreSQL  │   │    Redis    │   │    pgvector     │ │       │
 │  │   │   :5432     │   │    :6379    │   │  (Long-Term     │ │       │
 │  │   │ (人格・永続) │   │ (短期・手続)│   │   Vector DB)    │ │       │
 │  │   └─────────────┘   └─────────────┘   └─────────────────┘ │       │
 │  └──────────────────────────────┬──────────────────────────────┘       │
 │                                  │ LLM推論リクエスト                    │
 └──────────────────────────────────┼─────────────────────────────────────┘
                                    │
 ┌──────────────────────────────────▼─────────────────────────────────────┐
 │  cocoro-llm-server (192.168.50.112) ※ 新規構築中                       │
 │                                                                         │
 │  ┌──────────────────────────────────────────────────────────────────┐  │
 │  │              LiteLLM Gateway  :8000  (OpenAI互換)                │  │
 │  │              ルーティング / フォールバック / ロードバランシング    │  │
 │  └────────────────────┬────────────────────┬──────────────────────┘  │
 │                        │                    │                          │
 │   ┌────────────────────▼──┐   ┌─────────────▼───────────────┐        │
 │   │  vLLM Primary  :8080  │   │  vLLM Secondary  :8081      │        │
 │   │  Llama 4 Scout 109B   │   │  Qwen 3.5 32B Q5_K_M        │        │
 │   │  Q4_K_M               │   │                             │        │
 │   └───────────────────────┘   └─────────────────────────────┘        │
 │                                                                         │
 │   ┌────────────────────────────────────────────────────────────────┐  │
 │   │  NVIDIA RTX PRO 6000 Blackwell  96GB VRAM                      │  │
 │   └────────────────────────────────────────────────────────────────┘  │
 └─────────────────────────────────────────────────────────────────────────┘
                                    │
                     フォールバック  │  (LLMサーバー障害時)
                                    ▼
                    ┌───────────────────────────────┐
                    │  Gemini 2.5 Flash (クラウド)  │
                    │  Google API (外部)             │
                    └───────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────┐
 │  miniPC B (192.168.50.86) — cocoro-agent                               │
 │                                                                         │
 │  ┌─────────────────────────────────────────────────────────────────┐  │
 │  │           cocoro-agent  (エージェント実装・行動ループ)            │  │
 │  │           cocoro-coreへ HTTP接続 → LiteLLM経由でLLM利用         │  │
 │  └─────────────────────────────────────────────────────────────────┘  │
 └─────────────────────────────────────────────────────────────────────────┘
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
  ├─[Primary]   vLLM :8080  →  Llama 4 Scout 109B Q4_K_M
  ├─[Secondary] vLLM :8081  →  Qwen 3.5 32B Q5_K_M
  └─[Fallback]  Gemini 2.5 Flash (クラウド)
  │
  ▼
SSE ストリーミング (word-by-word) → ブラウザ
  │
  ▼
Memory保存
  Redis  (短期: TTL 24h)
  PostgreSQL (長期・永続)
  pgvector  (ベクトルインデックス更新)
```

### 2-B. エージェントタスク実行フロー（cocoro-agent）

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

---

## 3. VRAM配分図（96GB 内訳）

NVIDIA RTX PRO 6000 Blackwell — VRAM 96GB

```
┌────────────────────────────────────────────────────────────────────────┐
│  VRAM 96GB 配分                                                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ████████████████████████████████████████████████  62GB               │
│  Llama 4 Scout 109B Q4_K_M                                            │
│  vLLM Primary  :8080                                                  │
│  推定: 109B × 4.5bit/8 ≈ 61.3GB                                       │
│                                                                        │
│  ─────────────────────────────────────────────────                    │
│                                                                        │
│  ████████████████████  25GB                                           │
│  Qwen 3.5 32B Q5_K_M                                                  │
│  vLLM Secondary  :8081                                                 │
│  推定: 32B × 5.5bit/8 ≈ 22.0GB + KVキャッシュ ≈ 25GB                  │
│                                                                        │
│  ─────────────────────────────────────────────────                    │
│                                                                        │
│  ███  9GB                                                             │
│  VRAM予備 / KVキャッシュオーバーフロー / システム                      │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

 合計: 62 + 25 + 9 = 96GB

 モデル計算根拠:
   Q4_K_M: 約 4.5 bits/param  → 109,000M × 4.5 / 8 / 1024 ≈ 61.3 GB
   Q5_K_M: 約 5.5 bits/param  →  32,000M × 5.5 / 8 / 1024 ≈ 22.0 GB

 注意事項:
   - 実際の使用量はシーケンス長・バッチサイズにより変動
   - vLLMのKVキャッシュはGPU_MEMORY_UTILIZATION=0.90 で制御
   - 両モデル同時ロードでVRAMが逼迫する場合はQwenをCPUオフロード検討 [TODO]
```

---

## 4. 各Repo役割一覧（14 repo）

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

## 5. 社内ネットワーク構成（IPアドレス対応表）

### ホスト一覧

| ホスト名 | IPアドレス | ハードウェア | OS | 役割 |
|---------|-----------|------------|-----|------|
| `cocoro-llm-server` | 192.168.50.112 | NVIDIA RTX PRO 6000 Blackwell (96GB VRAM) | Debian 13 | LLM推論専用サーバー ※新規構築中 |
| `miniPC-A` | 192.168.50.92 | Intel N95 / 16GB RAM / 512GB SSD | Debian 13 | cocoro-core / cocoro-console |
| `miniPC-B` | 192.168.50.86 | Intel N95 / 16GB RAM / 512GB SSD | Debian 13 | cocoro-agent |

### ポートマップ

| ホスト | IPアドレス | ポート | サービス | 状態 |
|--------|-----------|--------|---------|------|
| cocoro-llm-server | 192.168.50.112 | :8000 | LiteLLM Gateway (OpenAI互換) | 構築中 |
| cocoro-llm-server | 192.168.50.112 | :8080 | vLLM Primary — Llama 4 Scout 109B | 構築中 |
| cocoro-llm-server | 192.168.50.112 | :8081 | vLLM Secondary — Qwen 3.5 32B | 構築中 |
| cocoro-llm-server | 192.168.50.112 | :9090 | Prometheus (メトリクス収集) | 構築中 |
| cocoro-llm-server | 192.168.50.112 | :3030 | Grafana (ダッシュボード) | 構築中 |
| miniPC-A | 192.168.50.92 | :8001 | cocoro-core (FastAPI) | 稼働中 |
| miniPC-A | 192.168.50.92 | :3000 | cocoro-console (Next.js) | 稼働中 |
| miniPC-A | 192.168.50.92 | :5432 | PostgreSQL + pgvector | 稼働中 |
| miniPC-A | 192.168.50.92 | :6379 | Redis | 稼働中 |
| miniPC-B | 192.168.50.86 | :8010 | cocoro-agent | [TODO] |

### ネットワーク構成図

```
 インターネット
      │
  ルーター (192.168.50.1)
      │
      │ 192.168.50.0/24 (LAN)
  ────┼──────────────────────────────────────────────────
      │           │                     │
      │           │                     │
      ▼           ▼                     ▼
 .112            .92                  .86
 cocoro-         miniPC A             miniPC B
 llm-server      cocoro-core :8001    cocoro-agent
                 cocoro-console :3000
 LiteLLM :8000   PostgreSQL :5432
 vLLM :8080      Redis :6379
 vLLM :8081
 Prometheus :9090
 Grafana :3030
```

### 外部通信

| 接続先 | プロトコル | 用途 | 発信元 |
|--------|-----------|------|--------|
| `generativelanguage.googleapis.com` | HTTPS | Gemini 2.5 Flash (フォールバック) | cocoro-llm-server |
| `huggingface.co` / `hf.co` | HTTPS | モデルダウンロード | cocoro-llm-server |
| `pypi.org` | HTTPS | Pythonパッケージ | 全ホスト |
| `registry.npmjs.org` | HTTPS | npmパッケージ | miniPC-A |

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
   └─ System Prompt構築 → LLMへ送信

⚠ この順序は変更不可。順序を変えると人格の一貫性が崩壊する。
⚠ シンクロ率 92% 超え（Divergence Ceiling）で学習停止。
```

---

*このドキュメントはインフラ実態の変化に追随して更新すること。未確定事項は `[TODO]` で明示し、「完了」と書かない。*
