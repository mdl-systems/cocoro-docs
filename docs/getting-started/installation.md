---
title: miniPC セットアップ
sidebar_position: 2
---

# 🖥️ miniPC セットアップ（cocoro-installer）

**工場キッティング用の全自動インストーラーです。USB を挿して電源を入れるだけで完了します。**

---

## 必要なもの

- miniPC（Intel N95 / RAM 8GB 以上 / SSD 512GB NVMe）
- USB メモリ（8GB 以上）
- [Rufus](https://rufus.ie/)（Windows）または `dd`（Linux/Mac）
- WSL または Ubuntu 環境（ISO ビルド用）

---

## Step 1: ISO をビルド

WSL / Ubuntu で実行：

```bash
git clone https://github.com/mdl-systems/cocoro-installer.git
cd cocoro-installer

# 必要ツールのインストール
sudo apt-get install -y xorriso isolinux rsync

# ISO ビルド
./usb/build-iso.sh
# → output/cocoro-os-installer.iso が生成される
```

---

## Step 2: USB に書き込む

**Rufus（推奨）:**
1. Rufus を開く
2. パーティション構成: **GPT**
3. ターゲットシステム: **UEFI（CSM なし）**
4. ブートの種類: **ISO イメージ** → `cocoro-os-installer.iso` を選択
5. 書き込みオプション: **ISOイメージモード**
6. スタート

---

## Step 3: miniPC にインストール

1. USB をminiPCに挿入
2. 電源 ON
3. GRUB が 3 秒後に自動起動
4. **操作不要** — すべて自動で進む

```
インストールフロー（約 15〜20 分）:
USB ブート
  → GRUB 自動選択（3秒）
  → Debian 13 無人インストール
  → 再起動
  → Docker CE セットアップ
  → cocoro-core デプロイ
  → 完了 ✅
```

---

## インストール後の確認

インストール完了後、USB を抜いて再起動すると Debian が起動します。

```bash
# SSH でアクセス
ssh cocoro-admin@cocoro.local

# 確認コマンド
docker --version           # Docker が入ってるか
systemctl status docker    # Docker が動いてるか
df -h                      # パーティション確認
cat /etc/cocoro-release    # バージョン確認
```

---

## ログイン情報

| 項目 | 値 |
|------|----|
| ホスト名 | `cocoro` / mDNS: `cocoro.local` |
| ユーザー | `cocoro-admin` |
| パスワード | `cocoro-factory-2026` |
| SSH | `ssh cocoro-admin@cocoro.local` |

:::caution セキュリティ注意
本番環境ではパスワードを変更してください：
```bash
passwd cocoro-admin
```
:::

---

## パーティション構成

| マウントポイント | サイズ | 用途 |
|----------------|--------|------|
| `/boot/efi` | 512MB | EFI |
| `/` | 50GB | ルート FS |
| `/var/lib/docker` | 100GB | Docker イメージ |
| swap | 4GB | スワップ |
| `/data/cocoro` | 残り全部 | PostgreSQL / Redis 永続データ |
