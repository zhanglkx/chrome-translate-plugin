# 📤 推送到 GitHub 指南

## 🎯 目标

将 ARI 划词翻译插件推送到你的 GitHub 仓库

---

## 📋 前置条件

- ✅ Git 已配置（已完成）
- ✅ 本地代码已提交（已完成）
- ⏳ 需要：GitHub 账户和仓库

---

## 🚀 推送步骤

### 步骤 1️⃣：创建 GitHub 仓库

1. 访问 https://github.com/new
2. 填写信息：
   - **Repository name**: `ari-translation-plugin` （或其他名称）
   - **Description**: `ARI 划词翻译 - Chrome 扩展插件，支持 DeepSeek AI 翻译`
   - **Public/Private**: 根据需要选择
3. ❌ **不要** 初始化 README、.gitignore 等空文件
4. 点击"Create repository"

### 步骤 2️⃣：添加远程仓库

从 GitHub 复制仓库 URL（HTTPS 或 SSH），然后在终端运行：

**使用 HTTPS**（推荐新手）:
```bash
cd /Users/temptrip/Documents/Demo/chromePlugin/chrome-translate-plugin
git remote add origin https://github.com/YOUR_USERNAME/ari-translation-plugin.git
git branch -M main
git push -u origin main
```

**使用 SSH**（需要配置 SSH Key）:
```bash
cd /Users/temptrip/Documents/Demo/chromePlugin/chrome-translate-plugin
git remote add origin git@github.com:YOUR_USERNAME/ari-translation-plugin.git
git branch -M main
git push -u origin main
```

### 步骤 3️⃣：输入凭证

如果使用 HTTPS：
- 用户名：你的 GitHub 用户名
- 密码：你的 GitHub Token（**不是密码**）

💡 **获取 GitHub Token**:
1. 访问 https://github.com/settings/tokens
2. 点击"Generate new token"
3. 选择 `public_repo` 权限（公开仓库）或 `repo` 权限（私有仓库）
4. 复制 token 并用作密码

### 步骤 4️⃣：验证推送成功

```bash
# 查看远程仓库
git remote -v

# 查看推送状态
# 应该看到: origin https://github.com/YOUR_USERNAME/ari-translation-plugin.git
```

访问你的 GitHub 仓库 URL，应该能看到所有文件！

---

## 🔄 之后的更新

每次本地修改和提交后，推送只需：

```bash
git push
```

---

## 🎓 常用 Git 命令速查

```bash
# 查看状态
git status

# 查看日志
git log --oneline

# 查看修改
git diff

# 添加并提交
git add .
git commit -m "描述你的改动"

# 推送
git push
```

---

## 🆘 常见问题

### ❓ 怎样确认 SSH 已配置？
```bash
ssh -T git@github.com
# 应该看到: Hi YOUR_USERNAME! You've successfully authenticated...
```

### ❓ 忘记了远程 URL？
```bash
git remote -v
```

### ❓ 需要修改远程 URL？
```bash
# 查看现在的 URL
git remote get-url origin

# 修改 URL
git remote set-url origin NEW_URL
```

### ❓ 远程分支不是 main？
```bash
# 查看所有分支
git branch -a

# 重命名本地分支
git branch -M main

# 推送时指定分支
git push -u origin main
```

---

## ✅ 完成验证清单

- [ ] GitHub 仓库已创建
- [ ] 复制了仓库 URL
- [ ] 执行了 `git remote add origin <URL>`
- [ ] 执行了 `git push -u origin main`
- [ ] 访问 GitHub 看到了你的代码
- [ ] 提交消息显示为 "Initial commit: ARI Translation Plugin v2.0"

---

## 🎉 成功标志

在 GitHub 上应该能看到：
- ✅ 所有源代码文件
- ✅ 所有文档文件（.md）
- ✅ 正确的目录结构
- ✅ 2 条提交记录

---

**需要帮助？** 
- GitHub 文档: https://docs.github.com/en
- Git 教程: https://git-scm.com/book/en/v2
