# CLAUDE.md — Cocoro OS Project (mdl-systems)

> このファイルはAntigravityが各セッション開始時に自動読み込みします。
> プロジェクト全体の文脈を把握するための「憲法」です。

---

## プロジェクト概要

**Cocoro OS** は、人間の思考・判断・個性を模倣するパーソナルAI意識OSです。
miniPC（Intel N95 / Debian 13）上でAI Agentをローカル常時稼働させることを目的としています。

- **組織**: mdl-systems
- **ライセンス**: Apache License 2.0（全repo共通）
- **主要言語**: Python 3.11 / TypeScript / Shell

---

## リポジトリ構成と役割

### ✅ 開発済みrepo

| Repo | 役割 | 言語 |
|------|------|------|
| `cocoro-core` | Personality AI OSのコアエンジン。Memory+Values+Emotion+Decision Graphで人格の一貫性を保証。53modules / 131 endpoints / 231 tests | Python 3.11 |
| `cocoro-console` | miniPCのローカル管理UI（LAN内専用）。ChatGPTライクなSSEストリーミングチャット・メモリブラウザ・エージェント管理・ノード監視 | Next.js 16 / TypeScript |
| `cocoro-website` | インターネット公開向けSNS×AIプラットフォーム。AIエージェントによるソーシャルフィード・コミュニティ・チャット | Next.js 16 / TypeScript |
| `cocoro-installer` | 工場キッティング用Debian 13自動インストールUSB。miniPC向けゼロタッチOSセットアップ + cocoro-coreデプロイ | Shell |
| `cocoro-docs` | 公式ドキュメントサイト（Docusaurus 3）。GitHub Pagesでホスト | TypeScript / MDX |

### � 未開発repo（将来実装予定）

| Repo | 想定役割 |
|------|---------|
| `cocoro-sdk` | 外部開発者向けSDK（cocoro-core APIラッパー） |
| `cocoro-cli` | コマンドラインインターフェース |
| `cocoro-apps` | cocoro上で動くアプリケーション群 |
| `cocoro-agent` | エージェント実装・行動ループ拡張 |
| `cocoro-models` | AIモデル定義・管理 |
| `cocoro-network` | ネットワーク接続・通信プロトコル |
| `cocoro-node` | ノード管理・クラスタ通信 |
| `cocoro-cloud` | クラウド連携・リモート同期 |
| `cocoro-examples` | サンプルコード・チュートリアル |

---

## 依存関係マップ

```
[ インターネット ]
cocoro-website (Next.js:3000)
  OpenAI API + cocoro-core連携
  PostgreSQL + Prisma / JWT / NextAuth.js
        │
        └──── HTTP ──────────────────────┐
                                         ▼
[ LAN内 ]                        cocoro-core (FastAPI:8001)
cocoro-console (Next.js:3000)           │
  SQLite / AES-256-GCM / Ed25519 ┌──────┴──────────────┐
        │                        ▼                     ▼
        └─── SSE/HTTP/JWT ──► PostgreSQL+pgvector     Redis
                             (memory/personality)  (cache/queue)

[ デプロイ ]
cocoro-installer (Shell/USB)
  → Debian 13 自動インストール
  → Docker CE セットアップ
  → cocoro-core を /opt/cocoro/core にデプロイ
```

---

## システムアーキテクチャ（cocoro-core 11層構造）

```
Layer 11: Dashboard & Voice        (Web UI / Web Speech API)
Layer 10: API Gateway              (FastAPI + Nginx, 131 endpoints)
Layer 9.5: Security                (Rate Limit / IP Filter / HTTPS)
Layer 9:  Governance               (Ethics + Safety + Value Scoring)
Layer 8:  Organization             (Departments + Agent Registry)
Layer 7:  Agent Execution          (Task Router + Worker + Queue)
Layer 6:  AI Brain                 (Reasoning + Decision + Tools×10)
Layer 5:  Evolution                (Observation + Evaluation + Meta)
Layer 4:  Personality              (Identity + Values + Emotion×6)
Layer 3:  Memory                   (Short-Term:Redis / Long-Term:PG / Vector:pgvector)
Layer 2:  Infrastructure           (PostgreSQL + Redis + Docker)
Layer 1:  OS                       (Debian 13)
Layer 0:  Hardware                 (miniPC: N95 / 16GB / 512GB SSD)
```

### アーキテクチャの原則

1. **LLMは「声帯」**: LLMが変わっても人格 (Memory/Values/Emotion/Decision) は維持される
2. **ローカルファースト**: miniPC上でAIが自律動作。Ollamaでオフライン運用も可能
3. **2フロントエンド構成**: cocoro-console（LAN内管理）/ cocoro-website（公開SNS）
4. **ゼロタッチデプロイ**: cocoro-installerでUSBから全自動セットアップ

---

## 開発時の注意事項

