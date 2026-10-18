import { useState } from 'react'
import { VIDEO_PLATFORMS, formatDuration, sanitizeCoverUrl, sanitizeVideoUrl } from '../lib/videoIntent'
import type { VideoResult, VideoSearchBundle } from '../types'

/**
 * 聊天窗口内的视频搜索结果块
 * ------------------------------------------------------------
 * - 真实视频结果与 AI 文本严格分离：本组件只渲染搜索服务返回的数据；
 * - 每条结果再次做 URL 校验（域名白名单 + https），不可信的链接直接不渲染；
 * - 封面 / 作者 / 时长缺失时优雅降级，不伪造任何字段；
 * - 「在该平台搜索更多」入口明确标注为平台搜索页，不与具体视频混淆。
 */

const PLATFORM_CLASS: Record<string, string> = {
  bilibili: 'is-bilibili',
  douyin: 'is-douyin',
  xiaohongshu: 'is-xiaohongshu',
  xigua: 'is-xigua',
}

function VideoCover({ result }: { result: VideoResult }) {
  const [failed, setFailed] = useState(false)
  const cover = result.coverUrl ? sanitizeCoverUrl(result.coverUrl) : null
  return (
    <div className={`video-card__cover ${PLATFORM_CLASS[result.platform] ?? ''}`}>
      {cover && !failed ? (
        <img src={cover} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span className="video-card__cover-fallback" aria-hidden="true">
          ▶
        </span>
      )}
    </div>
  )
}

function VideoCard({ result }: { result: VideoResult }) {
  return (
    <a
      className={`video-card ${PLATFORM_CLASS[result.platform] ?? ''}`}
      href={result.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      data-platform={result.platform}
      data-testid="video-card"
    >
      <VideoCover result={result} />
      <div className="video-card__body">
        <h4 className="video-card__title">{result.title}</h4>
        <p className="video-card__meta">
          <span className="video-card__platform">{VIDEO_PLATFORMS[result.platform].label}</span>
          {result.author && <span className="video-card__author">{result.author}</span>}
          {typeof result.duration === 'number' && result.duration > 0 && (
            <span className="video-card__duration">{formatDuration(result.duration)}</span>
          )}
        </p>
        {result.description && <p className="video-card__desc">{result.description}</p>}
        <span className="video-card__cta">
          观看视频 <span aria-hidden="true">↗</span>
        </span>
      </div>
    </a>
  )
}

export default function VideoResults({
  bundle,
  loading,
  onRetry,
}: {
  bundle?: VideoSearchBundle
  loading?: boolean
  onRetry?: () => void
}) {
  if (loading || !bundle) {
    return (
      <div className="video-search is-loading" data-testid="video-search" data-state="loading" aria-live="polite">
        <p className="video-search__loading-line">
          <span className="video-search__spinner" aria-hidden="true" />
          正在哔哩哔哩等平台检索真实视频…
        </p>
      </div>
    )
  }

  if (bundle.status === 'clarify') {
    return (
      <div className="video-search is-ask" data-testid="video-search" data-state="clarify">
        <p className="video-search__question">{bundle.question ?? bundle.note}</p>
      </div>
    )
  }

  // 渲染前再校验一遍：不可信的链接一律不展示（防伪造 / 钓鱼）
  const results = bundle.results.filter((item) => Boolean(item.title) && Boolean(sanitizeVideoUrl(item.url, item.platform)))
  const entries = bundle.entries.filter((item) => Boolean(sanitizeVideoUrl(item.url, item.platform)))
  const errored = bundle.providers.filter((item) => item.status === 'error')
  const failed = bundle.status === 'failed'

  return (
    <div
      className="video-search"
      data-testid="video-search"
      data-state={results.length > 0 ? 'results' : failed ? 'error' : 'empty'}
      aria-live="polite"
    >
      <div className="video-search__head">
        <span className="video-search__badge">站内视频搜索 · 真实结果</span>
        <p className="video-search__note">{bundle.note}</p>
        {failed !== true && errored.length > 0 && (
          <ul className="video-search__issues">
            {errored.map((item) => (
              <li key={item.platform}>
                {VIDEO_PLATFORMS[item.platform].label}：{item.reason ?? '暂时不可用'}
              </li>
            ))}
          </ul>
        )}
      </div>

      {results.length > 0 && (
        <div className="video-search__grid">
          {results.map((item) => (
            <VideoCard key={item.id} result={item} />
          ))}
        </div>
      )}

      {entries.length > 0 && (
        <div className="video-search__entries">
          <span className="video-search__entries-label">在该平台搜索更多：</span>
          {entries.map((entry) => (
            <a
              key={entry.id}
              className={`video-entry ${PLATFORM_CLASS[entry.platform] ?? ''}`}
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              data-platform={entry.platform}
              data-testid="video-entry"
            >
              {VIDEO_PLATFORMS[entry.platform].label} ↗
            </a>
          ))}
        </div>
      )}

      {results.length === 0 && onRetry && (
        <button type="button" className="video-search__retry" onClick={onRetry}>
          重试搜索
        </button>
      )}

      <p className="video-search__foot">
        结果来自平台公开数据的实时检索，点击卡片打开原视频；平台入口会在新标签页打开对应平台的搜索页。
      </p>
    </div>
  )
}
