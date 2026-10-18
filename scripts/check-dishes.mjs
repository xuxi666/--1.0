/**
 * 美食图鉴数据与检索自检（node scripts/check-dishes.mjs / npm run check:dishes）
 * ------------------------------------------------------------
 * 通过 Vite 的 ssrLoadModule 直接加载真实 TS 数据与检索函数，检查：
 *  1. 规模：总菜品 >= 80，八大菜系各自 >= 10（火锅/烧烤/面食/甜品/街头小吃不算菜系）；
 *  2. id / 名称唯一，菜系与独立类型 id 合法；
 *  3. 每道菜有名称、一句话简介、详细介绍、独立历史与独立故事（无复制粘贴、内容长度达标）；
 *  4. 故事类型在许可范围内（历史记载 / 文献存疑 / 地方传说 / 民间故事 / 现代流行说法）；
 *  5. 图片映射：photo 指向的文件真实存在；无 photo 的菜必须明确是 pending 状态并用统一占位图；
 *     同一张图片不被两道菜共用（防张冠李戴）；
 *  6. 关联菜 id 全部存在、不含自己；
 *  7. 聊天入口有效：角色聊天指向真实角色且属于该菜，菜系聊天指向所属菜系；
 *  8. 详情按 id 加载：getDish 精确命中、非法 id 明确返回 undefined（不静默回退）；
 *  9. 搜索与筛选真的在过滤真实数据（关键词命中菜名/别名/菜系/地域/食材/故事词，组合筛选子集正确）。
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

const dishesMod = await vite.ssrLoadModule('/src/data/dishes/index.ts')
const cuisinesMod = await vite.ssrLoadModule('/src/data/cuisines.ts')
const charactersMod = await vite.ssrLoadModule('/src/data/characters.ts')
const bookMod = await vite.ssrLoadModule('/src/lib/dishBook.ts')

const {
  dishDatabase,
  dishMap,
  getDish,
  dishChatCharacterId,
  DISH_TYPES,
  DISH_DIFFICULTIES,
  STORY_TYPES,
  pendingImageDishes,
} = dishesMod
const { CUISINE_IDS, isCuisineId, foodTypeTags, cuisines } = cuisinesMod
const { characterMap } = charactersMod
const {
  searchDishes,
  EMPTY_DISH_QUERY,
  DISH_FLAVOR_OPTIONS,
  dishSearchText,
  dishCountByCuisine,
  relatedDishesOf,
  isDishQueryActive,
} = bookMod

const photoDir = nodePath.join(ROOT, 'public', 'images', 'photos')
const photoExists = (name) => fs.existsSync(nodePath.join(photoDir, `${name}.jpg`))
const foodTypeIds = foodTypeTags.map((tag) => tag.id)

/* 1. 规模 */
section('图鉴规模')
check(`菜品总数 >= 80（实际 ${dishDatabase.length}）`, dishDatabase.length >= 80)
const counts = dishCountByCuisine()
const thin = CUISINE_IDS.filter((id) => (counts[id] ?? 0) < 10)
check(
  `八大菜系各自 >= 10 道（${CUISINE_IDS.map((id) => `${id}:${counts[id] ?? 0}`).join(' ')}）`,
  thin.length === 0,
  `不足 10 道的菜系：${thin.join('、')}`,
)
check(
  '独立美食类型不计入菜系（foodTypeId 不在菜系白名单里）',
  foodTypeIds.every((id) => !isCuisineId(id)),
)

