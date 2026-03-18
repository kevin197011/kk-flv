# kk-flv

FLV 代理播放器：前端输入仅后端可访问的 FLV 地址，由后端拉流并转发，在浏览器中播放测试。

## 功能

- **代理拉流**：后端请求内网/仅服务端可访问的 FLV URL，流式转发给前端
- **页面播放**：前端使用 flv.js 解码并在 `<video>` 中播放
- **直链播放**：打开 `/play?url=<编码后的FLV地址>` 即可自动加载并静音播放（可点击视频控件取消静音）
- **主题切换**：支持亮色/暗色主题，偏好写入本地存储
- **单屏布局**：整页一屏内展示，无需滚动

## 技术栈

| 部分     | 技术                    |
|----------|-------------------------|
| 后端     | Go 1.22, Gin           |
| 前端     | React 18, TypeScript, Vite, flv.js |
| 运行方式 | Docker Compose（推荐）  |

## 快速开始

### Docker Compose（推荐）

```bash
docker compose up --build
```

- 前端：<http://localhost:3000>
- 后端：<http://localhost:8080>
- 前端通过 `/api` 代理到后端

### 本地开发

```bash
# 终端 1：后端
cd backend && go run ./cmd/api

# 终端 2：前端
cd frontend && npm install && npm run dev
```

浏览器打开 <http://localhost:3000>，前端会将 `/api` 代理到 `http://localhost:8080`。

## 使用方式

1. **页面内**：在输入框填入 FLV 地址（如 `http://10.170.96.153:8081/LesA/113503.flv`），点击 **Play**。
2. **直链**：访问  
   `http://localhost:3000/play?url=<URL 编码后的 FLV 地址>`  
   例如：  
   `http://localhost:3000/play?url=https%3A%2F%2Fexample.com%2Fstream.flv`  
   会加载该地址并自动静音播放，需要声音时在视频控件上取消静音即可。

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/flv/proxy?url=<encoded_flv_url>` | 代理拉取 FLV 并流式返回，仅允许 `http`/`https` |

## CI / 镜像

GitHub Actions 在推送到 `main`/`master`、发布 Release 或手动触发时，会构建 **linux/amd64 (x86)** 镜像并推送到 GitHub Container Registry：

- `ghcr.io/<owner>/kk-flv-backend`
- `ghcr.io/<owner>/kk-flv-frontend`

标签包含分支名、commit SHA，以及 main/master 分支的 `latest`。使用仓库默认 `GITHUB_TOKEN` 即可推送，无需额外配置。

拉取示例：

```bash
docker pull ghcr.io/<owner>/kk-flv-backend:latest
docker pull ghcr.io/<owner>/kk-flv-frontend:latest
```

## 文档

- 产品与接口说明见 [r.md](./r.md)（PRD）。
