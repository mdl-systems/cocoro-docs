---
title: トラブルシューティング
sidebar_position: 1
description: Cocoro OS のよくある問題 TOP10 と解決方法。セットアップ・チャット・API・エージェント・記憶に関する問題を網羅。
---

# 🔧 トラブルシューティング

よくある問題 **TOP 10** とその解決方法をまとめています。

---

## 問題 1: cocoro-core が起動しない

### 症状

```bash
curl http://cocoro.local:8001/health
# curl: (7) Failed to connect to cocoro.local port 8001
```

### 診断

```bash
ssh cocoro-admin@cocoro.local

# Docker コンテナの状態確認
docker ps -a

# cocoro-core のログを確認
docker logs cocoro-core --tail=50
```

### よくある原因と対処

| 原因 | 対処 |
|------|------|
| Gemini API キーが無効 | `.env` の `GEMINI_API_KEY` を確認 |
| PostgreSQL が起動していない | `docker compose restart postgres` |
| ポート 8001 が競合 | `ss -tlnp \| grep 8001` で確認 |
| Docker が起動していない | `sudo systemctl start docker` |
| メモリ不足 | `free -h` で確認（8GB 以上推奨）|

### 解決手順

```bash
cd /opt/cocoro/core/infra/docker

# .env の API キーを確認
grep GEMINI_API_KEY .env

# コンテナを再起動
docker compose down
docker compose up -d --build

# 30秒待ってから確認
sleep 30
curl http://localhost:8001/health
```

---

## 問題 2: `cocoro.local` が見つからない

### 症状

```
ping cocoro.local
# ping: cocoro.local: Name or service not known
```

### 原因

mDNS（Bonjour/Avahi）が正しく設定されていない、またはクライアント側で対応していない。

### 対処

```bash
# miniPC 側で mDNS が動いているか確認
ssh cocoro-admin@192.168.x.xxx  # IP アドレスで接続
systemctl status avahi-daemon

# 停止していれば起動
sudo systemctl enable avahi-daemon
sudo systemctl start avahi-daemon
```

**Windows でのmDNS 対応:**

- Windows 10/11 は標準で mDNS 対応
- Bonjour（iTunes インストール済みなら含まれる）が必要な場合あり
- 動かない場合は IP アドレスで直接アクセス

---

## 問題 3: チャットが応答しない・タイムアウトする

### 症状

```bash
curl -X POST http://cocoro.local:8001/chat ...
# タイムアウト or 長時間応答なし
```

### 診断

```bash
# Gemini API の疎通確認
curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY" | head -20

# Redis が動いているか
docker exec cocoro-core redis-cli ping
# → PONG が返れば OK

# PostgreSQL が動いているか
docker exec cocoro-postgres pg_isready
```

### よくある原因と対処

| 原因 | 対処 |
|------|------|
| Gemini API の制限に当たっている | 少し待つ（無料枠の制限）|
| インターネット接続なし | `ping 8.8.8.8` で確認 |
| Redis 接続エラー | `docker compose restart redis` |
| メモリ不足で LLM が遅い | Ollama に切り替え or RAM 増設 |

---

## 問題 4: シンクロ率が全然上がらない

### 症状

1週間使っても 10% 以下のまま。

### 診断

```bash
curl http://cocoro.local:8001/sync/rate \
  -H "Authorization: Bearer $COCORO_API_KEY"

# 記憶が保存されているか確認
curl http://cocoro.local:8001/memory/stats \
  -H "Authorization: Bearer $COCORO_API_KEY"
```

### 対処

1. **汎用的な質問（天気・ニュース）だけでなく個人的な話をする**
2. **Boot Wizard の初期インプットを充実させる**（再設定も可）
3. 毎日会話を続ける（1週間に1回では上昇が遅い）
4. 記憶が 0 件の場合は記憶システムのエラーを確認

```bash
# 記憶システムのヘルスチェック
curl http://cocoro.local:8001/health \
  -H "Authorization: Bearer $COCORO_API_KEY"
# → "memory_system": "healthy" になっているか確認
```

---

## 問題 5: エージェントタスクが失敗する

### 症状

```json
{
  "status": "failed",
  "error": "web_search tool failed"
}
```

### 診断

```bash
# エージェントのログを確認
docker logs cocoro-core 2>&1 | grep -i "agent\|task\|error" | tail -30
```

### よくある原因と対処

| エラー | 原因 | 対処 |
|-------|------|------|
| `web_search failed` | インターネット接続なし | `ping 8.8.8.8` で確認 |
| `memory_search failed` | pgvector エラー | `docker compose restart postgres` |
| `task timeout` | タスクが複雑すぎる | 指示を具体的に絞り込む |
| `agent queue full` | 同時タスクが多すぎる | 前のタスクが完了するまで待つ |

