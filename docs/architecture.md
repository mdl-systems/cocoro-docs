---
title: アーキテクチャ概要
sidebar_position: 2
description: Cocoro OSの11層アーキテクチャとコンポーネント間の関係をMermaidで解説。
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📐 アーキテクチャ概要

Cocoro OS は **11 層構造**で設計されており、ハードウェアから Web UI まで一貫したアーキテクチャを持ちます。

---

## システム全体図

```mermaid
graph TB
    subgraph Internet["🌐 インターネット"]
        Website["cocoro-website\nNext.js :3000\n(公開SNSプラットフォーム)"]
        OpenAI["OpenAI API"]
    end

    subgraph LAN["🏠 LAN内 (miniPC)"]
        Console["cocoro-console\nNext.js :3000\n(ローカル管理UI)"]
        Core["cocoro-core\nFastAPI :8001\nPersonality AI OS"]

        subgraph Data["データ層"]
            Postgres[("PostgreSQL :5432\n+ pgvector\n(記憶・人格・永続データ)")]
            Redis[("Redis :6379\n(短期記憶・キュー・キャッシュ)")]
        end
    end

    subgraph LLM["🧠 LLM層"]
        Gemini["Google Gemini\n2.5 Flash (クラウド)"]
        Ollama["Ollama\n(ローカル・オフライン)"]
    end

    subgraph Deploy["⚙️ デプロイ"]
        Installer["cocoro-installer\nUSB自動セットアップ"]
    end

    User["👤 ユーザー"] -->|"LAN / SSE / JWT"| Console
    User -->|"Internet / HTTPS"| Website
    Console -->|"HTTP / JWT"| Core
    Website -->|"HTTP"| Core
    Website --> OpenAI
    Core --> Postgres
    Core --> Redis
    Core -->|"生成委譲（声帯）"| Gemini
    Core -.->|"オフライン時"| Ollama
    Installer -.->|"Debian13 + Docker\n全自動セットアップ"| Core
```

---

## 11 層アーキテクチャ

```mermaid
graph BT
    L0["Layer 0: Hardware\nminiPC — Intel N95 / 16GB / 512GB SSD"]
    L1["Layer 1: OS\nDebian 13 (bookworm)"]
    L2["Layer 2: Infrastructure\nPostgreSQL + Redis + Docker"]
    L3["Layer 3: Memory\nShort-Term: Redis / Long-Term: PG / Vector: pgvector"]
    L4["Layer 4: Personality\nIdentity + Values(32dim) + Emotion(×6)"]
    L5["Layer 5: Evolution\nObservation + Evaluation + Meta Learning"]
    L6["Layer 6: AI Brain\nReasoning + Decision + Tools×10"]
    L7["Layer 7: Agent Execution\nTask Router + Worker + Queue"]
    L8["Layer 8: Organization\nDepartments + Agent Registry"]
    L9["Layer 9: Governance\nEthics + Safety + Value Scoring"]
    L95["Layer 9.5: Security\nRate Limit / IP Filter / HTTPS / JWT"]
    L10["Layer 10: API Gateway\nFastAPI + Nginx（131 endpoints）"]
    L11["Layer 11: Dashboard & Voice\nWeb UI / Web Speech API"]

    L0 --> L1 --> L2 --> L3 --> L4 --> L5 --> L6 --> L7 --> L8 --> L9 --> L95 --> L10 --> L11
```

<div style={{overflowX: 'auto'}}>

