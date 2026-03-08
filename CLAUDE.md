# CLAUDE.md — Cocoro OS Project (mdl-systems)

> このファイルはAntigravityが各セッション開始時に自動読み込みします。
> プロジェクト全体の文脈を把握するための「憲法」です。

---

## プロジェクト概要

**Cocoro OS** は、人間の思考・判断・個性を模倣するパーソナルAI意識OSです。
miniPC（主にDebian環境）上で動作し、AI Agentをローカルで常時稼働させることを目的としています。

- **組織**: mdl-systems
- **ライセンス**: Apache License 2.0（全repo共通）
- **主要言語**: Python / Shell / HTML

---

## リポジトリ構成と役割

### 🧠 コア・基盤層

| Repo | 役割 | 言語 |
|------|------|------|
| `cocoro-core` | AI意識OSのコアエンジン。思考・判断・個性のレプリケーション | Python |
| `cocoro-models` | AIモデル定義・管理（LLM/エージェントモデル） | 未確認 |
| `cocoro-agent` | エージェント実装・行動ループ・タスク実行 | 未確認 |

### 🌐 ネットワーク・インフラ層

| Repo | 役割 | 言語 |
|------|------|------|
| `cocoro-node` | ノード管理・P2Pまたはクラスタ通信 | 未確認 |
| `cocoro-network` | ネットワーク接続・通信プロトコル | 未確認 |
| `cocoro-cloud` | クラウド連携・リモート同期 | 未確認 |
| `cocoro-installer` | miniPC向けDebian自動セットアップ + cocoro-coreデプロイ | Shell |

### 🛠 開発者向けツール層

| Repo | 役割 | 言語 |
|------|------|------|
| `cocoro-sdk` | 外部開発者向けSDK（APIラッパー） | 未確認 |
| `cocoro-cli` | コマンドラインインターフェース | 未確認 |
| `cocoro-apps` | cocoro上で動くアプリケーション群 | 未確認 |

### 📚 ドキュメント・UI層

| Repo | 役割 | 言語 |
|------|------|------|
| `cocoro-console` | 管理コンソール・Web UI | 未確認 |
| `cocoro-docs` | ドキュメントサイト | 未確認 |
| `cocoro-examples` | サンプルコード・チュートリアル | 未確認 |
| `cocoro-website` | 公式Webサイト（AI Agent登録フォーム） | HTML |

---

## 依存関係マップ（推定）

```
cocoro-website
    │
    ▼
cocoro-console ──────────────────────────────────┐
    │                                             │
    ▼                                             ▼
cocoro-sdk ──────────────► cocoro-core ◄──── cocoro-agent
    │                           │                 │
    ▼                           ▼                 ▼
cocoro-cli              cocoro-models       cocoro-network
                               │                 │
                               ▼                 ▼
                        cocoro-cloud        cocoro-node
                               
cocoro-installer ──► cocoro-core（デプロイ対象）
cocoro-apps ────────► cocoro-sdk（アプリがSDK経由で利用）
cocoro-examples ────► cocoro-sdk / cocoro-cli
cocoro-docs ────────► 全repoのドキュメント集約
```

---

## アーキテクチャの原則（推定）

1. **ローカルファースト**: miniPC上でAIが自律動作することを前提
2. **モジュール分離**: 各機能が独立したrepoとして分割されている
3. **SDK経由のアクセス**: 外部・アプリからはcocoro-sdk経由でcoreにアクセス
4. **自動インストール**: cocoro-installerでセットアップをゼロ設定化

---

## 開発時の注意事項

### ✅ 実装前に確認すること
- 変更が `cocoro-core` に影響する場合、`cocoro-sdk` のインターフェースへの影響を必ず確認
- `cocoro-installer` はDebian/Shell依存のため、他OS環境でのテスト不可
- `cocoro-models` を変更する場合、`cocoro-agent` と `cocoro-core` との互換性を確認

### ⚠️ 未確認情報について
> このCLAUDE.mdはrepo名と説明文から推定して作成されています。
> 各repoのREADMEやコードを読んだ後、以下のセクションを実際の情報で更新してください：
> - 各repoの実際の技術スタック
> - API境界・インターフェース定義
> - 環境変数・設定ファイルの場所
> - テスト・ビルド・デプロイコマンド

---

## よく使うコマンド（確認後に記入）

```bash
# cocoro-core 起動
# TODO: 実際のコマンドに更新

# cocoro-installer 実行
# TODO: Shellスクリプト名を確認して記入

# テスト実行
# TODO: 各repoのテストコマンドを記入
```

---

## Antigravityワークスペース構成（推奨）

```
インスタンスA: cocoro-core + cocoro-models + cocoro-agent  （コア層）
インスタンスB: cocoro-sdk + cocoro-cli + cocoro-apps       （ツール層）
インスタンスC: cocoro-network + cocoro-node + cocoro-cloud （インフラ層）
インスタンスD: cocoro-installer + cocoro-console           （運用・UI層）
```

グローバルSkills（`~/.gemini/antigravity/skills/`）にこのファイルの要約を置くことで
全インスタンスからプロジェクト全体像を参照できます。

---

## 更新履歴

| 日付 | 更新内容 |
|------|---------|
| 2026-03-08 | 初版作成（repo名・説明文からの推定版） |
| （次回）  | 各repoのREADME確認後に実情報で更新 |
