# 员工工时管理系统

极简移动端员工工时管理 Web App，采用 iOS 风格浅色新拟物 UI。

## 🚀 技术栈

- **前端**: HTML5 + CSS3 + Vanilla JavaScript
- **后端**: Cloudflare Workers
- **数据库**: Cloudflare D1 (SQLite)
- **认证**: Cloudflare Zero Trust
- **部署**: Cloudflare Pages

## 📂 项目结构

```
zmansys3/
├── public/                 # 静态文件（前端）
│   ├── index.html         # 员工列表页
│   ├── calendar.html      # 员工日历页
│   ├── css/
│   │   └── style.css      # 统一样式
│   └── js/
│       ├── app.js         # 列表页逻辑
│       ├── calendar.js    # 日历页逻辑
│       ├── api.js         # API 封装
│       └── utils.js       # 工具函数
├── worker/                # Cloudflare Workers（后续创建）
├── PROJECT_PLAN.md       # 详细规划文档
└── README.md             # 本文件
```

## 🎨 设计特点

- **新拟物风格**: 柔光阴影，内凹/外凸效果
- **移动端优先**: 针对 iPhone Safari 优化
- **极简交互**: 一屏完成操作，无需滚动
- **直观易用**: 大按钮，易点击，易读

## 📱 功能模块

### 1. 员工列表页
- 搜索员工
- 添加/编辑/删除员工
- 查看本周/本月工时统计
- 点击进入日历页

### 2. 员工日历页
- 月历视图
- 单日工时录入（直接输入 / 时间范围）
- 多选日期统计
- 批量输入工时

## 🚧 当前状态

- [x] 项目规划文档
- [x] 页面静态 HTML 结构
- [x] 完整 CSS 样式（新拟物风格）
- [x] API 接口封装
- [x] 工具函数库
- [ ] 前端交互逻辑（进行中）
- [ ] 后端 API 开发
- [ ] 数据库配置
- [ ] Zero Trust 认证
- [ ] 部署配置

## 📖 开发指南

详细开发规划请参阅 [PROJECT_PLAN.md](PROJECT_PLAN.md)

## 📄 许可证

Private Project

