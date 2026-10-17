/**
 * 首页美食小精灵（FOOD SOUL PET）· 形象配置与随机逻辑
 * ------------------------------------------------------------
 * - 形象只影响视觉呈现与静态招呼文案，不绑定任何美食人格；
 *   对话身份统一由服务端通用提示词决定（server/api.ts · PET_SYSTEM_PROMPT）。
 * - 随机选择集中在本文件，纯函数 + 可注入随机源，便于测试；
 *   组件里不散落 Math.random。
 */

export type SpriteArt =
  | 'tangyuan'
  | 'baozi'
  | 'mantou'
  | 'riceball'
  | 'dumpling'
  | 'egg'
  | 'chili'
  | 'pudding'

export type SpritePalette = {
  /** 主体色 */
  base: string
  /** 深色描边 / 阴影 */
  deep: string
  /** 高光色 */
  light: string
  /** 点缀色（腮红 / 装饰） */
  accent: string
}

export type FoodSprite = {
  id: string
  name: string
  art: SpriteArt
  palette: SpritePalette
  /** 打开聊天面板时的固定欢迎语 */
  welcome: string
  /** 悬浮气泡备选提示语（静态文案，非 AI 生成） */
  hints: string[]
}

export const foodSprites: FoodSprite[] = [
  {
    id: 'tangyuan',
    name: '汤圆精灵',
    art: 'tangyuan',
    palette: { base: '#F7EFE1', deep: '#B98F5E', light: '#FFFCF4', accent: '#E8A766' },
    welcome: '我是汤圆精灵，糯糯的那种。今天想吃点什么？',
    hints: ['嗨！今天想吃点什么？', '不知道吃啥？可以随便聊聊', '厨房里有什么？我帮你想想'],
  },
  {
    id: 'baozi',
    name: '包子精灵',
    art: 'baozi',
    palette: { base: '#F6E7CB', deep: '#B5834F', light: '#FFFAF0', accent: '#D98AA6' },
    welcome: '我刚“出笼”，热乎着呢。想聊聊今天吃什么吗？',
    hints: ['呼——热乎着呢，聊两句？', '今天吃什么，交给我想想', '点我，说说你想吃的'],
  },
  {
    id: 'mantou',
    name: '馒头精灵',
    art: 'mantou',
    palette: { base: '#F3E6CE', deep: '#B78A57', light: '#FFFAF0', accent: '#D98AA6' },
    welcome: '我是馒头精灵，白白胖胖的那种。今天想吃什么？',
    hints: ['白胖白胖的，来聊聊天？', '想不出吃什么？点我', '家常菜也能聊出花，试试？'],
  },
  {
    id: 'riceball',
    name: '饭团精灵',
    art: 'riceball',
    palette: { base: '#FBF6EC', deep: '#6E5B41', light: '#FFFFFF', accent: '#E8A766' },
    welcome: '我是饭团精灵，随身带点海苔香。今天想吃什么？',
    hints: ['海苔味的小提示：点我聊天', '今天想吃点什么？', '一人食也能吃得香，聊聊？'],
  },
  {
    id: 'dumpling',
    name: '饺子精灵',
    art: 'dumpling',
    palette: { base: '#F5EBD8', deep: '#BE9059', light: '#FFFBF2', accent: '#E28F6B' },
    welcome: '我是饺子精灵，肚子里有货。今天想吃点什么？',
    hints: ['肚子里的故事不少，点我聊', '想吃什么？咱俩一起琢磨', '今天吃什么，聊着聊着就有答案'],
  },
  {
    id: 'egg',
    name: '煎蛋精灵',
    art: 'egg',
    palette: { base: '#FDF9F1', deep: '#D9A254', light: '#FFFFFF', accent: '#F2B23E' },
    welcome: '我是煎蛋精灵，边上焦脆的那圈是我。今天想吃什么？',
    hints: ['鸡蛋番茄能做什么？点我问', '把今天的话题煎得刚刚好', '今天想吃点什么？'],
  },
  {
    id: 'chili',
    name: '辣椒精灵',
    art: 'chili',
    palette: { base: '#C24A36', deep: '#8E2F22', light: '#E37B5F', accent: '#7E9C60' },
    welcome: '我是辣椒精灵，但聊什么口味都不偏心。今天想吃什么？',
    hints: ['我负责红，你负责点', '来聊点下饭的？', '今天吃什么，聊着聊着就有答案'],
  },
  {
    id: 'pudding',
    name: '布丁精灵',
    art: 'pudding',
    palette: { base: '#F6E3B4', deep: '#B4813E', light: '#FFF6DC', accent: '#C97A3F' },
    welcome: '我是布丁精灵，Q 弹但不粘人。今天想吃什么？',
    hints: ['甜甜的提示语：点我聊天', '想不出吃什么？摇一摇我', '今天想吃点什么？'],
  },
]

/** 可注入的随机源，默认 Math.random，测试时可传入固定序列 */
export type RandomFn = () => number

/**
 * 随机挑一个形象。
 * 传入 excludeId（上次出现过的形象）时优先避开它，
 * 避免同一标签页里连续两次刷新出现同一只精灵——但仍然保持随机。
 */
export function pickFoodSprite(options: { excludeId?: string | null; random?: RandomFn } = {}): FoodSprite {
  const random = options.random ?? Math.random
  const excludeId = options.excludeId ?? null
  const pool = excludeId ? foodSprites.filter((sprite) => sprite.id !== excludeId) : foodSprites
  const list = pool.length > 0 ? pool : foodSprites
  const index = Math.min(list.length - 1, Math.max(0, Math.floor(random() * list.length)))
  return list[index]
}

/** 从形象的备选提示语里随机挑一条（纯函数，可测试） */
export function pickSpriteHint(sprite: FoodSprite, random: RandomFn = Math.random): string {
  const list = sprite.hints.length > 0 ? sprite.hints : [sprite.welcome]
  const index = Math.min(list.length - 1, Math.max(0, Math.floor(random() * list.length)))
  return list[index]
}

/* ------------------- 会话级记忆（仅用于避开连续重复） ------------------- */

const SPRITE_KEY = 'fs-pet-sprite'
const BUBBLE_KEY = 'fs-pet-bubble'

/** 上一次出现过的形象 id（只用于避免连续两次刷新重复，不用于固定形象） */
export function lastFoodSpriteId(): string | null {
  try {
    return window.sessionStorage.getItem(SPRITE_KEY)
  } catch {
    return null
  }
}

/** 记录本次出现的形象；下次刷新仍会重新随机，只是会优先避开它 */
export function rememberFoodSprite(id: string) {
  try {
    window.sessionStorage.setItem(SPRITE_KEY, id)
  } catch {
    /* 隐私模式等场景忽略 */
  }
}

/** 欢迎气泡是否已被用户关闭（同一标签页会话内不再弹出） */
export function isPetBubbleDismissed(): boolean {
  try {
    return window.sessionStorage.getItem(BUBBLE_KEY) === '1'
  } catch {
    return false
  }
}

export function dismissPetBubble() {
  try {
    window.sessionStorage.setItem(BUBBLE_KEY, '1')
  } catch {
    /* ignore */
  }
}
