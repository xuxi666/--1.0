/**
 * 口味探索数据与上下文自检（node scripts/check-tastes.mjs / npm run check:tastes）
 * ------------------------------------------------------------
 * 通过 Vite 的 ssrLoadModule 直接加载真实 TS 数据，检查：
 *  1. 规模与 ID：正好 8 个口味；id / 名称 / 序号 / 人格标签唯一；isTasteId / getTaste 严格白名单，
 *     非法 id 明确返回 undefined（不静默回退）；
 *  2. 与菜系、角色分离：口味 id 不是菜系 id，也不是任何菜品角色 id（麻辣 ≠ 川菜，也 ≠ 麻婆豆腐角色）；
 *  3. 代表菜：全部是菜品库真实 id；至少 3 道；每道都有真实图片（文件存在）；
 *     代表菜的口味标签必须命中该口味的 flavorKeys（映射有据可查，不是随手贴的）；
 *  4. 图片：8 个口味图片互不相同，且不与八大菜系转盘的 8 张图重复；imageDishId 确实在主图解析链上；
 *  5. 多对多：同一道菜可以出现在多个口味（红烧肉 ∈ 咸香 ∩ 酱香浓郁）；
 *     每个口味的代表菜跨越 >= 2 个「归属」（菜系 / 独立美食类型 / 家常）；
 *  6. 人格与提示词：人格标签与约定一致；描述 / 欢迎语 / 推荐问题不重复；
 *     8 段系统提示词互不相同，且都声明「不是菜系、不是某道菜的角色」并写入忌口规则；
 *  7. 上下文隔离（服务端契约）：/api/taste-chat 存在且只认 tasteId；前端 api 与首页转盘都接的是 tasteId，
 *     没有把 tasteId 当 cuisineId / characterId 的用法。
 */
import fs from 'node:fs'
import nodePath from 'node:path'
import { createServer } from 'vite'

const ROOT = process.cwd()
const logLines = []
let total = 0
let failures = 0

function check(label, ok, extra = '') {
  total += 1
  if (!ok) failures += 1
  const line = `${ok ? '✓' : '✗'} ${label}${!ok && extra ? ` — ${extra}` : ''}`
  console.log(line)
  logLines.push(line)
}

function section(title) {
  const line = `\n== ${title} ==`
  console.log(line)
  logLines.push(line)
}

const vite = await createServer({
  configFile: false,
  root: ROOT,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'silent',
})

const tastesMod = await vite.ssrLoadModule('/src/data/tastes.ts')
const dishesMod = await vite.ssrLoadModule('/src/data/dishes/index.ts')
const cuisinesMod = await vite.ssrLoadModule('/src/data/cuisines.ts')
const charactersMod = await vite.ssrLoadModule('/src/data/characters.ts')

const { TASTE_IDS, tastes, tasteMap, getTaste, isTasteId, tasteIncludesDish, relatedTastesOfDish } = tastesMod
const { dishMap } = dishesMod
const { CUISINE_IDS, isCuisineId, cuisines } = cuisinesMod
const { characterMap } = charactersMod

const photoDir = nodePath.join(ROOT, 'public', 'images', 'photos')
const photoExists = (name) => typeof name === 'string' && fs.existsSync(nodePath.join(photoDir, `${name}.jpg`))

/** 约定的 8 个口味与人格标签（用户规格，不允许被静默改动） */
const EXPECTED = [
  ['mala', '麻辣', '热烈直球派'],
  ['suanla', '酸辣', '鲜活爽快派'],
  ['qingxian', '清鲜', '清爽讲究派'],
  ['xianxiang', '咸香', '踏实可靠派'],
  ['jiangxiang', '酱香浓郁', '沉稳醇厚派'],
  ['xiannong', '鲜香浓郁', '丰盛满足派'],
  ['xiangtian', '香甜', '温柔治愈派'],
  ['qingdan', '清淡温润', '温柔细腻派'],
]

/* 1. 规模与 ID 合法性 */
section('规模与 ID')
check(`口味正好 8 个（实际 ${tastes.length}）`, tastes.length === 8)
check('TASTE_IDS 与数据顺序一致', JSON.stringify(TASTE_IDS) === JSON.stringify(tastes.map((t) => t.id)))
check('TASTE_IDS 与约定顺序一致', JSON.stringify([...TASTE_IDS]) === JSON.stringify(EXPECTED.map((row) => row[0])))
check('id 无重复', new Set(tastes.map((t) => t.id)).size === tastes.length)
check('名称无重复', new Set(tastes.map((t) => t.name)).size === tastes.length)
check('序号 01-08 无重复', JSON.stringify(tastes.map((t) => t.index)) === JSON.stringify(['01', '02', '03', '04', '05', '06', '07', '08']))
check('英文名无重复', new Set(tastes.map((t) => t.en)).size === tastes.length)

