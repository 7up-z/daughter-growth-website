# 🚀 Vercel 部署快速设置指南

## 你的信息
- **GitHub**: 849000@qq.com
- **域名**: xiaomie.net
- **平台**: Vercel
- **数据库**: PostgreSQL

---

## 第一步：安装 Git

1. 访问 https://git-scm.com/download/win
2. 下载并安装 Git for Windows
3. 安装过程中保持默认选项即可

---

## 第二步：创建 GitHub 仓库

1. 访问 https://github.com/new
2. 填写：
   - Repository name: `daughter-growth-website`
   - Description: 女儿成长记录网站
   - 选择 **Private**（私密仓库）
3. 点击 "Create repository"
4. 复制仓库地址（类似：`https://github.com/你的用户名/daughter-growth-website.git`）

---

## 第三步：推送代码

打开 **PowerShell**（以管理员身份），执行：

```powershell
# 进入项目目录
cd C:\Users\cntd2\Documents\daughter-growth-website

# 初始化 Git
git init

# 配置 Git 用户名和邮箱
git config user.name "你的名字"
git config user.email "849000@qq.com"

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 添加远程仓库（把 YOUR_USERNAME 换成你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/daughter-growth-website.git

# 推送代码
git push -u origin main
```

---

## 第四步：部署到 Vercel

### 4.1 注册/登录 Vercel
1. 访问 https://vercel.com
2. 点击 "Sign Up"
3. 选择 "Continue with GitHub"
4. 使用 849000@qq.com 登录

### 4.2 导入项目
1. 点击 "Add New Project"
2. 找到 `daughter-growth-website` 仓库
3. 点击 "Import"
4. Framework Preset 选择 "Next.js"
5. 点击 "Deploy"

### 4.3 等待部署完成
- 大约需要 2-3 分钟
- 部署成功后会显示一个临时域名（如 xxx.vercel.app）

---

## 第五步：创建数据库

### 5.1 在 Vercel 创建 PostgreSQL
1. 在 Vercel Dashboard 点击 "Storage"
2. 点击 "Create Database"
3. 选择 "Vercel Postgres"
4. 区域选择 "Hong Kong (hkg1)"
5. 点击 "Create"
6. 连接到项目

### 5.2 获取数据库连接字符串
1. 在数据库详情页，点击 ".env.local"
2. 复制 `POSTGRES_URL` 的值

---

## 第六步：配置环境变量

在 Vercel 项目设置中：

1. 点击 "Settings" → "Environment Variables"
2. 添加以下变量：

| 名称 | 值 |
|------|-----|
| `DATABASE_URL` | 从数据库页面复制的 POSTGRES_URL |
| `NEXTAUTH_SECRET` | 随机字符串（见下方生成方法） |
| `NEXTAUTH_URL` | `https://xiaomie.net` |
| `BLOB_READ_WRITE_TOKEN` | 从 Vercel Blob 获取 |

### 生成 NEXTAUTH_SECRET

在 PowerShell 中运行：
```powershell
-join ((1..32) | ForEach-Object { Get-Random -Maximum 256 } | ForEach-Object { "{0:X2}" -f $_ })
```

复制生成的字符串作为 NEXTAUTH_SECRET 的值。

---

## 第七步：重新部署

1. 在 Vercel Dashboard 点击 "Redeploy"
2. 等待部署完成

---

## 第八步：数据库迁移

### 方法 1：在 Vercel Console 中运行
1. 在 Vercel Dashboard 点击 "Functions"
2. 或使用 Vercel CLI：

```powershell
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 进入项目目录
cd C:\Users\cntd2\Documents\daughter-growth-website

# 连接项目
vercel link

# 设置环境变量并运行迁移
$env:DATABASE_URL="你的数据库连接字符串"
npx prisma migrate deploy
```

### 方法 2：本地运行迁移
```powershell
cd C:\Users\cntd2\Documents\daughter-growth-website

# 安装依赖
npm install

# 设置数据库连接
$env:DATABASE_URL="你的数据库连接字符串"

# 运行迁移
npx prisma migrate deploy

# 生成 Prisma Client
npx prisma generate
```

---

## 第九步：绑定域名

### 9.1 在 Vercel 添加域名
1. 在 Vercel Dashboard 点击 "Settings" → "Domains"
2. 输入 `xiaomie.net`
3. 点击 "Add"

### 9.2 配置 DNS 记录

登录你的域名管理后台（购买域名的网站），添加以下记录：

**方式 1：A 记录（推荐）**
```
类型: A
主机记录: @
记录值: 76.76.21.21
TTL: 600
```

**方式 2：CNAME 记录**
```
类型: CNAME
主机记录: www
记录值: cname.vercel-dns.com
TTL: 600
```

### 9.3 等待 DNS 生效
- 通常需要 5-30 分钟
- 可以使用 https://www.whatsmydns.net/ 检查

---

## 第十步：验证部署

访问 https://xiaomie.net 检查：

- [ ] 网站可以正常打开
- [ ] 注册/登录功能正常
- [ ] 可以添加生日视频
- [ ] 可以添加旅行日记（含图片上传）
- [ ] 可以添加摄影记录（含图片上传）
- [ ] 可以删除内容
- [ ] 主题切换正常
- [ ] 移动端访问正常

---

## 🎉 完成！

网站已成功部署到 Vercel，使用 PostgreSQL 数据库，绑定自定义域名 xiaomie.net。

---

## 🔧 后续优化建议

1. **配置 Vercel Blob**：用于图片存储（已完成配置）
2. **设置自动备份**：定期备份数据库
3. **配置分析工具**：如 Google Analytics
4. **SEO 优化**：添加 sitemap.xml
5. **SSL 证书**：Vercel 自动提供 HTTPS

---

## 📞 需要帮助？

- Vercel 文档: https://vercel.com/docs
- Next.js 文档: https://nextjs.org/docs
- Prisma 文档: https://www.prisma.io/docs
- 域名 DNS 配置: 联系域名提供商客服
