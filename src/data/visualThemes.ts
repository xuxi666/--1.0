/**
 * 视觉主题配置（菜系 / 口味 / 品牌）——全站唯一来源
 * -------------------------------------------------
 * - 每个菜系、每个口味都有一条独立的 VisualTheme 记录，用稳定 id（cuisineId / tasteId）查找；
 *   页面与转场动画都只认 id，绝不通过中文显示名或数组下标选颜色；
 * - 菜系与口味不共用同一条主题记录，同一个视觉类型可被两边复用（类型一致、数据分离）；
 * - 主要消费方：
 *   · CircularTransition（圆形扩散转场层用 transitionGradient + glowColor）
 *   · CuisinePage / TastePage（页面根节点注入 --t-* 变量，页面与聊天区取主题色）
 * - 深色 UI 基础上取色：页面基底偏暗、转场圆取高饱和深渐变、文字保证对比度。
 */
import type { CuisineId } from './cuisines'
import type { TasteId } from './tastes'

export const BRAND_THEME_ID = 'brand' as const

/** 主题 id：八大菜系 id、八种口味 id，以及首页/总览页共用的品牌主题 */
export type ThemeId = CuisineId | TasteId | typeof BRAND_THEME_ID

export type VisualThemeKind = 'cuisine' | 'taste' | 'brand'

export type VisualTheme = {
  id: ThemeId
  kind: VisualThemeKind
  /** 展示名（调试与文档用） */
  label: string
  /** 主色：按钮、强调、边框 */
  primary: string
  /** 主色深部：渐变起点、深色面板 */
  secondary: string
  /** 点缀色：高光、次强调 */
  accent: string
  /** 主题页面基底（深色） */
  background: string
  /** 卡片 / 面板的主题化底色 */
  surfaceColor: string
  /** 主题化描边 */
  borderColor: string
  /** 主题化投影 */
  shadowColor: string
  /** 主文字色（深色底上的浅色，带主题微调） */
  text: string
  /** 次要文字色 */
  mutedText: string
  /** 光晕色（rgba，用于环境光 / 柔光） */
  glowColor: string
  /** 星球 / 节点的主题色 */
  orbColor: string
  /** 转场圆扩散用渐变（高饱和、深色起点） */
  transitionGradient: string
  /** 聊天页背景渐变（带主题淡染，不干扰阅读） */
  chatBackground: string
  /** 消息气泡 */
  bubbleStyle: {
    background: string
    border: string
    text: string
    userBackground: string
    userText: string
  }
  /** 主按钮 */
  buttonStyle: {
    background: string
    text: string
  }
  /** 主色按钮上的文字（与 primary 对比） */
  onPrimary: string
}