check('isTasteId 认可八个口味 id', TASTE_IDS.every((id) => isTasteId(id)))
check('isTasteId 拒绝菜系 id（chuan ≠ 口味）', !isTasteId('chuan'))
check('isTasteId 拒绝空值 / 未知字符串', !isTasteId('') && !isTasteId('unknown') && !isTasteId(undefined))
check('getTaste 命中合法 id', getTaste('mala')?.name === '麻辣')
check('getTaste 对菜系 id 返回 undefined（不静默回退）', getTaste('chuan') === undefined && getTaste('unknown') === undefined && getTaste(undefined) === undefined)
check('tasteMap 与 tastes 一一对应', TASTE_IDS.every((id) => tasteMap[id]?.id === id))

/* 2. 与菜系、角色分离 */
section('口味 ≠ 菜系 ≠ 角色')
check('口味 id 与八大菜系 id 无交集', tastes.every((t) => !isCuisineId(t.id)))
check('菜系 id 不会被 getCuisine 当成口味命中', CUISINE_IDS.every((id) => getTaste(id) === undefined))
check('口味 id 不是任何菜品角色 id', tastes.every((t) => characterMap[t.id] === undefined))
check('口味名与菜系名无重名', tastes.every((t) => !cuisines.some((c) => c.name === t.name)))

/* 3. 代表菜与口味标签 */
section('代表菜与口味标签')
for (const taste of tastes) {
  const missing = taste.representativeDishIds.filter((id) => !dishMap[id])
  check(`「${taste.name}」代表菜全部存在于菜品库（${taste.representativeDishIds.length} 道）`, missing.length === 0, missing.join('、'))
  check(`「${taste.name}」代表菜 >= 3 道`, taste.representativeDishIds.length >= 3)
  const noPhoto = taste.representativeDishes.filter((dish) => dish.imageStatus !== 'ready' || !dish.image)
  check(`「${taste.name}」代表菜都有真实图片`, noPhoto.length === 0, noPhoto.map((d) => d.id).join('、'))
  const badPhoto = taste.representativeDishes.filter((dish) => !photoExists(dish.photo))
  check(`「${taste.name}」代表菜图片文件都存在`, badPhoto.length === 0, badPhoto.map((d) => d.photo).join('、'))
  const offFlavor = taste.representativeDishes.filter((dish) => !dish.flavors.some((f) => taste.flavorKeys.includes(f)))
  check(
    `「${taste.name}」代表菜口味标签命中 flavorKeys（${taste.flavorKeys.join(' / ')}）`,
    offFlavor.length === 0,
    offFlavor.map((d) => `${d.name}[${d.flavors.join('|')}]`).join('、'),
  )
  const buckets = new Set(
    taste.representativeDishes.map((dish) => dish.cuisineId ?? dish.foodTypeId ?? '家常'),
  )
  check(`「${taste.name}」代表菜跨越 >= 2 个归属（${[...buckets].join(' / ')}）`, buckets.size >= 2)
}

/* 4. 图片 */
section('口味图片')
for (const taste of tastes) {
  check(`「${taste.name}」主图由菜品解析且有文件`, Boolean(taste.image) && Boolean(taste.imageDish) && photoExists(taste.imageDish?.photo))
  check(
    `「${taste.name}」imageDishId 在代表菜列表里`,
    taste.representativeDishIds.includes(taste.imageDishId),
  )
  check(`「${taste.name}」有独立的备用图（≠ 主图）`, Boolean(taste.fallbackImage) && taste.fallbackImage !== taste.image)
}
const tasteImages = tastes.map((t) => t.image)
check('8 个口味图片互不相同', new Set(tasteImages).size === 8)
const cuisineImages = new Set(cuisines.map((c) => c.image))
const overlap = tastes.filter((t) => cuisineImages.has(t.image)).map((t) => t.name)
check('口味图片与八大菜系转盘图片不重复', overlap.length === 0, overlap.join('、'))
check('imageDish 各不相同（8 张主图来自 8 道不同的菜）', new Set(tastes.map((t) => t.imageDishId)).size === 8)

