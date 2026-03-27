# Git 推送代码详细步骤

## 第一步：打开 PowerShell

### 方法 1：使用快捷键（推荐）
1. 按下键盘上的 `Win + X` 键
2. 在弹出的菜单中选择 **"Windows PowerShell"** 或 **"终端"**

### 方法 2：通过开始菜单
1. 点击屏幕左下角的 **"开始"** 按钮
2. 在搜索框中输入 **"powershell"**
3. 点击 **"Windows PowerShell"** 打开

### 方法 3：通过文件资源管理器
1. 打开文件资源管理器
2. 在地址栏输入 `powershell` 然后按回车

---

## 第二步：进入项目目录

在 PowerShell 中输入以下命令（可以复制粘贴）：

```powershell
cd C:\Users\cntd2\Documents\daughter-growth-website
```

然后按 **回车键**。

---

## 第三步：依次执行 Git 命令

**请按顺序复制粘贴以下命令，每行执行完后再执行下一行：**

### 1. 初始化 Git
```powershell
git init
```

### 2. 配置用户名（把"你的名字"换成你的真实姓名）
```powershell
git config user.name "你的名字"
```

### 3. 配置邮箱
```powershell
git config user.email "849000@qq.com"
```

### 4. 添加所有文件
```powershell
git add .
```

### 5. 提交代码
```powershell
git commit -m "Initial commit"
```

### 6. 添加远程仓库（重要：需要替换用户名）

**先查看你的 GitHub 用户名：**
1. 访问 https://github.com
2. 登录后看右上角显示的用户名
3. 比如用户名是 "zhangsan"

**然后执行：**
```powershell
git remote add origin https://github.com/你的用户名/daughter-growth-website.git
```

**示例：** 如果你的用户名是 zhangsan
```powershell
git remote add origin https://github.com/zhangsan/daughter-growth-website.git
```

### 7. 推送代码到 GitHub
```powershell
git push -u origin main
```

---

## 第四步：输入 GitHub 密码/Token

执行 `git push` 后，可能会提示输入密码：

### 如果提示输入用户名和密码：
- **Username**: 输入你的 GitHub 用户名
- **Password**: 输入你的 GitHub **Personal Access Token**（不是登录密码）

### 如何创建 Personal Access Token：
1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 填写 Note: "Vercel Deploy"
4. 勾选权限：**repo**（完整仓库访问）
5. 点击 "Generate token"
6. **复制生成的 token**（只显示一次！）
7. 在 PowerShell 中粘贴作为密码

---

## 完整命令示例

假设你的 GitHub 用户名是 **zhangsan**，以下是完整操作：

```powershell
# 进入项目目录
cd C:\Users\cntd2\Documents\daughter-growth-website

# 初始化 Git
git init

# 配置用户信息
git config user.name "张三"
git config user.email "849000@qq.com"

# 添加并提交代码
git add .
git commit -m "Initial commit"

# 连接远程仓库（替换 zhangsan 为你的用户名）
git remote add origin https://github.com/zhangsan/daughter-growth-website.git

# 推送代码
git push -u origin main
```

---

## 常见问题

### 问题 1：'git' 不是内部或外部命令
**解决：** Git 没有安装，请先访问 https://git-scm.com/download/win 下载安装

### 问题 2：fatal: not a git repository
**解决：** 没有执行 `git init`，请先初始化

### 问题 3：failed to push some refs
**解决：** 执行以下命令后再推送
```powershell
git pull origin main --rebase
git push -u origin main
```

### 问题 4：remote: Repository not found
**解决：** 检查 GitHub 用户名和仓库名是否正确

### 问题 5：Permission denied
**解决：** 
- 检查是否创建了 Personal Access Token
- 确保 Token 有 repo 权限
- 使用 Token 作为密码，不是 GitHub 登录密码

---

## 验证推送成功

推送成功后，访问：
```
https://github.com/你的用户名/daughter-growth-website
```

应该能看到上传的文件列表。

---

## 下一步

代码推送成功后，继续执行 Vercel 部署步骤：
1. 访问 https://vercel.com
2. 用 GitHub 登录
3. 导入 daughter-growth-website 仓库
