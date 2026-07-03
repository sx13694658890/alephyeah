# Playwright 网络请求拦截

通过 Playwright 监听页面响应或路由规则，可直接捕获 API JSON、跳过无关静态资源，在动态站点采集中减少 DOM 解析成本并提升加载速度。

## 核心思路

- **响应监听**：在 `page.on("response")` 中过滤 `xhr` / `fetch`，解析 JSON 体
- **路由拦截**：用 `page.route()` 中止图片、字体等低价值资源
- **等待策略**：`networkidle` + 短延时，确保异步请求完成后再汇总数据
- **容错处理**：`content-type` 与 JSON 解析失败时静默跳过，避免中断主流程

---

## 拦截 API 响应

监听所有网络响应，筛选 XHR / Fetch 且状态为 200 的 JSON 接口，将 URL 与解析结果一并收集。

```python
# -*- coding: utf-8 -*-
"""
使用 Playwright 拦截网络请求
"""

import asyncio
from playwright.async_api import async_playwright
from loguru import logger
from typing import List, Dict, Any


async def intercept_api_requests() -> List[Dict[str, Any]]:
    """
    拦截 API 请求获取数据

    通过网络拦截直接获取 JSON 数据
    """
    api_responses = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        # 监听所有响应
        async def handle_response(response):
            url = response.url
            # 过滤 API 请求
            if response.request.resource_type == "xhr" or response.request.resource_type == "fetch":
                try:
                    if response.status == 200:
                        content_type = response.headers.get("content-type", "")
                        if "json" in content_type:
                            data = await response.json()
                            api_responses.append({
                                "url": url,
                                "data": data
                            })
                            logger.info(f"拦截到 API 响应: {url[:60]}...")
                except Exception as e:
                    logger.debug(f"解析响应失败: {e}")

        page.on("response", handle_response)

        # 访问页面触发请求
        await page.goto("https://quotes.toscrape.com/js/", wait_until="networkidle")

        # 等待数据拦截完成
        await page.wait_for_timeout(2000)

        await browser.close()

    return api_responses
```

| 要点 | 说明 |
|------|------|
| `resource_type` | 仅处理 `xhr` / `fetch`，忽略 document、script 等 |
| `content-type` | 含 `json` 才尝试 `response.json()` |
| `networkidle` | 网络空闲后再等待 2s，覆盖延迟触发的接口 |
| 异常 | 解析失败记 debug 日志，不中断采集 |

---

## 阻止静态资源加载

通过路由规则中止图片与字体请求，缩短首屏加载时间，适合只需 DOM 文本的场景。

```python
async def demo_block_resources():
    """演示阻止资源加载以提升性能"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # 阻止图片和字体加载
        await page.route("**/*.{png,jpg,jpeg,gif,svg}", lambda route: route.abort())
        await page.route("**/*.{woff,woff2,ttf}", lambda route: route.abort())

        logger.info("已设置资源拦截，图片和字体将不会加载")

        await page.goto("https://quotes.toscrape.com/")
        await page.wait_for_selector(".quote")

        quotes_count = await page.locator(".quote").count()
        logger.info(f"页面加载完成，找到 {quotes_count} 条名言（无图片模式）")

        await browser.close()
```

| 拦截类型 | 匹配模式 | 效果 |
|----------|----------|------|
| 图片 | `**/*.{png,jpg,jpeg,gif,svg}` | 减少带宽与解码耗时 |
| 字体 | `**/*.{woff,woff2,ttf}` | 跳过 Web 字体下载 |

---

## 完整示例入口

```python
async def main():
    print("=== 拦截 API 请求示例 ===")
    responses = await intercept_api_requests()
    print(f"共拦截到 {len(responses)} 个 API 响应\n")

    print("=== 阻止资源加载示例 ===")
    await demo_block_resources()


if __name__ == "__main__":
    asyncio.run(main())
```

---

## 使用建议

- **API 优先**：若目标站数据来自 XHR，优先走响应拦截，比解析 DOM 更稳定
- **按需拦截**：CSS 通常保留以保证布局选择器可用；仅在不依赖样式时拦截
- **并发与上下文**：多页面共享 `browser`、独立 `context`，避免 Cookie 串扰
- **生产环境**：结合《工程化爬虫开发规范》中的重试与日志规范，对拦截失败做分类记录