---

## 問題 6: 認証エラー（401 Unauthorized）

### 症状

```json
{"error": {"code": "UNAUTHORIZED", "message": "Invalid API key"}}
```

### 対処

```bash
# API キーを確認
ssh cocoro-admin@cocoro.local
cat /opt/cocoro/core/infra/docker/.env | grep COCORO_API_KEY

# .env.local（cocoro-console 側）も確認
cat ~/.env.local | grep COCORO_CORE_API_KEY

# テスト
curl http://cocoro.local:8001/health \
  -H "Authorization: Bearer <確認したAPIキー>"
```

---

## 問題 7: レートリミットに当たる（429 Too Many Requests）

### 症状

```json
{"error": {"code": "RATE_LIMITED"}, "Retry-After": 30}
```

### 対処

```bash
# レートリミットの現在設定を確認
curl http://cocoro.local:8001/system/config \
  -H "Authorization: Bearer $COCORO_API_KEY" | grep rate_limit

# .env でレートリミットを調整（ローカル環境なら緩和可）
RATE_LIMIT_CHAT_PER_MINUTE=120    # デフォルト: 60
RATE_LIMIT_API_PER_MINUTE=300     # デフォルト: 120
```

---

## 問題 8: ディスク容量が不足してきた

### 症状

```bash
df -h
# /data/cocoro が 90% 以上
```

### 診断 & 対処

```bash
# 記憶のアーカイブ実行（古い低重要度記憶を削除）
curl -X POST http://cocoro.local:8001/memory/archive \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"older_than_days": 180, "min_importance_to_keep": 0.5}'

# Docker のクリーンアップ
docker system prune -f
docker volume prune -f

# PostgreSQL の容量確認
docker exec cocoro-postgres psql -U cocoro -c "
  SELECT pg_size_pretty(pg_total_relation_size('memories')) AS memories_size;
"
```

---

## 問題 9: cocoro-console が起動しない（Next.js エラー）

### 症状

```
Error: ENOENT: no such file or directory, '.env.local'
```

### 対処

```bash
cd /path/to/cocoro-console

# .env.local を作成
cp .env.local.example .env.local
nano .env.local

# 必須設定
COCORO_CORE_URL=http://192.168.x.xxx:8001
COCORO_CORE_API_KEY=<your_api_key>
COCORO_CORE_ENABLED=true

# 再起動
npm run dev
```

---

## 問題 10: Boot Wizard が完了しない・ループする

### 症状

Boot Wizard の途中で止まる、または完了後もまた Boot Wizard が表示される。

### 診断

```bash
# Boot Wizard の状態確認
curl http://cocoro.local:8001/setup/status \
  -H "Authorization: Bearer $COCORO_API_KEY"

# ログで原因確認
docker logs cocoro-core 2>&1 | grep -i "setup\|wizard" | tail -20
```

### 対処

```bash
# Boot Wizard の状態をリセット
curl -X POST http://cocoro.local:8001/setup/reset \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"confirm": true}'

# または cocoro-core を再起動
docker compose restart cocoro-core

# 30秒後に再度 http://cocoro.local:3000 にアクセス
```

---

## ログの確認方法まとめ

```bash
# cocoro-core のログ（全件）
docker logs cocoro-core -f

# エラーのみ抽出
docker logs cocoro-core 2>&1 | grep -i error

# 特定コンポーネントのログ
docker logs cocoro-core 2>&1 | grep -i "memory\|emotion\|agent"

# PostgreSQL のログ
docker logs cocoro-postgres --tail=30

# Redis のログ
docker logs cocoro-redis --tail=20
```

---

## まだ解決しない場合

1. **GitHub Issues** に報告: [github.com/mdl-systems/cocoro-core/issues](https://github.com/mdl-systems/cocoro-core/issues)
2. `docker logs cocoro-core > cocoro_debug.log 2>&1` でログを添付

```bash
# デバッグ情報の一括収集
docker logs cocoro-core > /tmp/core.log 2>&1
docker inspect cocoro-core > /tmp/inspect.log
cat /opt/cocoro/core/infra/docker/.env | sed 's/=.*/=REDACTED/' > /tmp/env_masked.log
echo "OS: $(uname -a)" >> /tmp/system.log
echo "Docker: $(docker --version)" >> /tmp/system.log
echo "Memory: $(free -h)" >> /tmp/system.log
echo "Disk: $(df -h)" >> /tmp/system.log
tar -czf /tmp/cocoro_debug.tar.gz /tmp/*.log
echo "デバッグファイル: /tmp/cocoro_debug.tar.gz"
```
