---
title: インストール
sidebar_position: 3
description: cocoro-installer を使った Debian 13 + cocoro-core の完全自動インストール手順。
---

# ⚙️ インストール

**cocoro-installer** を使って、miniPC に Cocoro OS を全自動でインストールします。
USB を挿して電源を入れるだけで、OS から cocoro-core まで約 20 分で完了します。

---

## 事前準備チェックリスト

インストール前に以下を揃えてください：

- [ ] Intel N95（または同等）miniPC
- [ ] USB メモリ 8GB 以上
- [ ] LAN ケーブル（ルーターと接続）
- [ ] Windows PC（ISO ビルド用）
- [ ] Rufus（USB 書き込みツール）→ [rufus.ie](https://rufus.ie)
- [ ] WSL2 / Ubuntu（ISO ビルド用）または配布 ISO

---

## Step 1: ISO ビルド

:::note WSL2（Ubuntu）で実行
以下のコマンドは Windows の WSL2 / Ubuntu 環境で実行してください。
:::

```bash
# 依存ツールをインストール
sudo apt-get update
sudo apt-get install -y xorriso isolinux rsync

# リポジトリをクローン
git clone https://github.com/mdl-systems/cocoro-installer.git
cd cocoro-installer

# ISO ビルド（約 5〜10 分）
./usb/build-iso.sh

# 完成した ISO を確認
ls -lh output/
# → cocoro-os-installer.iso（約 400MB）
```

:::tip ISO の再利用
一度ビルドした ISO は複数の USB メモリに書き込めます。
cocoro-installer の更新がない限り、再ビルドは不要です。
:::

---

## Step 2: USB に書き込み（Rufus）

1. **Rufus** を起動する
2. 以下の設定で書き込む：

| 設定項目 | 値 |
|---------|-----|
| デバイス | USB メモリ（8GB 以上）|
| ブートの種類 | ISO イメージ → `cocoro-os-installer.iso` を選択 |
| パーティション構成 | **GPT** |
| ターゲットシステム | **UEFI（CSM なし）**|
| ファイルシステム | FAT32 |
| クラスターサイズ | デフォルト |

3. 「スタート」をクリック
4. ダイアログが出たら → **「ISOイメージモードで書き込む」** を選択
5. 完了まで約 3〜5 分待つ

---

## Step 3: BIOS 設定

miniPC の BIOS で以下を確認・設定します。

| 設定項目 | 推奨値 |
|---------|--------|
| Boot Mode | **UEFI** |
| Secure Boot | **Disabled**（無効化必須）|
| Boot Priority | **USB First** |

:::warning Secure Boot は必ず無効化
Secure Boot が有効だと GRUB が起動できません。
BIOS 画面（機種により F2 / F12 / DEL）で `Secure Boot → Disabled` に変更してください。
:::

**BIOS へのアクセス方法（機種別）:**

| メーカー | キー |
|---------|------|
| AMI BIOS（多くのminiPC）| `DEL` または `F2` |
| KINGNOVY / TRIGKEY | `DEL` |
| BMAX | `DEL` または `F7` |

---

## Step 4: インストール実行（全自動）

1. miniPC の USB ポートに USB メモリを挿入
2. 電源 ON
3. **何もしなくてよい** — GRUB が 3 秒後に自動起動
4. Debian インストールが自動進行（約 15〜20 分）
5. 再起動 → `firstboot.sh` が Docker と cocoro-core をセットアップ（約 3〜5 分）
6. ログイン画面が表示されたら完了

```
USB 挿入 → 電源 ON
  ↓
GRUB メニュー（3秒で自動選択）
  ↓
Debian 自動インストール（preseed）
  ↓
再起動 → firstboot.sh
  ↓
Docker CE インストール
  ↓
cocoro-core デプロイ
  ↓
✅ 完了！
```

---

## Step 5: インストール確認

インストール完了後、同じ LAN 内の PC から SSH で接続して確認します。

```bash
# mDNS で接続（Windows は Bonjour が必要な場合あり）
ssh cocoro-admin@cocoro.local

# または IP アドレスで接続
ssh cocoro-admin@192.168.x.xxx

# デフォルトパスワード
# Password: cocoro-factory-2026
```

確認コマンド：

```bash
# Docker が動いているか
docker --version
# → Docker version 26.x.x

# cocoro-core が起動しているか
curl -s http://localhost:8001/health | python3 -m json.tool
# → {"status": "healthy", ...}

# パーティションの確認
df -h
# → /data/cocoro に大きな領域があれば OK

# バージョン確認
cat /etc/cocoro-release
# → Cocoro OS Installer v1.x.x
```

---

## インストール後のデフォルト設定

| 項目 | デフォルト値 | 変更推奨 |
|------|------------|---------|
| ホスト名 | `cocoro` | 任意 |
| mDNS | `cocoro.local` | — |
| ユーザー名 | `cocoro-admin` | — |
| パスワード | `cocoro-factory-2026` | **本番環境では変更必須** |
| cocoro-core ポート | `8001` | — |

---

## トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| GRUB が表示されない | BIOS の Boot Order | BIOS で USB を最優先に設定 |
| 「Secure Boot violation」エラー | Secure Boot が有効 | BIOS で Secure Boot を Disabled に |
| インストールが途中で止まる | USB の品質問題 | 別の USB メモリを使用 |
| SSH できない | mDNS が動いていない | `ping cocoro.local` または IP アドレスで試す |
| Docker が起動しない | firstboot 未完了 | `sudo systemctl restart docker` |
| cocoro-core が応答しない | コンテナ起動待ち | `docker ps` で確認、起動まで 30 秒待つ |

---

→ 次は **[Boot Wizard 完走ガイド](./boot-wizard)** へ
