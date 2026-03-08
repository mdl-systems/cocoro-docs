---
title: Next.js 統合ガイド
sidebar_position: 1
---

# ⚛️ Next.js 統合ガイド

**cocoro-console** の実装をベースに、Next.js アプリへの cocoro-core 組み込み方法を説明します。

---

## 環境変数設定

```bash
# .env.local
COCORO_CORE_URL=http://192.168.50.92:8001
COCORO_CORE_API_KEY=your_api_key
COCORO_CORE_ENABLED=true
```

---

## JWT トークン取得（キャッシュ付き）

```typescript
// lib/cocoro-client.ts
let tokenCache: { token: string; expiresAt: number } | null = null;

async function getJwtToken(): Promise<string> {
  // 1 時間キャッシュ
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const res = await fetch(`${process.env.COCORO_CORE_URL}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: process.env.COCORO_CORE_API_KEY }),
  });

  const data = await res.json();
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + 55 * 60 * 1000, // 55 分
  };

  return data.access_token;
}
```

---

## SSE ストリーミング API Route

```typescript
// app/api/chat/stream/route.ts
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  const token = await getJwtToken();

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  (async () => {
    try {
      const coreRes = await fetch(`${process.env.COCORO_CORE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await coreRes.json();

      // Word-by-word ストリーミング
      const words = data.text.split(' ');
      for (const word of words) {
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ text: word + ' ', done: false })}\n\n`)
        );
        await new Promise(r => setTimeout(r, 30));
      }

      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ text: '', done: true, emotion: data.emotion })}\n\n`)
      );
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

---

## クライアントコンポーネント（SSE 受信）

```tsx
// components/Chat.tsx
'use client';

import { useState } from 'react';

export function Chat() {
  const [messages, setMessages] = useState<Array<{role: string; text: string}>>([]);
  const [input, setInput] = useState('');

  async function sendMessage() {
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setMessages(prev => [...prev, { role: 'assistant', text: '' }]);

    const res = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage }),
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value).split('\n');
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const chunk = JSON.parse(line.slice(6));
        if (chunk.done) break;

        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].text += chunk.text;
          return updated;
        });
      }
    }
  }

  return (
    <div>
      {messages.map((msg, i) => (
        <div key={i} style={{ textAlign: msg.role === 'user' ? 'right' : 'left' }}>
          {msg.text}
        </div>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={sendMessage}>送信</button>
    </div>
  );
}
```
