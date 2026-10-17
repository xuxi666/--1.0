# 食有灵 FOOD SOUL

> 让每一道中国美食，都有自己的灵魂。

中国美食 AI 人格网站：把菜品变成有脾气、有语言习惯、有知识边界的角色。首页以「八大菜系」星环呈现我国传统八大菜系，点击任意菜系进入菜系探索页，看代表菜、找对应角色聊天、让 AI 写菜谱、按口味推荐下一顿，并在社区里讨论。首页右下角还有一只随机出现的美食小精灵，可以随手聊两句。

---

## 运行

```bash
npm install
npm run dev      # 本机 http://localhost:5173
```

启动后终端会同时打印 `Network:` 地址，例如：

```
➜  Local:   http://localhost:5173/
➜  Network: http://10.122.63.83:5173/
```

### 让舍友通过局域网访问

开发服务器已监听 `0.0.0.0`，同一 Wi-Fi 下的手机 / 电脑直接打开终端里的 `Network` 地址即可（后端 AI 接口同源，一起可用）。

**地址会变**：校园网 / 路由器用 DHCP 分配 IP，换网络或租约到期后旧地址就失效（表现为页面一直空白或连不上）。随时用下面的命令查看当前地址：

```bash
npm run ip
```

排查清单：

1. **同一网络**：两台设备连同一个 Wi-Fi / 路由器，且在同一网段（校园网常见 `/18`、`/24`）。
2. **防火墙**：首次运行 Node 时 Windows 会弹「允许访问」——勾选专用/公用网络。已被拦截时用管理员 PowerShell 放行：
   ```powershell
   netsh advfirewall firewall add rule name="Vite 5173" dir=in action=allow protocol=TCP localport=5173
   ```
3. **AP 隔离**：校园网 / 公司 Wi-Fi 常开启客户端隔离，设备之间互相 ping 不通。此时改用手机热点或宿舍路由器（电脑开热点时地址通常是 `192.168.137.1:5173`）。
4. **VPN / 代理**：Clash 等工具的 TUN 模式会劫持局域网路由，访问前关掉系统代理或 TUN。
5. **端口固定**：`strictPort: true`，5173 被占用时会直接报错而不是换端口，避免舍友拿到旧地址。

生产构建 / 预览（同样支持局域网）：

```bash
npm run build
npm run preview  # 本机 http://localhost:4173
```

### 接入智谱 AI（可选）

```bash
cp .env.example .env
# 编辑 .env，填入 ZHIPU_API_KEY
```

- `ZHIPU_API_KEY`：智谱开放平台 API Key（https://open.bigmodel.cn/usercenter/apikeys）
- `ZHIPU_MODEL`：默认 `glm-4-flash-250414`（免费额度、长 JSON 生成更快），也可换 `glm-4-air`（更快）/ `glm-4.6`（更强推理但更慢）

Key 只由服务端中间件（`server/api.ts`）读取，**不会进入前端产物**。未配置 Key 时，全站进入明确标注的「演示模式」。

当前仓库内的 `.env` 已配置好 Key，启动即为真实模式（`/api/status` 返回 `live`）。菜谱生成约 15–40 秒；模型偶发输出非法 JSON 时服务端会自动重试一次，仍失败才降级为演示菜谱。

---

## 技术栈

- React 18 + TypeScript + Vite 5 + React Router 6
- 原生 CSS（设计变量 / Grid / Flex / transform 动画），无 UI 框架
- Vite 中间件承载 AI 服务层：`/api/chat`（角色，SSE 流式）、`/api/pet-chat`（首页小精灵，SSE 流式）、`/api/recipe`、`/api/recommend`、`/api/status`
- 社区服务：`/api/community`（GET 快照 / 发帖 / 回复 / 点赞），数据落盘 `data/community.json`，局域网内多设备同步

## 目录

