---
title: 工場キッティング手順
sidebar_position: 3
---

# 🏭 工場キッティング手順

**miniPC を大量に出荷するための標準手順書です。**

---

## 手順概要

```
Step 1: ISO ビルド（1回だけ）
Step 2: USB に書き込み
Step 3: miniPC にインストール（自動・15〜20分）
Step 4: 検品確認（2分）
Step 5: 梱包・出荷
```

---

## Step 1: ISO ビルド（WSL/Ubuntu で実行）

```bash
git clone https://github.com/mdl-systems/cocoro-installer.git
cd cocoro-installer

sudo apt-get install -y xorriso isolinux rsync
./usb/build-iso.sh
# → output/cocoro-os-installer.iso
```

:::tip ISO の再利用
ISO は一度ビルドすれば複数の USB に使いまわせます。
cocoro-installer に更新がなければ再ビルド不要。
:::

---

## Step 2: USB に書き込み（Rufus）

| 設定項目 | 値 |
|---------|-----|
| デバイス | USB メモリ（8GB 以上） |
| ブートの種類 | ISO イメージ |
| パーティション構成 | GPT |
| ターゲットシステム | UEFI（CSM なし）|
| ファイルシステム | FAT32 |

**「スタート」→「ISOイメージモードで書き込む」を選択**

---

## Step 3: miniPC にインストール（自動）

1. USB をminiPCのUSBポートに挿入
2. 電源 ON
3. **何もしない** — GRUB が 3 秒後に自動起動
4. 完全自動で進む（約 15〜20 分）
5. 再起動後に Debian ログイン画面が表示されたら完了

---

## Step 4: 検品確認（SSH で実施）

```bash
# LAN に接続して SSH
ssh cocoro-admin@cocoro.local

# チェックリスト
docker --version        # Docker CE が入ってるか
systemctl is-active docker  # active と表示されるか
cat /etc/cocoro-release # バージョン番号確認
df -h /data/cocoro      # データパーティションの確認
curl -s http://localhost:8001/health  # cocoro-core 起動確認（オプション）
```

---

## BIOS 設定（機種によっては必要）

| 設定 | 値 |
|------|-----|
| Boot Mode | UEFI |
| Secure Boot | **Disabled** |
| Boot Priority | USB First |

---

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| GRUB が表示されない | BIOS の Boot Priority で USB を最優先に設定 |
| インストールが途中で止まる | USB を抜き差しして再起動 |
| SSH できない | LAN ケーブルを確認・`ping cocoro.local` |
| Docker が起動しない | `sudo systemctl restart docker` |