/* 2. 基础字段 */
section('id / 名称 / 类型')
const dupIds = dishDatabase.map((d) => d.id).filter((id, i, arr) => arr.indexOf(id) !== i)
check('菜品 id 全局唯一', dupIds.length === 0, dupIds.join('、'))
const dupNames = dishDatabase.map((d) => d.name).filter((name, i, arr) => arr.indexOf(name) !== i)
check('菜品名称全局唯一（不会出现两个同名条目）', dupNames.length === 0, dupNames.join('、'))
const badCuisine = dishDatabase.filter((d) => d.cuisineId !== undefined && !isCuisineId(d.cuisineId))
check('cuisineId 只能是八大菜系白名单', badCuisine.length === 0, badCuisine.map((d) => d.id).join('、'))
const badFoodType = dishDatabase.filter((d) => d.foodTypeId !== undefined && !foodTypeIds.includes(d.foodTypeId))
check('foodTypeId 只能是独立美食类型白名单', badFoodType.length === 0, badFoodType.map((d) => d.id).join('、'))
const badDishType = dishDatabase.filter((d) => !DISH_TYPES.includes(d.dishType))
check('dishType 在许可的菜品类型内', badDishType.length === 0, badDishType.map((d) => d.id).join('、'))
const badDifficulty = dishDatabase.filter((d) => !DISH_DIFFICULTIES.includes(d.difficulty))
check('difficulty 在许可难度内', badDifficulty.length === 0, badDifficulty.map((d) => d.id).join('、'))
const badStoryType = dishDatabase.filter((d) => !STORY_TYPES.includes(d.storyType))
check('storyType 在许可的内容类型内（史实与传说分开）', badStoryType.length === 0, badStoryType.map((d) => d.id).join('、'))
const missingBasics = dishDatabase.filter(
  (d) =>
    !d.name ||
    !d.summary ||
    !d.description ||
    !d.region ||
    d.ingredients.length < 2 ||
    d.flavors.length < 1 ||
    d.cookingMethods.length < 1 ||
    d.tags.length < 2 ||
    !d.emoji,
)
check('每道菜都有名称 / 简介 / 介绍 / 地域 / 食材 / 口味 / 技法 / 标签 / 图标', missingBasics.length === 0, missingBasics.map((d) => d.id).join('、'))

/* 3. 独立内容（防复制粘贴） */
section('独立的历史与典故')
const histLen = dishDatabase.map((d) => d.history.length)
const storyLen = dishDatabase.map((d) => d.story.length)
check(
  `历史渊源均为独立撰写（>= 60 字，最短 ${Math.min(...histLen)} 字）`,
  dishDatabase.every((d) => d.history.length >= 60),
  dishDatabase.filter((d) => d.history.length < 60).map((d) => d.id).join('、'),
)
check(
  `趣味典故均为独立撰写（80~320 字，最短 ${Math.min(...storyLen)} / 最长 ${Math.max(...storyLen)} 字）`,
  dishDatabase.every((d) => d.story.length >= 80 && d.story.length <= 320),
  dishDatabase.filter((d) => d.story.length < 80 || d.story.length > 320).map((d) => d.id).join('、'),
)
const dupHistory = dishDatabase.map((d) => d.history).filter((v, i, arr) => arr.indexOf(v) !== i)
check('没有两道菜共用同一段历史', dupHistory.length === 0)
const dupStory = dishDatabase.map((d) => d.story).filter((v, i, arr) => arr.indexOf(v) !== i)
check('没有两道菜共用同一段典故', dupStory.length === 0)
const dupDesc = dishDatabase.map((d) => d.description).filter((v, i, arr) => arr.indexOf(v) !== i)
check('没有两道菜共用同一段介绍', dupDesc.length === 0)
const dupSummary = dishDatabase.map((d) => d.summary).filter((v, i, arr) => arr.indexOf(v) !== i)
check('没有两道菜共用同一句简介', dupSummary.length === 0)

