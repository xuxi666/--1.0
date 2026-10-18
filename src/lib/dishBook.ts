/**
 * 美食图鉴检索工具（纯函数，无副作用）
 * ------------------------------------------------------------
 * 图鉴列表的搜索与筛选全部走这里，直接从 dishDatabase 过滤真实数据：
 * - 搜索覆盖：菜名 / 别名 / 菜系 / 地域 / 主要食材 / 故事与历史 / 口味标签 / 标签；
 * - 筛选维度：菜系（仅八大菜系）、菜品类型、口味特点、制作难度，可任意组合；
 * - 不缓存、不复制数据：结果永远是菜品库里的同一批对象。
 */
import {
  DISH_DIFFICULTIES,
  DISH_TYPES,
  dishDatabase,
  type Dish,
  type DishDifficulty,
  type DishType,
} from '../data/dishes'
import { foodTypeTags, cuisineMap } from '../data/cuisines'

export type DishQuery = {
  keyword: string
  /** '' 表示不限；否则是 CuisineId */
  cuisineId: string
  /** '' 表示不限；否则是 DishType */
  dishType: string
  /** '' 表示不限；否则是口味词（来自真实数据） */
  flavor: string
  /** '' 表示不限；否则是 DishDifficulty */
  difficulty: string
  /** '' 表示不限；否则是独立美食类型 id（hotpot / bbq / noodles / dessert / street-food） */
  foodTypeId: string
}

export const EMPTY_DISH_QUERY: DishQuery = {
  keyword: '',
  cuisineId: '',
  dishType: '',
  flavor: '',
  difficulty: '',
  foodTypeId: '',
}

/** 是否有任一筛选/搜索条件生效 */
export function isDishQueryActive(query: DishQuery): boolean {
  return Object.values(query).some((value) => value.trim() !== '')
}

/** 口味选项：从菜品库真实数据里收集，按出现次数排序（不写死在 UI 里） */
export const DISH_FLAVOR_OPTIONS: string[] = (() => {
  const counter = new Map<string, number>()
  for (const dish of dishDatabase) {
    for (const flavor of dish.flavors) {
      counter.set(flavor, (counter.get(flavor) ?? 0) + 1)
    }
  }
  return [...counter.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hans-CN'))
    .map(([flavor]) => flavor)
})()

export const DISH_TYPE_OPTIONS: readonly DishType[] = DISH_TYPES
export const DISH_DIFFICULTY_OPTIONS: readonly DishDifficulty[] = DISH_DIFFICULTIES

/** 独立美食类型选项（火锅 / 烧烤 / 面食 / 甜品 / 街头小吃），与八菜系筛选互不混淆 */
export const DISH_FOODTYPE_OPTIONS = foodTypeTags

/** 搜索用文本：把一道菜所有可被搜索的字段拼成一个串（每次调用重新拼，保证与数据一致） */
export function dishSearchText(dish: Dish): string {
  const cuisine = dish.cuisineId ? cuisineMap[dish.cuisineId] : undefined
  const foodType = dish.foodTypeId ? foodTypeTags.find((tag) => tag.id === dish.foodTypeId) : undefined
  return [
    dish.name,
    dish.aliases.join(' '),
    cuisine?.name ?? '',
    dish.region,
    dish.dishType,
    dish.difficulty,
    dish.storyType,
    dish.ingredients.join(' '),
    dish.flavors.join(' '),
    dish.flavorProfile,
    dish.tags.join(' '),
    dish.summary,
    dish.description,
    dish.history,
    dish.story,
    foodType?.name ?? '',
  ]
    .join(' ')
    .toLowerCase()
}

/** 关键词 → 全部分词都命中才算匹配（空格分隔，中英文都可） */
function matchesKeyword(haystack: string, keyword: string): boolean {
  const words = keyword
    .toLowerCase()
    .split(/[\s,，、]+/)
    .map((word) => word.trim())
    .filter(Boolean)
  if (!words.length) return true
  return words.every((word) => haystack.includes(word))
}

/**
 * 搜索 + 筛选菜品：按「搜索词 + 菜系 + 类型 + 口味 + 难度」组合过滤。
 * source 默认是整库；单测与检查脚本可以传入子集验证结果确实来自数据。
 */
export function searchDishes(query: DishQuery, source: Dish[] = dishDatabase): Dish[] {
  const keyword = query.keyword.trim()
  return source.filter((dish) => {
    if (query.cuisineId && dish.cuisineId !== query.cuisineId) return false
    if (query.dishType && dish.dishType !== query.dishType) return false
    if (query.difficulty && dish.difficulty !== query.difficulty) return false
    if (query.flavor && !dish.flavors.includes(query.flavor)) return false
    if (query.foodTypeId && dish.foodTypeId !== query.foodTypeId) return false
    if (keyword && !matchesKeyword(dishSearchText(dish), keyword)) return false
    return true
  })
}

/** 某个菜系的全部菜品（按图鉴数据顺序） */
export function dishesOfCuisine(cuisineId: string): Dish[] {
  return dishDatabase.filter((dish) => dish.cuisineId === cuisineId)
}

/** 某个独立美食类型的全部菜品（火锅 / 烧烤 / 面食 / 甜品 / 街头小吃） */
export function dishesOfFoodType(foodTypeId: string): Dish[] {
  return dishDatabase.filter((dish) => dish.foodTypeId === foodTypeId)
}

/** 相关菜品：按 relatedDishIds 解析，非法 id 直接跳过（不编造、不回退） */
export function relatedDishesOf(dish: Dish, limit = 4): Dish[] {
  const out: Dish[] = []
  for (const id of dish.relatedDishIds) {
    const related = dishDatabase.find((item) => item.id === id)
    if (related && related.id !== dish.id && !out.some((item) => item.id === related.id)) {
      out.push(related)
    }
    if (out.length >= limit) break
  }
  return out
}

/** 各菜系菜品数量（首页 / 图鉴页说明用，直接数真实数据） */
export function dishCountByCuisine(): Record<string, number> {
  const counter: Record<string, number> = {}
  for (const dish of dishDatabase) {
    if (!dish.cuisineId) continue
    counter[dish.cuisineId] = (counter[dish.cuisineId] ?? 0) + 1
  }
  return counter
}

/** 缺图（待补充）菜品数量，用于页面如实提示 */
export function pendingImageCount(): number {
  return dishDatabase.filter((dish) => dish.imageStatus === 'pending').length
}
