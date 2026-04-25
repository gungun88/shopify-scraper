# 星海数据采集 — E-com Scraper SaaS

SaaS 仪表盘，用于采集 Shopify、Shopline、Shoplazza 等电商独立站商品数据。

## 本地运行

**前置条件：** Node.js 18+

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量（可选）

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

如需对接外部真实爬虫服务，填写 `SCRAPER_API_URL`（不填则使用内置 Mock 模拟）。

### 3. 启动后端服务

```bash
npm run dev:server
# → 🚀 Server running on http://localhost:3001
```

### 4. 启动前端开发服务

新开一个终端：

```bash
npm run dev
# → http://localhost:3000
```

## 平台自动识别

提交采集任务时选择「自动判断（推荐）」，系统会通过以下两层策略自动识别目标站点平台：

1. **URL/域名规则匹配**（毫秒级，无网络请求）：识别 `.myshopify.com`、`shoplineapp.com` 等官方子域名
2. **HTML 指纹识别**（针对自定义域名）：抓取目标页面，通过 JS 变量、CDN 域名等特征判断平台类型

支持平台：Shopify、Shopline、Shoplazza（店匠）、Shopyy、XShopyy、Shoplus

## 对接真实爬虫

在 `.env` 中配置 `SCRAPER_API_URL` 指向你的爬虫服务地址，后端会自动将采集请求转发到该服务：

```
SCRAPER_API_URL=https://your-scraper-api.example.com
```

爬虫服务需实现以下接口：
- `POST /scrape/single` — 单品采集，body: `{ urls, platform }`
- `POST /scrape/batch` — 目录采集，body: `{ url, platform, limit? }`
