---
title: 複数 miniPC の連携
sidebar_position: 5
---

# 🖥️🖥️ 複数 miniPC の連携

複数の miniPC を役割分担させることで、負荷分散・機能分割が可能です。

:::info 正式なクラスタ機能について
`cocoro-node` による本格的なマルチノード機能は開発計画中です。
このページは現時点で実現可能な構成を説明します。
:::

---

## 構成パターン A：コア分離型（推奨）

```
LAN: 192.168.1.0/24

miniPC-A (192.168.1.100)
├── cocoro-core       :8001  ← AIエンジン
├── PostgreSQL        :5432
└── Redis             :6379

miniPC-B (192.168.1.101)
└── cocoro-console    :3000  ← 管理UI（miniPC-Aに接続）

miniPC-C (192.168.1.102)
└── cocoro-website    :3000  ← 公開サイト（miniPC-Aに接続）
```

### miniPC-B の設定（cocoro-console）

```bash
# .env.local
COCORO_CORE_URL=http://192.168.1.100:8001
COCORO_CORE_API_KEY=your_api_key
COCORO_CORE_ENABLED=true
```

### miniPC-C の設定（cocoro-website）

```bash
# .env.local
COCORO_CORE_URL=http://192.168.1.100:8001
OPENAI_API_KEY=your_key
DATABASE_URL=postgresql://...
```

---

## 構成パターン B：バックアップ型

```
miniPC-A (メインノード)
├── cocoro-core       :8001
├── PostgreSQL        :5432
└── Redis             :6379

miniPC-B (バックアップノード)
├── cocoro-core       :8001  ← A が落ちた時に切り替え
├── PostgreSQL        :5432  ← A からレプリケーション
└── Redis             :6379
```

PostgreSQL の論理レプリケーション設定：

```bash
# miniPC-A（Primary）の postgresql.conf
wal_level = logical
max_replication_slots = 2
max_wal_senders = 2

# miniPC-B（Replica）でサブスクリプション作成
psql -U postgres -c "
  CREATE SUBSCRIPTION cocoro_replica
  CONNECTION 'host=192.168.1.100 dbname=cocoro user=postgres'
  PUBLICATION cocoro_pub;
"
```

---

## mDNS による自動検出

cocoro-installer でセットアップした miniPC は `cocoro.local` でアクセスできます。

複数台ある場合は `/etc/hostname` を変更します：

```bash
# miniPC-A
echo "cocoro-main" | sudo tee /etc/hostname
# → cocoro-main.local でアクセス可能

# miniPC-B
echo "cocoro-console" | sudo tee /etc/hostname
# → cocoro-console.local でアクセス可能
```

---

## ネットワーク要件

| 項目 | 推奨 |
|------|------|
| LAN 速度 | 1Gbps 有線推奨 |
| レイテンシ | 1ms 以内（同一 LAN）|
| セキュリティ | 同一 VLAN に配置推奨 |
| アクセス制御 | UFW / iptables で他ノードのみ許可 |

```bash
# miniPC-A の cocoro-core（8001）を LAN 内のみ許可
sudo ufw allow from 192.168.1.0/24 to any port 8001
sudo ufw deny 8001
```
