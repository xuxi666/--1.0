/**
 * 美食小精灵 · 原创卡通形象（纯 SVG，不依赖外部图片）
 * ------------------------------------------------------------
 * 统一风格：圆润造型 + 深色描边 + 高光 + 同一套表情，
 * 各形象通过轮廓、配色与装饰区分，颜色来自 foodSprites 的 palette。
 */

import type { SpriteArt, SpritePalette } from '../data/foodSprites'

type Props = {
  art: SpriteArt
  palette: SpritePalette
  size?: number
  className?: string
}

export default function FoodSpriteArt({ art, palette, size = 72, className }: Props) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {art === 'tangyuan' && <Tangyuan p={palette} />}
      {art === 'baozi' && <Baozi p={palette} />}
      {art === 'mantou' && <Mantou p={palette} />}
      {art === 'riceball' && <Riceball p={palette} />}
      {art === 'dumpling' && <Dumpling p={palette} />}
      {art === 'egg' && <FriedEgg p={palette} />}
      {art === 'chili' && <Chili p={palette} />}
      {art === 'pudding' && <Pudding p={palette} />}
    </svg>
  )
}

/* ------------------------------ 通用零件 ------------------------------ */

const INK = '#3B2B21'

function Ground() {
  return <ellipse cx="60" cy="104" rx="26" ry="5" fill="#3A2A20" opacity="0.14" />
}

function Face({
  cx = 60,
  cy = 64,
  spread = 13,
  eyeR = 4.4,
  blushColor,
  blushOpacity = 0.45,
  blushDx = 24,
}: {
  cx?: number
  cy?: number
  spread?: number
  eyeR?: number
  blushColor: string
  blushOpacity?: number
  blushDx?: number
}) {
  return (
    <g>
      <ellipse cx={cx - blushDx} cy={cy + 8} rx={6.4} ry={4} fill={blushColor} opacity={blushOpacity} />
      <ellipse cx={cx + blushDx} cy={cy + 8} rx={6.4} ry={4} fill={blushColor} opacity={blushOpacity} />
      <circle cx={cx - spread} cy={cy} r={eyeR} fill={INK} />
      <circle cx={cx + spread} cy={cy} r={eyeR} fill={INK} />
      <circle cx={cx - spread + 1.5} cy={cy - 1.5} r={1.4} fill="#FFFDF8" />
      <circle cx={cx + spread + 1.5} cy={cy - 1.5} r={1.4} fill="#FFFDF8" />
      <path
        d={`M ${cx - 5.5} ${cy + 8.5} Q ${cx} ${cy + 13.5} ${cx + 5.5} ${cy + 8.5}`}
        fill="none"
        stroke={INK}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </g>
  )
}

/* ------------------------------ 各形象 ------------------------------ */

/** 小汤圆：奶油白圆球 + 芝麻点 */
function Tangyuan({ p }: { p: SpritePalette }) {
  return (
    <g>
      <Ground />
      <ellipse cx="60" cy="63" rx="36" ry="33" fill={p.base} stroke={p.deep} strokeWidth="2.4" />
      <ellipse cx="46" cy="44" rx="13" ry="9" fill={p.light} opacity="0.9" transform="rotate(-20 46 44)" />
      <ellipse cx="73" cy="40" rx="2.6" ry="1.9" fill="#8A6A4A" transform="rotate(24 73 40)" />
      <ellipse cx="83" cy="48" rx="2.4" ry="1.8" fill="#8A6A4A" transform="rotate(40 83 48)" />
      <ellipse cx="64" cy="35" rx="2.2" ry="1.7" fill="#8A6A4A" transform="rotate(8 64 35)" />
      <Face cy={65} blushColor={p.accent} />
    </g>
  )
}

/** 小包子：扁圆 + 顶部褶子 + 小揪揪 */
function Baozi({ p }: { p: SpritePalette }) {
  return (
    <g>
      <Ground />
      <ellipse cx="60" cy="68" rx="37" ry="31" fill={p.base} stroke={p.deep} strokeWidth="2.4" />
      <g stroke={p.deep} strokeWidth="2" strokeLinecap="round" opacity="0.7">
        <path d="M60 38 L44 50" fill="none" />
        <path d="M60 38 L52 43" fill="none" />
        <path d="M60 38 L68 43" fill="none" />
        <path d="M60 38 L76 50" fill="none" />
      </g>
      <circle cx="60" cy="36" r="5.2" fill={p.base} stroke={p.deep} strokeWidth="2.2" />
      <ellipse cx="45" cy="70" rx="12" ry="8" fill={p.light} opacity="0.85" transform="rotate(-16 45 70)" />
      <Face cy={74} blushColor={p.accent} />
    </g>
  )
}

/** 小馒头：光滑圆润 + 顶部小花 */
function Mantou({ p }: { p: SpritePalette }) {
  return (
    <g>
      <Ground />
      <ellipse cx="60" cy="66" rx="36" ry="31" fill={p.base} stroke={p.deep} strokeWidth="2.4" />
      <g fill={p.accent} opacity="0.85">
        <circle cx="60" cy="35" r="4.4" />
        <circle cx="67.4" cy="38.4" r="4.4" />
        <circle cx="64.6" cy="46.6" r="4.4" />
        <circle cx="55.4" cy="46.6" r="4.4" />
        <circle cx="52.6" cy="38.4" r="4.4" />
      </g>
      <circle cx="60" cy="41" r="3" fill={p.light} />
      <ellipse cx="44" cy="68" rx="12" ry="8" fill={p.light} opacity="0.85" transform="rotate(-16 44 68)" />
      <Face cy={72} blushColor={p.accent} />
    </g>
  )
}

