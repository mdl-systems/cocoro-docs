---
title: 環境変数・設定
sidebar_position: 3
---

# ⚙️ 環境変数・設定

---

## cocoro-core

設定ファイル: `infra/docker/.env`（`.env.example` からコピー）

```bash
# ===== LLM プロバイダー =====
LLM_PROVIDER=gemini           # gemini | ollama

# ===== Gemini（クラウド）=====
GEMINI_API_KEY=your_key       # 必須（Gemini 使用時）
GEMINI_MODEL=gemini-2.0-flash

# ===== Ollama（ローカル）=====
# OLLAMA_BASE_URL=http://host.docker.internal:11434
# OLLAMA_MODEL=gemma3:4b

# ===== API 認証 =====
COCORO_API_KEY=your_secret    # 必須（任意の文字列）
JWT_SECRET=                   # 空 = API Key 認証のみ

# ===== データベース =====
POSTGRES_PASSWORD=cocoro_secret
POSTGRES_DB=cocoro
REDIS_URL=redis://redis:6379

# ===== セキュリティ =====
FORCE_HTTPS=false             # 本番環境では true に
RATE_LIMIT_ENABLED=true
ALLOWED_ORIGINS=*             # 本番環境では明示的に指定
```

---

## cocoro-console

設定ファイル: `.env.local`（`.env.local.example` からコピー）

```bash
# cocoro-core への接続
COCORO_CORE_URL=http://192.168.50.92:8001   # miniPC の IP アドレス
COCORO_CORE_API_KEY=your_cocoro_api_key

# false = モックモード（cocoro-core なしで開発可能）
COCORO_CORE_ENABLED=false
```

:::tip オフライン開発
`COCORO_CORE_ENABLED=false` に設定すると、cocoro-core を起動せずに  
cocoro-console の UI 開発ができます。
:::

---

## cocoro-website

設定ファイル: `.env.local`（`.env.example` からコピー）

```bash
# AI
OPENAI_API_KEY=your_openai_key

# データベース
DATABASE_URL=postgresql://user:pass@localhost:5432/cocoro_web

# 認証
JWT_SECRET=your_jwt_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# アプリ設定
NEXT_PUBLIC_APP_NAME=COCORO
NEXT_PUBLIC_APP_URL=https://your-domain.com
```
