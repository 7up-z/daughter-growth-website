# Vercel Postgres 设置指南

## 第一步：创建 Vercel Postgres 数据库

### 1.1 访问 Vercel Storage
1. 登录 https://vercel.com
2. 点击顶部导航栏的 **"Storage"**
3. 点击 **"Create Database"**

### 1.2 选择数据库类型
- 选择 **"Vercel Postgres"**
- 如果没有这个选项，说明您的账户需要升级或该功能在您所在区域不可用

### 1.3 配置数据库
- **Database Name**: `daughter-growth-db`
- **Region**: 选择 **Hong Kong (hkg1)** 或离您最近的区域
- 点击 **"Create"**

### 1.4 连接到项目
1. 创建后点击 **"Connect to Project"**
2. 选择您的项目 `daughter-growth-website`
3. 点击 **"Connect"**

---

## 第二步：获取数据库连接字符串

### 2.1 查看环境变量
连接成功后，Vercel 会自动添加以下环境变量到您的项目：

- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL` （我们使用这个）
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### 2.2 验证环境变量
1. 进入项目 **Settings** → **Environment Variables**
2. 确认 `POSTGRES_PRISMA_URL` 已存在

---

## 第三步：更新代码（已完成）

代码已更新为使用 PostgreSQL：
- ✅ `prisma/schema.prisma` - 数据库提供程序改为 postgresql
- ✅ `package.json` - 添加了 vercel-build 脚本

---

## 第四步：推送代码并部署

### 4.1 推送代码
```powershell
cd C:\Users\cntd2\Documents\daughter-growth-website
git add .
git commit -m "Update to use Vercel Postgres"
git push origin master
```

### 4.2 等待自动部署
Vercel 会自动检测到代码推送并开始部署。

---

## 第五步：运行数据库迁移

### 方法 1：使用 Vercel CLI（推荐）

```powershell
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 进入项目目录
cd C:\Users\cntd2\Documents\daughter-growth-website

# 连接项目
vercel link

# 拉取环境变量
vercel env pull .env.local

# 运行迁移
npx prisma migrate deploy
```

### 方法 2：在 Vercel 控制台运行

1. 进入项目页面
2. 点击 **"Functions"** 或使用 Vercel CLI 命令

---

## 第六步：验证部署

### 6.1 检查环境变量
确保以下变量已设置：
- `POSTGRES_PRISMA_URL` ✅ （Vercel 自动添加）
- `NEXTAUTH_SECRET` （您需要手动添加）
- `NEXTAUTH_URL` （部署后获取）

### 6.2 生成 NEXTAUTH_SECRET
```powershell
-join ((1..32) | ForEach-Object { Get-Random -Maximum 256 } | ForEach-Object { "{0:X2}" -f $_ })
```

### 6.3 测试注册功能
访问部署后的网站，尝试注册账户。

---

## 常见问题

### Q1: 没有 "Vercel Postgres" 选项？
**A**: Vercel Postgres 可能需要：
- 升级到 Pro 计划
- 或申请 Early Access
- 或使用替代方案：**Supabase**（免费）

### Q2: 迁移失败？
**A**: 确保环境变量正确加载：
```powershell
vercel env pull .env.local
```

### Q3: 数据库连接超时？
**A**: 检查 `POSTGRES_PRISMA_URL` 是否正确，或尝试使用 `POSTGRES_URL_NON_POOLING`

---

## 替代方案：Supabase（如果 Vercel Postgres 不可用）

如果 Vercel Postgres 在您的账户中不可用，可以使用 **Supabase**：

1. 访问 https://supabase.com
2. 创建免费账户
3. 创建新项目
4. 获取 **Database URL**
5. 在 Vercel 环境变量中添加 `POSTGRES_PRISMA_URL` = Supabase 的连接字符串

---

## 下一步

1. 在 Vercel 中创建 Postgres 数据库
2. 连接数据库到项目
3. 推送代码
4. 运行数据库迁移
5. 测试网站功能

**请按步骤操作，遇到问题告诉我！**
