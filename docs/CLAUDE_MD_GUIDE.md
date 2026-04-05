---
title: CLAUDE.md 統一ガイド
sidebar_position: 99
description: Antigravity（AIエージェント）がセッション開始時に読み込む CLAUDE.md の目的・必須記載項目・運用ルールを統一規定する。
---

# CLAUDE.md 統一ガイド

> **対象**: mdl-systems 全 repo の CLAUDE.md 作成・更新担当者  
> **強制度**: 全項目「必須」（任意項目は明示）

---

## 1. CLAUDE.md の目的

### Antigravity がセッション開始時に読む「プロジェクト憲法」

Antigravity（AIコーディングエージェント）は、**各セッションが完全に独立したコンテキストで開始される**。
前回セッションで把握した仕様・決定事項・進行状況はデフォルトでは引き継がれない。

CLAUDE.md はこの問題を解決するために存在する。

```
セッション開始
  │
  ▼
Antigravity が CLAUDE.md を自動読み込み
  │
  ├─ プロジェクト全体像の把握
  ├─ 使用技術・ポート・IP・キー名の確認
  ├─ 絶対ルール（クイックフィックス禁止等）の適用
  └─ 前回セッションの継続ハッシュ確認
  │
  ▼
コーディング作業開始（文脈の連続性が保たれた状態で）
```

### CLAUDE.md が果たす3つの役割

| 役割 | 内容 |
|------|------|
| **文脈提供** | プロジェクトのアーキテクチャ・技術スタック・依存関係を一覧化 |
| **ルール強制** | クイックフィックス禁止・未完成を完了と書かない等の行動規律 |
| **進捗継続** | git ハッシュによるセッション間の連続性保証 |

---

## 2. 全 repo で統一する必須記載項目

以下の構造を**すべての repo の CLAUDE.md に含める**こと。
順序・見出し名は変更不可。

### 2-1. ファイル冒頭注記（必須）

```markdown
> このファイルはAntigravityが各セッション開始時に自動読み込みします。
> プロジェクト全体の文脈を把握するための「憲法」です。
```

### 2-2. プロジェクト概要（必須）

```markdown
## プロジェクト概要

- **組織**: mdl-systems
- **repo**: github.com/mdl-systems/<repo-name>
- **役割**: （1行で） このrepoが何をするのか
- **ライセンス**: Apache License 2.0
- **主要言語**: Python 3.11 / TypeScript / Shell 等
```

### 2-3. インフラ構成（必須・実態と一致させること）

```markdown
## インフラ構成

| ホスト | IP | 役割 |
|---|---|---|
| cocoro-llm-server | 192.168.50.112 | LLM推論（vLLM + LiteLLM） |
| miniPC A | 192.168.50.92 | cocoro-core / cocoro-console |
| miniPC B | 192.168.50.86 | cocoro-agent |
```

> **絶対ルール**: ポート・IP・キー名は実態と一致させること。
> 古い情報のまま放置することは禁止。変更時は即時更新。

### 2-4. テックスタック（必須）

```markdown
## テックスタック

| Component | Technology | Version |
|-----------|-----------|---------|
| （実際の技術を記載） | | |
```

バージョンが不明な場合は `latest` ではなく `[TODO: バージョン確認]` と書く。

### 2-5. 環境変数（必須）

```markdown
## 環境変数

```bash
# 設定ファイル: <実際のパス>
KEY_NAME=<value>   # 用途説明
```
```

> **注意**: シークレット値は絶対に書かない。`<key>` または `<secret>` で置換。

### 2-6. よく使うコマンド（必須）

```markdown
## よく使うコマンド

```bash
# 起動
<起動コマンド>

# ヘルスチェック
<ヘルスチェックコマンド>

# テスト
<テストコマンド>
```
```

### 2-7. 絶対ルール（必須・全 repo 共通）

```markdown
## 絶対ルール

- クイックフィックス禁止
- 未完成の機能を「完了」と書かない
- ポート・IP・キー名は実態と一致させる
- 作業完了時は必ず git log --oneline -1 を出力
- 未確定事項は [TODO] で明示する
```

### 2-8. 更新履歴（必須）

```markdown
## 更新履歴

| 日付 | 更新内容 |
|------|---------|
| YYYY-MM-DD | （変更内容を1行で） |
```

---

## 3. ハッシュ値による進捗管理ルール

### なぜハッシュ管理が必要か

Antigravity の各セッションはコンテキストが独立している。
「前回どこまで作業したか」をハッシュで明示することで、

- 作業の重複を防ぐ
- 前回コミットからの差分を正確に把握できる
- セッション間の継続性が保たれる

### 3-1. 作業完了時のルール（必須）

作業がひとまとまり完了した時点で、**必ず以下を実行して出力する**：

```bash
git log --oneline -1
```

出力例：
```
9784583 (HEAD -> main) docs: full system architecture
```

このハッシュ（`9784583`）を次回セッションの引き継ぎ情報として使用する。

### 3-2. セッション開始時のルール

次回セッションを開始する際、プロンプトに以下を含める：

```
前回のハッシュ: 9784583
継続タスク: <今日やること>
```

これにより Antigravity は：
1. `git show 9784583` で前回の変更内容を把握
2. `git log --oneline 9784583..HEAD` で差分確認
3. 文脈を完全に引き継いだ状態で作業開始

### 3-3. ハッシュ管理フロー

```
セッション A
  │
  ├─ 作業実施
  │
  ├─ git add -A && git commit -m "..."
  │
  └─ git log --oneline -1  →  abc1234  ← これを記録
       │
       │（次回セッションで伝える）
       ▼
セッション B
  │
  ├─ 「前回ハッシュ: abc1234」をプロンプトに含める
  │
  ├─ Antigravity が git show abc1234 で前回内容確認
  │
  └─ 継続作業開始
```

