# 项目概述

**daughter-growth-website** 是一个家庭私域成长记忆网站，用于记录成长时间线、生日影像、旅行地图、摄影相册和家庭留言，并通过足迹地图浏览带有地点的记录。

当前产品定位：

- 私密家庭记忆空间，不是公开博客。
- 首页公开展示产品定位和脱敏示例。
- 内容页面向登录家人开放。
- 默认主题为 `paper`（温馨绘本）。
- 四套主题通过 `lib/app-theme.ts` 和 `components/providers/theme-provider.tsx` 统一维护。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16.2.1 (App Router) |
| 语言 | TypeScript 5 |
| UI | React 19, Tailwind CSS 4, 主题化家庭记忆界面 |
| 认证 | NextAuth.js 4 |
| 数据库 | Prisma ORM + PostgreSQL (Vercel Postgres) |
| 存储 | Vercel Blob |
| 包管理器 | pnpm |

## 设计方向

整体设计应服务于“家庭记忆册”的长期浏览和补充：

- 温暖、私密、可回看。
- 内容优先，避免营销式落地页。
- 首页采用杂志封面，导航包含成长时间线、生日影像、旅行地图、足迹地图、摄影相册、家庭留言。按年浏览集成在成长时间线中。
- 未登录状态只展示首页、登录页和脱敏示例，不暴露真实照片、留言、视频正文。
- 登录后展示真实家庭动态、快捷上传和完整内容入口。
- 主题切换需要在四套主题下保持文字对比、卡片层级和移动端可读性。

四套主题：

| 代码 | 中文名 | 方向 |
|------|--------|------|
| `paper` | 温馨绘本 | 默认主题，米白、纸张、手账感 |
| `cinematic` | 电影相册 | 深色、金色、影像感 |
| `playful` | 绘本拼贴 | 高饱和色块、儿童成长感 |
| `future` | 清透相册 | 玻璃拟态、浅蓝紫、轻盈相册 |

## 目录结构

```txt
app/
├── api/                    # API 路由
│   ├── auth/
│   ├── birthday/
│   ├── comments/
│   ├── memory/summary/     # 家庭记忆汇总
│   ├── messages/
│   ├── photos/             # 照片资源 API，页面入口为 /gallery
│   ├── travel/
│   ├── upload/
│   └── user/
├── birthday/               # 生日影像
├── dashboard/              # 登录后首页
├── gallery/                # 摄影相册
├── login/                  # 家人专属入口
├── map/                    # 旅行和照片的世界／中国足迹地图
├── messages/               # 家庭留言
├── photos/                 # 旧路径跳转到 /gallery
├── profile/                # 用户资料
├── settings/theme/         # 主题设置
├── timeline/               # 成长时间线
├── travel/                 # 旅行地图
└── page.tsx                # 公开首页
```

核心共享文件：

- `lib/memory-modules.ts`：家庭模块的导航配置。
- `lib/app-theme.ts`：主题样式 token。
- `components/providers/theme-provider.tsx`：主题状态、localStorage、用户资料同步。
- `components/ui/theme-shell.tsx`：内容页外壳、页头和操作区。
- `components/ui/family-masthead.tsx`：主模块导航、四套主题和家庭账户入口。
- `components/ui/archive-records.tsx`：成长时间线的月份分组和记录。

## 关键入口 / 核心模块

| 功能 | 入口 |
|------|------|
| 开发服务器 | `pnpm run dev` 或 `bash scripts/coze-preview-run.sh` |
| 生产构建 | `pnpm run build` |
| 生产启动 | `pnpm run start` |
| 数据库迁移 | `pnpm prisma migrate deploy` |
| 首页 | `/` |
| 登录后首页 | `/dashboard`，进入 `/timeline` |
| 成长时间线 | `/timeline` |
| 生日影像 | `/birthday` |
| 旅行地图 | `/travel` |
| 足迹地图 | `/map` |
| 摄影相册 | `/gallery` |
| 家庭留言 | `/messages` |
| 主题设置 | `/settings/theme` |

## 运行与预览

### 环境要求

- Node.js 24（通过 `nodejs-24` runtime）
- pnpm 包管理器

### 预览链路

- 端口：**5000**（固定）
- 构建脚本：`scripts/coze-preview-build.sh`
- 运行脚本：`scripts/coze-preview-run.sh`
- 验证：`curl http://localhost:5000` 返回 200，端口监听 `0.0.0.0:5000`

### 部署链路

- 构建脚本：`.cozeproj/scripts/deploy_build.sh`
- 运行脚本：`.cozeproj/scripts/deploy_run.sh`
- 端口：**5000**（生产模式）
- Backend 模式：启用（Next.js SSR 需要）

## 长期约束

1. 包管理器仅使用 `pnpm`，不要使用 `npm` 或 `yarn`。
2. 遵循 Next.js App Router 规范。
3. 预览和部署统一使用 **5000** 端口。
4. 不要使用或清理 9000 端口。
5. `/gallery` 是摄影相册页面入口；`/api/photos` 仍是照片资源 API。
6. 新增内容页应复用 `ThemedShell`、`ThemedHeader`、`ThemedPageHero` 和主题 token。
7. 未登录页面不得请求或展示真实家庭私密数据。

## 常见问题和预防

1. 在脚本中执行 `pnpm exec` 时，确保已正确 cd 到项目根目录。
2. Next.js 启动参数使用 `-H` 和 `-p` 短参数。
3. Prisma 使用 `@prisma/adapter-pg` 适配 Vercel Postgres。
4. 默认主题应保持为 `paper`，数据库默认值和前端 fallback 需要一致。
5. 改动主模块入口时，优先更新 `lib/memory-modules.ts`，不要在多个页面重复维护。

