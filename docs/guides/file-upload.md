---
title: ファイルアップロード
sidebar_position: 5
description: Cocoro OS へのファイルアップロード機能の使い方。PDF・テキスト・画像のアップロードと AI による解析・記憶への統合。
---

# 📁 ファイルアップロード

Cocoro OS にファイルをアップロードすると、AI が内容を解析して記憶に統合します。
「この資料を読んで、要点をまとめて」「この契約書の重要な条項を抽出して」といった使い方が可能です。

---

## 対応ファイル形式

| カテゴリ | 形式 | 最大サイズ |
|---------|------|----------|
| **ドキュメント** | PDF, DOCX, XLSX, PPTX, TXT, MD | 50 MB |
| **画像** | JPG, PNG, GIF, WebP | 10 MB |
| **コード** | .py, .ts, .js, .go, .rs, その他テキスト | 10 MB |
| **データ** | CSV, JSON, YAML | 20 MB |

---

## cocoro-console からアップロード

ドラッグ&ドロップまたはクリックでファイルをアップロード：

```
┌─────────────────────────────────────────────────────┐
│  💬 Cocoro OS Console                               │
│─────────────────────────────────────────────────────│
│                                                     │
│  [AI]: こんにちは！ファイルをアップロードするか、      │
│        メッセージを入力してください。                  │
│                                                     │
│  ────────────────────────────────────────────────   │
│  📎 [ファイルを添付]  [メッセージを入力...]  [送信▶] │
└─────────────────────────────────────────────────────┘
```

**ドラッグ&ドロップ**: ファイルをチャット画面にドラッグするだけ

---

## 使用例

### PDF 資料の解析

```
ユーザー: 📎 quarterly_report_Q1_2026.pdf

         「この資料のポイントを3行でまとめて。
          数字が含まれる部分は特に詳しく」

Cocoro:  📄 Q1 2026 四半期レポートを解析しました（全 47 ページ）

         📊 3行まとめ:
         1. 売上高は前年同期比 +23%、目標比 108% 達成
         2. 主要コスト（人件費・開発費）は想定内に収まり、営業利益率 18.2%
         3. Q2 は新製品ライン投入で売上 30% 増を計画中

         📌 主要数値:
         - 売上高: ¥1.24 億（前年: ¥1.01 億）
         - 営業利益: ¥2,260 万
         - 顧客数: 842 社（+134 社）

         このレポートを記憶に保存しますか？ [はい / いいえ]
```

### コードレビュー

```
ユーザー: 📎 api_handler.py

         「このコードのバグを探して、改善点も教えて」

Cocoro:  🔍 api_handler.py（全 156 行）を解析しました

         ⚠️ バグ（2件）:
         1. L43: `user_id` の None チェックが欠如
            → AttributeError が発生する可能性
            修正案: `if user_id is None: raise ValueError(...)`

         2. L89: セッションがクローズされていない
            → メモリリークの原因
            修正案: `with db.session() as session:` パターンに変更

         💡 改善点（3件）:
         1. L12〜25: 重複した入力バリデーション → 関数化を推奨
         2. L67: マジックナンバー `3600` → 定数 `TOKEN_EXPIRY` に
         3. 全体: 型ヒントが不足（Python 3.11 では積極的に追加推奨）
```

### 画像の解析

```
ユーザー: 📎 architecture_diagram.png

         「このアーキテクチャ図を説明して、
          問題点があれば指摘して」

Cocoro:  🖼️ アーキテクチャ図を解析しました

         📐 構成の概要:
         - フロントエンド（Next.js）→ API Gateway → マイクロサービス 5 台
         - PostgreSQL × 2 + Redis × 1 のデータ層

         ⚠️ 指摘事項:
         1. API Gateway が SPOF（単一障害点）になっている
            → ロードバランサーの追加を検討
         2. サービス間通信が HTTP のみ
            → 高負荷時は gRPC への移行を推奨
         3. Redisの冗長化が見られない
            → Redis Cluster または Sentinel の導入を検討
```

---

## API でファイルをアップロード

```bash
# multipart/form-data でアップロード
curl -X POST http://cocoro.local:8001/files/upload \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -F "file=@quarterly_report.pdf" \
  -F "message=この資料のポイントを3行でまとめて" \
  -F "save_to_memory=true"

# 応答
{
  "file_id": "file_abc123",
  "filename": "quarterly_report.pdf",
  "size_bytes": 2048576,
  "pages": 47,
  "analysis": {
    "summary": "Q1 2026 売上高前年比+23%...",
    "key_points": ["...", "...", "..."],
    "saved_to_memory": true,
    "memory_id": "mem_xyz789"
  }
}
```

---

## ファイルの記憶への統合

アップロードしたファイルを記憶に保存すると、後から会話で参照できます：

```
「先日アップロードしたQ1レポートで、売上が一番高かった月は？」
→ search_memory("Q1レポート 売上") で自動検索・回答

「あの資料に書いてあったコスト削減案を実行するタスクを作って」
→ 記憶から内容を引用 → create_task で自動登録
```

---

## ファイル管理

### アップロード済みファイル一覧

```bash
GET /files?limit=20&type=pdf

{
  "files": [
    {
      "id": "file_abc123",
      "filename": "quarterly_report.pdf",
      "uploaded_at": "2026-03-14T10:30:00Z",
      "size_bytes": 2048576,
      "saved_to_memory": true
    }
  ],
  "total": 12
}
```

### ファイルの削除

```bash
DELETE /files/file_abc123
```

---

## 制限と注意事項

:::warning ファイルサイズ制限
- 単일ファイル: 最大 50MB（PDF）/ 10MB（画像）
- 1日のアップロード上限: 200MB（設定で変更可）
:::

:::note プライバシー
アップロードしたファイルは miniPC 内に保存され、**外部に送信されません**。
LLM による解析は Gemini API を通じて行われますが、ファイル本体は送信されず、
テキスト抽出した内容のみが処理されます。
:::

### 設定ファイルによる上限変更

```bash
# cocoro-core の環境変数で変更可能
FILE_UPLOAD_MAX_SIZE_MB=100        # 単一ファイルの最大サイズ
FILE_UPLOAD_DAILY_LIMIT_MB=500     # 1日の合計上限
FILE_STORAGE_PATH=/data/cocoro/files
```
