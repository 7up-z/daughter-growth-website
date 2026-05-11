# 项目概述

**daughter-growth-website** - 基于 Next.js 16.2.1 的全栈成长记录网站，支持用户认证、照片管理、旅行记录、生日视频、留言等功能。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16.2.1 (App Router) |
| 语言 | TypeScript 5 |
| UI | React 19, Tailwind CSS 4, 极简黑白灰设计风格 |
| 认证 | NextAuth.js 4 |
| 数据库 | Prisma ORM + PostgreSQL (Vercel Postgres) |
| 存储 | Vercel Blob |
| 包管理器 | pnpm |

## 设计风格

**极简博客风格**，参考 blatr.cn 和 cworld0.com：
- 黑白灰主色调 + 柔和彩色点缀
- 清晰的排版层次和信息结构
- 卡片式和列表式内容展示
- 简洁的导航和交互

### 配色方案
| 用途 | 色值 | 说明 |
|------|------|------|
| 主色 | #171717 | 深灰文字 |
| 次色 | #525252 | 次要文字 |
| 强调色 | #3b82f6 (蓝), #ec4899 (粉), #f59e0b (橙) | 图标和装饰 |
| 背景 | #ffffff, #fafafa, #f5f5f5 | 层次分明 |
| 渐变 | pink/rose, amber/orange, blue/indigo | 头像和装饰背景 |

## 目录结构

```
/workspace/projects/
├── app/                    # Next.js App Router 页面
│   ├── api/               # API 路由 (auth, birthday, comments, messages, photos, travel, upload, user)
│   ├── birthday/          # 生日页面
│   ├── dashboard/         # 仪表盘
│   ├── login/             # 登录页
│   ├── messages/          # 消息页面
│   ├── photos/            # 照片管理
│   ├── profile/           # 用户资料
│   ├── travel/            # 旅行记录
│   └── page.tsx           # 首页
├── components/             # React 组件
├── lib/                    # 工具库 (auth.ts, prisma.ts)
├── prisma/                 # 数据库 schema 和迁移
├── scripts/                 # 预览脚本 (coze-preview-*.sh)
├── .cozeproj/              # 部署配置
│   └── scripts/           # 部署脚本 (deploy_*.sh)
├── .coze                   # Coze 项目配置
├── package.json
└── next.config.ts
```

## 关键入口 / 核心模块

| 功能 | 入口 |
|------|------|
| 开发服务器 | `pnpm run dev` 或 `bash scripts/coze-preview-run.sh` |
| 生产构建 | `pnpm run build` |
| 生产启动 | `pnpm run start` |
| 数据库迁移 | `pnpm prisma migrate deploy` |

## 运行与预览

### 环境要求
- Node.js 24 (通过 `nodejs-24` runtime)
- pnpm 包管理器

### 预览链路
- 端口: **5000** (固定)
- 构建脚本: `scripts/coze-preview-build.sh`
- 运行脚本: `scripts/coze-preview-run.sh`
- 验证: `curl http://localhost:5000` 返回 200，端口监听 `0.0.0.0:5000`

### 部署链路
- 构建脚本: `.cozeproj/scripts/deploy_build.sh`
- 运行脚本: `.cozeproj/scripts/deploy_run.sh`
- 端口: **5000** (生产模式)
- Backend 模式: 启用 (Next.js SSR 需要)

## 用户偏好与长期约束

1. **包管理器限制**: 仅允许 `pnpm`，禁止 `npm`/`yarn`
2. **Next.js 规则**: 遵循 App Router 规范，见 `node_modules/next/dist/docs/`
3. **端口约束**: 预览和部署统一使用 **5000** 端口
4. **禁止操作**: 不得使用或清理 9000 端口

## 常见问题和预防

1. **pnpm exec 问题**: 在脚本中执行 `pnpm exec` 时，确保已正确 cd 到项目根目录
2. **Next.js 参数**: 使用 `-H` 和 `-p` 短参数而非 `--hostname`/`--port`
3. **Prisma**: 使用 `@prisma/adapter-pg` 适配 Vercel Postgres
4. **设计风格**: 采用极简黑白灰风格，CSS 变量定义在 `app/globals.css`
5. **数据库配置**: Vercel 环境需在控制台设置 `DATABASE_URL`

---

*本文档由 Coze 初始化自动生成*
