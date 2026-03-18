---
title: トラブルシューティング
sidebar_position: 1
description: Cocoro OS のよくある問題 TOP10 と解決方法。接続・シンクロ率・エージェントなどの問題を網羅。
---

# 🔧 トラブルシューティング

よくある問題 **TOP 10** とその解決方法です。

---

## 問題 1: cocoro-core に接続できない

### 症状

```bash
curl http://cocoro.local:8001/health
# curl: (7) Failed to connect to cocoro.local port 8001

# または
curl https://home.cocoro-os.com/api/health
# curl: (6) Could not resolve host
```

### 診断チャート

```
接続できない
    │
    ├─ LAN 内アクセスの場合
    │       ├─ cocoro.local が見つからない → 問題1-A
    │       └─ ポート 8001 に繋がらない   → 問題1-B
    │
    └─ 外部アクセス（Tunnel）の場合
            ├─ DNS が解決できない         → 問題1-C
            └─ 403 / 502 エラー           → 問題1-D
```

### 問題 1-A: cocoro.local が見つからない

```bash
# mDNS が動いているか確認
ssh cocoro-admin@192.168.x.xxx  # IP アドレスで接続
systemctl status avahi-daemon

# 停止していれば起動
sudo systemctl enable avahi-daemon
sudo systemctl start avahi-daemon
```

**Windows でのヒント:** iTunes がインストール済みであれば Bonjour が使えます。
動かない場合は IP アドレスで直接アクセスしてください。

### 問題 1-B: cocoro-core が起動していない

```bash
ssh cocoro-admin@cocoro.local

# Docker コンテナの状態確認
docker ps -a | grep cocoro

# ログを確認
docker logs cocoro-core --tail=50

# 再起動
cd /opt/cocoro/core/infra/docker
docker compose down
docker compose up -d --build
sleep 30
curl http://localhost:8001/health
```

**よくある原因:**

| 原因 | 確認方法 | 対処 |
|------|---------|------|
| Gemini API キーが無効 | `grep GEMINI_API_KEY .env` | API キーを更新 |
| PostgreSQL 未起動 | `docker ps | grep postgres` | `docker compose restart postgres` |
| ポート 8001 が競合 | `ss -tlnp | grep 8001` | 競合プロセスを停止 |
| メモリ不足 | `free -h` | 不要プロセスを停止 |

### 問題 1-C: 外部から DNS が解決できない

```bash
# DNS の確認
nslookup home.cocoro-os.com
# → "NXDOMAIN" の場合は DNS 設定が未完了

# Cloudflare Tunnel の状態確認
ssh cocoro-admin@cocoro.local
cloudflared tunnel info home
sudo systemctl status cloudflared
```

### 問題 1-D: 外部から 403 / 502 エラー

```
403: Cloudflare Access の認証に失敗
  → メールアドレスがポリシーに登録されているか確認

502: cocoro-core が起動していない
  → 問題 1-B の手順で再起動
```

---

## 問題 2: シンクロ率が NaN になる

### 症状

```bash
curl http://cocoro.local:8001/sync/rate \
  -H "Authorization: Bearer $COCORO_API_KEY"

# レスポンス
{
  "sync_rate": NaN,
  "error": "calculation_failed"
}

# または cocoro-console でシンクロ率が "NaN%" と表示される
```

### 原因と対処

```bash
ssh cocoro-admin@cocoro.local

# 1. pgvector が正常動作しているか確認
docker exec cocoro-postgres psql -U cocoro -c "
  SELECT COUNT(*) FROM memories WHERE vector IS NOT NULL;
"
# → 0 件の場合はベクトルが初期化されていない

# 2. sync_rate テーブルの確認
docker exec cocoro-postgres psql -U cocoro -c "
  SELECT * FROM sync_rate_history ORDER BY created_at DESC LIMIT 5;
"

# 3. シンクロ率の再計算を強制実行
curl -X POST http://cocoro.local:8001/sync/recalculate \
  -H "Authorization: Bearer $COCORO_API_KEY"

# 4. それでも直らない場合は初期化
curl -X POST http://cocoro.local:8001/sync/reset \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"confirm": true, "keep_memories": true}'
```

### Boot Wizard 未完了が原因の場合

```bash
# Boot Wizard の状態確認
curl http://cocoro.local:8001/setup/status \
  -H "Authorization: Bearer $COCORO_API_KEY"

# "completed": false の場合は Boot Wizard を完走させる
# → http://cocoro.local:3000 にアクセスして Boot Wizard を完了
```

---

## 問題 3: エージェント（agent）がオフラインになる

### 症状

```bash
curl http://cocoro.local:8001/org/status \
  -H "Authorization: Bearer $COCORO_API_KEY"

# レスポンス
{
  "agents": [
    {
      "id": "research_worker",
      "status": "offline",    ← ここがオフライン
      "last_heartbeat": "2026-03-18T10:00:00+09:00"
    }
  ]
}

# または POST /agent/run で
{
  "error": "No available workers"
}
```