/* 4. 图片映射与错配 */
section('图片映射')
check('统一占位图文件存在（public/images/dishes/placeholder.svg）', fs.existsSync(nodePath.join(ROOT, 'public', 'images', 'dishes', 'placeholder.svg')))
const brokenPhoto = dishDatabase.filter((d) => d.imageStatus === 'ready' && !photoExists(d.photo))
check('有图的菜：photo 指向的文件真实存在', brokenPhoto.length === 0, brokenPhoto.map((d) => d.id).join('、'))
const wrongStatus = dishDatabase.filter((d) => (d.photo ? d.imageStatus !== 'ready' : d.imageStatus !== 'pending'))
check('图片状态与 photo 字段一致（无 photo 必须是 pending）', wrongStatus.length === 0, wrongStatus.map((d) => d.id).join('、'))
const photoOwners = new Map()
const sharedPhoto = []
for (const d of dishDatabase) {
  if (!d.photo) continue
  if (photoOwners.has(d.photo)) sharedPhoto.push(`${d.photo}: ${photoOwners.get(d.photo)} / ${d.id}`)
  else photoOwners.set(d.photo, d.id)
}
check('同一张图片没有被两道菜共用（防图片错配）', sharedPhoto.length === 0, sharedPhoto.slice(0, 5).join('；'))
// photo 与菜名对应：完全同名，或文件名包含菜名 / 菜名包含文件名（如「家庭版烤鸭腿」对「烤鸭腿」类）
const mismatch = dishDatabase.filter((d) => {
  if (!d.photo) return false
  const a = d.photo.replace(/[\s（）()]/g, '')
  const b = d.name.replace(/[\s（）()]/g, '')
  return a !== b && !a.includes(b) && !b.includes(a)
})
check('photo 文件与菜品名称对应（不拿别的菜的图）', mismatch.length === 0, mismatch.map((d) => `${d.id}→${d.photo}`).join('、'))
check(
  `待补充图片的菜明确标记（当前 ${pendingImageDishes.length} 道）`,
  pendingImageDishes.every((d) => d.image === '/images/dishes/placeholder.svg' && d.imageLicense.includes('待补充')),
)
check(
  '有图的菜注明来源与许可（AI 原创生成）',
  dishDatabase.filter((d) => d.imageStatus === 'ready').every((d) => d.imageCredit.includes('AI 原创') && d.imageLicense.includes('项目内生成')),
  dishDatabase.filter((d) => d.imageStatus === 'ready' && !d.imageCredit.includes('AI 原创')).map((d) => d.id).join('、'),
)
check('详情页图片说明非空（imageAlt）', dishDatabase.every((d) => d.imageAlt && d.imageAlt.includes(d.name)), dishDatabase.filter((d) => !d.imageAlt || !d.imageAlt.includes(d.name)).map((d) => d.id).join('、'))

/* 5. 关联与聊天入口 */
section('关联菜品与聊天入口')
const badRelated = dishDatabase.filter((d) => d.relatedDishIds.length < 2 || d.relatedDishIds.some((rid) => !dishMap[rid] || rid === d.id))
check('relatedDishIds 均 >= 2 条、指向真实存在的菜、且不包含自己', badRelated.length === 0, badRelated.map((d) => d.id).join('、'))
const dupRelated = dishDatabase.filter((d) => new Set(d.relatedDishIds).size !== d.relatedDishIds.length)
check('relatedDishIds 内部无重复', dupRelated.length === 0, dupRelated.map((d) => d.id).join('、'))
const badChat = dishDatabase.filter((d) => {
  const target = d.chatTarget
  if (!target) return false
  if (target.kind === 'character') return !characterMap[target.characterId] || dishChatCharacterId(d) !== target.characterId
  return !isCuisineId(target.cuisineId) || d.cuisineId !== target.cuisineId
})
check('聊天入口有效（角色入口指向真实角色且属于该菜；菜系入口指向所属菜系）', badChat.length === 0, badChat.map((d) => d.id).join('、'))
const badSource = dishDatabase.filter(
  (d) =>
    (d.chatTarget?.kind === 'character' && d.chatTarget.source === 'dish' && d.characterId !== d.chatTarget.characterId) ||
    (d.chatTarget?.kind === 'character' && d.chatTarget.source === 'foodType' && Boolean(d.characterId)),
)
check('角色入口来源标注正确（自有角色 / 独立类型角色不混淆）', badSource.length === 0, badSource.map((d) => d.id).join('、'))
const noChatNoReason = dishDatabase.filter((d) => !d.chatTarget && (d.cuisineId || d.characterId))
check('有归属的菜必须有聊天入口（没入口的只能是真正的家常菜）', noChatNoReason.length === 0, noChatNoReason.map((d) => d.id).join('、'))
const cuisineChatDishes = dishDatabase.filter((d) => d.chatTarget?.kind === 'cuisine')
check(
  `没有独立角色的菜走所属菜系聊天（${cuisineChatDishes.length} 道）`,
  cuisineChatDishes.every((d) => d.chatTarget.cuisineId === d.cuisineId),
)
const charChatDishes = dishDatabase.filter((d) => d.chatTarget?.kind === 'character')
check(`有独立角色的菜走菜品角色聊天（${charChatDishes.length} 道）`, charChatDishes.every((d) => Boolean(characterMap[d.chatTarget.characterId])))

