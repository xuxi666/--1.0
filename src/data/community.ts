import { photoUrl } from '../lib/photos'

export type PostKind = '讨论' | '菜谱分享' | '提问' | '角色话题'

/** 帖子回复（服务端存储，局域网内同步） */
export type PostReply = {
  id: string
  nickname: string
  avatarColor: string
  initial: string
  content: string
  createdAt: number
}

export type CommunityPost = {
  id: string
  nickname: string
  avatarColor: string
  initial: string
  /** 发布时间（epoch ms），相对时间在前端计算 */
  createdAt: number
  topic: string
  characterId?: string
  content: string
  /** 基础点赞数（演示帖的“历史热度”；用户帖为 0），真实点赞由服务端叠加 */
  likeBase: number
  kind: PostKind
  badge?: string
  images: string[]
}

/** 服务端返回的社区快照：用户帖子 + 回复表 + 点赞表（帖 id -> 客户端 id 列表） */
export type CommunitySnapshot = {
  posts: CommunityPost[]
  replies: Record<string, PostReply[]>
  likes: Record<string, string[]>
}

export const AVATAR_COLORS = ['#C9A06A', '#C0392B', '#7E9C9A', '#B83A26', '#8FA98C', '#D98AA6', '#A8642F']

/** 按昵称稳定映射一个头像色 */
export function avatarColorFor(name: string) {
  const seed = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return AVATAR_COLORS[seed % AVATAR_COLORS.length]
}

export function initialOf(name: string) {
  return (name.trim() || '匿').slice(0, 1)
}

/** 演示帖的相对时间：距今 minutes 分钟 */
const ago = (minutes: number) => Date.now() - minutes * 60_000

export const communityPosts: CommunityPost[] = [
  {
    id: 'p1',
    nickname: '半夜煮面的老陈',
    avatarColor: '#C9A06A',
    initial: '陈',
    createdAt: ago(12),
    topic: '和麻婆豆腐聊完，我把豆腐换了',
    characterId: 'mapo',
    content:
      '它一句“你豆腐不焯水，那不叫麻婆豆腐”，把我十年的习惯否了。照它说的焯了 40 秒淡盐水，豆腐真的不碎了，边缘还完整。它说话难听，但确实对。',
    likeBase: 128,
    kind: '讨论',
    badge: '老饕',
    images: [photoUrl('麻婆豆腐')],
  },
  {
    id: 'p2',
    nickname: '一勺豆瓣',
    avatarColor: '#C0392B',
    initial: '豆',
    createdAt: ago(38),
    topic: '三次勾芡到底是哪三次？',
    characterId: 'mapo',
    content:
      '今天问麻婆豆腐三次勾芡的时机，它给的答案很具体：第一次收汤、第二次挂汁、第三次亮油。按这个做了，盘底真的没有出水。附一张出锅前的状态。',
    likeBase: 96,
    kind: '提问',
    badge: '进阶',
    images: [photoUrl('鱼香茄子'), photoUrl('水煮鱼')],
  },
  {
    id: 'p3',
    nickname: '林小满',
    avatarColor: '#7E9C9A',
    initial: '林',
    createdAt: ago(60),
    topic: '用「只有鸡蛋和番茄」生成了一份菜谱',
    characterId: 'hongshaorou',
    content:
      '输入“只有鸡蛋和番茄，能做什么”，它给了三个方向，我选了番茄炒蛋 + 番茄蛋花汤的组合，还提醒我糖别放太早。二十分钟上桌，室友说比外卖强。',
    likeBase: 74,
    kind: '菜谱分享',
    badge: '新手',
    images: [photoUrl('番茄炒蛋'), photoUrl('番茄鸡蛋面')],
  },
  {
    id: 'p4',
    nickname: '火锅局召集人',
    avatarColor: '#B83A26',
    initial: '锅',
    createdAt: ago(120),
    topic: '重庆火锅坚持先下鸭血，你们呢？',
    characterId: 'huoguo',
    content:
      '被它说服了：先下鸭血和黄豆芽垫底，锅底会越煮越厚。试了一次，确实比先涮肉香。有没有反方观点？',
    likeBase: 61,
    kind: '讨论',
    badge: '组局达人',
    images: [photoUrl('重庆火锅')],
  },
  {
    id: 'p5',
    nickname: '江南不下雨',
    avatarColor: '#8FA98C',
    initial: '江',
    createdAt: ago(180),
    topic: '腌笃鲜的春笋，今年早了半个月',
    characterId: 'jiangnan',
    content:
      '它说霜降后的青菜才肯甜，我原本不信。今年按节气买菜，确实差着一截。附一张我家今年的第一锅腌笃鲜，汤是奶白的。',
    likeBase: 152,
    kind: '菜谱分享',
    badge: '时令派',
    images: [photoUrl('腌笃鲜'), photoUrl('龙井虾仁'), photoUrl('清蒸鲈鱼')],
  },
  {
    id: 'p6',
    nickname: '甜党代表',
    avatarColor: '#D98AA6',
    initial: '甜',
    createdAt: ago(300),
    topic: '汤圆说“水别大滚”，我信了',
    characterId: 'tangyuan',
    content:
      '以前煮汤圆全是破的，它让我转小火、点两次凉水，这次一个都没破。它说话软软的，但给的建议一点不含糊。',
    likeBase: 88,
    kind: '菜谱分享',
    badge: '新手',
    images: [photoUrl('黑芝麻汤圆')],
  },
  {
    id: 'p7',
    nickname: '西北风',
    avatarColor: '#C7B08A',
    initial: '西',
    createdAt: ago(1440),
    topic: '兰州牛肉面不接受“兰州拉面”这个叫法',
    characterId: 'lanzhou',
    content:
      '跟它聊了半小时，从一清二白讲到毛细二细韭叶大宽。它说汤浑了只有一个理由：火大了。这句话我记住了。',
    likeBase: 203,
    kind: '角色话题',
    badge: '面食控',
    images: [photoUrl('兰州牛肉面')],
  },
  {
    id: 'p8',
    nickname: '炭火不熄',
    avatarColor: '#A8642F',
    initial: '炭',
    createdAt: ago(1560),
    topic: '凌晨一点的烧烤，是另一种营养',
    characterId: 'shaokao',
    content:
      '它说“没什么事是一顿烧烤解决不了的”。我不信，试了。凌晨一点半，两串羊肉、一份蒜蓉茄子，确实好多了。附现场图。',
    likeBase: 117,
    kind: '讨论',
    badge: '深夜党',
    images: [photoUrl('孜然羊肉串'), photoUrl('蒜蓉烤茄子')],
  },
  {
    id: 'p9',
    nickname: '一碗热汤',
    avatarColor: '#C9A06A',
    initial: '汤',
    createdAt: ago(2880),
    topic: '过桥米线那层油，到底该不该撇？',
    characterId: 'yue',
    content:
      '家里人说那层油不健康，粤菜那边又说那是给食材留的时间。两边都挺有道理，想听听大家怎么处理。',
    likeBase: 45,
    kind: '提问',
    badge: '好奇宝宝',
    images: [photoUrl('过桥米线')],
  },
]

export const communityTopics = [
  '#麻婆豆腐三次勾芡',
  '#锅底先下什么',
  '#时令与节气',
  '#汤圆不破皮',
  '#一清二白',
  '#深夜烧烤局',
]

export const postKinds: Array<PostKind | '全部'> = ['全部', '讨论', '菜谱分享', '提问', '角色话题']
