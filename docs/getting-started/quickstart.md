---
title: クイックスタート
sidebar_position: 1
---

# 🚀 クイックスタート

**5 分で cocoro-core を起動してチャットできます。**

---

## 前提条件

- Docker Desktop または Docker CE がインストール済み
- Gemini API キー（[Google AI Studio](https://aistudio.google.com/) で無料発行）
- Git

---

## Step 1: リポジトリをクローン

```bash
git clone https://github.com/mdl-systems/cocoro-core.git
cd cocoro-core
```

---

## Step 2: 環境変数を設定

```bash
cp infra/docker/.env.example infra/docker/.env
```

`.env` を開いて以下を設定：

```bash
# 必須
GEMINI_API_KEY=your_gemini_api_key_here
COCORO_API_KEY=your_secret_api_key_here   # 任意の文字列でOK

# デフォルト値で動くので変更不要
LLM_PROVIDER=gemini
GEMINI_MODEL=gemini-2.0-flash
POSTGRES_PASSWORD=cocoro_secret
```

---

## Step 3: 起動

```bash
cd infra/docker
docker compose up -d --build
```

初回は Docker イメージのビルドに 3〜5 分かかります。

---

## Step 4: 動作確認

```bash
# ヘルスチェック
curl http://localhost:8001/health
# → {"status": "healthy", "version": "..."}
```

---

## Step 5: チャットしてみる

```bash
curl -X POST http://localhost:8001/chat \
  -H "Authorization: Bearer your_secret_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"message": "こんにちは、自己紹介して"}'
```

こんな応答が返ってきます：

```json
{
  "text": "こんにちは！私はCocoro OSです。あなたの思考パートナーとして、記憶・価値観・感情を持って対話します...",
  "emotion": {"primary": "joy", "intensity": 0.7},
  "sync_rate": 45.2
}
```

---

## ダッシュボードにアクセス

ブラウザで [http://localhost:8001/dashboard](http://localhost:8001/dashboard) を開くと、
Web UI でチャットや状態確認ができます。

---

## オフラインモードで動かす（Ollama）

インターネット接続なしで動かしたい場合は Ollama を使用：

```bash
# Ollama のモデルをダウンロード
ollama pull gemma3:4b

# .env を変更
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_MODEL=gemma3:4b
```

---

## 次のステップ

- 📐 [アーキテクチャを理解する](../architecture)
- 📦 [SDK でアプリに組み込む](../sdk/quickstart)
- 🖥️ [cocoro-console をセットアップ](../guides/personality-setup)