- `cocoro-core` のAPI変更は `cocoro-console` / `cocoro-website` 両方への影響を確認
- Decision Graph のパイプライン順序を守る: **Memory → Value → Emotion → Decision**
- シンクロ率 92% 超え（Divergence Ceiling）で学習停止するため注意
- `cocoro-console` と `cocoro-website` は**ポート3000が競合**するため同時起動時は要注意
- `cocoro-installer` はDebian/Shell依存のため他OS環境でのテスト不可
- LLMプロバイダーは `LLM_PROVIDER=gemini` or `ollama` で切り替え可能

---

## cocoro-core 詳細

### テックスタック
| Component | Technology | Version |
|-----------|-----------|---------|
| Language | Python | 3.11 |
| API Framework | FastAPI | 0.109 |
| LLM (Cloud) | Google Gemini | 2.5 Flash |
| LLM (Local) | Ollama | - |
| Database | PostgreSQL + pgvector | 16 |
| Cache / Queue | Redis | 7 |
| Container | Docker Compose + Nginx | - |
| Test | pytest + pytest-asyncio | 231 tests (9 files) |

### 環境変数
```bash
# 設定ファイル: infra/docker/.env（.env.example からコピー）
LLM_PROVIDER=gemini           # or ollama
GEMINI_API_KEY=<key>          # 必須（Gemini使用時）
GEMINI_MODEL=gemini-2.0-flash
COCORO_API_KEY=<key>          # API認証キー（必須）
POSTGRES_PASSWORD=cocoro_secret
JWT_SECRET=<secret>           # 空=API Key認証
FORCE_HTTPS=false             # 本番はtrue
RATE_LIMIT_ENABLED=true
```

### よく使うコマンド
```bash
# 起動
cd infra/docker && docker compose up -d --build

# ヘルスチェック
curl http://localhost:8001/health

# 会話テスト
curl -X POST http://localhost:8001/chat \
  -H "Authorization: Bearer <COCORO_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"message": "こんにちは、自己紹介して"}'

# ダッシュボード
open http://localhost:8001/dashboard

# テスト（全件）
docker exec cocoro-core python -m pytest tests/ -v --tb=short

# テスト（カテゴリ別）
docker exec cocoro-core python -m pytest tests/test_e2e.py -v        # E2E (99)
docker exec cocoro-core python -m pytest tests/test_emotion.py -v    # Emotion (28)
docker exec cocoro-core python -m pytest tests/test_security.py -v   # Security (19)
docker exec cocoro-core python -m pytest tests/test_next_gen.py -v   # C-2〜C-8 (42)
```

### Function Calling ツール（10種）
`search_memory` / `create_task` / `get_org_status` / `search_learnings` /
`get_personality` / `get_current_time` / `web_search` / `add_schedule` /
`list_schedules` / `list_recent_tasks` + Plugins (math/time/format/random)

### ディレクトリ構成
```
cocoro-core/
├── api/           # FastAPI サーバー(131 endpoints) + セキュリティ + ダッシュボード
├── brain/         # LLM統合 / 思考エンジン / 判断エンジン / 計画 / ツール
├── personality/   # 人格エンジン(6要素) / 感情 / 成長 / クローン / 音声
├── memory/        # 短期(Redis) / 長期(PostgreSQL) / ベクトル(pgvector) / アーカイバ
├── evolution/     # 自己進化モジュール群
├── governance/    # 倫理チェック + ルール管理
├── agent/         # タスクルーター + ワーカー + 組織管理
├── infra/docker/  # Dockerfile / docker-compose.yml / nginx.conf / .env
├── tests/         # 231テスト (9ファイル)
└── docs/ARCHITECTURE.md
```

---

## cocoro-console 詳細

### テックスタック
| レイヤー | 技術 |
|---------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Style | Vanilla CSS（クリームテーマ）|
| Animation | Framer Motion |
| Markdown | react-markdown + remark-gfm |
| Database | SQLite (better-sqlite3) |
| Security | AES-256-GCM / Scrypt / Ed25519 / CSRF / Rate Limiting |

### 環境変数
```bash
# 設定ファイル: .env.local（.env.local.example からコピー）
COCORO_CORE_URL=http://192.168.50.92:8001
COCORO_CORE_API_KEY=<your-api-key>
COCORO_CORE_ENABLED=false   # false=モックモード（オフライン開発用）
```

### よく使うコマンド
```bash
npm install
npm run dev        # → http://localhost:3000
# 本番接続時は COCORO_CORE_ENABLED=true に変更して再起動
```

### cocoro-core 接続フロー
```
チャット入力
  → POST /api/chat/stream (SSE)
  → cocoro-core /auth/token (JWT取得・1時間キャッシュ)
  → cocoro-core /chat
  → SSE word-by-word streaming → ブラウザ
```

### 残タスク (P3)
- PIN/パスコード認証・Dockerコンテナ化
- E2Eテスト (Playwright) / ユニットテスト (Vitest) / CI/CD

