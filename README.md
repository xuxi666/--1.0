# 食有灵 FOOD SOUL

> 让每一道中国美食，都有自己的灵魂。

中国美食 AI 人格网站：把菜品变成有脾气、有语言习惯、有知识边界的角色。首页是一屏沉浸式双模式星环（锚定 100dvh，电脑与手机首屏都不露出任何后续模块）：默认「八大菜系」，转盘上方可一键切到「口味探索」（口味是味觉偏好而不是菜系，同一道菜可以属于多个口味）。点任意节点，会从被点击的那个圆出发做一次圆形揭示转场——圆形里透出的就是目标菜系 / 口味专属页本身（背景、角色、人格标签、聊天界面在点击瞬间就已经是最终画面），圆外仍是首页，约 420ms 扩张完成后无缝落进那个世界；每个菜系与每种口味都有自己的视觉主题（主色 / 渐变 / 光效 / 转场配色 / 聊天页配色，集中在 `src/data/visualThemes.ts`）与 AI 人格，可以跟它聊做菜、看代表菜、按菜系推荐下一顿，也能进入单道菜的角色聊天、让 AI 写菜谱、在聊天里真实检索做菜视频，并在社区里讨论；从聊天页返回首页是直接跳转，不再有反向圆形动画。图鉴、AI 菜谱工作台、智能推荐、社区等模块整体放在 `/explore`（导航栏对应入口都指向这个页面的区块）。「中国美食图鉴」（`/dishes`）收录 92 道有独立内容的菜，可以搜索、组合筛选、点进每道菜自己的详情页（介绍 / 历史 / 人物 / 典故 / 食材 / 口味技法 / 图片与来源说明），再从详情页带着「当前讨论」的上下文进入对应的角色或菜系聊天。首页右下角还有一只随机出现的美食小精灵，可以随手聊两句。

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

八大菜系数据与接口自检（数据部分无需服务，接口冒烟建议先 `npm run dev`）：

```bash
npm run check:cuisines
```

做菜视频搜索自检（含真实网络检索；接口冒烟与 UI 部分需先 `npm run dev`）：

```bash
npm run check:videos            # 意图/清洗/编排/真实检索/接口（87 项）
node scripts/video-check.mjs    # Playwright UI 全链路（43 项）
```

中国美食图鉴自检（数据部分无需服务；UI 部分需先 `npm run dev`）：

```bash
npm run check:dishes            # 数据一致性 / 搜索筛选 / 图片映射（62 项）
node scripts/dish-check.mjs     # Playwright UI 全链路（53 项）
```

口味探索自检（数据部分无需服务；UI 部分需先 `npm run dev`）：

```bash
npm run check:tastes            # 数据 / 图片 / 上下文隔离（120 项）
node scripts/taste-check.mjs    # Playwright UI 全链路（84 项）
```

全屏首页 / 圆形揭示转场 / 菜系与口味专属主题自检（需先 `npm run dev`）：

