## 代理封禁机制

当爬虫通过代理发送请求时，目标网站的防护系统会经过多层检测来判断是否为爬虫流量。每一层检测失败都会导致不同的封禁策略，最终将 IP 加入黑名单。

### 检测流程

```mermaid
flowchart TD
    Request["发起请求"] --> RateCheck{"频率检测"}
    RateCheck -->|正常| UACheck{"UA检测"}
    RateCheck -->|过快| Block429["429 限流"]

    UACheck -->|正常| BehaviorCheck{"行为检测"}
    UACheck -->|异常| Block412["412 风控"]

    BehaviorCheck -->|正常| Success["正常响应"]
    BehaviorCheck -->|异常| Block403["403 封禁"]

    Block429 --> IPMark["IP标记"]
    Block412 --> IPMark
    Block403 --> IPMark

    IPMark --> BlackList["IP黑名单"]

    style Success fill:#c8e6c9,stroke:#4caf50
    style Block429 fill:#fff3e0,stroke:#ff9800
    style Block412 fill:#ffcdd2,stroke:#f44336
    style Block403 fill:#ffcdd2,stroke:#f44336
    style BlackList fill:#ffcdd2,stroke:#f44336
```

### 三层检测机制

| 检测层 | 触发条件 | 响应码 | 含义 |
|--------|---------|--------|------|
| **频率检测** | 请求频率超过阈值 | `429 Too Many Requests` | 临时限流，降低频率后自动恢复 |
| **UA 检测** | User-Agent 缺失、异常或为已知爬虫标识 | `412 Precondition Failed` | 风控拦截，请求被拒绝 |
| **行为检测** | 访问模式异常（如固定间隔、无 Referer、无 Cookie） | `403 Forbidden` | IP 封禁，需更换代理 IP |

### 封禁升级路径

1. **429 限流** → 首次警告，通常持续数分钟到一小时。服务端记录该 IP 的请求频率。
2. **412 风控** → 进一步确认该 IP 存在异常行为特征，标记为可疑。
3. **403 封禁** → 最终判定为爬虫流量，IP 被加入黑名单。解封时间从数小时到永久不等。

一旦 IP 进入黑名单，该代理将无法再访问目标网站的任何资源。因此，在爬虫开发中，及时识别这些响应码并切换代理至关重要。
