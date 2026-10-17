/**
 * 八大菜系数据模块（首页星环 / 菜系探索页的唯一来源）
 * -------------------------------------------------
 * 八大菜系是美食文化分类，不等于八个固定 AI 角色：
 * - 一个菜系拥有多道代表菜，每道代表菜都可以有自己的 AI 人格；
 * - 部分代表菜已经对应到 characters.ts 中的现有角色（characterId）；
 * - 没有专属角色的菜系不硬造人格，页面会给出诚实的引导入口。
 * 重庆火锅、烧烤、面食、甜品、街头小吃等作为独立美食类型保留在 foodTypeTags。
 */
import { characterMap, type Character } from './characters'
import { photoUrl } from '../lib/photos'

export type CuisineDish = {
  /** 代表菜名 */
  name: string
  /** 无照片时的占位图标（不出现破图） */
  emoji: string
  /** 站内已有照片名（public/images/photos/<name>.jpg），缺省时由占位图标承接 */
  photo?: string
  /** 对应的现有 AI 角色 id（有则提供聊天入口） */
  characterId?: string
}

export type Cuisine = {
  id: string
  /** 展示序号 01-08 */
  index: string
  name: string
  en: string
  /** 人格标签：菜系的一句话性格 */
  personalityTag: string
  /** 地域 */
  region: string
  /** 文化介绍 */
  description: string
  /** AI 角色设计方向（为角色提供文化背景，不直接复制成角色） */
  personalityDesc: string
  /** 代表菜品 */
  representativeDishes: CuisineDish[]
  /** 主图（本地照片路径） */
  image: string
  /** 主图加载失败时的本地备用图 */
  fallbackImage: string
  /** 关联的现有菜系人格角色（可选） */
  characterId?: string
  emoji: string
  palette: { base: string; deep: string; light: string }
}