/* 6. 详情按 id 加载 */
section('详情按 id 加载')
check('每道菜都能被 getDish(id) 精确命中（同一个对象）', dishDatabase.every((d) => getDish(d.id) === d))
check('非法 id 明确返回 undefined（不静默回退到第一道菜）', getDish('__not_a_dish__') === undefined && getDish('') === undefined && getDish(undefined) === undefined)
check('相关菜品解析只返回库里真实存在的菜', dishDatabase.every((d) => relatedDishesOf(d).every((r) => Boolean(dishMap[r.id]) && r.id !== d.id)))

/* 7. 搜索与筛选（真实数据） */
section('搜索与筛选')
const resEasy = searchDishes({ ...EMPTY_DISH_QUERY, keyword: '麻婆豆腐' })
check('搜索菜名命中（麻婆豆腐）', resEasy.length >= 1 && resEasy.every((d) => d.name.includes('麻婆豆腐') || d.aliases.some((a) => a.includes('麻婆豆腐'))), `结果 ${resEasy.length}`)
const resAlias = searchDishes({ ...EMPTY_DISH_QUERY, keyword: '桂鱼' })
check('搜索别名命中（松鼠桂鱼 → 松鼠鳜鱼）', resAlias.some((d) => d.id === 'songshu-guiyu'), `结果 ${resAlias.length}`)
const resCuisineWord = searchDishes({ ...EMPTY_DISH_QUERY, keyword: '徽菜' })
check('搜索菜系名命中（徽菜）', resCuisineWord.length >= 10 && resCuisineWord.every((d) => d.cuisineId === 'hui'), `结果 ${resCuisineWord.length}`)
const resRegion = searchDishes({ ...EMPTY_DISH_QUERY, keyword: '宁波' })
check('搜索地域命中（宁波 → 雪菜大汤黄鱼）', resRegion.some((d) => d.id === 'xuecai-datanghuangyu'), `结果 ${resRegion.length}`)
const resIngredient = searchDishes({ ...EMPTY_DISH_QUERY, keyword: '糯米' })
check('搜索食材命中（糯米 → 徽州圆子）', resIngredient.some((d) => d.id === 'huizhou-yuanzi'), `结果 ${resIngredient.length}`)
const resStory = searchDishes({ ...EMPTY_DISH_QUERY, keyword: '和尚' })
check('搜索故事词命中（和尚 → 佛跳墙）', resStory.some((d) => d.id === 'fotiaoqiang'), `结果 ${resStory.length}`)
const resFlavor = searchDishes({ ...EMPTY_DISH_QUERY, keyword: '酸甜' })
const expectFlavor = dishDatabase.filter((d) => dishSearchText(d).includes('酸甜'))
check(
  '搜索口味标签命中（酸甜，检索范围与真实数据一致）',
  resFlavor.length === expectFlavor.length && resFlavor.length >= 5 && resFlavor.every((d) => dishSearchText(d).includes('酸甜')),
  `结果 ${resFlavor.length}`,
)
const resNone = searchDishes({ ...EMPTY_DISH_QUERY, keyword: '__不存在的词__' })
check('搜不到时不编造结果（返回空数组）', resNone.length === 0)

