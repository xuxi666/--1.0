import { useState, type CSSProperties } from 'react'
import { photoUrl } from '../lib/photos'

type PhotoPalette = { base: string; deep: string; light: string }

type Props = {
  name: string
  /** 直接指定图片地址（优先于 name 推导）；缺省时用 photoUrl(name) */
  src?: string
  /** 主图加载失败时的备用地址；仍失败则降级为 emoji 占位 */
  fallbackSrc?: string
  emoji?: string
  palette?: PhotoPalette
  className?: string
  alt?: string
  eager?: boolean
}

/**
 * 菜品照片：真实摄影图（CogView 生成，本地缓存）。
 * 加载中显示所属口味的色块；失败先尝试备用图，最终降级为食物图标，不会出现破图。
 */
export default function FoodPhoto({
  name,
  src,
  fallbackSrc,
  emoji = '🍽️',
  palette,
  className = '',
  alt,
  eager = false,
}: Props) {
  const primary = src ?? photoUrl(name)
  const [stage, setStage] = useState<'primary' | 'fallback' | 'failed'>(primary ? 'primary' : 'failed')
  const [loaded, setLoaded] = useState(false)

  const url = stage === 'primary' ? primary : stage === 'fallback' ? (fallbackSrc ?? '') : ''
  const showImage = stage !== 'failed' && Boolean(url)

  const style = palette
    ? ({
        '--p-base': palette.base,
        '--p-deep': palette.deep,
        '--p-light': palette.light,
      } as CSSProperties)
    : undefined

  return (
    <div className={`photo ${className} ${showImage && loaded ? 'is-loaded' : ''}`} style={style}>
      {showImage && (
        <img
          key={url}
          src={url}
          alt={alt ?? name}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false)
            setStage((current) => (current === 'primary' && fallbackSrc ? 'fallback' : 'failed'))
          }}
        />
      )}
      {!showImage && (
        <span className="photo__fallback" aria-hidden="true">
          {emoji}
        </span>
      )}
      <span className="photo__shade" aria-hidden="true" />
    </div>
  )
}