### 3-4. git add && commit の標準手順

```bash
# 作業完了後（毎回この順序で実行）
git add -A
git commit -m "<prefix>: <説明>"
git log --oneline -1   # ← 必ずこれを出力して記録
```

---

## 4. コミットメッセージ命名規則

### プレフィックス一覧

| prefix | 用途 | 例 |
|--------|------|-----|
| `feat` | 新機能追加 | `feat: add vector search to memory module` |
| `fix` | バグ修正 | `fix: resolve Redis connection timeout` |
| `docs` | ドキュメント追加・更新 | `docs: full system architecture` |
| `test` | テスト追加・修正 | `test: add emotion pipeline unit tests` |
| `refactor` | リファクタリング（機能変更なし） | `refactor: extract LLM client to adapter pattern` |
| `chore` | ビルド設定・依存関係・ツール | `chore: upgrade vLLM to 0.4.3` |
| `perf` | パフォーマンス改善 | `perf: enable VRAM paging for Llama 4 Scout` |
| `ci` | CI/CD 設定変更 | `ci: add health check to deploy workflow` |
| `infra` | インフラ・サーバー設定 | `infra: configure LiteLLM fallback routing` |
| `revert` | コミット巻き戻し | `revert: revert "feat: add experimental memory compression"` |

### 命名ルール

```
<prefix>: <何を><どうした>（日本語 or 英語 / 50文字以内）
```

**良い例:**
```
docs: add VRAM allocation breakdown to ARCHITECTURE.md
feat: implement pgvector cosine similarity search
fix: correct LiteLLM port from 8001 to 8000
infra: set GPU_MEMORY_UTILIZATION=0.90 for vLLM
```

**悪い例:**
```
update                          ← prefix なし、内容不明
fix bug                         ← 何のバグか不明
docs: update docs               ← 何を更新したか不明
WIP                             ← 作業中コミットは禁止（feature branch でも原則禁止）
```

### スコープ（任意）

変更対象が明確な場合はスコープを付与：

```
feat(memory): add archiver for long-term consolidation
fix(api): handle 429 rate limit from Gemini
docs(llm-server): add vLLM build instructions for Blackwell
```

---

## 5. 各 repo の CLAUDE.md 最終更新日一覧

| Repo | CLAUDE.md の有無 | 最終更新日 | 備考 |
|------|----------------|-----------|------|
| `cocoro-docs` | ✅ あり | 2026-03-08 | 全 repo の情報を集約した親 CLAUDE.md |
| `cocoro-core` | [TODO: 確認] | — | 53モジュール・131エンドポイント情報を含むべき |
| `cocoro-console` | [TODO: 確認] | — | ポート3000・Ed25519認証情報を含むべき |
| `cocoro-website` | [TODO: 確認] | — | PostgreSQL/Prisma・NextAuth情報を含むべき |
| `cocoro-installer` | [TODO: 確認] | — | キッティング手順・対象HW情報を含むべき |
| `cocoro-agent` | [TODO: 作成] | — | miniPC B (192.168.50.86) 構成情報を含むべき |
| `cocoro-sdk` | 未開発 | — | repo 作成時に同時作成すること |
| `cocoro-cli` | 未開発 | — | repo 作成時に同時作成すること |
| `cocoro-apps` | 未開発 | — | repo 作成時に同時作成すること |
| `cocoro-models` | 未開発 | — | repo 作成時に同時作成すること |
| `cocoro-network` | 未開発 | — | repo 作成時に同時作成すること |
| `cocoro-node` | 未開発 | — | repo 作成時に同時作成すること |
| `cocoro-cloud` | 未開発 | — | repo 作成時に同時作成すること |
| `cocoro-examples` | 未開発 | — | repo 作成時に同時作成すること |

> **[TODO]** マークが付いている repo は次回セッションで CLAUDE.md の存在確認・内容精査を行うこと。
> 新 repo を作成した際は、このテーブルを即時更新すること。

---

## Appendix: CLAUDE.md テンプレート

新 repo 作成時にコピーして使用する最小テンプレート：

```markdown
> このファイルはAntigravityが各セッション開始時に自動読み込みします。
> プロジェクト全体の文脈を把握するための「憲法」です。

---

## プロジェクト概要

- **組織**: mdl-systems
- **repo**: github.com/mdl-systems/<repo-name>
- **役割**: [1行でこのrepoの役割を記述]
- **ライセンス**: Apache License 2.0
- **主要言語**: [使用言語]

---

## インフラ構成

| ホスト | IP | 役割 |
|---|---|---|
| cocoro-llm-server | 192.168.50.112 | LLM推論（vLLM + LiteLLM） |
| miniPC A | 192.168.50.92 | cocoro-core / cocoro-console |
| miniPC B | 192.168.50.86 | cocoro-agent |

---

## テックスタック

| Component | Technology | Version |
|-----------|-----------|---------|
| [実際の技術を記載] | | |

---

## 環境変数

```bash
# 設定ファイル: [実際のパス]
# KEY_NAME=<value>   # 用途説明
```

---

## よく使うコマンド

```bash
# 起動
[起動コマンド]

# ヘルスチェック
[ヘルスチェックコマンド]

# テスト
[テストコマンド]
```

---

## 絶対ルール

- クイックフィックス禁止
- 未完成の機能を「完了」と書かない
- ポート・IP・キー名は実態と一致させる
- 作業完了時は必ず git log --oneline -1 を出力
- 未確定事項は [TODO] で明示する

---

## 更新履歴

| 日付 | 更新内容 |
|------|---------|
| YYYY-MM-DD | 初版作成 |
```

---

*このガイド自体も変更があれば即時更新し、更新履歴に記録すること。*  
*最終更新: 2026-04-06*
