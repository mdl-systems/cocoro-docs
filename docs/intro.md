---
slug: /
title: Cocoro OS とは
sidebar_position: 1
description: AIに人格を与えるOS。LLMを「声帯」として扱い、Memory・Values・Emotion・Decision Graphで人格の一貫性を保証するパーソナルAI意識OS。
---

# 🧠 Cocoro OS とは

> **AIに「人格」を与えるOS** — LLMを「声帯」として扱い、人格の一貫性を保証するパーソナルAI意識OS

---

## なぜ Cocoro OS が必要か

ChatGPT や Gemini は賢い。でも **「あなただけのAI」** にはなれない。

- 毎回リセットされる会話
- 前回話したことを覚えていない
- 昨日と今日で性格が変わる
- クラウド上に個人情報を預ける不安

**Cocoro OS はこれを全て解決します。**

```
従来のAI:  [あなた] ←→ [LLM（毎回リセット）]

Cocoro OS:  [あなた] ←→ [Cocoro（記憶・人格・感情が蓄積）] ←→ [LLM（声帯）]
```

LLM は単なる「声帯」です。記憶・価値観・感情・判断はすべて Cocoro OS が独立して管理します。
**LLM が Gemini から Ollama に変わっても、人格は一切失われません。**

---

## Cocoro OS の 5 つの特徴

### 🧠 1. 人格の一貫性

**Memory + Values + Emotion + Decision Graph** の 4 層構造で人格を保証。

```
┌──────────────────────────────────────────────────────┐
│                    Cocoro OS 人格エンジン              │
│                                                      │
│  ┌─────────────┐   ┌─────────────┐                  │
│  │   Memory    │   │   Values    │                  │
│  │ 3層記憶体系  │   │ 32次元価値観 │                  │
│  └──────┬──────┘   └──────┬──────┘                  │
│         │                 │                          │
│  ┌──────▼──────┐   ┌──────▼──────┐                  │
│  │   Emotion   │   │  Decision   │                  │
│  │  6要素感情  │   │  判断グラフ  │                  │
│  └──────┬──────┘   └──────┬──────┘                  │
│         └────────┬─────────┘                         │
│                  ▼                                   │
│          [LLM への System Prompt]                     │
└──────────────────────────────────────────────────────┘
```

### 📦 2. ローカルファースト

miniPC（Intel N95 / Debian 13）上で **24時間365日** 自律動作。

| 項目 | 内容 |
|------|------|
| ハードウェア | Intel N95 miniPC（約3万円）|
| OS | Debian 13 |
| 消費電力 | 約 10〜15W（常時稼働可能）|
| インターネット | 不要（Ollama でオフライン動作可）|
| データ | すべてローカルに暗号化保存 |

### 🤖 3. 自律エージェント

10 種の Function Calling ツールで複雑タスクを自律実行。

```
「今週のAIニュースを調べて、要点をまとめてタスクに登録しておいて」

→ web_search("AIニュース 2026年3月")
→ search_memory("AI トレンド")  … 過去の関連記憶も参照
→ analyze & summarize
→ create_task("AIニュース週次まとめ", priority="low")
→ 「完了しました。今週の注目トピックは…」
```

### 🔒 4. プライバシー重視

| セキュリティ層 | 技術 |
|-------------|------|
| 通信暗号化 | Ed25519 デジタル署名 + JWT |
| データ暗号化 | AES-256-GCM |
| アクセス制御 | IP ホワイトリスト + レート制限 |
| 管理 UI | LAN 内専用（外部公開なし）|

### ⚡ 5. ゼロタッチデプロイ

USB 挿すだけで全自動セットアップ。

```
USB 挿入 → 電源 ON → GRUB 3秒待機 → 全自動インストール
→ Debian 13 → Docker → cocoro-core デプロイ → 完了（約20分）
```

---

## アーキテクチャ全体図

```
[ インターネット ]
┌─────────────────────────────────────────────────────┐
│  cocoro-website (Next.js:3000)                      │
│  OpenAI API × cocoro-core 連携                      │
│  SNS × AI プラットフォーム（公開）                    │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP
[ LAN 内 ]            ▼
┌─────────────────────────────────────────────────────┐
│  cocoro-core (FastAPI:8001)                         │
│  Personality AI OS — 53 モジュール / 131 endpoints   │
│  ┌──────────────┐  ┌─────────┐  ┌───────────────┐  │
│  │  PostgreSQL  │  │  Redis  │  │  pgvector     │  │
│  │  + pgvector  │  │  Cache  │  │  Vector Search│  │
│  └──────────────┘  └─────────┘  └───────────────┘  │
└──────────────────────────────────────────────────▲──┘
                      │ SSE/HTTP/JWT                │
┌─────────────────────▼─────────────────────────────┐
│  cocoro-console (Next.js:3000)                     │
│  ローカル管理 UI — LAN 内専用                        │
│  チャット / メモリブラウザ / エージェント管理          │
└────────────────────────────────────────────────────┘

[ デプロイ ]
┌────────────────────────────────────────────────────┐
│  cocoro-installer (Shell/USB)                      │
│  → Debian 13 自動インストール                        │
│  → Docker CE セットアップ                           │
│  → cocoro-core を /opt/cocoro/core にデプロイ        │
└────────────────────────────────────────────────────┘
```

---

## はじめてみる

| ステップ | 内容 | 時間 |
|---------|------|------|
| [1. ハードウェア準備](./getting-started/hardware) | miniPC の選定・購入 | 数日（配送待ち）|
| [2. インストール](./getting-started/installation) | cocoro-installer USB からセットアップ | 約 30 分 |
| [3. Boot Wizard](./getting-started/boot-wizard) | Cocoro に名前・人格を設定 | 約 10〜15 分 |
| [4. 最初のチャット](./getting-started/first-chat) | Cocoro OS と会話開始 | 今すぐ |

---

## 技術スペック概要

| 項目 | 仕様 |
|------|------|
| コアエンジン | Python 3.11 / FastAPI 0.109 |
| データベース | PostgreSQL 16 + pgvector + Redis 7 |
| LLM（クラウド）| Google Gemini 2.5 Flash |
| LLM（ローカル）| Ollama（オフライン対応）|
| セキュリティ | Rate Limit / IP Filter / HTTPS 対応 |
| テスト | 231 tests / 9 files（pytest）|
| ライセンス | Apache License 2.0 |

---

## ライセンス

Apache License 2.0（全リポジトリ共通）

```
Copyright 2026 mdl-systems
Licensed under the Apache License, Version 2.0
```
