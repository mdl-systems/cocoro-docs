---
title: SDK 概要
sidebar_position: 1
---

# 📦 cocoro-sdk 概要

:::info 開発予定
cocoro-sdk は現在開発計画段階です。
このドキュメントは SDK の設計仕様を示しています。
:::

---

## cocoro-sdk とは

**cocoro-sdk** は、cocoro-core API を TypeScript / JavaScript から簡単に使えるクライアントライブラリです。

- 型安全な API アクセス
- SSE ストリーミングのサポート
- エラーハンドリングの簡略化
- Node.js / ブラウザ / Edge Runtime 対応

---

## インストール（予定）

```bash
npm install @mdl-systems/cocoro-sdk
```

---

## 対応環境

| 環境 | サポート |
|------|---------|
| Node.js 18+ | ✅ |
| Next.js（Server Components） | ✅ |
| Next.js（Client Components） | ✅ |
| ブラウザ（Vite / CRA） | ✅ |
| Edge Runtime | ✅ |
| Deno | 🔜 |

---

## 直接 API を使う（現在の方法）

SDK がリリースされるまでは、HTTP API を直接呼び出してください：

```typescript
const COCORO_URL = process.env.COCORO_CORE_URL!;
const COCORO_KEY = process.env.COCORO_CORE_API_KEY!;

// チャット
const res = await fetch(`${COCORO_URL}/chat`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${COCORO_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ message: 'こんにちは' }),
});
const data = await res.json();
console.log(data.text);
```

---

## 関連ドキュメント

- [SDK クイックスタート](./quickstart) — 設計仕様
- [チャット API](./chat)
- [人格・感情 API](./personality)
- [メモリ API](./memory)
- [エージェント API](./agent)
