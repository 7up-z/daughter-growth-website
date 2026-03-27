# 女儿成长记录网站 - Vercel 部署完整指南

## 📋 部署前准备

### 1. 安装必要工具
- **Node.js**: https://nodejs.org (建议 v18+)
- **Git**: https://git-scm.com/downloads
- **Vercel CLI**: `npm i -g vercel`

### 2. 账号准备
- GitHub 账号: 849000@qq.com
- Vercel 账号 (使用 GitHub 登录)
- 域名: xiaomie.net

---

## 🚀 部署步骤

### 步骤 1: 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - Repository name: `daughter-growth-website`
   - Description: 女儿成长记录网站
   - 选择 Private（私密）
3. 点击 "Create repository"

### 步骤 2: 推送代码到 GitHub

打开 PowerShell 或 CMD，执行：

```powershell
cd C:\Users\cntd2\Documents\daughter-growth-website

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit for Vercel deployment"

# 添加远程仓库（将 YOUR_USERNAME 替换为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/daughter-growth-website.git

# 推送代码
git push -u origin main
```

### 步骤 3: 创建 Vercel 项目

1. 访问 https://vercel.com
2. 点击 "Add New Project"
3. 选择 GitHub 仓库 `daughter-growth-website`
4. 点击 "Import"

### 步骤 4: 配置环境变量

在 Vercel 项目设置中，添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | (稍后获取) | PostgreSQL 连接字符串 |
| `NEXTAUTH_SECRET` | (随机生成) | 用于加密会话 |
| `NEXTAUTH_URL` | https://xiaomie.net | 生产环境 URL |

生成 NEXTAUTH_SECRET：
```powershell
# 在 PowerShell 中运行
-join ((1..32) | ForEach-Object { Get-Random -Maximum 256 } | ForEach-Object { "{0:X2}" -f $_ })
```

### 步骤 5: 创建 PostgreSQL 数据库

1. 在 Vercel Dashboard 中点击 "Storage"
2. 点击 "Create Database"
3. 选择 "Vercel Postgres"
4. 选择区域：Hong Kong (hkg1) - 离中国最近
5. 连接到项目
6. 复制 `DATABASE_URL` 到环境变量

### 步骤 6: 部署

1. 点击 "Deploy"
2. 等待构建完成
3. 访问临时域名查看效果

### 步骤 7: 绑定自定义域名

1. 在 Vercel 项目设置中选择 "Domains"
2. 添加域名: `xiaomie.net`
3. 根据提示配置 DNS 记录：
   - 类型: A
   - 名称: @
   - 值: 76.76.21.21
   
   或 CNAME 记录：
   - 类型: CNAME
   - 名称: www
   - 值: cname.vercel-dns.com

### 步骤 8: 数据库迁移

部署成功后，在 Vercel Console 中运行：

```bash
npx prisma migrate deploy
```

或在本地运行：

```powershell
# 设置环境变量后
$env:DATABASE_URL="你的PostgreSQL连接字符串"
npx prisma migrate deploy
```

---

## 🔧 域名 DNS 配置

登录你的域名管理后台（如阿里云、腾讯云、GoDaddy 等），添加以下记录：

### 方式 1: A 记录（推荐）
```
类型: A
主机记录: @
记录值: 76.76.21.21
TTL: 600
```

### 方式 2: CNAME 记录
```
类型: CNAME
主机记录: www
记录值: cname.vercel-dns.com
TTL: 600
```

---

## ✅ 部署后检查清单

- [ ] 网站可以正常访问 https://xiaomie.net
- [ ] 用户注册/登录功能正常
- [ ] 图片上传功能正常
- [ ] 生日视频可以添加/删除
- [ ] 旅行日记可以添加/删除
- [ ] 摄影记录可以添加/删除
- [ ] 主题切换功能正常
- [ ] 移动端访问正常

---

## 🐛 常见问题

### 1. 数据库连接失败
- 检查 DATABASE_URL 是否正确
- 确认数据库已创建并连接

### 2. 图片上传失败
- Vercel 是 Serverless，文件上传需要配置外部存储
- 建议后续迁移到云存储（如阿里云 OSS、AWS S3）

### 3. 构建失败
- 检查 package.json 中的构建命令
- 查看 Vercel 构建日志

---

## 📞 需要帮助？

- Vercel 文档: https://vercel.com/docs
- Next.js 文档: https://nextjs.org/docs
- Prisma 文档: https://www.prisma.io/docs