export const cuisines: Cuisine[] = [
  {
    id: 'chuan',
    index: '01',
    name: '川菜',
    en: 'SICHUAN',
    personalityTag: '热烈直球派',
    region: '四川、重庆',
    description:
      '一菜一格，百菜百味。麻辣只是它的开场——鱼香、糊辣、怪味等二十四种味型，才是川菜真正的家底。',
    personalityDesc: '热情、直率、有感染力，表达生动，善于活跃气氛；会认真纠正「川菜只有辣」的误会。',
    representativeDishes: [
      { name: '麻婆豆腐', emoji: '🥘', photo: '麻婆豆腐', characterId: 'mapo' },
      { name: '回锅肉', emoji: '🥓', photo: '回锅肉' },
      { name: '水煮鱼', emoji: '🐟', photo: '水煮鱼', characterId: 'shuizhuyu' },
      { name: '宫保鸡丁', emoji: '🍗', photo: '宫保鸡丁' },
    ],
    image: photoUrl('麻婆豆腐'),
    fallbackImage: photoUrl('水煮鱼'),
    characterId: 'chuan',
    emoji: '🌶️',
    palette: { base: '#C6402F', deep: '#5E1510', light: '#F0B49B' },
  },
  {
    id: 'yue',
    index: '02',
    name: '粤菜',
    en: 'CANTONESE',
    personalityTag: '清鲜讲究派',
    region: '广东',
    description:
      '讲究本味与火候。清蒸、白灼、老火靓汤——好食材自己会说话，调味只是礼貌。',
    personalityDesc: '细致、务实、讲究品质，重视食材本味，表达克制而有条理。',
    representativeDishes: [
      { name: '白切鸡', emoji: '🍗', photo: '白切鸡' },
      { name: '清蒸鱼', emoji: '🐟', photo: '清蒸鲈鱼' },
      { name: '广式烧鹅', emoji: '🦆', photo: '广式烧鹅' },
      { name: '老火靓汤', emoji: '🍲', photo: '老火靓汤' },
    ],
    image: photoUrl('白切鸡'),
    fallbackImage: photoUrl('清蒸鲈鱼'),
    characterId: 'yue',
    emoji: '🐟',
    palette: { base: '#8FA98C', deep: '#2F4234', light: '#DCE7D6' },
  },
  {
    id: 'su',
    index: '03',
    name: '苏菜',
    en: 'JIANGSU',
    personalityTag: '温柔雅致派',
    region: '江苏',
    description:
      '淮扬刀工与苏锡甜咸的合流，讲究火候、汤头与造型，追求一个「和」字与一个「精」字。',
    personalityDesc: '温柔、从容、优雅，重视细节，善于以温和的方式交流。',
    representativeDishes: [
      { name: '松鼠鳜鱼', emoji: '🐠', photo: '松鼠鳜鱼' },
      { name: '清炖狮子头', emoji: '🥩', photo: '清炖狮子头' },
      { name: '大煮干丝', emoji: '🍜', photo: '大煮干丝' },
      { name: '盐水鸭', emoji: '🦆', photo: '盐水鸭' },
    ],
    image: photoUrl('松鼠鳜鱼'),
    fallbackImage: photoUrl('腌笃鲜'),
    characterId: 'jiangnan',
    emoji: '🐠',
    palette: { base: '#7E9C9A', deep: '#22383A', light: '#DCE9E4' },
  },
  {
    id: 'lu',
    index: '04',
    name: '鲁菜',
    en: 'SHANDONG',
    personalityTag: '豪爽可靠派',
    region: '山东',
    description:
      '源于齐鲁，讲究火候与吊汤，咸鲜为本、爆炒见功，是北方菜系共同的底子。',
    personalityDesc: '爽快、可靠、讲义气，表达坦诚，给人值得信赖的感觉。',
    representativeDishes: [
      { name: '葱烧海参', emoji: '🥢', photo: '葱烧海参' },
      { name: '糖醋鲤鱼', emoji: '🐟', photo: '糖醋鲤鱼' },
      { name: '九转大肠', emoji: '🍖', photo: '九转大肠' },
      { name: '油焖大虾', emoji: '🦐', photo: '油焖大虾' },
    ],
    image: photoUrl('葱烧海参'),
    fallbackImage: photoUrl('糖醋鲤鱼'),
    emoji: '🦐',
    palette: { base: '#7A5C3E', deep: '#33210F', light: '#E8D3B8' },
  },
  {
    id: 'xiang',
    index: '05',
    name: '湘菜',
    en: 'HUNAN',
    personalityTag: '火辣倔强派',
    region: '湖南',
    description:
      '香辣、鲜辣、酸辣，层次直接不绕弯。腊味与剁椒，是它最鲜明的地方性格。',
    personalityDesc: '鲜明、果断、有主见，表达直接，富有情绪感染力。',
    representativeDishes: [
      { name: '剁椒鱼头', emoji: '🐟', photo: '剁椒鱼头' },
      { name: '农家小炒肉', emoji: '🥩', photo: '农家小炒肉' },
      { name: '辣椒炒肉', emoji: '🌶️', photo: '辣椒炒肉' },
      { name: '腊味合蒸', emoji: '🍖', photo: '腊味合蒸' },
    ],
    image: photoUrl('剁椒鱼头'),
    fallbackImage: photoUrl('辣子鸡'),
    emoji: '🔥',
    palette: { base: '#B8341F', deep: '#3D0B05', light: '#F2AE90' },
  },
  {
    id: 'min',
    index: '06',
    name: '闽菜',
    en: 'FUJIAN',
    personalityTag: '温润细腻派',
    region: '福建',
    description:
      '一汤十变，善用山珍海味。红糟、糟醉与高汤，是沿海人家代代相传的细腻功夫。',
    personalityDesc: '温润、细腻、善于倾听，表达有亲和力，注重人与人之间的情感。',
    representativeDishes: [
      { name: '佛跳墙', emoji: '🍲', photo: '佛跳墙' },
      { name: '荔枝肉', emoji: '🍖', photo: '荔枝肉' },
      { name: '醉排骨', emoji: '🍖', photo: '醉排骨' },
      { name: '红糟鱼', emoji: '🐟', photo: '红糟鱼' },
    ],
    image: photoUrl('佛跳墙'),
    fallbackImage: photoUrl('清蒸鲈鱼'),
    emoji: '🍲',
    palette: { base: '#6C8598', deep: '#22323E', light: '#DCE6EC' },
  },
  {
    id: 'zhe',
    index: '07',
    name: '浙菜',
    en: 'ZHEJIANG',
    personalityTag: '清雅聪慧派',
    region: '浙江',
    description:
      '清、香、爽、嫩、鲜。西湖的茶与酒都在菜里——讲究时令，珍惜本味。',
    personalityDesc: '聪慧、清雅、有分寸感，擅长观察细节，表达自然且富有情趣。',
    representativeDishes: [
      { name: '龙井虾仁', emoji: '🍤', photo: '龙井虾仁' },
      { name: '东坡肉', emoji: '🍖', photo: '东坡肉', characterId: 'dongpo' },
      { name: '西湖醋鱼', emoji: '🐟', photo: '西湖醋鱼' },
      { name: '叫花鸡', emoji: '🍗', photo: '叫花鸡' },
    ],
    image: photoUrl('龙井虾仁'),
    fallbackImage: photoUrl('东坡肉'),
    emoji: '🍤',
    palette: { base: '#7E9C6F', deep: '#2A3A24', light: '#DFE8D5' },
  },
  {
    id: 'hui',
    index: '08',
    name: '徽菜',
    en: 'ANHUI',
    personalityTag: '沉稳质朴派',
    region: '安徽',
    description:
      '重火功、善烧炖，山货与发酵风味见长。臭鳜鱼与毛豆腐，是敢吃的人才懂的名菜。',
    personalityDesc: '沉稳、内敛、务实，有自己的坚持，不刻意讨好用户。',
    representativeDishes: [
      { name: '徽州臭鳜鱼', emoji: '🐟', photo: '徽州臭鳜鱼' },
      { name: '毛豆腐', emoji: '🧀', photo: '毛豆腐' },
      { name: '徽州红烧肉', emoji: '🍖', photo: '徽州红烧肉' },
      { name: '黄山炖鸽', emoji: '🕊️', photo: '黄山炖鸽' },
    ],
    image: photoUrl('徽州臭鳜鱼'),
    fallbackImage: photoUrl('臭豆腐'),
    emoji: '🥘',
    palette: { base: '#6E7A4A', deep: '#242A12', light: '#D8DCC0' },
  },
]

