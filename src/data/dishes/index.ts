/**
 * 菜品图鉴数据库（全站唯一数据源）
 * ------------------------------------------------------------
 * 结构：
 * - 八大菜系按菜系拆分为独立数据模块（chuan / yue / su / lu / xiang / min / zhe / hui）；
 * - legacy.ts 保存第一阶段已有的 30 道菜（id 与推荐字段保持不变，只补齐图鉴字段）；
 * - 本文件统一汇总、推导图片与 AI 聊天入口，并对外提供只读查询。
 *
 * 页面与接口只消费 dishDatabase / dishMap / getDish，不允许在组件里另写一份菜品库。
 */
import { photoUrl } from '../../lib/photos'
import { characterMap } from '../characters'
import { cuisineMap, foodTypeTags } from '../cuisines'
import { chuanDishes } from './chuan'
import { huiDishes } from './hui'
import { legacyDishes } from './legacy'
import { luDishes } from './lu'
import { minDishes } from './min'
import { suDishes } from './su'
import { xiangDishes } from './xiang'
import { yueDishes } from './yue'
import { zheDishes } from './zhe'
import type { Dish, DishChatTarget, DishSeed } from './types'

export type {
  Dish,
  DishChatTarget,
  DishDifficulty,
  DishImageStatus,
  DishSeed,
  DishType,
  StoryType,
} from './types'

/** 图片说明：站内图片全部是智谱 CogView 生成的原创图，未找到可靠图片时明确标记待补充 */
const READY_CREDIT = 'AI 原创生成（智谱 CogView-3-Flash，落盘 public/images/photos）'
const READY_LICENSE = '项目内生成资源，可随项目使用'
const PENDING_CREDIT = '暂无可靠图片'
const PENDING_LICENSE = '待补充：未使用来源不明的网络图片，前端以统一占位图呈现'

/** 由 cuisineId / characterId / foodTypeId 推导菜品详情页的 AI 聊天入口 */
function resolveChatTarget(seed: DishSeed): DishChatTarget | undefined {
  if (seed.characterId) {
    const character = characterMap[seed.characterId]
    if (character) return { kind: 'character', characterId: character.id, label: character.name, source: 'dish' }
  }
  if (seed.cuisineId) {
    const cuisine = cuisineMap[seed.cuisineId]
    if (cuisine) return { kind: 'cuisine', cuisineId: cuisine.id, label: cuisine.name }
  }
  if (seed.foodTypeId) {
    const tag = foodTypeTags.find((item) => item.id === seed.foodTypeId)
    const character = tag ? characterMap[tag.characterId] : undefined
    if (character) return { kind: 'character', characterId: character.id, label: character.name, source: 'foodType' }
  }
  return undefined
}

function resolve(seed: DishSeed): Dish {
  const photo = seed.photo
  const hasPhoto = Boolean(photo)
  return {
    ...seed,
    image: hasPhoto ? photoUrl(photo as string) : '',
    imageStatus: hasPhoto ? 'ready' : 'pending',
    imageCredit: hasPhoto ? READY_CREDIT : PENDING_CREDIT,
    imageLicense: hasPhoto ? READY_LICENSE : PENDING_LICENSE,
    galleryImages: (seed.gallery ?? []).map((name) => photoUrl(name)),
    chatTarget: resolveChatTarget(seed),
  }
}

/** 手写数据（八大菜系 + 第一阶段已有菜品） */
export const dishSeeds: DishSeed[] = [
  ...chuanDishes,
  ...yueDishes,
  ...suDishes,
  ...luDishes,
  ...xiangDishes,
  ...minDishes,
  ...zheDishes,
  ...huiDishes,
  ...legacyDishes,
]

export const dishDatabase: Dish[] = dishSeeds.map(resolve)

export const dishMap: Record<string, Dish> = Object.fromEntries(
  dishDatabase.map((dish) => [dish.id, dish]),
)

/** 按 id 取菜：非法 id 返回 undefined，绝不回退到别的菜 */
export function getDish(id: string | undefined | null): Dish | undefined {
  if (!id) return undefined
  return dishMap[id]
}

/**
 * 这道菜能否在这个角色的聊天里作为「当前讨论的菜品」。
 * - 有独立角色的菜：必须是它自己的角色；
 * - 没有独立角色、但属于火锅/面食等独立美食类型的菜：可以由该类型的角色带着聊。
 * 前端（ChatPage）与服务端（/api/chat）共用同一判断，保证两边一致、无法伪造。
 */
export function dishChatCharacterId(dish: Dish | undefined): string | undefined {
  if (!dish) return undefined
  if (dish.characterId) return dish.characterId
  if (dish.cuisineId) return undefined
  if (dish.chatTarget?.kind === 'character' && dish.chatTarget.source === 'foodType') return dish.chatTarget.characterId
  return undefined
}

/** 图鉴筛选用的固定选项（与数据类型保持同步） */
export const DISH_TYPES = ['荤菜', '素菜', '汤羹', '主食', '点心', '凉菜', '小吃'] as const
export const DISH_DIFFICULTIES = ['入门', '家常', '进阶', '考功夫'] as const
export const STORY_TYPES = [
  '历史记载',
  '文献存疑',
  '地方传说',
  '民间故事',
  '现代流行说法',
] as const

/** 缺少可靠图片、当前用统一占位图承接的菜品 */
export const pendingImageDishes: Dish[] = dishDatabase.filter((dish) => dish.imageStatus === 'pending')
