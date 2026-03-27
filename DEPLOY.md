# 女儿成长记录网站 - Vercel 部署指南

## 项目信息
- **域名**: xiaomie.net
- **部署平台**: Vercel
- **数据库**: PostgreSQL (Vercel Postgres)

## 部署步骤

### 1. 创建 Vercel 项目
1. 访问 https://vercel.com
2. 使用 GitHub 账号 (849000@qq.com) 登录
3. 点击 "Add New Project"
4. 导入 GitHub 仓库

### 2. 创建 PostgreSQL 数据库
1. 在 Vercel Dashboard 点击 "Storage"
2. 选择 "Create Database"
3. 选择 "Vercel Postgres"
4. 连接到项目

### 3. 环境变量配置
在 Vercel 项目设置中添加以下环境变量：

```
DATABASE_URL=          # Vercel Postgres 自动提供
NEXTAUTH_SECRET=       # 随机字符串，用于加密
NEXTAUTH_URL=          # https://xiaomie.net (生产环境)
```

生成 NEXTAUTH_SECRET：
```bash
openssl rand -base64 32
```

### 4. 构建配置
项目已配置好，Vercel 会自动检测 Next.js 项目。

### 5. 域名绑定
1. 在 Vercel 项目设置中选择 "Domains"
2. 添加域名: xiaomie.net
3. 根据提示配置 DNS 记录

### 6. 数据库迁移
首次部署后，在 Vercel 控制台运行：
```bash
npx prisma migrate deploy
```

## 本地开发
```bash
npm install
npx prisma generate
npm run dev
```

## 文件结构
```
daughter-growth-website/
├── app/                 # Next.js App Router
├── components/          # React 组件
├── lib/                 # 工具函数
├── prisma/             # 数据库模型
├── public/             # 静态资源
│   └── uploads/        # 上传文件
└── package.json
```

## 功能模块
- ✅ 用户登录/注册
- ✅ 生日视频管理
- ✅ 旅行日记（支持图片上传）
- ✅ 摄影记录（支持图片上传）
- ✅ 留言板
- ✅ 主题切换
- ✅ 响应式设计

## 注意事项
1. 图片上传到 `public/uploads/images/`
2. 生产环境使用 PostgreSQL
3. 定期备份数据库
