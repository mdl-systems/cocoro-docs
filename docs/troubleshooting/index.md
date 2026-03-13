---
title: トラブルシューティング
sidebar_position: 1
---

# 🔧 トラブルシューティング

よくある問題と解決方法をまとめています。

---

## 🐳 Docker / 起動の問題

### cocoro-core が起動しない

```bash
# ログ確認
cd cocoro-core/infra/docker
docker compose logs cocoro-core --tail=50

# コンテナ状態確認
docker compose ps
```

**原因と対処：**

| エラー | 原因 | 対処 |
|--------|------|------|
| `GEMINI_API_KEY not set` | 環境変数未設定 | `.env` に `GEMINI_API_KEY=...` を追加 |
| `PostgreSQL connection failed` | DB 未起動 | `docker compose up -d postgres` |
| `Redis connection refused` | Redis 未起動 | `docker compose up -d redis` |
| `Port 8001 already in use` | ポート競合 | `sudo lsof -i :8001` で確認、プロセスを停止 |

### Docker コンテナが再起動を繰り返す

```bash
docker compose logs cocoro-core --tail=100 --follow
```

`Exit Code 1` の場合は Python の依存関係エラーの可能性：

```bash
docker compose exec cocoro-core pip install -r requirements.txt
docker compose restart cocoro-core
```

---

## 🔐 認証の問題

### API Key が通らない（401 エラー）

```bash
# API Key の確認
cat cocoro-core/infra/docker/.env | grep COCORO_API_KEY

# テスト
curl -v http://localhost:8001/health \
  -H "Authorization: Bearer YOUR_KEY"
```

- `Authorization: Bearer` の形式になっているか確認
- `.env` と実際のリクエストでキーが一致しているか確認

### JWT トークンの有効期限切れ

```
{"code": "TOKEN_EXPIRED", "message": "..."}
```

JWT は **1時間**で失効します。再取得:

```bash
curl -X POST http://localhost:8001/auth/token \
  -H "Content-Type: application/json" \
  -d '{"api_key": "YOUR_API_KEY"}'
```

---

## 🤖 LLM の問題

### Gemini が応答しない

```bash
# LLM 接続確認
curl http://localhost:8001/health | jq '.llm_status'
# → "connected" でなければ問題あり
```

対処：
1. `GEMINI_API_KEY` が正しいか確認（Google AI Studio で再発行）
2. `GEMINI_MODEL=gemini-2.0-flash` が設定されているか確認
3. Gemini API の利用制限（レート制限）に達していないか確認

### Ollama に切り替えて動作確認

```bash
# インフラ/.env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma3:4b

# Ollama のインストール
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull gemma3:4b

docker compose restart cocoro-core
```

---

## 💬 チャットの問題

### 返答が遅い（5秒以上かかる）

原因 1: **メモリ検索が遅い**（pgvector インデックス未作成）

```sql
-- PostgreSQL に接続して確認
docker compose exec postgres psql -U postgres -d cocoro \
  -c "SELECT * FROM pg_indexes WHERE tablename='memories';"

-- インデックスがなければ作成
docker compose exec postgres psql -U postgres -d cocoro \
  -c "CREATE INDEX ON memories USING ivfflat (embedding vector_cosine_ops);"
```

原因 2: **LLM モデルが重すぎる**

```bash
# 軽量モデルに切り替え
GEMINI_MODEL=gemini-2.0-flash  # flash は最速
```

### 返答が一般的すぎる（シンクロ率が低い）

シンクロ率が低い初期状態では一般的な返答になります。
→ [シンクロ率・成長システム](../concepts/sync-rate) を参照

---

## 🗄️ データベースの問題

### PostgreSQL に接続できない

```bash
docker compose exec postgres pg_isready -U postgres
# → "accepting connections" であれば正常

# 接続テスト
docker compose exec postgres psql -U postgres -d cocoro -c "SELECT 1;"
```

### データのバックアップ

```bash
# PostgreSQL バックアップ
docker compose exec postgres pg_dump -U postgres cocoro > backup_$(date +%Y%m%d).sql

# リストア
docker compose exec -T postgres psql -U postgres cocoro < backup_20260313.sql
```

### Redis がデータを失う

`Redis` はデフォルトで揮発性です。重要なデータは PostgreSQL に保存されます。  
Redis が再起動してもセッションが切れるだけで、長期メモリは失われません。

---

## 🌐 ネットワークの問題

### `cocoro.local` にアクセスできない

```bash
# mDNS の確認（Windows から）
ping cocoro.local

# 直接 IP で試す
ping 192.168.1.100  # miniPC の IP アドレス
```

Windows で mDNS が使えない場合：

```
C:\Windows\System32\drivers\etc\hosts に追加:
192.168.1.100  cocoro.local
```

### Cloudflare Tunnel が切断される

```bash
sudo systemctl status cloudflared
sudo journalctl -u cloudflared -f
```

`cloudflared` サービスが落ちている場合：

```bash
sudo systemctl restart cloudflared
```

---

## 🆘 それでも解決しない場合

1. **ログを全部確認:** `docker compose logs --tail=200`
2. **コンテナを完全リセット:** `docker compose down -v && docker compose up -d --build`
3. **GitHub Issues:** [github.com/mdl-systems/cocoro-core/issues](https://github.com/mdl-systems/cocoro-core/issues)