```
server/api.ts              AI 服务层：智谱调用、菜谱校验、推荐筛选、相关菜品、照片上传、社区存储、小精灵通用助手
data/community.json        社区数据（帖子 / 回复 / 点赞，首次访问自动创建并写入示例回复）
src/data/characters.ts     17 位角色的完整人格配置 + 独立系统提示词
src/data/cuisines.ts       八大菜系数据（名称/人格标签/地域/代表菜/图片/关联角色）+ 独立美食类型标签
src/data/foodSprites.ts    美食小精灵形象配置 + 随机选择逻辑（纯函数，可测试）
src/data/categories.ts     8 个口味人格
src/data/dishes.ts         30 道菜品库（推荐候选池）
src/components/FoodSoulOrbit.tsx   八大菜系旋转星环（悬停预览 / 点击进入）
src/components/FoodTypeTags.tsx    更多美食类型标签（火锅/烧烤/面食/甜品/街头小吃）
src/components/FoodSoulPet.tsx     首页悬浮美食小精灵（气泡 / 聊天面板 / 无障碍）
src/components/FoodSpriteArt.tsx   小精灵原创 SVG 形象（8 种，统一风格）
src/components/FoodPhoto.tsx       菜品照片（含加载/失败降级）
src/components/RelatedDishes.tsx   聊天页相关菜品侧栏
src/components/PostCard.tsx        社区帖子卡（含图片宫格与回复区）
src/components/Lightbox.tsx        图片灯箱
src/lib/community.ts               社区数据源（帖子/回复/点赞的获取与提交）
scripts/gen-photos.mjs             批量生成菜品照片（CogView）
src/pages/*.tsx            首页 / 人格 / 分类 / 菜系 / 角色 / 聊天 / 菜谱 / 推荐 / 社区
src/styles/*.css           设计系统与页面样式（community.css 为社区专属）
scripts/*.mjs              Playwright 截图与流程自检脚本（开发用）
```

## 星环实现（八大菜系）

三层结构保证「节点沿轨道旋转、文字始终正向」：

```
.orbit-rotor     匀速自转 θ（50s / 圈）
  .orbit-slot    rotate(a) translate(r) rotate(-a)   → 摆到圆周
    .orbit-counter  rotate(-θ)                        → 抵消父级旋转
      .orbit-node   文字/图片始终正向
```

- 星环节点为八大菜系（川、粤、苏、鲁、湘、闽、浙、徽），数据来自 `src/data/cuisines.ts`
- 悬停或键盘聚焦时，两个动画同时 `animation-play-state: paused`；悬停节点会在中心圆盘预览该菜系的
  人格标签、地域与前三道代表菜
- 点击任意菜系节点（或圆盘上的按钮）进入 `/cuisines/:id` 菜系探索页；方向键可切换节点，Enter 进入
- `prefers-reduced-motion: reduce` 时停止自转，保留静态环形布局
- 移动端节点名称改为圆盘内的胶囊标签，避免被中心圆盘裁切

## 八大菜系展示系统

- `src/data/cuisines.ts`：八大菜系统一数据（id / 序号 / 中英文名 / 人格标签 / 地域 / 文化介绍 /
  AI 角色设计方向 / 代表菜 / 主图 / 备用图 / 关联角色），并导出 `foodTypeTags` 保留
  重庆火锅、烧烤、面食、甜品、街头小吃等独立美食类型
- 首页中央圆盘：「每一道美食，都有自己的灵魂 / 八大菜系，万种风味。每一道菜，都值得被认识。」+
  「探索美食」按钮（跳转 `/personalities#cuisines` 菜系区块）
- `/cuisines/:id`（`src/pages/CuisinePage.tsx`）：菜系名称、地域、文化介绍、四道代表菜
  （已有同名角色的菜直接给聊天入口，所有代表菜都可「生成菜谱」）、相关 AI 角色卡片
- 菜系 ≠ 固定角色：八大菜系是文化分类，角色是独立人格。一个菜系可以有多道代表菜，
  每道菜可以有独立人格；暂无专属角色的菜系显示诚实的空状态与引导，不伪造角色
- `/personalities` 页新增「八大菜系」区块与「更多美食类型」标签，原口味方向与 17 位角色完整保留

## 真实实现 / 演示内容