---

## cocoro-website 詳細

### テックスタック
| レイヤー | 技術 |
|---------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Style | Tailwind CSS 4 |
| AI | OpenAI API（チャット・ストリーミング）|
| Database | PostgreSQL + Prisma |
| 認証 | JWT / NextAuth.js |

### cocoro-consoleとの違い
| | cocoro-console | cocoro-website |
|--|---------------|----------------|
| 用途 | ローカル管理UI | 公開SNS×AIプラットフォーム |
| ネットワーク | LAN内専用 | インターネット公開 |
| DB | SQLite | PostgreSQL + Prisma |
| 認証 | Ed25519デバイス認証 | JWT / NextAuth.js |
| AI連携 | cocoro-core直接 | OpenAI API + cocoro-core |

### 環境変数
```bash
# 設定ファイル: .env.local（.env.example からコピー）
OPENAI_API_KEY=<key>
DATABASE_URL=postgresql://...
JWT_SECRET=<secret>
NEXTAUTH_SECRET=<secret>
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=COCORO
NEXT_PUBLIC_APP_URL=https://...
```

### よく使うコマンド
```bash
npm install
cp .env.example .env.local
npm run dev     # → http://localhost:3000
npm run build
npm start
npm run lint
```

---

## cocoro-installer 詳細

### インストールフロー
```
USB ブート → GRUB 自動選択(3秒) → Debian 無人インストール
  → 再起動 → Docker + cocoro-core セットアップ → 完了（約20秒）
```

### 対象ハードウェア・ログイン情報
| 項目 | 値 |
|------|----|
| CPU | Intel N95 / RAM 8〜16GB / SSD 512GB NVMe |
| ホスト名 | `cocoro` / mDNS: `cocoro.local` |
| ユーザー | `cocoro-admin` / PW: `cocoro-factory-2026` |
| SSH | `ssh cocoro-admin@cocoro.local` |

### パーティション構成
| マウントポイント | サイズ | 用途 |
|----------------|--------|------|
| `/boot/efi` | 512MB | EFI |
| `/` | 50GB | ルートFS |
| `/var/lib/docker` | 100GB | Dockerイメージ |
| swap | 4GB | スワップ |
| `/data/cocoro` | 残り全部 | PostgreSQL / Redis 永続データ |

### よく使うコマンド
```bash
# ISO ビルド（WSL/Ubuntu）
sudo apt-get install -y xorriso isolinux rsync
./usb/build-iso.sh
# → output/cocoro-os-installer.iso

# USB に直接配置
./usb/deploy-to-usb.sh /mnt/d

# 検品確認（インストール後）
ssh cocoro-admin@cocoro.local
docker --version && systemctl status docker && df -h
cat /etc/cocoro-release
```

### 工場キッティング手順
1. `build-iso.sh` でISO生成
2. Rufus（GPT / UEFI / ISOイメージモード）でUSBに書き込み
3. miniPCにUSB挿入 → 電源ON → 自動完了（操作不要）
4. firstbootが約20秒でDockerをセットアップ
5. USBを抜いて梱包

---

## cocoro-docs 開発コマンド

```bash
# セットアップ
npm install

# ローカルプレビュー → http://localhost:3001
npm run start

# 本番ビルド（静的ファイル生成）
npm run build

# GitHub Pages へデプロイ（mainブランチpushで自動実行）
npm run deploy
```

### 重要
- **ポート 3001** を使用（cocoro-console / cocoro-website の 3000 と競合しない）
- `docs/` 配下の `.md` / `.mdx` ファイルを編集してコンテンツを追加
- APIリファレンスは cocoro-core の openapi.json から自動生成予定（Phase 2）
- GitHub Actions（`.github/workflows/deploy.yml`）で mainブランチpush → 自動デプロイ
- 公開 URL: `https://mdl-systems.github.io/cocoro-docs/`

---

## Antigravityワークスペース構成（推奨）

```
インスタンスA: cocoro-core        （コアエンジン開発）
インスタンスB: cocoro-console     （ローカル管理UI開発）
インスタンスC: cocoro-website     （SNSプラットフォーム開発）
インスタンスD: cocoro-installer   （デプロイ・キッティング）
インスタンスE: cocoro-docs        （ドキュメントサイト管理）
```

> 新repoが追加されたらインスタンスを追加し、このCLAUDE.mdを更新してください。

---

## 更新履歴

| 日付 | 更新内容 |
|------|---------|
| 2026-03-08 | 初版作成（repo名・説明文から推定） |
| 2026-03-08 | cocoro-installer / cocoro-core / cocoro-console / cocoro-website README反映 |
| 2026-03-08 | 未開発repoを整理・最終版に統合 |
| 2026-03-08 | cocoro-docs（Docusaurus 3）を開発済みrepoとして追加。docs開発コマンドセクション追加 |
