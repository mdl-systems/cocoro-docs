---
title: ノードネットワーク
sidebar_position: 4
---

# 🌐 ノードネットワーク

複数の miniPC（ノード）を連携させることで、Cocoro OS を**分散・冗長化**できます。

:::info 開発状況
ノードネットワーク機能（`cocoro-node` / `cocoro-network`）は現在開発計画段階です。
このページは設計仕様を記載しています。
:::

---

## シングルノード vs マルチノード

### シングルノード（現在の標準構成）

```
┌─────────────────────────────────┐
│         miniPC（N95）            │
│                                  │
│  cocoro-core (:8001)            │
│  cocoro-console (:3000)         │
│  PostgreSQL + Redis + pgvector  │
└─────────────────────────────────┘
        │ LAN
        ▼
    スマートフォン / PC（ブラウザ）
```

### マルチノード（将来構成）

```
                  [ マスターノード ]
                  miniPC-A (N95)
                  ┌──────────────┐
                  │ cocoro-core  │ ← メイン人格・記憶
                  │ PostgreSQL   │
                  │ Redis        │
                  └──────┬───────┘
                         │ cocoro-network (P2P)
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    [ Worker Node ]  [ Worker Node ] [ Archive Node ]
    miniPC-B         miniPC-C        miniPC-D
    エージェント実行  エージェント実行  長期メモリ専用
```

---

## ノード役割の分類

| ロール | 説明 | 必要スペック |
|--------|------|------------|
| **Master** | メイン人格・判断・API Gateway | RAM 16GB 推奨 |
| **Worker** | タスク実行・エージェント並列処理 | RAM 8GB |
| **Archive** | 長期メモリ・ベクトル DB 専用 | SSD 優先 |
| **Edge** | IoT デバイス・センサー連携 | Raspberry Pi 等 |

---

## ノード間通信（設計仕様）

```
プロトコル: WebSocket / gRPC（検討中）
認証:       Ed25519 公開鍵ペア（ノード固有）
暗号化:     TLS 1.3
ディスカバリ: mDNS + Zeroconf（LAN 内自動検出）
```

---

## 現在できること（シングルノードでの分散）

マルチノード機能がリリースされるまでは、**Cloudflare Tunnel** を使って外部アクセスを実現できます：

```
Internet
  │
  ▼
Cloudflare Edge（cloudflared）
  │ トンネル
  ▼
LAN 内 miniPC
  └── cocoro-core (:8001)
  └── cocoro-console (:3000)
```

→ 設定方法は **[Cloudflare Tunnel の設定](../guides/cloudflare-tunnel)** を参照

---

## 複数 miniPC を今すぐ活用する方法

現時点では **役割分割**で擬似的に複数ノードを運用できます：

```
miniPC-A: cocoro-core（メイン） + PostgreSQL + Redis
miniPC-B: cocoro-console（管理UI）のみ → miniPC-A に接続
miniPC-C: cocoro-website（公開サイト）のみ → miniPC-A に接続
```

→ 手順は **[複数 miniPC の連携](../guides/multi-node)** を参照
