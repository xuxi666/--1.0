import type { CSSProperties } from 'react'

type Palette = { base: string; deep: string; light: string }

type Props = {
  emoji: string
  palette: Palette
  className?: string
  /** 是否显示蒸汽与光晕细节 */
  detail?: boolean
  alt?: string
}

/**
 * 美食视觉：以食物色系构建的「盘中肖像」。
 * 用渐变、盘沿、蒸汽与颗粒模拟编辑式食物质感，不依赖外部图片资源。
 */
export default function FoodPortrait({ emoji, palette, className = '', detail = true, alt }: Props) {
  const style = {
    '--p-base': palette.base,
    '--p-deep': palette.deep,
    '--p-light': palette.light,
  } as CSSProperties

  return (
    <div className={`portrait ${className}`} style={style} role="img" aria-label={alt ?? ''}>
      <div className="portrait__wash" />
      <div className="portrait__plate" />
      <div className="portrait__food" />
      {detail && (
        <svg className="portrait__steam" viewBox="0 0 100 100" aria-hidden="true">
          <path d="M38 46c-3-6 3-8 0-14s3-8 0-14" />
          <path d="M50 42c-3-7 3-9 0-16s3-9 0-16" />
          <path d="M62 46c-3-6 3-8 0-14s3-8 0-14" />
        </svg>
      )}
      <span className="portrait__glyph">{emoji}</span>
      <div className="portrait__vignette" />
      <div className="portrait__grain" />
    </div>
  )
}