export const cuisineMap: Record<string, Cuisine> = Object.fromEntries(
  cuisines.map((cuisine) => [cuisine.id, cuisine]),
)

export function getCuisine(id: string | undefined) {
  return id ? cuisineMap[id] : undefined
}

/** 菜系关联的现有角色：菜系人格在前，已有同名角色的代表菜在后 */
export function relatedCharactersOfCuisine(cuisine: Cuisine): Character[] {
  const ids = [
    cuisine.characterId,
    ...cuisine.representativeDishes.map((dish) => dish.characterId),
  ].filter((id): id is string => Boolean(id))
  return [...new Set(ids)]
    .map((id) => characterMap[id])
    .filter((character): character is Character => Boolean(character))
}

/**
 * 独立美食类型 / 探索标签：
 * 这些分类不属于八大菜系，但作为独立美食类型保留，各自已有角色。
 */
export type FoodTypeTag = {
  id: string
  name: string
  characterId: string
}

export const foodTypeTags: FoodTypeTag[] = [
  { id: 'hotpot', name: '重庆火锅', characterId: 'huoguo' },
  { id: 'bbq', name: '烧烤', characterId: 'shaokao' },
  { id: 'noodles', name: '面食', characterId: 'mianshi' },
  { id: 'dessert', name: '甜品', characterId: 'tianpin' },
  { id: 'street-food', name: '街头小吃', characterId: 'jietou' },
]