### 診断と対処

```bash
# 1. エージェントのログ確認
docker logs cocoro-core 2>&1 | grep -i "agent\|worker\|offline" | tail -30

# 2. タスクキュー（Redis）の確認
docker exec cocoro-redis redis-cli LLEN task_queue
# → 大量のタスクが溜まっている場合はキューをクリア

# 3. キューのクリア（緊急時）
docker exec cocoro-redis redis-cli DEL task_queue

# 4. cocoro-core を再起動してエージェントを再起動
docker compose restart cocoro-core
sleep 30

# 5. 状態確認
curl http://cocoro.local:8001/org/status \
  -H "Authorization: Bearer $COCORO_API_KEY"
```

**複数ノード構成の場合:**

```bash
# セカンダリノードがオフラインになっている場合
curl http://cocoro.local:8001/nodes \
  -H "Authorization: Bearer $COCORO_API_KEY"

# status が "unhealthy" のノードに SSH 接続して確認
ssh cocoro-admin@192.168.x.xxx  # セカンダリノードの IP
docker logs cocoro-core --tail=30
docker compose restart cocoro-core
```

---

## 問題 4: チャットがタイムアウトする

### 症状

チャットを送信しても応答がない / 非常に遅い。

### 対処

```bash
# Gemini API の疎通確認
curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY" \
  | python3 -m json.tool | head -5

# インターネット接続確認
ping -c 3 8.8.8.8

# Ollama に切り替える（オフライン・低速時）
# .env の LLM_PROVIDER を ollama に変更して再起動
```

---

## 問題 5: 認証エラー（401 Unauthorized）

```bash
# API キーを確認
grep COCORO_API_KEY /opt/cocoro/core/infra/docker/.env

# テスト
curl http://cocoro.local:8001/health \
  -H "Authorization: Bearer <確認したキー>"
```

---

## 問題 6: シンクロ率が全然上がらない

### 対処

1. **日常的な会話をする**（汎用的な質問より個人的な話が効果的）
2. **Boot Wizard の回答を充実させる**（再設定も可）
3. **毎日使う**（週1回では上昇が非常に遅い）

```bash
# 記憶が正常に保存されているか確認（0件は異常）
curl http://cocoro.local:8001/memory/stats \
  -H "Authorization: Bearer $COCORO_API_KEY"
```

---

## 問題 7: Cloudflare Tunnel が切断される

```bash
# cloudflared サービスの確認
sudo systemctl status cloudflared

# ログで切断原因を確認
sudo journalctl -u cloudflared -n 50 --no-pager | grep -i "error\|disconnect\|reconnect"

# 再起動
sudo systemctl restart cloudflared
```

---

## 問題 8: Boot Wizard がループする

```bash
# 状態確認
curl http://cocoro.local:8001/setup/status \
  -H "Authorization: Bearer $COCORO_API_KEY"

# リセット
curl -X POST http://cocoro.local:8001/setup/reset \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"confirm": true}'

docker compose restart cocoro-core
```

---

## 問題 9: ディスク容量が不足

```bash
# 使用量確認
df -h

# 記憶のアーカイブ（古い低重要度記憶を削除）
curl -X POST http://cocoro.local:8001/memory/archive \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"older_than_days": 180, "min_importance_to_keep": 0.5}'

# Docker のクリーンアップ
docker system prune -f
docker volume prune -f
```

---

## 問題 10: レートリミットに当たる（429）

```bash
# .env でレートリミットを調整
sudo nano /opt/cocoro/core/infra/docker/.env

# 追加・変更
RATE_LIMIT_CHAT_PER_MINUTE=120    # デフォルト: 60
RATE_LIMIT_API_PER_MINUTE=300     # デフォルト: 120

docker compose restart cocoro-core
```

---

## ログの一括収集（サポート用）

問題が解決しない場合、以下でデバッグ情報を収集して問い合わせてください：

```bash
# デバッグ情報の一括収集
docker logs cocoro-core > /tmp/core.log 2>&1
docker logs cocoro-postgres --tail=50 > /tmp/postgres.log 2>&1
sudo journalctl -u cloudflared -n 100 > /tmp/tunnel.log 2>&1
docker inspect cocoro-core > /tmp/inspect.log
cat /opt/cocoro/core/infra/docker/.env \
  | sed 's/=.*/=REDACTED/' > /tmp/env_masked.log
{
  echo "OS: $(uname -a)"
  echo "Docker: $(docker --version)"
  echo "Memory: $(free -h)"
  echo "Disk: $(df -h)"
  echo "Date: $(date)"
} > /tmp/system.log

tar -czf /tmp/cocoro_debug.tar.gz /tmp/*.log
echo "📦 デバッグファイル: /tmp/cocoro_debug.tar.gz"
```

**問い合わせ先:**
- GitHub Issues: [github.com/mdl-systems/cocoro-core/issues](https://github.com/mdl-systems/cocoro-core/issues)
- デバッグファイルを添付すると解決が早まります