const cuisineThemes: Record<CuisineId, VisualTheme> = {
  // 川菜：赤焰朱红 —— 热烈、直接、有冲击力
  chuan: {
    id: 'chuan',
    kind: 'cuisine',
    label: '川菜 · 赤焰朱红',
    primary: '#C8402C',
    secondary: '#5E1510',
    accent: '#F09A5C',
    background: '#150A08',
    surfaceColor: '#1C100D',
    borderColor: 'rgba(232, 104, 58, 0.3)',
    shadowColor: 'rgba(94, 21, 16, 0.5)',
    text: '#F8EEE9',
    mutedText: 'rgba(248, 238, 233, 0.62)',
    glowColor: 'rgba(232, 104, 58, 0.42)',
    orbColor: '#E8683A',
    transitionGradient: 'linear-gradient(135deg, #4A0F0A 0%, #A0281A 46%, #E8683A 100%)',
    chatBackground:
      'radial-gradient(120% 80% at 18% 0%, rgba(200, 64, 44, 0.18) 0%, rgba(200, 64, 44, 0.05) 42%, transparent 68%), linear-gradient(180deg, #150D0B 0%, #0C0C0F 100%)',
    bubbleStyle: {
      background: 'rgba(200, 64, 44, 0.13)',
      border: 'rgba(232, 104, 58, 0.26)',
      text: '#F7E9E2',
      userBackground: 'rgba(232, 104, 58, 0.2)',
      userText: '#FFF1E6',
    },
    buttonStyle: { background: 'linear-gradient(135deg, #C8402C 0%, #E8683A 100%)', text: '#FFF6EF' },
    onPrimary: '#FFF6EF',
  },

  // 粤菜：翡翠青绿 —— 鲜活、清透、精致
  yue: {
    id: 'yue',
    kind: 'cuisine',
    label: '粤菜 · 翡翠青绿',
    primary: '#2F8F66',
    secondary: '#123B2B',
    accent: '#7FD1A6',
    background: '#0C120E',
    surfaceColor: '#101B15',
    borderColor: 'rgba(79, 181, 131, 0.3)',
    shadowColor: 'rgba(18, 59, 43, 0.5)',
    text: '#EEF6F0',
    mutedText: 'rgba(238, 246, 240, 0.6)',
    glowColor: 'rgba(79, 181, 131, 0.4)',
    orbColor: '#4FB583',
    transitionGradient: 'linear-gradient(135deg, #0C2E20 0%, #1F6B49 46%, #4FB583 100%)',
    chatBackground:
      'radial-gradient(120% 80% at 18% 0%, rgba(47, 143, 102, 0.18) 0%, rgba(47, 143, 102, 0.05) 42%, transparent 68%), linear-gradient(180deg, #0C130F 0%, #0C0C0F 100%)',
    bubbleStyle: {
      background: 'rgba(47, 143, 102, 0.14)',
      border: 'rgba(79, 181, 131, 0.26)',
      text: '#E9F5EE',
      userBackground: 'rgba(79, 181, 131, 0.2)',
      userText: '#F0FBF5',
    },
    buttonStyle: { background: 'linear-gradient(135deg, #246F50 0%, #4FB583 100%)', text: '#F2FBF6' },
    onPrimary: '#F2FBF6',
  },

  // 苏菜：雅致青瓷 —— 雅致、精巧、细腻
  su: {
    id: 'su',
    kind: 'cuisine',
    label: '苏菜 · 雅致青瓷',
    primary: '#4E9C96',
    secondary: '#1C4B48',
    accent: '#A9DCD6',
    background: '#0D1212',
    surfaceColor: '#121B1A',
    borderColor: 'rgba(143, 201, 194, 0.3)',
    shadowColor: 'rgba(28, 75, 72, 0.5)',
    text: '#EEF4F3',
    mutedText: 'rgba(238, 244, 243, 0.6)',
    glowColor: 'rgba(143, 201, 194, 0.38)',
    orbColor: '#8FC9C2',
    transitionGradient: 'linear-gradient(135deg, #123230 0%, #3A7F79 48%, #8FC9C2 100%)',
    chatBackground:
      'radial-gradient(120% 80% at 18% 0%, rgba(78, 156, 150, 0.17) 0%, rgba(78, 156, 150, 0.05) 42%, transparent 68%), linear-gradient(180deg, #0D1313 0%, #0C0C0F 100%)',
    bubbleStyle: {
      background: 'rgba(78, 156, 150, 0.14)',
      border: 'rgba(143, 201, 194, 0.26)',
      text: '#E9F3F2',
      userBackground: 'rgba(143, 201, 194, 0.2)',
      userText: '#F1FAF9',
    },
    buttonStyle: { background: 'linear-gradient(135deg, #35736E 0%, #8FC9C2 100%)', text: '#F4FBFA' },
    onPrimary: '#F4FBFA',
  },

  // 鲁菜：琥珀金棕 —— 厚重、经典、稳健
  lu: {
    id: 'lu',
    kind: 'cuisine',
    label: '鲁菜 · 琥珀金棕',
    primary: '#C08A3E',
    secondary: '#3B2408',
    accent: '#EBC98F',
    background: '#120E08',
    surfaceColor: '#1B150C',
    borderColor: 'rgba(217, 168, 85, 0.3)',
    shadowColor: 'rgba(59, 36, 8, 0.5)',
    text: '#F8F1E5',
    mutedText: 'rgba(248, 241, 229, 0.6)',
    glowColor: 'rgba(217, 168, 85, 0.4)',
    orbColor: '#D9A855',
    transitionGradient: 'linear-gradient(135deg, #2E1C07 0%, #7A5218 46%, #D9A855 100%)',
    chatBackground:
      'radial-gradient(120% 80% at 18% 0%, rgba(192, 138, 62, 0.17) 0%, rgba(192, 138, 62, 0.05) 42%, transparent 68%), linear-gradient(180deg, #130F0A 0%, #0C0C0F 100%)',
    bubbleStyle: {
      background: 'rgba(192, 138, 62, 0.14)',
      border: 'rgba(217, 168, 85, 0.26)',
      text: '#F6EFE2',
      userBackground: 'rgba(217, 168, 85, 0.2)',
      userText: '#FDF7EA',
    },
    buttonStyle: { background: 'linear-gradient(135deg, #8A6428 0%, #D9A855 100%)', text: '#2A1B06' },
    onPrimary: '#2A1B06',
  },

  // 湘菜：烈焰橘红 —— 鲜明、活泼、热烈
  xiang: {
    id: 'xiang',
    kind: 'cuisine',
    label: '湘菜 · 烈焰橘红',
    primary: '#E2551E',
    secondary: '#7A2409',
    accent: '#F7A05C',
    background: '#140C07',
    surfaceColor: '#1E110A',
    borderColor: 'rgba(245, 130, 46, 0.3)',
    shadowColor: 'rgba(122, 36, 9, 0.5)',
    text: '#FAEDE4',
    mutedText: 'rgba(250, 237, 228, 0.62)',
    glowColor: 'rgba(245, 130, 46, 0.45)',
    orbColor: '#F5822E',
    transitionGradient: 'linear-gradient(135deg, #3C0E02 0%, #B23A0E 44%, #F5822E 100%)',
    chatBackground:
      'radial-gradient(120% 80% at 18% 0%, rgba(226, 85, 30, 0.18) 0%, rgba(226, 85, 30, 0.05) 42%, transparent 68%), linear-gradient(180deg, #140D08 0%, #0C0C0F 100%)',
    bubbleStyle: {
      background: 'rgba(226, 85, 30, 0.14)',
      border: 'rgba(245, 130, 46, 0.26)',
      text: '#F9ECE1',
      userBackground: 'rgba(245, 130, 46, 0.2)',
      userText: '#FFF3E6',
    },
    buttonStyle: { background: 'linear-gradient(135deg, #C2431A 0%, #F5822E 100%)', text: '#FFF5EC' },
    onPrimary: '#FFF5EC',
  },

  // 闽菜：海韵蓝绿 —— 清新、细腻、灵动
  min: {
    id: 'min',
    kind: 'cuisine',
    label: '闽菜 · 海韵蓝绿',
    primary: '#33809B',
    secondary: '#103A4A',
    accent: '#7FC9D8',
    background: '#0A1114',
    surfaceColor: '#0E171C',
    borderColor: 'rgba(87, 174, 194, 0.3)',
    shadowColor: 'rgba(16, 58, 74, 0.5)',
    text: '#EAF4F6',
    mutedText: 'rgba(234, 244, 246, 0.6)',
    glowColor: 'rgba(87, 174, 194, 0.4)',
    orbColor: '#57AEC2',
    transitionGradient: 'linear-gradient(135deg, #082B38 0%, #1F6276 48%, #57AEC2 100%)',
    chatBackground:
      'radial-gradient(120% 80% at 18% 0%, rgba(51, 128, 155, 0.17) 0%, rgba(51, 128, 155, 0.05) 42%, transparent 68%), linear-gradient(180deg, #0B1215 0%, #0C0C0F 100%)',
    bubbleStyle: {
      background: 'rgba(51, 128, 155, 0.15)',
      border: 'rgba(87, 174, 194, 0.26)',
      text: '#E7F2F5',
      userBackground: 'rgba(87, 174, 194, 0.2)',
      userText: '#EFF9FB',
    },
    buttonStyle: { background: 'linear-gradient(135deg, #245F75 0%, #57AEC2 100%)', text: '#F0FAFC' },
    onPrimary: '#F0FAFC',
  },

  // 浙菜：竹影青绿 —— 自然、清雅、克制
  zhe: {
    id: 'zhe',
    kind: 'cuisine',
    label: '浙菜 · 竹影青绿',
    primary: '#6B9440',
    secondary: '#2A3D12',
    accent: '#B7D489',
    background: '#0E1209',
    surfaceColor: '#131A0D',
    borderColor: 'rgba(143, 176, 85, 0.3)',
    shadowColor: 'rgba(42, 61, 18, 0.5)',
    text: '#F1F5EA',
    mutedText: 'rgba(241, 245, 234, 0.6)',
    glowColor: 'rgba(143, 176, 85, 0.38)',
    orbColor: '#8FB055',
    transitionGradient: 'linear-gradient(135deg, #18260A 0%, #48691F 46%, #8FB055 100%)',
    chatBackground:
      'radial-gradient(120% 80% at 18% 0%, rgba(107, 148, 64, 0.17) 0%, rgba(107, 148, 64, 0.05) 42%, transparent 68%), linear-gradient(180deg, #0E130A 0%, #0C0C0F 100%)',
    bubbleStyle: {
      background: 'rgba(107, 148, 64, 0.15)',
      border: 'rgba(143, 176, 85, 0.26)',
      text: '#EEF4E4',
      userBackground: 'rgba(143, 176, 85, 0.2)',
      userText: '#F5FAEB',
    },
    buttonStyle: { background: 'linear-gradient(135deg, #4F7028 0%, #8FB055 100%)', text: '#F5FAEB' },
    onPrimary: '#F5FAEB',
  },

  // 徽菜：山岚墨金 —— 古朴、醇厚、沉稳
  hui: {
    id: 'hui',
    kind: 'cuisine',
    label: '徽菜 · 山岚墨金',
    primary: '#9C7B34',
    secondary: '#20260F',
    accent: '#D4B96C',
    background: '#10120B',
    surfaceColor: '#171A0F',
    borderColor: 'rgba(212, 185, 108, 0.3)',
    shadowColor: 'rgba(32, 38, 15, 0.55)',
    text: '#F5F0E0',
    mutedText: 'rgba(245, 240, 224, 0.6)',
    glowColor: 'rgba(212, 185, 108, 0.35)',
    orbColor: '#C9A95C',
    transitionGradient: 'linear-gradient(135deg, #161A0B 0%, #3E4A22 48%, #8C6F2E 100%)',
    chatBackground:
      'radial-gradient(120% 80% at 18% 0%, rgba(156, 123, 52, 0.16) 0%, rgba(156, 123, 52, 0.05) 42%, transparent 68%), linear-gradient(180deg, #10120C 0%, #0C0C0F 100%)',
    bubbleStyle: {
      background: 'rgba(156, 123, 52, 0.16)',
      border: 'rgba(212, 185, 108, 0.26)',
      text: '#F3EEDD',
      userBackground: 'rgba(212, 185, 108, 0.2)',
      userText: '#FAF6E8',
    },
    buttonStyle: { background: 'linear-gradient(135deg, #6E5622 0%, #C9A95C 100%)', text: '#241C08' },
    onPrimary: '#241C08',
  },
}