| 功能 | 状态 |
| --- | --- |
| 首页 9 个区块、响应式、滚动渐入、八大菜系星环交互 | 真实实现 |
| 八大菜系数据 / 菜系探索页（代表菜 + 角色入口） | 真实实现（数据驱动，`src/data/cuisines.ts`） |
| 角色人格配置、分类页、角色详情页 | 真实实现（数据驱动） |
| 多轮对话 + 流式输出 + 角色切换 + 历史持久化 | 真实实现（已接入智谱 GLM，`/api/status` = live） |
| 结构化菜谱 + 服务端逐字段校验 + 份量重算 | 真实实现（含非法 JSON 自动重试） |
| 推荐：菜品库筛选 → 打分 → AI 写理由 | 真实实现（理由由 GLM 生成） |
| 聊天页「相关菜品」侧栏 | 真实实现：AI 从同口味菜品库挑选 4 道并写标签/理由，可换一批 |
| 首页美食小精灵（随机形象 / 悬浮气泡 / 聊天面板） | 真实实现：8 种原创 SVG 形象 + GLM 通用助手（`/api/pet-chat`，SSE 流式），无固定人格 |
| 社区：昵称 / 上传照片 / 点赞 / 回复 / 分类 / 排序 / 发帖 / 图片灯箱 | 真实交互：帖子、回复与点赞存服务端 `data/community.json`，同一局域网内所有设备同步可见 |
| 用户账号体系 | 未实现 |
| 美食图片 | 真实照片：44 张食物摄影图（含八大菜系主图），由 CogView-3-Flash 生成并本地缓存于 `public/images/photos/`（可用 `npm run photos` 重新生成） |

### 首页美食小精灵（FOOD SOUL PET）

首页右下角有一只悬浮的美食小精灵（汤圆 / 包子 / 馒头 / 饭团 / 饺子 / 煎蛋 / 辣椒 / 布丁 共 8 种原创
SVG 形象），与 17 位美食人格互相独立——形象只影响外观，对话统一使用服务端的通用助手提示词，没有麻辣、
清爽之类的固定人格。

- 每次完整刷新首页随机换一只，同一标签页会避开上一次的形象（sessionStorage 只记「上一次」，不固定形象）
- 首次进入显示一条可关闭的欢迎气泡，关闭后本次会话不再弹出；点击精灵展开聊天面板，ESC 或 ✕ 收起
- 聊天走独立接口 `POST /api/pet-chat`（SSE 流式）：服务端强制注入系统提示词、只接受 user/assistant 角色、
  限制单条 2000 字与最近 10 条历史；未配置 `ZHIPU_API_KEY` 时回复会被明确标注为「演示模式」
- 聊天记录保留在本次页面会话内（关掉面板再打开不丢），刷新页面重新开始；自发帖/回复以外的功能不受影响

### 局域网同步（社区）

社区不再依赖浏览器本地存储：发帖、回复、点赞全部通过服务端 API 写入 `data/community.json`，
舍友通过热点 / 同一 Wi-Fi 打开 `http://<你的IP>:5173/community` 即可看到你刚发的帖子并参与回复。

- 首次访问时自动创建该文件，并写入几条示例回复（对应演示帖，可随意删改）
- 点赞按浏览器匿名 id 记录：同一台设备不会重复计数，换设备可再点一次
- 帖子与回复仅存于运行服务的这台电脑；局域网内所有人看到的是同一份数据
- 没有登录与鉴权，昵称自填，只适合局域网/本地演示

### 照片上传

社区发帖可以上传自己拍的照片：浏览器端先压到长边 1600px 的 JPEG，再 `POST /api/upload`（base64），
服务端校验类型与大小（≤6MB）后落到 `public/uploads/`，通过 `GET /uploads/<file>` 提供，dev 与 preview 都可用。

- 单条帖子最多 3 张，支持点击选择与拖拽
- 上传目录已在 `.gitignore` 中忽略
- 没有登录与鉴权，只适合局域网/本地演示

## 已知限制

- 社区数据存服务端 `data/community.json`（局域网内同步），但无账号体系，不适合公网部署
- 菜品库为内置静态数据（30 条），未接入真实菜谱数据库
- 演示菜谱的步骤为通用模板，仅用于展示交互流程
