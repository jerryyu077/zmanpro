# 员工工时管理系统 (ZmanSys)

> 极简移动端员工工时管理 Web App，专为老板快速记录与结算工时设计

[![部署状态](https://img.shields.io/badge/部署-Cloudflare_Pages-orange)](https://zmanpro.pages.dev)
[![License](https://img.shields.io/badge/license-Private-blue)]()

![iOS风格新拟物UI](https://img.shields.io/badge/UI-iOS_Neumorphism-lightgrey)
![Mobile First](https://img.shields.io/badge/Mobile-First-green)

---

## 🎯 项目简介

一款专为老板本人使用的极简员工工时管理系统，主要在 iPhone Safari 上使用。支持快速记录员工每天的工作时数、时薪和备注，并可对任意日期范围进行统计汇总。

### ✨ 核心特性

- 🎨 **iOS 风格新拟物 UI** - 浅色柔光设计，美观易用
- 📱 **移动端优先** - 专为 iPhone 优化，一屏完成操作
- ⚡ **极简交互** - 直观的点击、滑动交互
- 📊 **智能统计** - 自动计算本周/本月工时、多日期汇总
- 🎉 **节假日显示** - 内置美国法定节假日
- 🔒 **Zero Trust 认证** - Cloudflare 企业级安全保护

---

## 🚀 技术栈

### 前端
- **HTML5 + CSS3 + Vanilla JavaScript** - 无框架依赖，轻量快速
- **CSS Variables** - 统一主题配色
- **LocalStorage** - 本地数据持久化（开发阶段）

### 后端
- **Cloudflare Workers** - 全球边缘计算
- **Cloudflare D1** - SQLite 分布式数据库
- **RESTful API** - 标准化接口设计

### 部署
- **Cloudflare Pages** - 静态网站托管
- **GitHub** - 版本控制和 CI/CD
- **Cloudflare Zero Trust** - 单点登录认证

---

## 📂 项目结构

```
zmansys3/
├── public/                     # 前端静态文件
│   ├── index.html             # 员工列表页
│   ├── calendar.html          # 员工日历页
│   ├── css/
│   │   └── style.css          # 新拟物风格样式
│   └── js/
│       ├── app.js             # 列表页逻辑
│       ├── calendar.js        # 日历页逻辑
│       ├── api.js             # API 请求封装
│       └── utils.js           # 工具函数（日期、节假日）
├── worker/                     # Cloudflare Workers
│   └── index.js               # API 路由与业务逻辑
├── schema.sql                  # 数据库结构定义
├── wrangler.toml              # Cloudflare 配置
├── PROJECT_PLAN.md            # 详细规划文档
├── DEPLOYMENT.md              # 部署指南
└── README.md                  # 本文件
```

---

## 📱 功能模块

### 1️⃣ 员工列表页
<details>
<summary>点击展开详情</summary>

- ✅ 两列卡片布局（一页显示 8 个员工）
- ✅ 实时搜索（姓名/地点/备注）
- ✅ 添加/编辑/删除员工
- ✅ 显示本周/本月累计工时
- ✅ 点击卡片进入日历页
- ✅ 删除需二次确认（输入姓名）

**卡片信息**：
- 员工姓名 + 工作地点
- 默认时薪（橙色高亮）
- 本周工时 / 本月工时
- 备注信息
- 编辑 / 删除按钮

</details>

### 2️⃣ 员工日历页
<details>
<summary>点击展开详情</summary>

- ✅ iOS 风格月历视图（7×6 网格）
- ✅ 显示美国法定节假日（11个）
- ✅ 已录入工时的日期高亮显示
- ✅ 单日工时录入（两种模式）
- ✅ 多选日期统计
- ✅ 批量输入工时
- ✅ 月份切换

**单日录入模式**：
1. **直接输入工时** - 输入总时长（如 8.5 小时）
2. **时间范围** - 选择开始/结束时间，自动计算（支持跨日）

**多选统计**：
- 总工时
- 日均工时
- 平均时薪（加权平均）
- 总工资

</details>

### 3️⃣ 节假日功能
<details>
<summary>点击展开详情</summary>

**支持的美国法定节假日**：
1. 元旦（1月1日）
2. 马丁·路德·金纪念日（1月第三个星期一）
3. 总统日（2月第三个星期一）
4. 阵亡将士纪念日（5月最后一个星期一）
5. 解放日（6月19日）
6. 美国独立日（7月4日）
7. 劳动节（9月第一个星期一）
8. 哥伦布日（10月第二个星期一）
9. 退伍军人节（11月11日）
10. 感恩节（11月第四个星期四）
11. 圣诞节（12月25日）

**显示方式**：
- 日历格子上方显示中文简称（如"元旦"）
- 选中日期时显示完整名称（如"New Year's Day — 元旦"）
- 节假日背景淡黄粉渐变

</details>

---

## 🎨 设计规范

### 配色方案
| 用途 | 颜色 | 说明 |
|------|------|------|
| 主背景 | `#F5F5F7` | 浅灰 |
| 卡片背景 | `#FFFFFF` | 白色 |
| 主色调 | `#007AFF` | iOS 蓝 |
| 时薪 | `#FF9500` | 橙色 |
| 删除 | `#FF3B30` | 红色 |
| 统计 - 绿 | `#34C759` | 日均工时 |
| 统计 - 紫 | `#AF52DE` | 平均时薪 |

### 新拟物阴影
```css
/* 外凸效果 */
box-shadow: 8px 8px 16px rgba(163, 177, 198, 0.6),
            -8px -8px 16px rgba(255, 255, 255, 0.9);

/* 内凹效果 */
box-shadow: inset 4px 4px 8px rgba(163, 177, 198, 0.5),
            inset -4px -4px 8px rgba(255, 255, 255, 0.9);
```

---

## 🗄️ 数据库设计

### 表结构

**employees（员工表）**
```sql
- id (主键)
- name (姓名)
- location (地点)
- default_hourly_rate (默认时薪)
- notes (备注)
- created_at / updated_at
```

**work_records（工时记录表）**
```sql
- id (主键)
- employee_id (外键)
- date (日期 YYYY-MM-DD)
- hours (工时)
- hourly_rate (当天时薪)
- start_time / end_time (可选)
- notes (备注)
- created_at / updated_at
- UNIQUE(employee_id, date) -- 每人每天一条
```

---

## 🚀 快速开始

### 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/jerryyu077/zmanpro.git
cd zmanpro

# 2. 启动本地服务器
cd public
python3 -m http.server 8000

# 3. 访问
open http://localhost:8000/index.html
```

### 部署到 Cloudflare

详细步骤请参阅 [DEPLOYMENT.md](DEPLOYMENT.md)

**快速部署**：
```bash
# 1. 登录 Wrangler
wrangler login

# 2. 创建 D1 数据库
wrangler d1 create zmansys-db

# 3. 初始化数据库
wrangler d1 execute zmansys-db --file=./schema.sql

# 4. 部署 Workers
wrangler deploy

# 5. 在 Cloudflare Dashboard 部署 Pages
# - 连接 GitHub 仓库
# - 构建输出目录: public
```

---

## 📊 API 接口

完整的 RESTful API 文档：

### 员工管理
- `GET /api/employees` - 获取所有员工
- `GET /api/employees/:id` - 获取单个员工
- `POST /api/employees` - 新增员工
- `PUT /api/employees/:id` - 更新员工
- `DELETE /api/employees/:id` - 删除员工

### 工时记录
- `GET /api/employees/:id/records` - 获取某月工时
- `POST /api/work-records` - 新增/更新单日工时
- `POST /api/work-records/batch` - 批量添加工时
- `DELETE /api/work-records/:id` - 删除工时
- `POST /api/work-records/statistics` - 多日期统计

---

## ✅ 开发进度

- [x] 项目规划与 UI 设计
- [x] 前端页面开发（HTML + CSS）
- [x] 前端交互逻辑（JavaScript）
- [x] 员工列表页（搜索、新增、编辑、删除）
- [x] 日历页（单日录入、多选统计、批量输入）
- [x] 节假日功能（11个美国法定节假日）
- [x] 日期处理优化（修复时区问题）
- [x] 后端 API 开发（Cloudflare Workers）
- [x] 数据库设计（D1 SQLite）
- [x] 部署文档编写
- [ ] API 与前端对接
- [ ] Zero Trust 认证配置
- [ ] 生产环境部署
- [ ] 功能测试与优化

---

## 📖 文档

- 📘 [详细规划文档](PROJECT_PLAN.md) - 完整的功能规划和设计规范
- 🚀 [部署指南](DEPLOYMENT.md) - 一步步部署到 Cloudflare
- 💻 [API 文档](worker/index.js) - 查看 Worker 代码注释

---

## 🤝 贡献

这是一个私有项目，目前不接受外部贡献。

---

## 📄 许可证

Private Project - All Rights Reserved

---

## 👨‍💻 开发者

开发时间：2025年11月  
技术栈：Cloudflare + Vanilla JavaScript  
设计风格：iOS Neumorphism  

---

**⭐ 如果这个项目对你有帮助，欢迎 Star！**