| 層 | 名称 | 技術 | 役割 |
|----|------|------|------|
| 11 | Dashboard & Voice | Web UI / Web Speech API | ユーザーインターフェース |
| 10 | API Gateway | FastAPI + Nginx | 131 エンドポイント |
| 9.5 | Security | Rate Limit / JWT / HTTPS | セキュリティ多層防御 |
| 9 | Governance | Ethics + Safety Engine | 倫理・安全チェック |
| 8 | Organization | Agent Registry | 部署・エージェント管理 |
| 7 | Agent Execution | Task Router + Queue | タスク自律実行 |
| 6 | AI Brain | Reasoning + Tools×10 | 推論・ツール実行 |
| 5 | Evolution | Meta Learning | 自己進化・学習 |
| 4 | Personality | Values×32 + Emotion×6 | **人格の核心** |
| 3 | Memory | Redis + PG + pgvector | 3層記憶システム |
| 2 | Infrastructure | PostgreSQL + Redis | データ永続化 |
| 1 | OS | Debian 13 | オペレーティングシステム |
| 0 | Hardware | Intel N95 miniPC | 物理ハードウェア |

</div>

---

## アーキテクチャの原則

### 1. LLM は「声帯」

```mermaid
graph LR
    Input["入力メッセージ"] --> Pipeline

    subgraph Pipeline["Cocoro OS 人格パイプライン"]
        Memory["Memory\n記憶照合"] --> Values["Values\n価値観スコアリング"]
        Values --> Emotion["Emotion\n感情修飾"]
        Emotion --> Decision["Decision\n最終判断"]
    end

    Decision -->|"System Prompt生成"| LLM["LLM\nGemini / Ollama\n（声帯）"]
    LLM --> Output["出力"]
```

LLM は「何を言うか」を生成するだけ。**「誰として言うか」は Cocoro OS が決定**します。
LLM を Gemini から Ollama に変えても、人格は 100% 維持されます。

:::caution Decision Graph パイプライン順序は必ず守ること
**Memory → Value → Emotion → Decision** の順序は変更不可。
順序を変えると人格の一貫性が崩れます。
:::

### 2. ローカルファースト

```mermaid
graph LR
    miniPC["miniPC\ncocoro.local"] -->|"LAN内専用"| Console["cocoro-console\n管理UI"]
    miniPC -->|"オプション"| Tunnel["Cloudflare Tunnel\n外部アクセス"]
    Tunnel -->|"HTTPS"| Remote["外出先\nスマホ・PC"]
```

すべてのデータはローカルに保存。インターネット接続は Gemini API 通信のみで、Ollama 使用時は完全オフライン動作が可能。

### 3. 2フロントエンド構成

| | cocoro-console | cocoro-website |
|--|---------------|----------------|
| 用途 | ローカル管理 UI | 公開 SNS プラットフォーム |
| ネットワーク | LAN 内専用 | インターネット公開 |
| 認証 | Ed25519 デバイス認証 | JWT / NextAuth.js |
| DB | SQLite | PostgreSQL + Prisma |
| AI 連携 | cocoro-core 直接 | OpenAI API + cocoro-core |

---

## テックスタック一覧

<Tabs>
  <TabItem value="core" label="cocoro-core" default>

| Component | Technology | Version |
|-----------|-----------|---------|
| Language | Python | 3.11 |
| API Framework | FastAPI | 0.109 |
| LLM (Cloud) | Google Gemini | 2.5 Flash |
| LLM (Local) | Ollama | latest |
| Database | PostgreSQL + pgvector | 16 |
| Cache / Queue | Redis | 7 |
| Container | Docker Compose + Nginx | latest |
| Test | pytest + pytest-asyncio | 231 tests |

  </TabItem>
  <TabItem value="console" label="cocoro-console">

| レイヤー | 技術 |
|---------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Style | Vanilla CSS（クリームテーマ）|
| Animation | Framer Motion |
| Database | SQLite (better-sqlite3) |
| Security | AES-256-GCM / Ed25519 |

  </TabItem>
  <TabItem value="website" label="cocoro-website">

| レイヤー | 技術 |
|---------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Style | Tailwind CSS 4 |
| AI | OpenAI API |
| Database | PostgreSQL + Prisma |
| 認証 | JWT / NextAuth.js |

  </TabItem>
</Tabs>