```bash
npm run check:ui                # Playwright UI 全链路（全屏适配 / 圆内即目标页且圆外仍是首页、合成器扩张无抖动 / 无缝落地 / 分层入场 / 16 套主题 / 降级 / 残留清理）
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
- Vite 中间件承载 AI 服务层：`/api/chat`（角色，SSE 流式；支持 `dishId` 菜品上下文）、`/api/cuisine-chat`（八大菜系人格，SSE 流式，按 `cuisineId` 由服务端选择系统提示词；同样支持 `dishId`）、`/api/taste-chat`（八种口味人格，SSE 流式，按 `tasteId` 由服务端选择系统提示词；同样支持 `dishId`）、`/api/pet-chat`（首页小精灵，SSE 流式）、`/api/recipe`、`/api/recommend`、`/api/videos/search`（做菜视频真实检索）、`/api/status`
- 社区服务：`/api/community`（GET 快照 / 发帖 / 回复 / 点赞），数据落盘 `data/community.json`，局域网内多设备同步

## 目录

```
server/api.ts              AI 服务层：智谱调用、菜谱校验、推荐筛选、相关菜品、照片上传、社区存储、小精灵通用助手、做菜视频搜索路由
server/services/videoSearch.ts  做菜视频检索服务（B 站真实检索 + 平台搜索入口 + 缓存/清洗/去重/排序）
data/community.json        社区数据（帖子 / 回复 / 点赞，首次访问自动创建并写入示例回复）
src/data/characters.ts     17 位角色的完整人格配置 + 独立系统提示词
src/data/cuisines.ts       八大菜系数据（名称/人格标签/地域/代表菜/图片/关联角色/独立 systemPrompt）+ 独立美食类型标签
src/data/tastes.ts         八种口味探索数据（名称/人格标签/风味介绍/代表菜 id/图片菜品 id/口味关键词/独立 systemPrompt）+ 口味对话上下文校验
src/data/foodSprites.ts    美食小精灵形象配置 + 随机选择逻辑（纯函数，可测试）
src/data/categories.ts     8 个口味人格
src/data/dishes/           唯一菜品库（92 道）：types.ts（Dish/DishSeed/枚举）+ index.ts（推导/查询）+ legacy.ts 与八大菜系各一个文件
src/lib/dishBook.ts        图鉴检索纯函数（关键词 / 菜系 / 类型 / 口味 / 难度 / 独立美食类型 + 计数）
src/lib/dishImage.ts       菜品图片解析（有图用图，缺图统一占位图）
src/components/DishCard.tsx        图鉴菜品卡片（图 / 名 / 归属 / 一句话 / 口味 / 详情入口）
src/components/FoodWheel.tsx       通用旋转星环（八大菜系 / 口味探索共用：自转 / 悬停暂停预览 / 键盘 / 入场动画 / 点击回报屏幕坐标）
src/components/HomeFoodWheel.tsx   首页双模式转盘（模式切换控件 + 两套独立数据配置 + 中心文案与转场入口）
src/components/CircularTransition.tsx  圆形揭示转场（Provider + 预览层：原生 DOM 建壳、transform + 逆缩放让圆内 1:1 渲染真实目标页 / 覆盖半径计算 / 无缝落地标记 / reduced-motion 直接跳转 / 残留兜底清理）
src/data/visualThemes.ts           菜系 / 口味 / 品牌视觉主题总表（VisualTheme 类型 + --t-* 变量映射，按稳定 id 查找）
src/pages/ExplorePage.tsx          探索页 /explore（原首页除转盘外的全部模块：人格 / 角色 / 图鉴 / 菜谱 / 推荐 / 社区 / 宣言）
src/components/TasteChat.tsx       口味 AI 聊天区（独立历史 fs-taste-chat-<tasteId>）
src/components/FoodTypeTags.tsx    更多美食类型标签（火锅/烧烤/面食/甜品/街头小吃）
src/components/FoodSoulPet.tsx     首页悬浮美食小精灵（气泡 / 聊天面板 / 无障碍）
src/components/FoodSpriteArt.tsx   小精灵原创 SVG 形象（8 种，统一风格）
src/components/FoodPhoto.tsx       菜品照片（含加载/失败降级）
src/components/RelatedDishes.tsx   聊天页相关菜品侧栏
src/components/VideoResults.tsx    聊天内视频结果卡片（真实链接与 AI 文本严格分离）
src/lib/videoIntent.ts             视频意图解析 / 关键词生成 / 链接白名单校验（前后端共用纯函数）
src/components/PostCard.tsx        社区帖子卡（含图片宫格与回复区）
src/components/Lightbox.tsx        图片灯箱
src/lib/community.ts               社区数据源（帖子/回复/点赞的获取与提交）
scripts/gen-photos.mjs             批量生成菜品照片（CogView）
scripts/check-cuisines.mjs         八大菜系数据 / 接口一致性检查（npm run check:cuisines）
scripts/check-tastes.mjs           口味探索数据 / 图片映射 / 上下文隔离检查（npm run check:tastes）
scripts/check-dishes.mjs           美食图鉴数据一致性 / 搜索筛选 / 图片映射检查（npm run check:dishes）
scripts/check-videos.mjs           做菜视频搜索数据 / 服务 / 真实检索检查（npm run check:videos）
scripts/dish-check.mjs             美食图鉴 UI 全链路自检（Playwright）
scripts/taste-check.mjs            口味探索 UI 全链路自检（Playwright）
scripts/video-check.mjs            做菜视频搜索 UI 全链路自检（Playwright）
scripts/ui-check.mjs               全屏首页 / 圆形揭示转场 / 专属主题 UI 全链路自检（Playwright）
src/pages/*.tsx            首页 / 探索 / 人格 / 分类 / 菜系 / 口味（TasteIndexPage / TastePage）/ 角色 / 聊天 / 菜谱 / 推荐 / 社区 / 图鉴（DishBookPage / DishDetailPage）
src/styles/*.css           设计系统与页面样式（community.css 为社区专属；transition.css 为转场动画层与主题页）
scripts/*.mjs              Playwright 截图与流程自检脚本（开发用）
```

## 星环实现（双模式：八大菜系 / 口味探索）

三层结构保证「节点沿轨道旋转、文字始终正向」：

```
.orbit-rotor     匀速自转 θ（50s / 圈）
  .orbit-slot    rotate(a) translate(r) rotate(-a)   → 摆到圆周
    .orbit-counter  rotate(-θ)                        → 抵消父级旋转
      .orbit-node   文字/图片始终正向
```

- 星环节点为八大菜系（川、粤、苏、鲁、湘、闽、浙、徽），数据来自 `src/data/cuisines.ts`；
  切到「口味探索」后节点变为八种口味，数据来自 `src/data/tastes.ts`
- 悬停或键盘聚焦时，两个动画同时 `animation-play-state: paused`；悬停节点会在中心圆盘预览该菜系的
  人格标签、地域与前三道代表菜，圆盘按钮变为「和X AI 聊聊天」
- 点击任意菜系节点（或圆盘上的按钮）进入 `/cuisines/:id` 菜系专属页（内嵌该菜系 AI 聊天）；
  方向键可切换节点，Enter 进入
- `prefers-reduced-motion: reduce` 时停止自转，保留静态环形布局
- 移动端节点名称改为圆盘内的胶囊标签，避免被中心圆盘裁切
- 默认模式是「八大菜系」，转盘上方的切换控件（分段胶囊，带 `aria-pressed` 与明确的可访问名称）
  只换数据源、不刷新页面：整盘以 `key` 重挂载保证上一个模式的名称 / 图片 / 中心文案零残留，
  切换控件留在原地，用键盘 Enter / ← → 操作后焦点不会丢；`prefers-reduced-motion` 下连同入场动画一起关闭
- `.orbit-rotor` 是旋转的整块方形：只在节点按钮上保留指针事件（`pointer-events: none` + 节点 `auto`），
  否则转到对角线角度时透明角落会盖住上方切换控件与下方提示的点击 / 选择区域

## 全屏首页与圆形扩散转场（UI 升级）

### 首页全屏（`src/pages/Home.tsx`）

- 首页只剩「品牌标识 + 模式切换 + 环形转盘 + 中央圆盘文案 / 主入口 + 一条探索入口」，
  `.hero--full` 以 `min-height: 100vh; min-height: 100dvh` 锚定整屏，`grid` 上下两行（转盘区 + 探索入口行），
  桌面与手机首屏都不会露出图鉴 / 社区 / 推荐等模块
- 转盘尺寸受三重约束：`--stage: min(620px, 86vw, calc(100dvh - 252px))`（720px 以下放宽为 88vw），
  短屏笔记本、手机竖屏、手机横屏（`orientation: landscape and max-height: 560px` 另有压缩档）都不会裁切节点；
  不支持 `dvh` 的内核经 `@supports` 退回 `100vh` 公式
- 原首页除转盘外的模块整体搬到 `/explore`（`src/pages/ExplorePage.tsx`，保留 `#personalities / #characters /
  #dishbook / #recipe-lab / #recommend / #community` 锚点），导航栏四个入口改指 `/explore#…`，
  首页底部的探索入口与探索页开场的两个主按钮（进入美食宇宙 / 找到我的本命美食）都保留

### 圆形揭示转场（`src/components/CircularTransition.tsx`）

- `CircularTransitionProvider` 挂在 `BrowserRouter` 内、`Nav` 之外，提供 `start({ to, themeId, origin })` 与 `back(to)`；
  Provider 通过 `renderPreview` 拿到「目标路由 → 真实页面元素」的渲染器（`App.tsx` 注入 `<Routes location={to}>`，
  与主路由共用同一批页面组件，避免 Provider 与页面互相 import）
- 点击节点：`FoodWheel` 从被点击的 `.orbit-node__disc` 取屏幕中心与半径（`onSelect(id, origin)`），
  Provider 在点击处理函数里**同步用原生 DOM** 建壳（不经过 React、不等下一帧）：一个以点击点为圆心、
  直径 = 覆盖半径 × 2 的圆形容器，里面按点击点反向缩放一个视口大小的舞台；层内就是**真实的目标页**
  （主题背景 / 角色 / 人格标签 / 聊天界面，且处于最终状态，不重播入场编排）；揭示层本身不接收指针事件
  （`pointer-events: none` + `inert`），整个视口由外层壳统一拦截点击，扩张中不会误触首页、页脚或预览层里的链接
- 扩张只用 `transform: scale()`：容器从小圆放大到满屏，舞台用**等比例逆变换**抵消（约 70 个线性关键帧逼近双曲线，
  插值误差 < 0.05%），所以圆内页面全程 1:1 贴住视口、不位移不拉伸，圆形只是它的取景框；
  全程走合成器，主线程去挂载目标页 / 切路由时圆边也不会卡顿（这是之前 `clip-path` 每帧重绘、
  出现 100–150ms 帧空档的根因）
- 首帧半径 = `max(节点半径, 24px)`，终点半径 = 点击点到视口四角的最远距离 × 1.04 + 8px
  （任意宽高比、任意点击位置都绝不露角）；时长 **420ms**（要求区间 350–500ms）、
  缓动 `cubic-bezier(0.25, 0.35, 0.55, 1)`：点击后 1–2 帧内起动画，82% 时长已走完约 97% 半径，
  全程都能看到圆边在动，不会出现「瞬间铺满再干等」的停顿
- 动画首帧先画「小圆 + 主题柔光底盘」（rAF → `setTimeout 0`），再把真实页挂进舞台并做 `opacity` 淡入
  （时长按剩余时间自适应），页面内容出现前也不会是一块与主题无关的纯色
- 扩张期间首页转盘轻微降权（`body.is-transitioning`）；揭示层 `z-index: 240`
  ——在页面内容与悬浮精灵（200）之上、站点导航（300）之下，导航在转场全程留在原位，落地时不会有 chrome 跳动
- **无缝落地**：扩张走完（圆已盖满整屏）→ `markWorldArrival(pathname)`（`src/lib/worldArrival.ts`）标记目标页 →
  `navigate(to)` → 等真实页面挂载完成即放开指针事件（交互不必等揭示层摘除）→ 再等 3 帧让它完成首绘 →
  直接移除揭示层，无淡出等待、无闪屏（真实页因标记而 `no-enter` + `route-fade--skip`，
  与预览层几何误差 < 1.5px）；预览层里 `?q=` 的自动发送被跳过（`useWorldPreview`），
  只由落地页执行一次，聊天回复不会在转场中提前消耗
- 非聊天目标（首页中央「开始探索」等没有可预览页面的入口）退化为纯色圆形覆盖：同节奏 420ms 扩张 → 导航 →
  260ms 淡出，不做色彩浸润层，不叠加任何特效掩盖衔接问题
- **返回首页**：`back()` 直接 `navigate(to)`，没有任何圆形 / 遮罩动画，也不再有 sessionStorage 圆心记录与导航拦截；
  返回后无残留遮罩与滚动锁，可立即再次点击入口
- 防重与清理：`busyRef` 保证同一时刻只有一次转场；`runId` 代际校验 + 6 秒兜底看门狗；
  `try/finally` 卸载揭示层、移除 `body.is-transitioning`；扩张期间路由被别的操作切走时只淡出揭示层、不抢导航；
  组件卸载 / 路由变化都会清掉定时器与临时 DOM
- `prefers-reduced-motion: reduce`：直接 `navigate(to)`，完全不创建动画层（不做扩散也不做淡入淡出）
- `useWorldArrivalClass` 给落地页附加 `no-enter`（永久关闭该次挂载的入场编排）与 `skip-reveal`
  （900ms 内滚动渐入元素直接呈现，避免切换瞬间落差，随后恢复滚动动画）

### 进入世界的分层入场（transition.css）

- 主题页**直接加载 / 刷新**时按「世界背景 → 世界名称 → 介绍 → AI 人格头（名称 / 人格标签）→ 欢迎语 / 消息区 →
  输入框与发送按钮」依次入场：每段都是 300–380ms 的一次性 `world-enter`（上移 16px + 淡入）动画，
  起始延迟 100–420ms；
  由圆形揭示转场送进来的落地页则通过 `no-enter` 关闭这组编排——圆形扩张本身已经是入口动画，
  落地瞬间必须与预览层同一画面，不能再播一次淡入（否则移除揭示层时会闪）
- 世界环境光（`.theme-page::before`）与角落柔光装饰层（`.theme-page::after`：两束 `--t-glow` + 一束 `--t-orb`
  的静止径向光斑，固定于视口、`pointer-events: none`）先亮起来；所有装饰都是一次性动画，
  转场结束后没有循环动效干扰阅读（自检断言 `document.getAnimations()` 中无限循环动画数为 0）
- AI 头像（聊天头部 / 欢迎区 / 消息头像）带主题描边与静态柔光（`box-shadow` 取 `--t-glow`）；
  聊天发送按钮、快捷入口与「清空对话」悬停同样跟随世界主题
- `prefers-reduced-motion: reduce`：整组入场编排直接关闭（`animation: none`），内容立即可见、不做延迟等待

### 菜系 / 口味专属主题（`src/data/visualThemes.ts`）

- `VisualTheme` 类型含 `id / kind / label / primary / secondary / accent / background / surfaceColor /
  borderColor / shadowColor / text / mutedText / glowColor / orbColor / transitionGradient / chatBackground /
  bubbleStyle / buttonStyle / onPrimary`，17 条记录（品牌 + 8 菜系 + 8 口味）全部按稳定 id 查找
  （`getVisualTheme(cuisineId / tasteId)`），没有任何 `if (name === '川菜')` 式判断，未知 id 回退品牌主题
- `themeVars()` 把主题映射成 `--t-*` 变量挂在菜系 / 口味页根节点（`data-theme-id` 同时写进 DOM 便于自检）：
  页面基底、顶部环境光、代表菜主图描边与投影、主按钮渐变、聊天区背景 / 气泡 / 输入框 / 建议问题、
  「⌂ 回到首页」悬停色全部跟随主题；页面切走后颜色随组件卸载一起消失，不会残留到别的页面
- 8 个菜系主题：川菜·赤焰朱红 / 粤菜·翡翠青绿 / 苏菜·雅致青瓷 / 鲁菜·琥珀金棕 / 湘菜·烈焰橘红 /
  闽菜·海韵蓝绿 / 浙菜·竹影青绿 / 徽菜·山岚墨金；
  8 个口味主题：麻辣·炽热猩红 / 酸辣·酸橙黄绿 / 清鲜·薄荷青 / 咸香·麦芽暖金 / 酱香浓郁·深琥珀棕 /
  鲜香浓郁·海藻墨绿 / 香甜·蜜桃粉金 / 清淡温润·月白竹青；菜系与口味不共用同一条记录（自检断言 16 个主色互异）
- 节点文字名称始终可见、按钮带 `aria-pressed` / `aria-label`，颜色不是识别菜系与口味的唯一方式

## 八大菜系展示系统

- `src/data/cuisines.ts`：八大菜系统一数据（id / 序号 / 中英文名 / 人格标签 / 地域 / 文化介绍 /
  人格描述 / 知识范围 / 欢迎语 / 推荐问题 / 独立 systemPrompt / 代表菜 / 主图 / 备用图 / 关联角色），
  并导出 `foodTypeTags` 保留重庆火锅、烧烤、面食、甜品、街头小吃等独立美食类型
- 首页中央圆盘（默认「八大菜系」模式）：「每一道美食，都有自己的灵魂 / 八大菜系，万种风味。每一道菜，
  都值得被认识。」+「开始探索」按钮（跳转 `/personalities#cuisines` 菜系区块）；切到「口味探索」后
  变为「你的口味，藏着你的美食灵魂 / 从麻辣鲜香到清甜温润，找到与你味蕾契合的那一种。」+
  「探索我的口味」按钮（跳转 `/tastes`）
- `/cuisines/:id`（`src/pages/CuisinePage.tsx`）：菜系名称、地域、文化介绍、**菜系 AI 聊天区**、
  四道代表菜（已有同名角色的菜给「切换到「X」聊天」入口，所有代表菜都可「生成菜谱」）、相关角色卡片
- 菜系聊天：请求 `POST /api/cuisine-chat` 携带 `cuisineId`，服务端按白名单校验（未知 id 返回 400
  `unknown cuisine`，绝不静默回退）并从 `cuisines.ts` 选择该菜系自己的系统提示词，SSE 流式输出；
  每个菜系使用独立的本地历史（`fs-cuisine-chat-<cuisineId>`），互相不串上下文
- 菜系 ≠ 固定角色：聊天对象默认是菜系本身（代表整个菜系）；只有用户主动点代表菜上的
  「切换到「X」聊天」才会换成那道菜的角色。暂无独立角色的菜系显示诚实的空状态与引导，不伪造角色
- `/personalities` 页新增「八大菜系」区块与「更多美食类型」标签，原口味方向与 17 位角色完整保留
- 口味分类页（`/personalities/:categoryId`）的主图与主按钮统一使用数据里显式配置的代言角色
  （`featuredCharacterId` + `featuredCharacterOfCategory()`），不再按数组顺序取人——从根上排除
  「浓香派却和烧烤聊天」这类错配

## 口味探索系统（与菜系正交）

口味不是传统菜系，而是此刻的味觉偏好：同一道菜可以属于多个口味（红烧肉 ∈ 咸香 ∩ 酱香浓郁），
一个口味也能跨越多个菜系（麻辣 → 川菜的麻婆豆腐、湘菜的口味虾）。口味与菜系是多对多关系，
数据上分开维护，互不替代。

- `src/data/tastes.ts`：八种口味方向（麻辣 / 酸辣 / 清鲜 / 咸香 / 酱香浓郁 / 鲜香浓郁 / 香甜 / 清淡温润），
  每项含 id / 序号 / 中英文名 / 人格标签 / 风味介绍 / 人格简介 / 口味关键词（数据自检用）/ 知识范围 /
  代表菜（真实菜品 id）/ 主图菜品 id / 欢迎语 / 推荐问题 / 独立 systemPrompt
- 口味图片不手写路径：由 `imageDishId` 从菜品库解析（自检确认 8 张图互不相同、与八大菜系星环图零复用），
  加载失败自动降级占位，不破坏布局
- `/tastes`（总览）与 `/tastes/:id`（口味页）：风味介绍、代表菜（图鉴详情 / 菜品角色聊天 / 生成菜谱）、
  「和「X」口味聊聊天」入口；代表菜聊天入口按这道菜自己的归属推导（没有独立角色就走所属菜系聊天并带 `dishId`）
- 口味聊天：`POST /api/taste-chat` 携带 `tasteId`，服务端用 `getTaste` 白名单校验（未知 id / 菜系 id
  返回 400 `unknown taste`，绝不静默回退），从 `tastes.ts` 选择该口味自己的系统提示词；每个口味独立
  本地历史（`fs-taste-chat-<tasteId>`）。`tasteId` 绝不会被当作 `cuisineId` / `characterId` 使用：
  反过来把口味 id 发给 `/api/cuisine-chat` 同样 400——角色 / 菜系 / 口味三个聊天上下文互相隔离
- 口味人格不是菜品角色：它代表味觉偏好，可以跨菜系推荐，但会先确认忌口与过敏，并尊重用户指定的菜系

## 做菜视频搜索（真实检索）

在角色聊天、菜系聊天或口味聊天里说「帮我找这道菜的教学视频」「帮我找鱼香肉丝的做法视频」「只找 B 站的视频」，
或点聊天框上方的「帮我找相关视频」按钮，站内会**真实检索**并返回可点击的视频卡片；找不到单条视频时
诚实地给平台搜索入口，绝不编造视频或链接。触发检索的消息不会发给 AI 模型——模型全程接触不到视频链接。

### 平台策略（实测结论）

| 平台 | 单条视频结果 | 实现方式 |
| --- | --- | --- |
| 哔哩哔哩 | ✅ 可以 | 服务端调用其网页版公开搜索接口：先访问一次主页取得匿名会话（`buvid3`，无需登录、不破解签名、不绕验证码）再搜索；命中风控（`-412`）时刷新会话重试一次，仍失败就如实报错 |
| 抖音 | ⚠️ 仅搜索入口 | 网页数据依赖签名与登录态，不做抓取；提供官方搜索页入口链接（明确标注「在该平台搜索更多」） |
| 小红书 | ⚠️ 仅搜索入口 | 同上 |
| 西瓜视频 | ⚠️ 仅搜索入口 | 同上 |

- YouTube 等国外平台不在默认来源内；平台只认白名单（`bilibili / douyin / xiaohongshu / xigua`），未知平台直接 `400`；
- 请求里只接受关键词，**不存在「让服务端抓取任意 URL」的入口**（防 SSRF）；结果中的链接与封面都经过
  `https` + 域名白名单双重校验（服务端 + 渲染前各一次）；
- 结果清洗：去 HTML 标签、解实体、去重、按相关度/教程完整度/用户条件（新手、时长上限、正宗、少油少盐、
  快手）排序、截断条数；作者 / 时长 / 封面 / 发布日期缺失即不显示，绝不伪造；
- 关键词级内存缓存（默认 10 分钟；失败结果短缓存 60 秒），避免频繁请求平台。

### 接口

`POST /api/videos/search`

```json
{
  "text": "帮我找鱼香肉丝的做法视频，适合新手，十分钟以内",
  "contextCharacterId": "mapo",
  "contextCuisineId": "chuan",
  "contextTasteId": "mala",
  "platforms": ["bilibili"],
  "limit": 6
}
```

（三个上下文 id 按聊天来源选填：角色聊天带 `contextCharacterId`、菜系聊天带 `contextCuisineId`、口味聊天带
`contextTasteId`；未知 id 一律忽略而不是报错。）

返回 `VideoSearchBundle`：`status`（`done` / `clarify`）、`note`（如实的说明文字）、`query`、`keywords`、
`results[]`（`id / title / platform / url / coverUrl? / author? / duration? / description? / publishedAt? / sourceType: 'video'`）、
`entries[]`（平台搜索入口，`sourceType: 'search-entry'`）、`providers[]`（各平台本轮实际情况）。
信息不足时（如只点按钮但没有任何上下文）返回 `status: 'clarify'` 先反问，不搜索、不编造。

### 可选环境变量

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `VIDEO_SEARCH_TIMEOUT_MS` | `8000` | 单次平台请求超时（2000–20000） |
| `VIDEO_SEARCH_CACHE_TTL_MS` | `600000` | 搜索结果缓存时长（10000–3600000） |
| `BILIBILI_COOKIE` | 空 | 可选：手动指定 B 站匿名会话 Cookie；不填则自动访问主页获取 |

**不需要申请任何第三方 API 权限**：B 站检索走其网页版公开接口（匿名会话），其余平台仅提供官方搜索页入口。

### 自检

```bash
npm run check:videos            # 87 项：意图/条件/清洗/编排（mock）/真实检索/接口冒烟
node scripts/video-check.mjs    # 43 项：Playwright UI 全链路（需 dev server）
```

## 中国美食图鉴（/dishes）

把推荐引擎用到的菜品库升级成有独立内容的图鉴：92 道菜、八大菜系各不少于 10 道，每道菜都有自己的
介绍、历史渊源、人物、典故、食材、口味技法与图片说明。

- 数据只有一份：`src/data/dishes/`（`types.ts` + `index.ts` + 按菜系拆分的 8 个文件 + `legacy.ts` 迁移旧数据）。
  旧路径 `src/data/dishes.ts` 已并入其中，`import ... from '../data/dishes'` 与既有菜品 id 全部保持不变
  （`mapo-tofu`、`dongpo-pork`、`kaoya` 等 id 沿用），所以推荐、相关菜品、菜谱、社区不受影响
- `DishSeed`（手写字段）与 `Dish`（推导字段）分离：`image / imageStatus / imageCredit / imageLicense /
  galleryImages / chatTarget` 由 `index.ts` 统一推导，避免在 92 条数据里重复手写
- 列表页 `/dishes`：搜索（菜名 / 别名 / 菜系 / 地域 / 食材 / 故事与历史 / 口味）、筛选（菜系 / 类型 / 口味 /
  难度 / 独立美食类型）可任意组合、一键清除，全部走 `src/lib/dishBook.ts` 真实过滤（检查脚本直接复用同一份函数）
- 详情页 `/dishes/:id`：`getDish(id)` 精确命中，非法 id 明确提示「图鉴里没有这道菜」，绝不回退到别的菜；
  含别名、菜系与地域、辣度 / 时长 / 人均 / 场景、介绍、历史、相关人物、典故（带内容类型）、食材与过敏原、
  口味技法、图片画廊（主图 + `galleryImages`）、相关菜品、教程入口、聊天入口与图片来源信息
- 独立美食类型（火锅 / 烧烤 / 面食 / 甜品 / 街头小吃）保留为独立维度，不计入八大菜系；
  一道菜可以同时有 `cuisineId`（如川菜）与 `foodTypeId`（如重庆火锅）
- 探索页（`/explore`）有「中国美食图鉴」区块（八大菜系各挑一道）、导航栏「美食图鉴」入口、菜系页代表菜可点进对应详情页

### 内容可信度

| storyType | 含义 |
| --- | --- |
| 历史记载 | 有较为通行的史料与饮食文献支撑的表述 |
| 文献存疑 | 有文献线索但存在争议，按「常见说法」记录 |
| 地方传说 | 地方上流传的说法，缺少确证，不等于史实 |
| 民间故事 | 民间口耳相传的趣闻，读作故事而不是史料 |
| 现代流行说法 | 近现代才流行的说法或做法，非古代传统 |

有分歧的归属（叫花鸡的苏浙之说、臭鳜鱼起源、李鸿章杂烩等）在「历史渊源」里直接写明「有不同说法」，
不编造年份、文献出处与人物对话；`npm run check:dishes` 会检查每道菜的历史与典故互不重复（没有复制粘贴）。

### 图片策略

- 站内图片全部是原创生成图（智谱 CogView-3-Flash），落盘 `public/images/photos/<菜名>.jpg`，
  可用 `npm run photos` 重新生成；生成脚本会自动跳过已存在的文件
- 数据里的 `photo` 必须能在 `public/images/photos/` 找到对应文件；找不到或没有 `photo` 的菜一律
  `imageStatus: 'pending'`，前端统一使用 `public/images/dishes/placeholder.svg` 占位图并标注「图片待补充」，
  详情页写明来源与许可，**不使用来源不明的网络图片**
- 检查脚本会校验 photo 文件存在、同一张图不被两道菜共用、photo 与菜名对应（防张冠李戴）

### 聊天上下文（dishId）

详情页的聊天入口会把 `dishId` 带进聊天页：

- 有独立角色的菜：`/chat/<角色 id>?dish=<菜品 id>`（如麻婆豆腐 → `/chat/mapo?dish=mapo-tofu`）
- 只有所属菜系的菜：`/cuisines/<菜系 id>?dish=<菜品 id>`（如清蒸鲈鱼 → `/cuisines/yue?dish=qingzheng-luyu`）
- 没有独立角色、但属于独立美食类型的菜：借该类型的角色（如烤茄子 → `/chat/shaokao?dish=kao-qiezi`）
- 都没有的家常菜：诚实显示「这道菜还没有专属聊天入口」，不硬塞别的菜

服务端在 `/api/chat`、`/api/cuisine-chat` 与 `/api/taste-chat` 会用菜品库**再校验一次** dishId
（角色聊天要求这道菜属于该角色、菜系聊天要求属于该菜系、口味聊天要求这道菜属于该口味），
通过后把这道菜的真实数据（名称 / 地域 / 口味 / 食材 / 技法 / 难度）作为「当前讨论」
写进系统提示词——前端伪造 dishId 无效，也不会把无关的菜硬塞进对话。



## 真实实现 / 演示内容

| 功能 | 状态 |
| --- | --- |
| 首页 9 个区块、响应式、滚动渐入、双模式星环交互（八大菜系 ↔ 口味探索，默认菜系） | 真实实现 |
| 中国美食图鉴（92 道菜 / 搜索 / 组合筛选 / 独立详情页 / 图片与来源说明） | 真实实现（数据驱动，`src/data/dishes/`；检查 `npm run check:dishes` + `node scripts/dish-check.mjs`） |
| 图鉴菜品聊天上下文（dishId 双端校验，角色/菜系/独立类型三种入口） | 真实实现（`/api/chat` 与 `/api/cuisine-chat` 服务端再校验） |
| 八大菜系数据 / 菜系专属页（菜系 AI 人格聊天 + 代表菜 + 角色入口） | 真实实现（数据驱动，`src/data/cuisines.ts`，接口 `/api/cuisine-chat`） |
| 口味探索（八种口味 / 双模式星环 / `/tastes` 与 `/tastes/:id` / 口味 AI 人格聊天） | 真实实现（数据驱动，`src/data/tastes.ts`，接口 `/api/taste-chat`；检查 `npm run check:tastes` + `node scripts/taste-check.mjs`） |
| 角色人格配置、分类页、角色详情页 | 真实实现（数据驱动） |
| 多轮对话 + 流式输出 + 角色/菜系人格 + 历史持久化（存储按角色 `fs-chat-*` / 菜系 `fs-cuisine-chat-*` / 口味 `fs-taste-chat-*` 隔离） | 真实实现（已接入智谱 GLM，`/api/status` = live） |
| 结构化菜谱 + 服务端逐字段校验 + 份量重算 | 真实实现（含非法 JSON 自动重试） |
| 推荐：菜品库筛选 → 打分 → AI 写理由 | 真实实现（理由由 GLM 生成；支持「限定菜系」，严格过滤、无候选时诚实返回空结果） |
| 聊天页「相关菜品」侧栏 | 真实实现：AI 从同口味菜品库挑选 4 道并写标签/理由，可换一批 |
| 做菜视频搜索：B 站真实检索 + 其他平台官方搜索入口 | 真实实现：`POST /api/videos/search`；链接只可能来自真实检索或平台搜索页，模型不接触链接，字段缺失不伪造 |
| 首页美食小精灵（随机形象 / 悬浮气泡 / 聊天面板） | 真实实现：8 种原创 SVG 形象 + GLM 通用助手（`/api/pet-chat`，SSE 流式），无固定人格 |
| 社区：昵称 / 上传照片 / 点赞 / 回复 / 分类 / 排序 / 发帖 / 图片灯箱 | 真实交互：帖子、回复与点赞存服务端 `data/community.json`，同一局域网内所有设备同步可见 |
| 用户账号体系 | 未实现 |
| 美食图片 | 真实照片：100 张食物摄影图（含八大菜系主图、32 道代表菜与图鉴菜品），由 CogView-3-Flash 生成并本地缓存于 `public/images/photos/`（可用 `npm run photos` 重新生成）；缺图时用统一占位图并标注「图片待补充」 |

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
- 菜品库为内置静态数据（图鉴 92 道，其中 30 道沿用旧推荐库），未接入真实菜谱数据库
- 图鉴每道菜目前只有 1 张主图，详情页的画廊区块会如实显示现有图片（数据结构支持多图）；历史人物的关联以流传较广的说法为准，不能确认的部分已写明
- 部分菜没有独立角色（如清蒸鲈鱼），进的是所属菜系聊天；少数家常菜没有任何聊天入口，详情页会如实说明
- 口味探索的代表菜是每个口味的精选映射（3–5 道，自检保证带真实口味标签），其余菜品暂未出现在口味分组里；
  口味与菜系、口味与菜品为多对多关系，数据层没有互相替代
- 演示菜谱的步骤为通用模板，仅用于展示交互流程
- 做菜视频搜索的单条结果目前只能来自哔哩哔哩（抖音/小红书/西瓜未开放公开搜索接口，仅提供搜索入口）；
  B 站匿名会话可能被临时风控，接口会刷新会话重试一次，仍失败则如实提示而不是返回假数据
