# 部署指南

## 📦 部署到 Cloudflare

### 前置要求
- Cloudflare 账号
- Wrangler CLI（`npm install -g wrangler`）
- Git 已推送到 GitHub

---

## 🚀 步骤 1：部署前端（Cloudflare Pages）

### 1.1 连接 GitHub 仓库
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** 
3. 点击 **Create Application** → **Pages** → **Connect to Git**
4. 选择仓库：`jerryyu077/zmanpro`
5. 配置构建设置：
   - **Build command**: 留空（静态网站无需构建）
   - **Build output directory**: `public`
   - **Root directory**: `/`

### 1.2 部署
- 点击 **Save and Deploy**
- 等待部署完成（约1-2分钟）
- 记录分配的域名：`https://zmanpro.pages.dev`

---

## 🗄️ 步骤 2：创建 D1 数据库

### 2.1 登录 Wrangler
```bash
wrangler login
```

### 2.2 创建数据库
```bash
cd /Users/jy/Desktop/zman/zmansys3
wrangler d1 create zmansys-db
```

**输出示例**：
```
✅ Successfully created DB 'zmansys-db'!
database_id = "xxxx-xxxx-xxxx-xxxx"
```

### 2.3 更新 wrangler.toml
复制输出的 `database_id`，替换 `wrangler.toml` 中的 `YOUR_DATABASE_ID`

### 2.4 初始化数据库结构
```bash
wrangler d1 execute zmansys-db --file=./schema.sql
```

### 2.5 验证数据库
```bash
wrangler d1 execute zmansys-db --command="SELECT name FROM sqlite_master WHERE type='table'"
```

应该看到：`employees` 和 `work_records` 两张表

---

## ⚙️ 步骤 3：部署 Workers API

### 3.1 部署到生产环境
```bash
wrangler deploy
```

**输出示例**：
```
✨ Compiled Worker successfully
✨ Uploaded Worker successfully
🌍 Deployed to https://zmansys-api.your-subdomain.workers.dev
```

### 3.2 记录 API 地址
复制输出的 Workers 地址，如：
```
https://zmansys-api.your-subdomain.workers.dev
```

---

## 🔗 步骤 4：连接前端和后端

### 4.1 更新前端 API 地址

编辑 `public/js/api.js`：
```javascript
const API_BASE = 'https://zmansys-api.your-subdomain.workers.dev/api';
```

替换为你的 Workers 地址。

### 4.2 提交并推送
```bash
git add public/js/api.js
git commit -m "Update API endpoint"
git push origin main
```

### 4.3 Pages 自动重新部署
- Cloudflare Pages 会自动检测 GitHub 推送
- 约1分钟后完成部署

---

## 🔒 步骤 5：配置 Zero Trust 认证（可选）

### 5.1 进入 Zero Trust 设置
1. Cloudflare Dashboard → **Zero Trust**
2. **Access** → **Applications** → **Add an application**
3. 选择 **Self-hosted**

### 5.2 配置应用
- **Application name**: `ZmanSys Employee Management`
- **Subdomain**: 使用你的 Pages 域名
- **Session duration**: 24 hours

### 5.3 添加访问策略
- **Policy name**: `Admin Only`
- **Action**: Allow
- **Include**: Emails → 输入你的管理员邮箱

### 5.4 保存并应用
访问你的应用时会自动跳转到登录页面。

---

## ✅ 验证部署

### 前端测试
访问：`https://zmanpro.pages.dev`
- 应该看到员工列表页
- 搜索栏、添加按钮可见

### 后端测试
```bash
# 测试 API 连接
curl https://zmansys-api.your-subdomain.workers.dev/api/employees

# 应该返回：
{"success":true,"data":[]}
```

### 功能测试
1. **添加员工**：点击"添加员工"，填写信息
2. **查看员工**：列表应显示新员工
3. **进入日历**：点击员工卡片
4. **录入工时**：点击日期，输入工时
5. **查看统计**：多选日期查看统计

---

## 🔧 常见问题

### Q1: API 请求失败（CORS 错误）
**解决**：检查 `worker/index.js` 中的 CORS 头是否正确

### Q2: 数据库连接失败
**解决**：
1. 确认 `wrangler.toml` 中的 `database_id` 正确
2. 运行 `wrangler d1 list` 查看数据库列表
3. 重新绑定：`wrangler d1 info zmansys-db`

### Q3: Workers 部署失败
**解决**：
1. 检查 `wrangler.toml` 语法
2. 运行 `wrangler whoami` 确认登录状态
3. 升级 Wrangler：`npm install -g wrangler@latest`

### Q4: Pages 构建失败
**解决**：
1. 确认 `public` 目录存在
2. 检查 GitHub 仓库同步
3. 查看 Pages 构建日志

---

## 📊 生产环境配置

### 自定义域名
1. Cloudflare Dashboard → **Pages** → 你的项目
2. **Custom domains** → **Set up a custom domain**
3. 输入域名，按提示配置 DNS

### 环境变量
如需添加环境变量：
1. Pages → **Settings** → **Environment variables**
2. Workers → Dashboard → 你的 Worker → **Settings** → **Variables**

### 监控和日志
- **Pages Analytics**: Dashboard → Pages → Analytics
- **Workers Logs**: Dashboard → Workers → 你的 Worker → Logs
- **Real-time logs**: `wrangler tail`

---

## 🎉 部署完成！

你的应用现已部署到：
- **前端**: https://zmanpro.pages.dev
- **API**: https://zmansys-api.your-subdomain.workers.dev

享受你的员工工时管理系统吧！

