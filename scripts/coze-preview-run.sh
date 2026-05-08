#!/usr/bin/env bash
set -euo pipefail

# 基于脚本位置定位项目根目录（使用绝对路径）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# 显式声明关键环境变量
export PORT=5000

# 清理 5000 端口残留进程（幂等性）
fuser -k 5000/tcp 2>/dev/null || true
sleep 1

# 启动 Next.js 开发服务器，绑定 IPv4 全接口
exec pnpm exec next dev -H 0.0.0.0 -p 5000
