import { characterMap, characters } from './characters'

export type Category = {
  id: string
  index: string
  name: string
  en: string
  desc: string
  traits: string
  representatives: string[]
  palette: { base: string; deep: string; light: string }
  emoji: string
  /**
   * 该口味方向的「代言角色」：
   * 分类页主图、主按钮与文案统一以这个角色的身份展示，
   * 不再用数组下标 members[0] 隐式挑选，避免「浓香派却和烧烤聊聊」式的错配。
   */
  featuredCharacterId: string
}

export const categories: Category[] = [
  {
    id: 'mala',
    index: '01',
    name: '麻辣派',
    en: 'THE FIERY',
    desc: '热烈、直接、反应快。擅长辣度、花椒麻感与香料层次。',
    traits: '热烈 / 直接 / 有锋芒',
    representatives: ['麻婆豆腐', '重庆火锅', '水煮鱼', '川菜'],
    palette: { base: '#C0392B', deep: '#4E0F0A', light: '#F3B79E' },
    emoji: '🌶️',
    featuredCharacterId: 'mapo',
  },
  {
    id: 'xianxiang',
    index: '02',
    name: '鲜香派',
    en: 'THE PURE',
    desc: '温和、讲究、细腻。只谈本味、火候与食材的诚实。',
    traits: '温和 / 讲究 / 细腻',
    representatives: ['小笼包', '粤菜'],
    palette: { base: '#8FA98C', deep: '#2F4234', light: '#DCE7D6' },
    emoji: '🐟',
    featuredCharacterId: 'xiaolongbao',
  },
  {
    id: 'nongxiang',
    index: '03',
    name: '浓香派',
    en: 'THE DEEP',
    desc: '沉稳、从容、耐心。慢火、酱香与脂肪的对话。',
    traits: '沉稳 / 从容 / 有耐性',
    representatives: ['东坡肉', '红烧肉', '烧烤'],
    palette: { base: '#8C4A2B', deep: '#361508', light: '#E7C3A0' },
    emoji: '🍖',
    featuredCharacterId: 'dongpo',
  },
  {
    id: 'qingshuang',
    index: '04',
    name: '清爽派',
    en: 'THE LIGHT',
    desc: '温柔、雅致、念时令。清淡不等于寡淡。',
    traits: '温柔 / 雅致 / 有分寸',
    representatives: ['江南菜'],
    palette: { base: '#7E9C9A', deep: '#22383A', light: '#DCE9E4' },
    emoji: '🌿',
    featuredCharacterId: 'jiangnan',
  },
  {
    id: 'suanxiang',
    index: '05',
    name: '酸香派',
    en: 'THE SHARP',
    desc: '爽利、提神、有分寸。酸是提鲜，不是遮味。',
    traits: '爽利 / 干脆 / 提神',
    representatives: ['酸菜鱼', '街头小吃'],
    palette: { base: '#B7A24A', deep: '#3A3312', light: '#EDE4BC' },
    emoji: '🥬',
    featuredCharacterId: 'suancaiyu',
  },
  {
    id: 'tianrun',
    index: '06',
    name: '甜润派',
    en: 'THE SWEET',
    desc: '活泼、治愈、嘴甜。甜是给情绪的一级台阶。',
    traits: '活泼 / 治愈 / 会哄人',
    representatives: ['汤圆', '甜品'],
    palette: { base: '#D98AA6', deep: '#5A2438', light: '#F7DDE6' },
    emoji: '🍮',
    featuredCharacterId: 'tangyuan',
  },
  {
    id: 'fajiao',
    index: '07',
    name: '醇厚发酵派',
    en: 'THE FERMENTED',
    desc: '叛逆、有底气、藏得深。时间与微生物的合谋。',
    traits: '叛逆 / 有底气 / 毒舌',
    representatives: ['臭豆腐'],
    palette: { base: '#6E7A4A', deep: '#242A12', light: '#D8DCC0' },
    emoji: '🫘',
    featuredCharacterId: 'choudoufu',
  },
  {
    id: 'jiachang',
    index: '08',
    name: '温暖家常派',
    en: 'THE HOMELY',
    desc: '朴实、可靠、恋旧。一碗面先把人稳住。',
    traits: '朴实 / 可靠 / 恋旧',
    representatives: ['兰州牛肉面', '面食'],
    palette: { base: '#C9A06A', deep: '#4A3520', light: '#F0DFC6' },
    emoji: '🍜',
    featuredCharacterId: 'lanzhou',
  },
]

export const categoryMap: Record<string, Category> = Object.fromEntries(
  categories.map((c) => [c.id, c]),
)

export function charactersOfCategory(categoryId: string) {
  return characters.filter((c) => c.categoryId === categoryId)
}

/** 分类的代言角色（主图 / 主按钮统一使用它，非法配置返回 undefined 而不是乱指） */
export function featuredCharacterOfCategory(categoryId: string) {
  const category = categoryMap[categoryId]
  return category ? characterMap[category.featuredCharacterId] : undefined
}

export function categoryName(id: string) {
  return categoryMap[id]?.name ?? '未知口味'
}
