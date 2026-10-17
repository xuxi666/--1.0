import { characters } from './characters'

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
  /** 代表菜品的照片名 */
  photoName: string
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
    photoName: '麻婆豆腐',
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
    photoName: '小笼包',
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
    photoName: '东坡肉',
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
    photoName: '龙井虾仁',
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
    photoName: '酸菜鱼',
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
    photoName: '汤圆',
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
    photoName: '臭豆腐',
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
    photoName: '兰州牛肉面',
  },
]

export const categoryMap: Record<string, Category> = Object.fromEntries(
  categories.map((c) => [c.id, c]),
)

export function charactersOfCategory(categoryId: string) {
  return characters.filter((c) => c.categoryId === categoryId)
}

export function categoryName(id: string) {
  return categoryMap[id]?.name ?? '未知口味'
}
