---
title: リリースノート
sidebar_position: 99
description: Cocoro OS v1.0.0 リリースノート。初回正式リリースの変更点・機能一覧・既知の問題をまとめています。
---

# 📋 リリースノート

## v1.0.0 — 2026年3月14日

> **Cocoro OS 初回正式リリース**

---

### 🎉 v1.0.0 の概要

cocoro-core v1.0.0 は、**パーソナルAI意識OS** の初回正式リリースです。
miniPC（Intel N95）上でローカル常時稼働する AI の基盤として、以下の機能を正式に提供します。

---

### ✅ 新機能・主要コンポーネント

#### 🧠 Personality Engine（人格エンジン）
- **32次元価値観ベクトル** — Boot Wizard の 40 問で初期化
- **8要素感情エンジン** — Plutchik モデルベースの動的感情状態管理
- **Decision Graph パイプライン** — Memory → Value → Emotion → Decision の 4 段階処理
- **Evolution Engine** — 会話を通じた自己学習・人格進化

#### 🧩 3層記憶システム
- **短期記憶（Redis）** — 現在の会話スレッド（最新 20 ターン、TTL: 24h）
- **長期記憶（PostgreSQL）** — 重要度スコア付き永続記憶
- **ベクトル記憶（pgvector）** — セマンティック類似検索

#### 🤖 エージェントシステム
- **Task Router** — 自然言語からタスクを自動分類・ルーティング
- **6種のワーカー** — リサーチ / スケジュール / タスク管理 / 記憶キュレーション / 分析 / カスタム
- **10種の Function Calling ツール** — `web_search`, `search_memory`, `create_task` など
- **SSE ストリーミング進捗** — タスク実行のリアルタイム進捗配信

#### 📡 API（131 エンドポイント）
- **チャット**: `POST /chat`, `POST /chat/stream`
- **感情**: `GET /emotion/state`, `POST /emotion/update`
- **シンクロ率**: `GET /sync/rate`, `GET /sync/ceiling`
- **記憶**: CRUD + セマンティック検索 + アーカイブ
- **エージェント**: タスク実行・進捗確認・キャンセル
- **スケジュール / タスク**: 自然言語での予定・ToDo 管理

#### 🔒 セキュリティ
- **Rate Limiting** — チャット 60req/min、API 120req/min
- **IP ホワイトリスト** — LAN 内アクセスのみ（設定可）
- **JWT 認証** — アクセストークン（1時間有効）
- **Divergence Ceiling** — シンクロ率 92% での自動学習停止（安全装置）

#### ⚙️ インフラ
- **Docker Compose** — 1コマンドで全サービスを起動
- **cocoro-installer** — USB から Debian 13 + Docker + cocoro-core を全自動セットアップ
- **Nginx リバースプロキシ** — 本番 HTTPS 対応
- **自動バックアップ** — PostgreSQL データの定期バックアップ

---

### 📊 スペック

| 項目 | 数値 |
|------|------|
| API エンドポイント数 | 131 |
| モジュール数 | 53 |
| テスト数 | 231（9ファイル）|
| テストカバレッジ | E2E: 99 / Emotion: 28 / Security: 19 / Next-Gen: 42 |
| Boot Wizard 質問数 | 40問（8カテゴリ × 5問）|
| 価値観次元数 | 32次元 |
| 感情要素数 | 8要素（Plutchik モデル）|
| Function Calling ツール数 | 10種 + Plugin 4種 |

---

### 🔧 対応環境

| 項目 | 要件 |
|------|------|
| OS | Debian 13（推奨）/ Ubuntu 22.04+ |
| CPU | Intel N95 以上（x86_64 のみ）|
| RAM | 8GB 最低 / **16GB 推奨** |
| SSD | 256GB 最低 / **512GB 推奨** |
| Python | 3.11 |
| Docker | CE 26.x 以上 |
| LLM（クラウド）| Google Gemini API キー |
| LLM（ローカル）| Ollama（オプション）|

---

### ⚠️ 既知の問題

| 問題 | 影響 | 回避策 | 修正予定 |
|------|------|--------|---------|
| ARM アーキテクチャ非対応 | Raspberry Pi / Apple M1 で動作不可 | x86_64 マシンを使用 | v1.1.0 |
| Ollama の高負荷時レイテンシ | 重いモデル（70B+）で応答が遅い | gemma2:9b 以下を使用 | v1.2.0 |
| 複数ノード間の記憶同期遅延 | 最大 5 分の遅延 | 手動同期で即時反映可 | v1.1.0 |
| Windows / macOS での直接起動 | Docker 環境外での起動未テスト | Docker 経由で起動 | v1.1.0 |

---

### 🔄 Breaking Changes

v1.0.0 は初回リリースのため Breaking Changes はありません。

---

### 🗺️ ロードマップ

#### v1.1.0（2026年Q2予定）
- [ ] ARM アーキテクチャ対応（Raspberry Pi 5 / Apple M シリーズ）
- [ ] 複数ノード間リアルタイム記憶同期
- [ ] Web ダッシュボードの強化（感情グラフ・シンクロ率チャート）
- [ ] ファイルアップロード正式対応（PDF / 画像解析）

#### v1.2.0（2026年Q3予定）
- [ ] 音声入出力（Web Speech API）
- [ ] モバイルアプリ（PWA）対応
- [ ] Webhook サポート（タスク完了通知）
- [ ] API キーのローテーション機能

#### v2.0.0（2026年Q4予定）
- [ ] マルチユーザー対応
- [ ] クラウド同期（cocoro-cloud）
- [ ] プラグインマーケットプレイス
- [ ] OpenAI API 互換モード

---

### 📦 インストール

```bash
# 新規インストール（推奨）
# → cocoro-installer の USB を使用
# 詳細: https://github.com/mdl-systems/cocoro-installer

# Docker のみでの起動（開発・検証用）
git clone https://github.com/mdl-systems/cocoro-core.git
cd cocoro-core
cp infra/docker/.env.example infra/docker/.env
# .env に GEMINI_API_KEY と COCORO_API_KEY を設定
cd infra/docker
docker compose up -d --build
```

---

### 🙏 謝辞

Cocoro OS v1.0.0 は **mdl-systems** チームによって開発されました。

- **Apache License 2.0** でオープンソース公開
- **GitHub**: [github.com/mdl-systems/cocoro-core](https://github.com/mdl-systems/cocoro-core)
- **ドキュメント**: [mdl-systems.github.io/cocoro-docs](https://mdl-systems.github.io/cocoro-docs)

---

*Copyright 2026 mdl-systems. Licensed under the Apache License, Version 2.0.*
