---
title: SDK クイックスタート
sidebar_position: 2
---

# 📦 SDK クイックスタート

---

## インストール

```bash
npm install @mdl-systems/cocoro-sdk
```

---

## 基本的な使い方

```typescript
import { CocoroClient } from '@mdl-systems/cocoro-sdk';

const cocoro = new CocoroClient({
  baseUrl: 'http://cocoro.local:8001',  // miniPC の URL
  apiKey: process.env.COCORO_API_KEY!,
});

// シンプルなチャット
const response = await cocoro.chat.send({
  message: 'こんにちは',
});
console.log(response.text);
console.log(response.emotion);    // { primary: 'joy', intensity: 0.7 }
console.log(response.syncRate);   // 45.2
```

---

## SSE ストリーミング

```typescript
// リアルタイムストリーミング（word-by-word）
const stream = await cocoro.chat.stream({
  message: 'AIトレンドについて詳しく教えて',
});

for await (const chunk of stream) {
  process.stdout.write(chunk.text);
}
```

---

## Next.js での使用例

### サーバーコンポーネント

```typescript
// app/page.tsx
import { CocoroClient } from '@mdl-systems/cocoro-sdk';

const cocoro = new CocoroClient({
  baseUrl: process.env.COCORO_CORE_URL!,
  apiKey: process.env.COCORO_CORE_API_KEY!,
});

export default async function Page() {
  const personality = await cocoro.personality.get();
  return <div>名前: {personality.name}</div>;
}
```

### API Route（SSE ストリーミング）

```typescript
// app/api/chat/stream/route.ts
import { CocoroClient } from '@mdl-systems/cocoro-sdk';

const cocoro = new CocoroClient({
  baseUrl: process.env.COCORO_CORE_URL!,
  apiKey: process.env.COCORO_CORE_API_KEY!,
});

export async function POST(req: Request) {
  const { message } = await req.json();

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  (async () => {
    const cocoroStream = await cocoro.chat.stream({ message });
    for await (const chunk of cocoroStream) {
      await writer.write(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
    }
    await writer.close();
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
```

---

## エラーハンドリング

```typescript
import { CocoroClient, CocoroError } from '@mdl-systems/cocoro-sdk';

try {
  const response = await cocoro.chat.send({ message: 'こんにちは' });
} catch (error) {
  if (error instanceof CocoroError) {
    console.error('Cocoro エラー:', error.code, error.message);
  }
}
```

---

## 型定義

```typescript
type ChatResponse = {
  text: string;
  emotion: {
    primary: 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust';
    intensity: number;  // 0.0 〜 1.0
  };
  syncRate: number;      // シンクロ率（0 〜 100）
  thinkingTime: number;  // 思考時間（ms）
};

type StreamChunk = {
  text: string;
  done: boolean;
};
```
