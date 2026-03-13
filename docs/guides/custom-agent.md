---
title: カスタムエージェントの作成
sidebar_position: 6
---

# ⚡ カスタムエージェントの作成

cocoro-core に独自のエージェントとツールを追加できます。

---

## カスタムツールの追加

最も簡単な拡張方法は**カスタム Function Calling ツール**を追加することです。

### ステップ 1: ツールファイルの作成

```python
# cocoro-core/brain/tools/weather_tool.py

from .base import BaseTool
import httpx

class WeatherTool(BaseTool):
    name = "get_weather"
    description = "指定した都市の現在の天気を取得する"
    parameters = {
        "type": "object",
        "properties": {
            "city": {
                "type": "string",
                "description": "都市名（例: 東京、大阪）"
            }
        },
        "required": ["city"]
    }

    async def execute(self, city: str) -> dict:
        # OpenWeatherMap API 等を呼び出す
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"https://api.openweathermap.org/data/2.5/weather",
                params={"q": city, "appid": "YOUR_KEY", "lang": "ja"}
            )
            data = resp.json()
        return {
            "city": city,
            "weather": data["weather"][0]["description"],
            "temp_c": round(data["main"]["temp"] - 273.15, 1)
        }
```

### ステップ 2: ツールの登録

```python
# cocoro-core/brain/tool_executor.py

from .tools.weather_tool import WeatherTool

REGISTERED_TOOLS = [
    # ... 既存のツール
    WeatherTool(),  # ← 追加
]
```

### ステップ 3: Docker を再起動

```bash
cd cocoro-core/infra/docker
docker compose up -d --build
```

---

## カスタムツールのテスト

```bash
# ツールが登録されたか確認
curl http://localhost:8001/agent/tools \
  -H "Authorization: Bearer $COCORO_API_KEY"

# 動作テスト（チャット経由）
curl -X POST http://localhost:8001/chat \
  -H "Authorization: Bearer $COCORO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "東京の今の天気は？"}'

# → get_weather ツールが自動的に呼び出される
```

---

## カスタム Worker（エージェント）の追加

より高度な自律エージェントを作る場合：

```python
# cocoro-core/agent/workers/stock_worker.py

from .base import BaseWorker

class StockAnalysisWorker(BaseWorker):
    """株価分析専門エージェント"""

    name = "stock_analysis"
    supported_domains = ["finance", "investment", "stock"]

    async def execute(self, task: Task) -> TaskResult:
        # 1. 株価データを取得
        price_data = await self.tools.execute("get_stock_price", symbol=task.params["symbol"])

        # 2. 技術分析
        analysis = self.analyze_trend(price_data)

        # 3. メモリに保存
        await self.memory.store(
            content=f"{task.params['symbol']}の分析結果: {analysis.summary}",
            category="knowledge",
            importance=0.7
        )

        return TaskResult(
            text=f"📈 {task.params['symbol']} 分析結果:\n{analysis.summary}",
            data=analysis.dict()
        )
```

---

## 既存のエージェント拡張（Plugin）

ツールの追加だけでなく、既存エージェントの振る舞いを拡張できます：

```python
# reasoning エンジンへの pre-hook
class MyReasoningPlugin:
    async def before_decision(self, input: str, context: dict) -> dict:
        # 特定のキーワードがあれば優先度を上げる
        if "緊急" in input or "至急" in input:
            context["priority"] = "urgent"
        return context
```

---

## ベストプラクティス

| 原則 | 説明 |
|------|------|
| **単一責任** | 1 ツール = 1 機能 |
| **エラーハンドリング** | 必ず try/except を入れる |
| **タイムアウト** | httpx には `timeout=10.0` を設定 |
| **メモリ活用** | 結果は `self.memory.store()` で保存 |
| **テスト作成** | `tests/test_agent.py` にテストを追加 |
