/**
 * 菜品图鉴数据模型（菜品库的唯一类型来源）
 * ------------------------------------------------------------
 * - DishSeed 是「作者手写」的数据形状：只写真实存在的内容，缺图就不写 photo（标记为待补充）；
 * - Dish 是「程序推导」的完整形状：image / imageStatus / imageCredit / imageLicense / chatTarget
 *   由 src/data/dishes/index.ts 统一推导，避免每道菜重复填写并保证全站一致；
 * - cuisineId 只放八大菜系（chuan/yue/su/lu/xiang/min/zhe/hui）；
 *   foodTypeId 只放独立美食类型（hotpot/bbq/noodles/dessert/street-food），两者可以同时存在，
 *   但独立美食类型永远不会被当成菜系。
 */
import type { CuisineId } from '../cuisines'

/** 菜品类型（图鉴筛选用，与「口味分类 categoryId」是两套维度） */
export type DishType = '荤菜' | '素菜' | '汤羹' | '主食' | '点心' | '凉菜' | '小吃'

/** 内容可信度标记：明确区分史实与传说 */
export type StoryType =
  | '历史记载'
  | '文献存疑'
  | '地方传说'
  | '民间故事'
  | '现代流行说法'

/** 家庭制作难度 */
export type DishDifficulty = '入门' | '家常' | '进阶' | '考功夫'

/** 图片状态：ready = 站内有真实图片；pending = 待补充（前端用统一占位图） */
export type DishImageStatus = 'ready' | 'pending'

/** 菜品详情页的 AI 聊天入口（由 cuisineId / characterId / foodTypeId 推导） */
export type DishChatTarget =
  | {
      kind: 'character'
      characterId: string
      label: string
      /** dish = 这道菜有自己的角色；foodType = 菜本身没有独立角色，借所属独立美食类型（火锅/面食等）的角色 */
      source: 'dish' | 'foodType'
    }
  | { kind: 'cuisine'; cuisineId: CuisineId; label: string }

/** 作者手写的菜品数据 */
export type DishSeed = {
  /** 稳定唯一 id（全站唯一；第一阶段已存在的菜品 id 必须沿用） */
  id: string
  name: string
  /** 别名、常见写法（可为空数组） */
  aliases: string[]
  /** 口味分类 id（推荐引擎使用，必须是 categories.ts 里的合法 id） */
  categoryId: string
  dishType: DishType
  /** 八大菜系归属（没有明确归属就不写，绝不硬凑） */
  cuisineId?: CuisineId
  /** 独立美食类型归属（hotpot / bbq / noodles / dessert / street-food） */
  foodTypeId?: string
  /** 已有的独立 AI 角色 id（没有就不写） */
  characterId?: string
  /** 地域来源（如「四川成都」「粤港」「江南」） */
  region: string
  /** 一句话简介（列表卡片用，建议 12-32 字） */
  summary: string
  /** 更短的一句描述（推荐/相关菜品沿用原有字段，建议 10-26 字） */
  desc: string
  /** 详细介绍（详情页正文，建议 120-260 字） */
  description: string
  /** 历史渊源（存在多种说法时写明「有不同说法」） */
  history: string
  /** 相关人物 / 厨师 / 文化人物；没有可靠关联时留空数组 */
  people: string[]
  /** 趣味故事、传说或典故（建议 100-250 字，每道菜内容不同） */
  story: string
  storyType: StoryType
  /** 辣度 0-3 */
  spicy: 0 | 1 | 2 | 3
  /** 家庭制作总分钟数 */
  minutes: number
  /** 人均预算（元） */
  price: number
  /** 适合场景（只从固定词表里选） */
  scenes: string[]
  /** 口味标签（固定词表的简短词，如「麻辣」「清鲜」） */
  flavors: string[]
  /** 口味特征描述（一句话） */
  flavorProfile: string
  /** 主要烹饪技法 */
  cookingMethods: string[]
  difficulty: DishDifficulty
  /** 常见过敏原 */
  allergens: string[]
  /** 主要食材（4-8 项） */
  ingredients: string[]
  /** 站内照片名（public/images/photos/<photo>.jpg）；没有可靠图片就不要写这一项 */
  photo?: string
  /** 图片替代文本（必须点明是哪道菜） */
  imageAlt: string
  /** 可选的多图（站内照片名）；没有就不写 */
  gallery?: string[]
  /** 相关菜品 id（2-4 个，必须真实存在） */
  relatedDishIds: string[]
  /** 教学视频搜索关键词（如「麻婆豆腐 家常做法」） */
  videoSearchQuery: string
  /** 搜索标签 */
  tags: string[]
  emoji: string
}

/** 程序推导后的完整菜品数据（全站消费的就是这个形状） */
export type Dish = DishSeed & {
  /** 主图地址（无可靠图片时为空串，前端用统一占位图） */
  image: string
  imageStatus: DishImageStatus
  /** 图片来源说明 */
  imageCredit: string
  /** 图片许可说明 */
  imageLicense: string
  /** 多图地址（与 gallery 一一对应） */
  galleryImages: string[]
  /** AI 聊天入口（没有可关联的菜系 / 角色时为空） */
  chatTarget?: DishChatTarget
}
