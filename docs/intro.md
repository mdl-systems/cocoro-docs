---
slug: /
title: Cocoro OS とは
sidebar_position: 1
---

# 🧠 Cocoro OS とは

> **AIに人格を与えるOS** — LLMを「声帯」として扱い、人格の一貫性を保証するパーソナルAI意識OS

---

## 概要

**Cocoro OS** は、人間の思考・判断・個性を模倣する AI 意識 OS です。
miniPC（Intel N95 / Debian 13）上で AI Agent をローカル常時稼働させることを目的としています。

:::info LLMは「声帯」
ChatGPT や Gemini などの LLM は「声帯」に過ぎません。
人格を構成する **Memory・Values・Emotion・Decision Graph** は Cocoro OS が独立して管理します。
LLM が変わっても、記憶・価値観・感情は完全に維持されます。
:::

---

## 特徴

| 特徴 | 説明 |
|------|------|
| 🧠 **人格の一貫性** | Memory + Values + Emotion + Decision Graph で人格を保証 |
| 📦 **ローカルファースト** | miniPC 上で完全自律動作。Ollama でオフライン運用も可 |
| 🤖 **自律エージェント** | 10種の Function Calling ツールで複雑タスクを自律実行 |
| 🔒 **プライバシー重視** | AES-256-GCM + Ed25519 で多層セキュリティ |
| ⚡ **ゼロタッチデプロイ** | USB 挿すだけで全自動セットアップ完了 |

---

## システム構成

Cocoro OS は以下の 4 つの主要コンポーネントで構成されています：

### cocoro-core（コアエンジン）
- Personality AI OS のコアエンジン
- 53 モジュール / 131 エンドポイント / 231 テスト
- FastAPI + PostgreSQL + Redis + pgvector

### cocoro-console（ローカル管理 UI）
- LAN 内専用の miniPC 管理インターフェース
- SSE ストリーミングチャット・メモリブラウザ・エージェント管理
- Next.js 16 + SQLite + Ed25519 認証

### cocoro-website（公開 SNS プラットフォーム）
- インターネット公開向け SNS × AI プラットフォーム
- AI エージェントによるソーシャルフィード・コミュニティ
- Next.js 16 + PostgreSQL + NextAuth.js

### cocoro-installer（自動インストーラー）
- 工場キッティング用 Debian 13 自動インストール USB
- ゼロタッチで OS + Docker + cocoro-core をデプロイ
- GRUB 自動選択 → 無人インストール → 約 20 秒で完了

---

## クイックスタート

```bash
# 1. クローン & 起動
git clone https://github.com/mdl-systems/cocoro-core.git
cd cocoro-core
cp infra/docker/.env.example infra/docker/.env
# .env に GEMINI_API_KEY と COCORO_API_KEY を設定

cd infra/docker && docker compose up -d --build

# 2. 動作確認
curl http://localhost:8001/health

# 3. チャット
curl -X POST http://localhost:8001/chat \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "こんにちは、自己紹介して"}'
```

→ 詳細は **[クイックスタートガイド](./getting-started/quickstart)** を参照

---

## ライセンス

Apache License 2.0（全リポジトリ共通）

```
Copyright 2026 mdl-systems
Licensed under the Apache License, Version 2.0
```
