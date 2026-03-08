---
title: アーキテクチャ概要
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📐 アーキテクチャ概要

Cocoro OS は **11 層構造**で設計されており、ハードウェアから Web UI まで一貫したアーキテクチャを持ちます。

---

## 11 層アーキテクチャ

<div style={{maxWidth: '640px', margin: '0 auto'}}>

<div className="arch-layer layer-ui">
  <span className="arch-layer-number">Layer 11</span>
  <div><strong>Dashboard & Voice</strong> — Web UI / Web Speech API</div>
</div>
<div className="arch-layer layer-api">
  <span className="arch-layer-number">Layer 10</span>
  <div><strong>API Gateway</strong> — FastAPI + Nginx（131 エンドポイント）</div>
</div>
<div className="arch-layer layer-security">
  <span className="arch-layer-number">Layer 9.5</span>
  <div><strong>Security</strong> — Rate Limit / IP Filter / HTTPS / JWT</div>
</div>
<div className="arch-layer layer-gov">
  <span className="arch-layer-number">Layer 9</span>
  <div><strong>Governance</strong> — Ethics + Safety + Value Scoring</div>
</div>
<div className="arch-layer layer-org">
  <span className="arch-layer-number">Layer 8</span>
  <div><strong>Organization</strong> — Departments + Agent Registry</div>
</div>
<div className="arch-layer layer-agent">
  <span className="arch-layer-number">Layer 7</span>
  <div><strong>Agent Execution</strong> — Task Router + Worker + Queue</div>
</div>
<div className="arch-layer layer-brain">
  <span className="arch-layer-number">Layer 6</span>
  <div><strong>AI Brain</strong> — Reasoning + Decision + Tools × 10</div>
</div>
<div className="arch-layer layer-evo">
  <span className="arch-layer-number">Layer 5</span>
  <div><strong>Evolution</strong> — Observation + Evaluation + Meta Learning</div>
</div>
<div className="arch-layer layer-persona">
  <span className="arch-layer-number">Layer 4</span>
  <div><strong>Personality</strong> — Identity + Values + Emotion × 6</div>
</div>
<div className="arch-layer layer-memory">
  <span className="arch-layer-number">Layer 3</span>
  <div><strong>Memory</strong> — Short-Term: Redis / Long-Term: PG / Vector: pgvector</div>
</div>
<div className="arch-layer layer-infra">
  <span className="arch-layer-number">Layer 2</span>
  <div><strong>Infrastructure</strong> — PostgreSQL + Redis + Docker</div>
</div>
<div className="arch-layer layer-os">
  <span className="arch-layer-number">Layer 1</span>
  <div><strong>OS</strong> — Debian 13</div>
</div>
<div className="arch-layer layer-hw">
  <span className="arch-layer-number">Layer 0</span>
  <div><strong>Hardware</strong> — miniPC: Intel N95 / 16GB RAM / 512GB SSD</div>
</div>

</div>

---

## アーキテクチャの原則

### 1. LLM は「声帯」

```
┌─────────────────────────────────────┐
│          Cocoro OS（人格層）         │
│  Memory + Values + Emotion + Decision│
└──────────────────┬──────────────────┘
                   │ 思考・判断結果
         ┌─────────▼─────────┐
         │   LLM（声帯）      │
         │ Gemini / Ollama   │
         └───────────────────┘
```

LLM は「何を言うか」を生成するだけ。**「誰として言うか」は Cocoro OS が決定**します。
LLM を Gemini から Ollama に変えても、人格は 100% 維持されます。

### 2. Decision Graph パイプライン

```
入力
  │
  ▼
Memory（記憶照合）
  │ 「この人に以前何を話したか？」
  ▼
Value（価値観スコアリング）
  │ 「この行動は自分の価値観に合うか？」
  ▼
Emotion（感情修飾）
  │ 「今の感情状態はどうか？」
  ▼
Decision（最終判断）
  │ 「何をどう言うか」
  ▼
LLM（文章生成）
  │
  ▼
出力
```

:::caution パイプライン順序は必ず守ること
Memory → Value → Emotion → Decision の順序は変更不可。
順序を変えると人格の一貫性が崩れます。
:::

### 3. ネットワーク構成

```
[ インターネット ]
cocoro-website (Next.js:3000)
  OpenAI API + cocoro-core 連携
       │
       └────── HTTP ──────────────────┐
                                      ▼
[ LAN 内 ]                    cocoro-core (:8001)
cocoro-console (:3000)               │
  LAN 内専用管理 UI         ┌────────┴────────┐
       │                    ▼                ▼
       └── SSE/HTTP/JWT → PostgreSQL       Redis
                          + pgvector    (cache/queue)

[ デプロイ ]
cocoro-installer (USB)
  → Debian 13 自動インストール
  → Docker + cocoro-core セットアップ
```

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
