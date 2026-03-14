---
title: 複数ノード構成
sidebar_position: 5
description: 2台目のminiPCを追加して専門職ノードを構成する方法。ノード間通信の仕組みと設定手順を解説。
---

# 🌐 複数ノード構成

2台目以降の miniPC を追加して、**専門職ノード**として機能させることができます。
例えば「リサーチ専用ノード」「スケジュール管理専用ノード」として役割分担が可能です。

---

## なぜ複数ノードが必要か

1台の miniPC でも十分に動作しますが、以下の場合に複数ノードが有効です：

| 課題 | 複数ノードによる解決 |
|------|----------------|
| 同時に多くのエージェントタスクを実行したい | タスクを複数ノードに分散 |
| 一部の処理を高スペックマシンで行いたい | 役割に応じたスペック割当 |
| 障害時のフェイルオーバーを確保したい | プライマリ / セカンダリ冗長化 |
| Ollama（ローカルLLM）を専用マシンで動かしたい | GPU ノードの追加 |

---

## ネットワーク構成

```
[ LAN 192.168.1.0/24 ]

┌──────────────────────────────────────────────────────────────┐
│  プライマリノード (cocoro.local / 192.168.1.100)              │
│  cocoro-core :8001                                           │
│  cocoro-console :3000                                        │
│  役割: 会話・記憶・人格の中枢                                   │
└─────────────────────┬────────────────────────────────────────┘
                      │ HTTP / cocoro-network プロトコル
          ┌───────────┴──────────┐
          ▼                      ▼
┌──────────────────┐   ┌──────────────────┐
│  リサーチノード   │   │  スケジュールノード │
│  cocoro-node2    │   │  cocoro-node3     │
│  :8001           │   │  :8001           │
│  役割: Web検索   │   │  役割: タスク管理  │
│       情報収集   │   │       予定管理    │
└──────────────────┘   └──────────────────┘
```

---

## 2台目の miniPC を追加する手順

### Step 1: 2台目に cocoro-core をインストール

通常のインストール手順と同様に cocoro-installer を使用します。

```bash
# 2台目のホスト名を変更して識別しやすくする
# （cocoro-installer 実行後に設定）
ssh cocoro-admin@cocoro.local  # デフォルトのホスト名で接続
sudo hostnamectl set-hostname cocoro-node2
sudo nano /etc/hosts  # 127.0.1.1 を cocoro-node2 に変更
```

### Step 2: ノードの役割を設定

```bash
# cocoro-node2 の .env を設定
ssh cocoro-admin@cocoro-node2.local
sudo nano /opt/cocoro/core/infra/docker/.env
```

```bash
# cocoro-node2 の .env
NODE_ROLE=specialist          # デフォルト: primary
NODE_SPECIALIZATION=research  # 専門分野: research / schedule / analysis / custom
PRIMARY_NODE_URL=http://192.168.1.100:8001  # プライマリノードのアドレス
NODE_API_KEY=<同じAPIキーまたは専用キー>

# リサーチ特化の設定
AGENT_MAX_CONCURRENT_TASKS=5  # 同時タスク数を増やす
WEB_SEARCH_ENABLED=true
MEMORY_SYNC_TARGET=http://192.168.1.100:8001  # 記憶はプライマリに集約
```

### Step 3: プライマリノードにノードを登録

```bash
# プライマリノードから
curl -X POST http://cocoro.local:8001/nodes/register \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "node_id": "node2",
    "name": "リサーチノード",
    "url": "http://192.168.1.101:8001",
    "role": "specialist",
    "specialization": "research",
    "api_key": "<node2のAPIキー>"
  }'
```

```json
{
  "status": "success",
  "node_id": "node2",
  "connection_test": "passed",
  "message": "ノードを登録しました"
}
```

### Step 4: 動作確認

```bash
# ノード一覧を確認
curl http://cocoro.local:8001/nodes \
  -H "Authorization: Bearer $COCORO_API_KEY"

{
  "nodes": [
    {
      "node_id": "primary",
      "name": "プライマリノード",
      "url": "http://192.168.1.100:8001",
      "status": "healthy",
      "role": "primary",
      "specialization": "general"
    },
    {
      "node_id": "node2",
      "name": "リサーチノード",
      "url": "http://192.168.1.101:8001",
      "status": "healthy",
      "role": "specialist",
      "specialization": "research"
    }
  ],
  "total": 2
}
```

---

## タスクのノード振り分け

プライマリノードが自動的にタスクを適切なノードに振り分けます：

```
ユーザー: 「今週のAIニュースを調べてまとめて」

プライマリノード:
  タスクタイプ判定: research
  利用可能ノード確認...
  → node2（リサーチノード）が最適
  → node2 に転送

node2（リサーチノード）:
  [web_search] "AIニュース 2026年3月"...
  [analyze] ...
  → 結果をプライマリに返却

プライマリノード:
  結果をユーザーに返答
  → 会話記憶に保存
```

---

## ノード間通信の仕組み

```
プライマリノード → スペシャリストノード: タスク委譲（HTTP POST）
スペシャリストノード → プライマリノード: 結果返却（HTTP POST）
スペシャリストノード → プライマリノード: 記憶同期（WebSocket / 定期 POST）
```

### 記憶の同期

デフォルトでは、スペシャリストノードで生成された記憶は 5 分ごとにプライマリノードに同期されます：

```bash
# 同期設定（specialist ノードの .env）
MEMORY_SYNC_ENABLED=true
MEMORY_SYNC_INTERVAL_SEC=300  # 5分ごと
MEMORY_SYNC_TARGET=http://192.168.1.100:8001
```

---

## 専門職ノードの設定例

### 構成例 1: リサーチ + スケジュール の 3 台構成

```
プライマリ (cocoro):       会話・人格・記憶の中枢
リサーチノード (cocoro-r): Web検索・情報収集に特化
スケジュールノード (cocoro-s): タスク・予定管理に特化
```

### 構成例 2: GPU ノードを追加（Ollama 用）

```
プライマリ (N95 miniPC):    会話・記憶・タスク管理
GPU ノード (NVIDIA GPU PC): Ollama でローカル LLM 推論に特化
```

```bash
# GPU ノードの .env
NODE_ROLE=llm_provider
LLM_PROVIDER=ollama
OLLAMA_HOST=localhost
OLLAMA_MODEL=llama3.1:70b  # 70B モデルを高速推論
```

---

## フェイルオーバー

スペシャリストノードがダウンした場合、プライマリノードが自動的にタスクを引き継ぎます：

```bash
# フェイルオーバー設定（プライマリの .env）
NODE_HEALTH_CHECK_INTERVAL_SEC=30  # 30秒ごとにヘルスチェック
NODE_FAILOVER_ENABLED=true
```

---

## Cloudflare Tunnel との組み合わせ

複数ノード構成と Cloudflare Tunnel を組み合わせると、外出先から全ノードにアクセスできます：

→ [Cloudflare Tunnel ガイド](./cloudflare-tunnel)

---

## よくある問題

| 症状 | 原因 | 対処 |
|------|------|------|
| ノードが登録できない | ファイアウォール | `ufw allow 8001` を両ノードで実行 |
| タスクが振り分けられない | NODE_ROLE の設定ミス | `NODE_ROLE=specialist` を確認 |
| 記憶が同期されない | MEMORY_SYNC_TARGET の URL ミス | プライマリの IP アドレスを確認 |
| ノードのステータスが unhealthy | ネットワーク疎通不能 | `ping <ノードIP>` で確認 |
