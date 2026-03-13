#!/bin/bash

# ARI 划词翻译 - GitHub 推送脚本
# 使用方法：
#   1. 修改下面的 GitHub 用户名和仓库名
#   2. 保存此文件
#   3. 运行: bash push_to_github.sh

# ===================== 配置部分 =====================
GITHUB_USERNAME="YOUR_USERNAME"      # 你的 GitHub 用户名
GITHUB_REPO="ari-translation-plugin"  # 仓库名称
USE_SSH=false                          # 是否使用 SSH (true/false)

# ===================== 推送脚本 =====================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "🚀 ARI 划词翻译 - GitHub 推送"
echo "================================"
echo ""

# 设置远程 URL
if [ "$USE_SSH" = true ]; then
    REMOTE_URL="git@github.com:${GITHUB_USERNAME}/${GITHUB_REPO}.git"
    echo "📍 使用 SSH 连接"
else
    REMOTE_URL="https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}.git"
    echo "📍 使用 HTTPS 连接"
fi

echo "用户名: $GITHUB_USERNAME"
echo "仓库名: $GITHUB_REPO"
echo "URL: $REMOTE_URL"
echo ""

# 检查 git 状态
echo "📊 检查 Git 状态..."
if [ -d .git ]; then
    echo "✅ Git 仓库已存在"
else
    echo "❌ 错误：未找到 Git 仓库"
    exit 1
fi

# 添加远程仓库
echo ""
echo "🔗 添加远程仓库..."
git remote remove origin 2>/dev/null
git remote add origin "$REMOTE_URL"
git remote -v

# 推送代码
echo ""
echo "📤 推送代码到 GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ 推送完成！"
echo ""
echo "访问你的仓库："
if [ "$USE_SSH" = true ]; then
    echo "  https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}"
else
    echo "  https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}"
fi
