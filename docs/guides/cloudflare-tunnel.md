---
title: Cloudflare Tunnel 設定
sidebar_position: 7
---

# 🌐 Cloudflare Tunnel 設定

Cloudflare Tunnel を使うと、**グローバル IP なし・ポート開放なし**で LAN 内の miniPC に外部からアクセスできます。

---

## 仕組み

```
[スマートフォン / 外出先 PC]
          │ HTTPS
          ▼
  Cloudflare Edge（グローバル）
          │ Tunnel（暗号化）
          ▼
  miniPC 内 cloudflared デーモン
          │ localhost
          ├── cocoro-console :3000
          └── cocoro-core    :8001
```

---

## 前提条件

- Cloudflare アカウント（無料）
- 独自ドメインが Cloudflare に登録済み
- miniPC に `cloudflared` がインストール済み

---

## セットアップ手順

### Step 1: cloudflared のインストール

```bash
# miniPC (Debian) で実行
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb \
  -o cloudflared.deb
sudo dpkg -i cloudflared.deb
cloudflared --version
```

### Step 2: Cloudflare にログイン

```bash
cloudflared tunnel login
# ブラウザが開くので Cloudflare アカウントでログイン
# → ~/.cloudflared/cert.pem が生成される
```

### Step 3: トンネルの作成

```bash
cloudflared tunnel create cocoro-tunnel
# → UUID が発行される（例: a1b2c3d4-...）
```

### Step 4: 設定ファイルの作成

```yaml
# ~/.cloudflared/config.yml
tunnel: a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx
credentials-file: /home/cocoro-admin/.cloudflared/a1b2c3d4-xxxx.json

ingress:
  # cocoro-console（管理UI）
  - hostname: console.yourdomain.com
    service: http://localhost:3000

  # cocoro-core（API）
  - hostname: api.yourdomain.com
    service: http://localhost:8001

  # デフォルト（404）
  - service: http_status:404
```

### Step 5: DNS の設定

```bash
cloudflared tunnel route dns cocoro-tunnel console.yourdomain.com
cloudflared tunnel route dns cocoro-tunnel api.yourdomain.com
```

### Step 6: 起動・サービス化

```bash
# 動作確認
cloudflared tunnel run cocoro-tunnel

# systemd サービスとして常時起動
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
sudo systemctl status cloudflared
```

---

## セキュリティ設定

外部公開する場合は必ず認証を設定します。

### Cloudflare Access による保護

Cloudflare ダッシュボード → **Zero Trust** → **Access** → **Applications** で設定：

- **Application:** `console.yourdomain.com`
- **Policy:** メールアドレス認証（One-Time PIN）
- **Effect:** Allow（自分のメールのみ）

これにより、外部から管理UIにアクセスする際に Cloudflare のログインページが挟まります。

---

## 動作確認

```bash
# LAN 外（スマートフォン等）から確認
curl https://api.yourdomain.com/health

# → {"status": "healthy", "llm_status": "connected", ...}
```

---

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| `cloudflared` が接続できない | `sudo systemctl status cloudflared` でログ確認 |
| DNS が反映されない | 5〜10 分待つ（TTL の問題）|
| 403 Forbidden | Cloudflare Access のポリシーを確認 |
| トンネルが自動起動しない | `sudo systemctl enable cloudflared` を再実行 |
