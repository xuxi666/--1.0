import { useEffect } from 'react'

type Props = {
  src: string
  caption?: string
  onClose: () => void
}

export default function Lightbox({ src, caption, onClose }: Props) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [onClose])

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="查看图片" onClick={onClose}>
      <button type="button" className="lightbox__close" onClick={onClose} aria-label="关闭">
        ✕
      </button>
      <figure className="lightbox__figure" onClick={(event) => event.stopPropagation()}>
        <img src={src} alt={caption ?? '社区图片'} />
        {caption && <figcaption>{caption}</figcaption>}
      </figure>
    </div>
  )
}
