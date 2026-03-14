---
title: 必要なハードウェア
sidebar_position: 1
description: Cocoro OS の推奨ハードウェア構成。Intel N95 miniPC を中心に、必要なスペックと購入ガイドを解説。
---

# 💻 必要なハードウェア

Cocoro OS は **Intel N95 搭載 miniPC** での動作を標準として設計されています。
24時間365日の常時稼働を想定し、低消費電力・高コスパ・静音性を重視しています。

---

## 推奨構成（標準）

:::info 推奨スペック
この構成で Cocoro OS のすべての機能が快適に動作します。
:::

| パーツ | 推奨スペック | 備考 |
|--------|------------|------|
| **CPU** | Intel N95（4コア / 3.4GHz Burst）| TDP 15W、静音・省電力 |
| **RAM** | 16GB DDR4/DDR5 | 最低 8GB、16GB 推奨 |
| **ストレージ** | 512GB NVMe SSD | PostgreSQL 永続ストレージ含む |
| **OS** | Debian 13（bookworm）| cocoro-installer で自動インストール |
| **ネットワーク** | 有線 LAN 1Gbps | 無線 LAN も可 |
| **消費電力** | 約 10〜15W | 年間電気代 約 1,600 円 |

### 購入例（参考）

| 製品名 | CPU | RAM | SSD | 参考価格 |
|--------|-----|-----|-----|---------|
| KINGNOVY N95 | Intel N95 | 16GB | 512GB | 約 25,000 円 |
| TRIGKEY G5 | Intel N100 | 16GB | 500GB | 約 27,000 円 |
| BMAX B6 Pro | Intel N100 | 16GB | 512GB | 約 29,000 円 |

:::tip Amazon / AliExpress で購入可
「N95 miniPC 16GB」で検索すると多数の選択肢が見つかります。
Amazonなら在庫も安定しており、翌日〜2日で届きます。
:::

---

## 最小構成（開発・テスト用）

| パーツ | 最小スペック | 注意点 |
|--------|------------|--------|
| CPU | Intel N95 または同等 | ARM 系は未サポート |
| RAM | 8GB | 複数エージェント同時実行は不安定になる場合あり |
| ストレージ | 256GB SSD | pgvector の記憶量が制限される |

---

## パーティション構成

cocoro-installer が以下のパーティションを自動作成します：

| マウントポイント | サイズ | 用途 |
|----------------|--------|------|
| `/boot/efi` | 512 MB | EFI システムパーティション |
| `/` | 50 GB | ルートファイルシステム（OS + アプリ）|
| `/var/lib/docker` | 100 GB | Docker イメージ・コンテナ |
| `swap` | 4 GB | スワップ領域 |
| `/data/cocoro` | 残り全部 | PostgreSQL / Redis 永続データ |

---

## その他の必要なもの

| アイテム | 用途 | 備考 |
|--------|------|------|
| **USB メモリ 8GB 以上** | cocoro-installer の起動ディスク | インストール後は再利用可 |
| **LAN ケーブル**（推奨）| miniPC をルーターに接続 | 無線接続より安定 |
| **Windows PC**（作業用）| ISO ビルド・USB 書き込み | macOS も可 |
| **Rufus**（フリーソフト）| USB への ISO 書き込み | [https://rufus.ie](https://rufus.ie) |

---

## ネットワーク構成

標準的なホームネットワークでの接続構成：

```
[ インターネット ]
       │
   ルーター（192.168.1.1 など）
       │
   ├── miniPC (cocoro.local / 192.168.1.xxx)  ← Cocoro OS
   ├── PC / スマホ                              ← cocoro-console にアクセス
   └── その他デバイス
```

miniPC は DHCP で自動的に IP アドレスを取得し、`cocoro.local`（mDNS）で名前解決できます。

---

## ARM・Raspberry Pi について

:::warning ARM は非サポート
現在 ARM アーキテクチャ（Raspberry Pi、Apple M1/M2 など）は公式サポート外です。

**理由:**
- `cocoro-installer` の preseed が x86_64 前提
- Docker イメージが amd64 向けにビルドされている
- pgvector の SIMD 最適化が x86_64 向け

将来的な ARM 対応は検討中です。
:::

---

## 購入から起動までの流れ

```
①  Amazon などで miniPC を注文（2〜7日）
②  Windows PC で Rufus をダウンロード
③  cocoro-installer の ISO をビルドまたはダウンロード
④  USB に ISO を書き込む（約 5 分）
⑤  miniPC に USB を挿して電源 ON（全自動 / 約 20 分）
⑥  LAN からアクセスして Boot Wizard 開始
```

→ 次は **[インストールガイド](./installation)** へ