/* 5. 多对多 */
section('多对多关系')
const pairs = tastes.reduce((sum, t) => sum + t.representativeDishIds.length, 0)
const involved = new Set(tastes.flatMap((t) => t.representativeDishIds))
check(`口味-菜品关联数 > 菜品数（存在多属菜品：${pairs} > ${involved.size}）`, pairs > involved.size)
const hongshaorouTastes = relatedTastesOfDish('hongshaorou').map((t) => t.id).sort()
check(
  '红烧肉同时属于咸香与酱香浓郁（多对多可读）',
  JSON.stringify(hongshaorouTastes) === JSON.stringify(['jiangxiang', 'xianxiang']),
  hongshaorouTastes.join('、'),
)
check('relatedTastesOfDish 对未知 id 返回空数组', relatedTastesOfDish('__none__').length === 0 && relatedTastesOfDish(undefined).length === 0)
check('tasteIncludesDish 判定准确', tasteIncludesDish(getTaste('mala'), 'mapo-tofu') && !tasteIncludesDish(getTaste('mala'), 'chouguiyu') && !tasteIncludesDish(getTaste('mala'), undefined))

/* 6. 人格与提示词 */
section('人格与提示词')
for (const [id, name, tag] of EXPECTED) {
  const taste = getTaste(id)
  check(`「${name}」名称与人格标签与约定一致`, Boolean(taste) && taste.name === name && taste.personalityTag === tag)
}
check('人格标签两两不同', new Set(tastes.map((t) => t.personalityTag)).size === 8)
check('风味介绍非空且互不相同', new Set(tastes.map((t) => t.description)).size === 8 && tastes.every((t) => t.description.length >= 10))
check('人格简介非空且互不相同', new Set(tastes.map((t) => t.personalityDesc)).size === 8)
check('欢迎语非空且互不相同', new Set(tastes.map((t) => t.greeting)).size === 8 && tastes.every((t) => t.greeting.length >= 20))
check('每个口味 >= 3 条推荐问题', tastes.every((t) => t.suggestedQuestions.length >= 3))
check('推荐问题全部互不相同', new Set(tastes.flatMap((t) => t.suggestedQuestions)).size === tastes.reduce((sum, t) => sum + t.suggestedQuestions.length, 0))
check('知识范围非空且互不相同', new Set(tastes.map((t) => t.knowledge.join('|'))).size === 8)
check('8 段系统提示词互不相同', new Set(tastes.map((t) => t.systemPrompt)).size === 8)
check(
  '每段提示词都声明「不是菜系、不是某道菜的角色」',
  tastes.every((t) => t.systemPrompt.includes('不是某个地域菜系') && t.systemPrompt.includes('口味方向')),
)
check(
  '每段提示词都写入忌口 / 指定菜系规则',
  tastes.every((t) => t.systemPrompt.includes('忌口') && t.systemPrompt.includes('指定菜系')),
)
check('每段提示词都包含自身名称与标签', tastes.every((t) => t.systemPrompt.includes(`「${t.name}」`) && t.systemPrompt.includes(t.personalityTag)))

/* 7. 上下文隔离（服务端契约与路由） */
section('上下文隔离与接线')
const serverApi = fs.readFileSync(nodePath.join(ROOT, 'server', 'api.ts'), 'utf8')
const clientApi = fs.readFileSync(nodePath.join(ROOT, 'src', 'lib', 'api.ts'), 'utf8')
const homeWheel = fs.readFileSync(nodePath.join(ROOT, 'src', 'components', 'HomeFoodWheel.tsx'), 'utf8')
const appTsx = fs.readFileSync(nodePath.join(ROOT, 'src', 'App.tsx'), 'utf8')

check('服务端存在 /api/taste-chat 且用 getTaste 白名单校验', serverApi.includes("'/api/taste-chat'") && serverApi.includes('getTaste(') && serverApi.includes("'unknown taste'"))
check('服务端菜品上下文用 tasteIncludesDish 校验（不混用菜系规则）', serverApi.includes('tasteIncludesDish(taste'))
check('前端 api 层的 /api/taste-chat 携带 tasteId', clientApi.includes("'/api/taste-chat'") && clientApi.includes('tasteId: options.tasteId'))
check('首页转盘两种模式共用布局、各自接数据', homeWheel.includes("from '../data/cuisines'") && homeWheel.includes("from '../data/tastes'") && homeWheel.includes('/tastes/'))
check('路由注册 /tastes 与 /tastes/:tasteId', appTsx.includes('path="/tastes"') && appTsx.includes('path="/tastes/:tasteId"'))

await vite.close()

const summary = failures === 0 ? `\n全部通过（${total}/${total}）` : `\n有 ${failures} 项未通过（共 ${total} 项）`
console.log(summary)
logLines.push(summary)

if (process.env.CHECK_LOG) {
  fs.writeFileSync(process.env.CHECK_LOG, logLines.join('\n'), 'utf8')
}

process.exit(failures === 0 ? 0 : 1)