/** 小饭团：圆角三角 + 海苔腰带 + 芝麻 */
function Riceball({ p }: { p: SpritePalette }) {
  return (
    <g>
      <Ground />
      <path
        d="M60 26 Q68 26 74 40 L94 78 Q99 92 84 92 L36 92 Q21 92 26 78 L46 40 Q52 26 60 26 Z"
        fill={p.base}
        stroke={p.deep}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <rect x="43" y="73" width="34" height="15" rx="3.5" fill="#3E4A38" />
      <ellipse cx="52" cy="44" rx="2.3" ry="1.8" fill="#8A6A4A" transform="rotate(-18 52 44)" />
      <ellipse cx="70" cy="42" rx="2.2" ry="1.7" fill="#8A6A4A" transform="rotate(22 70 42)" />
      <ellipse cx="62" cy="36" rx="2" ry="1.6" fill="#8A6A4A" />
      <Face cy={62} spread={12} blushDx={22} blushColor={p.accent} />
    </g>
  )
}

/** 小饺子：荷叶边 + 胖乎乎的下半身 */
function Dumpling({ p }: { p: SpritePalette }) {
  return (
    <g>
      <Ground />
      <path
        d="M26 70 Q23 46 40 43 Q46 32 53 42 Q60 29 67 42 Q74 32 80 43 Q97 46 94 70 Q92 93 60 93 Q28 93 26 70 Z"
        fill={p.base}
        stroke={p.deep}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M38 50 Q41 45 45 50" fill="none" stroke={p.deep} strokeWidth="1.8" opacity="0.6" strokeLinecap="round" />
      <path d="M56 45 Q60 40 64 45" fill="none" stroke={p.deep} strokeWidth="1.8" opacity="0.6" strokeLinecap="round" />
      <path d="M74 50 Q77 45 81 50" fill="none" stroke={p.deep} strokeWidth="1.8" opacity="0.6" strokeLinecap="round" />
      <ellipse cx="45" cy="73" rx="11" ry="7.5" fill={p.light} opacity="0.8" transform="rotate(-14 45 73)" />
      <Face cy={70} blushColor={p.accent} />
    </g>
  )
}

/** 小煎蛋：波浪蛋白 + 蛋黄脸 */
function FriedEgg({ p }: { p: SpritePalette }) {
  return (
    <g>
      <Ground />
      <path
        d="M60 24 C72 22 84 28 87 39 C99 41 105 53 100 63 C105 74 98 86 87 88 C84 98 72 104 61 100 C50 106 37 101 33 91 C22 88 18 76 24 66 C18 55 26 43 37 40 C41 29 50 25 60 24 Z"
        fill={p.base}
        stroke={p.deep}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="65" r="21.5" fill="#F2B23E" />
      <circle cx="60" cy="65" r="21.5" fill="none" stroke="#D99A2B" strokeWidth="1.6" opacity="0.55" />
      <circle cx="52" cy="56" r="6.2" fill="#F8C96A" opacity="0.9" />
      <Face cy={66} spread={11} eyeR={4} blushDx={18} blushColor="#E08A3C" blushOpacity={0.5} />
    </g>
  )
}

/** 小辣椒：弯弯的红身体 + 绿帽 */
function Chili({ p }: { p: SpritePalette }) {
  return (
    <g>
      <Ground />
      <path d="M56 32 C78 34 90 50 86 66 C83 81 71 93 59 94 C51 94.5 45 88 48 80 C52 66 52 44 56 32 Z" fill={p.base} stroke={p.deep} strokeWidth="2.4" strokeLinejoin="round" />
      <ellipse cx="63" cy="50" rx="5.5" ry="12" fill={p.light} opacity="0.55" transform="rotate(14 63 50)" />
      <path d="M56 31 Q54 21 63 18" fill="none" stroke="#6F8B55" strokeWidth="4" strokeLinecap="round" />
      <path d="M55 31 Q45 26 42 33 Q47 37 55 35 Z" fill={p.accent} stroke="#66824E" strokeWidth="1.6" strokeLinejoin="round" />
      <Face cx={64} cy={64} spread={12} blushDx={21} blushColor={p.light} blushOpacity={0.5} />
    </g>
  )
}

/** 小布丁：上窄下宽的梯形身体 + 焦糖顶 */
function Pudding({ p }: { p: SpritePalette }) {
  return (
    <g>
      <Ground />
      <path
        d="M38 56 Q60 49 82 56 L90 92 Q92 102 80 102 L40 102 Q28 102 30 92 Z"
        fill={p.base}
        stroke={p.deep}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M35 55 Q60 45 85 55 Q84.5 62 79 62 Q74 61 70 64 Q64 67.5 58 64 Q53 61 47 62 Q39 62.5 35 55 Z"
        fill={p.accent}
        stroke={p.deep}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <ellipse cx="45" cy="80" rx="10" ry="7" fill={p.light} opacity="0.75" transform="rotate(-14 45 80)" />
      <Face cy={82} spread={12} blushDx={22} blushColor="#D98AA6" blushOpacity={0.4} />
    </g>
  )
}