const tasteThemes: Record<TasteId, VisualTheme> = {
  // 麻辣：炽热猩红 —— 热烈、直率、充满能量
  mala: {
    id: 'mala',
    kind: 'taste',
    label: '麻辣 · 炽热猩红',
    primary: '#E23A1E',
    secondary: '#6E0F05',
    accent: '#FF9A4A',
    background: '#140807',
    surfaceColor: '#1E0D0A',
    borderColor: 'rgba(255, 122, 58, 0.3)',
    shadowColor: 'rgba(110, 15, 5, 0.5)',
    text: '#FBEAE4',
    mutedText: 'rgba(251, 234, 228, 0.62)',
    glowColor: 'rgba(255, 110, 60, 0.48)',
    orbColor: '#FF7A3C',
    transitionGradient: 'linear-gradient(135deg, #3F0500 0%, #B01A0A 38%, #FF8A3C 100%)',
    chatBackground:
      'radial-gradient(120% 80% at 18% 0%, rgba(226, 58, 30, 0.2) 0%, rgba(226, 58, 30, 0.06) 42%, transparent 68%), linear-gradient(180deg, #150907 0%, #0C0C0F 100%)',
    bubbleStyle: {
      background: 'rgba(226, 58, 30, 0.15)',
      border: 'rgba(255, 122, 58, 0.28)',
      text: '#FAE7DF',
      userBackground: 'rgba(255, 110, 60, 0.22)',
      userText: '#FFF0E6',
    },
    buttonStyle: { background: 'linear-gradient(135deg, #C22A10 0%, #FF8A3C 100%)', text: '#FFF5EE' },
    onPrimary: '#FFF5EE',
  },

  // 酸辣：酸橙黄绿 —— 鲜活、爽快、灵动
  suanla: {
    id: 'suanla',
    kind: 'taste',
    label: '酸辣 · 酸橙黄绿',
    primary: '#9CB31C',
    secondary: '#3A470A',
    accent: '#E4D24E',
    background: '#0F1108',
    surfaceColor: '#161A0B',
    borderColor: 'rgba(214, 195, 59, 0.3)',
    shadowColor: 'rgba(58, 71, 10, 0.5)',
    text: '#F5F6E6',
    mutedText: 'rgba(245, 246, 230, 0.6)',
    glowColor: 'rgba(214, 195, 59, 0.4)',
    orbColor: '#D6C33B',
    transitionGradient: 'linear-gradient(135deg, #2A3403 0%, #71860F 44%, #D6C33B 100%)',
    chatBackground:
      'radial-gradient(120% 80% at 18% 0%, rgba(156, 179, 28, 0.16) 0%, rgba(156, 179, 28, 0.05) 42%, transparent 68%), linear-gradient(180deg, #10120A 0%, #0C0C0F 100%)',
    bubbleStyle: {
      background: 'rgba(156, 179, 28, 0.15)',
      border: 'rgba(214, 195, 59, 0.26)',
      text: '#F3F5E2',
      userBackground: 'rgba(214, 195, 59, 0.2)',
      userText: '#FBFBE9',
    },
    buttonStyle: { background: 'linear-gradient(135deg, #7E9312 0%, #D6C33B 100%)', text: '#232A05' },
    onPrimary: '#232A05',
  },

  // 清鲜：薄荷青 —— 干净、克制、清爽
  qingxian: {
    id: 'qingxian',
    kind: 'taste',
    label: '清鲜 · 薄荷青',
    primary: '#37A99A',
    secondary: '#0F4A43',
    accent: '#9BE3D8',
    background: '#0B1311',
    surfaceColor: '#0F1C19',
    borderColor: 'rgba(111, 201, 188, 0.3)',
    shadowColor: 'rgba(15, 74, 67, 0.5)',
    text: '#E9F6F3',
    mutedText: 'rgba(233, 246, 243, 0.6)',
    glowColor: 'rgba(111, 201, 188, 0.4)',
    orbColor: '#6FC9BC',
    transitionGradient: 'linear-gradient(135deg, #07332E 0%, #218277 46%, #6FC9BC 100%)',
    chatBackground:
      'radial-gradient(120% 80% at 18% 0%, rgba(55, 169, 154, 0.17) 0%, rgba(55, 169, 154, 0.05) 42%, transparent 68%), linear-gradient(180deg, #0B1412 0%, #0C0C0F 100%)',
    bubbleStyle: {
      background: 'rgba(55, 169, 154, 0.14)',
      border: 'rgba(111, 201, 188, 0.26)',
      text: '#E6F4F1',
      userBackground: 'rgba(111, 201, 188, 0.2)',
      userText: '#EFFBF8',
    },
    buttonStyle: { background: 'linear-gradient(135deg, #26786F 0%, #6FC9BC 100%)', text: '#F0FCF9' },
    onPrimary: '#F0FCF9',
  },

  // 咸香：麦芽暖金 —— 亲切、可靠、踏实
  xianxiang: {
    id: 'xianxiang',
    kind: 'taste',
    label: '咸香 · 麦芽暖金',
    primary: '#CDA050',
    secondary: '#4A3814',
    accent: '#EBD08E',
    background: '#121008',
    surfaceColor: '#1A160C',
    borderColor: 'rgba(226, 199, 130, 0.3)',
    shadowColor: 'rgba(74, 56, 20, 0.5)',
    text: '#F8F1E4',
    mutedText: 'rgba(248, 241, 228, 0.6)',
    glowColor: 'rgba(235, 208, 142, 0.4)',
    orbColor: '#E2C782',
    transitionGradient: 'linear-gradient(135deg, #33260B 0%, #8A6A2C 46%, #EBD08E 100%)',
    chatBackground:
      'radial-gradient(120% 80% at 18% 0%, rgba(205, 160, 80, 0.17) 0%, rgba(205, 160, 80, 0.05) 42%, transparent 68%), linear-gradient(180deg, #13110A 0%, #0C0C0F 100%)',
    bubbleStyle: {
      background: 'rgba(205, 160, 80, 0.15)',
      border: 'rgba(235, 208, 142, 0.26)',
      text: '#F6EFE0',
      userBackground: 'rgba(235, 208, 142, 0.2)',
      userText: '#FDF8EB',
    },
    buttonStyle: { background: 'linear-gradient(135deg, #96763A 0%, #E2C782 100%)', text: '#2A2109' },
    onPrimary: '#2A2109',
  },

  // 酱香浓郁：深琥珀棕 —— 沉稳、浓厚、耐心
  jiangxiang: {
    id: 'jiangxiang',
    kind: 'taste',
    label: '酱香浓郁 · 深琥珀棕',
    primary: '#96562A',
    secondary: '#401F08',
    accent: '#DCAC66',
    background: '#120D07',
    surfaceColor: '#1B1309',
    borderColor: 'rgba(220, 172, 102, 0.3)',
    shadowColor: 'rgba(64, 31, 8, 0.55)',
    text: '#F7EDE1',
    mutedText: 'rgba(247, 237, 225, 0.6)',
    glowColor: 'rgba(184, 127, 53, 0.42)',
    orbColor: '#B87F35',
    transitionGradient: 'linear-gradient(135deg, #280F02 0%, #6B3812 44%, #B87F35 100%)',
    chatBackground:
      'radial-gradient(120% 80% at 18% 0%, rgba(150, 86, 42, 0.18) 0%, rgba(150, 86, 42, 0.05) 42%, transparent 68%), linear-gradient(180deg, #130D08 0%, #0C0C0F 100%)',
    bubbleStyle: {
      background: 'rgba(150, 86, 42, 0.16)',
      border: 'rgba(220, 172, 102, 0.26)',
      text: '#F5EBDD',
      userBackground: 'rgba(220, 172, 102, 0.2)',
      userText: '#FCF5E9',
    },
    buttonStyle: { background: 'linear-gradient(135deg, #6E3D14 0%, #C08A45 100%)', text: '#2C1A06' },
    onPrimary: '#2C1A06',
  },

  // 鲜香浓郁：海藻墨绿 —— 丰盛、醇厚、有层次
  xiannong: {
    id: 'xiannong',
    kind: 'taste',
    label: '鲜香浓郁 · 海藻墨绿',
    primary: '#3E7A55',
    secondary: '#10281A',
    accent: '#96C7A4',
    background: '#0C120D',
    surfaceColor: '#101A13',
    borderColor: 'rgba(150, 199, 164, 0.3)',
    shadowColor: 'rgba(16, 40, 26, 0.5)',
    text: '#EDF5EE',
    mutedText: 'rgba(237, 245, 238, 0.6)',
    glowColor: 'rgba(95, 155, 116, 0.4)',
    orbColor: '#5F9B74',
    transitionGradient: 'linear-gradient(135deg, #0A1D12 0%, #2A5638 46%, #5F9B74 100%)',
    chatBackground:
      'radial-gradient(120% 80% at 18% 0%, rgba(62, 122, 85, 0.17) 0%, rgba(62, 122, 85, 0.05) 42%, transparent 68%), linear-gradient(180deg, #0C130E 0%, #0C0C0F 100%)',
    bubbleStyle: {
      background: 'rgba(62, 122, 85, 0.15)',
      border: 'rgba(150, 199, 164, 0.26)',
      text: '#E9F3EC',
      userBackground: 'rgba(150, 199, 164, 0.2)',
      userText: '#F1FAF4',
    },
    buttonStyle: { background: 'linear-gradient(135deg, #2F5F41 0%, #79B08C 100%)', text: '#F2FBF5' },
    onPrimary: '#F2FBF5',
  },

  // 香甜：蜜桃粉金 —— 温柔、轻盈、治愈
  xiangtian: {
    id: 'xiangtian',
    kind: 'taste',
    label: '香甜 · 蜜桃粉金',
    primary: '#E18FA8',
    secondary: '#7A3B52',
    accent: '#F6D3B8',
    background: '#130D10',
    surfaceColor: '#1D1216',
    borderColor: 'rgba(242, 195, 158, 0.3)',
    shadowColor: 'rgba(122, 59, 82, 0.45)',
    text: '#FBF0F3',
    mutedText: 'rgba(251, 240, 243, 0.6)',
    glowColor: 'rgba(242, 195, 158, 0.42)',
    orbColor: '#F2C39E',
    transitionGradient: 'linear-gradient(135deg, #4E2032 0%, #B05E7C 44%, #F2C39E 100%)',
    chatBackground:
      'radial-gradient(120% 80% at 18% 0%, rgba(225, 143, 168, 0.17) 0%, rgba(225, 143, 168, 0.05) 42%, transparent 68%), linear-gradient(180deg, #140E11 0%, #0C0C0F 100%)',
    bubbleStyle: {
      background: 'rgba(225, 143, 168, 0.15)',
      border: 'rgba(246, 211, 184, 0.26)',
      text: '#F8E9EE',
      userBackground: 'rgba(246, 211, 184, 0.2)',
      userText: '#FEF4F6',
    },
    buttonStyle: { background: 'linear-gradient(135deg, #B06179 0%, #F0BE9A 100%)', text: '#3A1926' },
    onPrimary: '#3A1926',
  },

  // 清淡温润：月白竹青 —— 平和、温润、舒适
  qingdan: {
    id: 'qingdan',
    kind: 'taste',
    label: '清淡温润 · 月白竹青',
    primary: '#8FB8AC',
    secondary: '#3E6B60',
    accent: '#DCE9E3',
    background: '#0E1211',
    surfaceColor: '#131B18',
    borderColor: 'rgba(169, 203, 193, 0.3)',
    shadowColor: 'rgba(62, 107, 96, 0.42)',
    text: '#EEF4F1',
    mutedText: 'rgba(238, 244, 241, 0.6)',
    glowColor: 'rgba(214, 230, 223, 0.32)',
    orbColor: '#A9CBC1',
    transitionGradient: 'linear-gradient(135deg, #2E4A43 0%, #6FA294 44%, #D6E6DF 100%)',
    chatBackground:
      'radial-gradient(120% 80% at 18% 0%, rgba(143, 184, 172, 0.15) 0%, rgba(143, 184, 172, 0.05) 42%, transparent 68%), linear-gradient(180deg, #0F1312 0%, #0C0C0F 100%)',
    bubbleStyle: {
      background: 'rgba(143, 184, 172, 0.14)',
      border: 'rgba(169, 203, 193, 0.26)',
      text: '#EAF2EF',
      userBackground: 'rgba(169, 203, 193, 0.2)',
      userText: '#F3FAF7',
    },
    buttonStyle: { background: 'linear-gradient(135deg, #4F7E72 0%, #A9CBC1 100%)', text: '#14241F' },
    onPrimary: '#14241F',
  },
}