check(`口味筛选项来自真实数据（${DISH_FLAVOR_OPTIONS.length} 个）`, DISH_FLAVOR_OPTIONS.length >= 10 && DISH_FLAVOR_OPTIONS.every((flavor) => dishDatabase.some((d) => d.flavors.includes(flavor))))
for (const cuisineId of CUISINE_IDS) {
  const filtered = searchDishes({ ...EMPTY_DISH_QUERY, cuisineId })
  check(
    `筛选 ${cuisineId} 只返回该菜系（${filtered.length} 道）`,
    filtered.length >= 10 && filtered.every((d) => d.cuisineId === cuisineId) && filtered.length === (counts[cuisineId] ?? 0),
  )
}
const filteredType = searchDishes({ ...EMPTY_DISH_QUERY, dishType: '汤羹' })
check('按类型筛选（汤羹）只返回汤羹', filteredType.length >= 5 && filteredType.every((d) => d.dishType === '汤羹'), `结果 ${filteredType.length}`)
const filteredDiff = searchDishes({ ...EMPTY_DISH_QUERY, difficulty: '考功夫' })
check('按难度筛选（考功夫）只返回对应难度', filteredDiff.length >= 5 && filteredDiff.every((d) => d.difficulty === '考功夫'), `结果 ${filteredDiff.length}`)
const sampleFlavor = DISH_FLAVOR_OPTIONS[0]
const filteredFlavor = searchDishes({ ...EMPTY_DISH_QUERY, flavor: sampleFlavor })
check(`按口味筛选（${sampleFlavor}）只返回含该口味的菜`, filteredFlavor.length >= 1 && filteredFlavor.every((d) => d.flavors.includes(sampleFlavor)), `结果 ${filteredFlavor.length}`)
const combo = searchDishes({ ...EMPTY_DISH_QUERY, cuisineId: 'hui', dishType: '汤羹' })
check('组合筛选（徽菜 + 汤羹）结果是两个条件的交集', combo.length >= 1 && combo.every((d) => d.cuisineId === 'hui' && d.dishType === '汤羹'), `结果 ${combo.length}`)
const comboKeyword = searchDishes({ ...EMPTY_DISH_QUERY, cuisineId: 'chuan', keyword: '鸡' })
check('组合搜索（川菜 + 鸡）结果同时满足', comboKeyword.length >= 1 && comboKeyword.every((d) => d.cuisineId === 'chuan'), `结果 ${comboKeyword.length}`)
const filteredFoodType = searchDishes({ ...EMPTY_DISH_QUERY, foodTypeId: 'hotpot' })
check('独立美食类型筛选（火锅）只返回该类型', filteredFoodType.length >= 1 && filteredFoodType.every((d) => d.foodTypeId === 'hotpot'), `结果 ${filteredFoodType.length}`)
check('筛选状态判断：空条件为 false，有条件为 true', !isDishQueryActive(EMPTY_DISH_QUERY) && isDishQueryActive({ ...EMPTY_DISH_QUERY, keyword: '汤' }))

/* 8. 代表菜能指回图鉴 */
section('菜系代表菜 ↔ 图鉴')
const badRep = cuisines.flatMap((c) => c.representativeDishes.filter((dish) => dish.dishId && !dishMap[dish.dishId]))
check('菜系代表菜的 dishId（如有）指向真实菜品', badRep.length === 0, badRep.map((d) => d.id).join('、'))
const repCuisineGuard = cuisines.flatMap((c) =>
  c.representativeDishes.filter((dish) => dish.dishId && dishMap[dish.dishId].cuisineId !== c.id).map((dish) => `${c.id}:${dish.dishId}`),
)
check('代表菜的图鉴详情页归属与菜系一致', repCuisineGuard.length === 0, repCuisineGuard.join('、'))
check('每个菜系都有图鉴详情入口', cuisines.every((c) => c.representativeDishes.some((dish) => Boolean(dish.dishId))))

await vite.close()

const summary = failures === 0 ? `\n全部通过（${total}/${total}）` : `\n有 ${failures} 项未通过（共 ${total} 项）`
console.log(summary)
logLines.push(summary)

if (process.env.CHECK_LOG) {
  fs.writeFileSync(process.env.CHECK_LOG, logLines.join('\n'), 'utf8')
}

process.exit(failures === 0 ? 0 : 1)
