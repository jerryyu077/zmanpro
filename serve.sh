#!/bin/bash
# 简易本地服务器启动脚本

cd public
echo "🚀 启动本地服务器..."
echo "📱 访问地址："
echo "   员工列表页: http://localhost:8000/index.html"
echo "   日历页: http://localhost:8000/calendar.html"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

python3 -m http.server 8000