/** 品牌主题：首页 / 总览页共用的中性转场与强调（不抢菜系与口味的戏） */
export const brandTheme: VisualTheme = {
  id: BRAND_THEME_ID,
  kind: 'brand',
  label: '品牌 · 食有灵',
  primary: '#E8A766',
  secondary: '#8C4A2B',
  accent: '#F2B87C',
  background: '#100D0A',
  surfaceColor: '#171310',
  borderColor: 'rgba(232, 167, 102, 0.28)',
  shadowColor: 'rgba(140, 74, 43, 0.45)',
  text: '#F5F1EB',
  mutedText: 'rgba(245, 241, 235, 0.6)',
  glowColor: 'rgba(232, 167, 102, 0.4)',
  orbColor: '#E8A766',
  transitionGradient: 'linear-gradient(135deg, #1A120C 0%, #6B3418 44%, #E8A766 100%)',
  chatBackground:
    'radial-gradient(120% 80% at 18% 0%, rgba(232, 167, 102, 0.16) 0%, rgba(232, 167, 102, 0.04) 42%, transparent 68%), linear-gradient(180deg, #110E0B 0%, #0C0C0F 100%)',
  bubbleStyle: {
    background: 'rgba(232, 167, 102, 0.12)',
    border: 'rgba(232, 167, 102, 0.24)',
    text: '#F5F1EB',
    userBackground: 'rgba(232, 167, 102, 0.18)',
    userText: '#FBF3E8',
  },
  buttonStyle: { background: 'linear-gradient(135deg, #C65D3B 0%, #E8A766 100%)', text: '#241708' },
  onPrimary: '#241708',
}

/** 全站主题总表：品牌 + 八大菜系 + 八种口味，id 全局唯一 */
export const visualThemeMap: Record<ThemeId, VisualTheme> = {
  brand: brandTheme,
  ...cuisineThemes,
  ...tasteThemes,
}

const themeIdSet = new Set<string>(Object.keys(visualThemeMap))

/** 校验任意字符串是否是已知主题 id（不依赖显示名） */
export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && themeIdSet.has(value)
}

/** 按稳定 id 取主题；未知 id 回退品牌主题（页面永远不会因为没有主题而崩） */
export function getVisualTheme(id: string | null | undefined): VisualTheme {
  if (id && isThemeId(id)) return visualThemeMap[id]
  return brandTheme
}

/**
 * 把主题映射成 CSS 自定义属性（--t-*），挂在页面根节点上。
 * 页面样式只引用变量，不在 CSS 里按名称拼颜色。
 */
export function themeVars(theme: VisualTheme): Record<string, string> {
  return {
    '--t-primary': theme.primary,
    '--t-secondary': theme.secondary,
    '--t-accent': theme.accent,
    '--t-bg': theme.background,
    '--t-surface': theme.surfaceColor,
    '--t-border': theme.borderColor,
    '--t-shadow': theme.shadowColor,
    '--t-text': theme.text,
    '--t-muted': theme.mutedText,
    '--t-glow': theme.glowColor,
    '--t-orb': theme.orbColor,
    '--t-chat-bg': theme.chatBackground,
    '--t-bubble-bg': theme.bubbleStyle.background,
    '--t-bubble-border': theme.bubbleStyle.border,
    '--t-bubble-text': theme.bubbleStyle.text,
    '--t-user-bg': theme.bubbleStyle.userBackground,
    '--t-user-text': theme.bubbleStyle.userText,
    '--t-btn-bg': theme.buttonStyle.background,
    '--t-btn-text': theme.buttonStyle.text,
    '--t-btn-solid': theme.primary,
    '--t-on-primary': theme.onPrimary,
  }
}

/** 八大菜系主题（供数据级自检使用） */
export { cuisineThemes, tasteThemes }
