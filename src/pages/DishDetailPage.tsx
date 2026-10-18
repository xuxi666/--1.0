import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DishCard from '../components/DishCard'
import FoodPhoto from '../components/FoodPhoto'
import Reveal from '../components/Reveal'
import VideoResults from '../components/VideoResults'
import { cuisineMap, foodTypeTags } from '../data/cuisines'
import { getDish } from '../data/dishes'
import { buildFailedBundle } from '../lib/videoIntent'
import { searchCookingVideos } from '../lib/api'
import { dishGallerySrcs, dishImageSrc } from '../lib/dishImage'
import { relatedDishesOf } from '../lib/dishBook'
import type { VideoSearchBundle } from '../types'

const STORY_TYPE_HINT: Record<string, string> = {
  历史记载: '有较为通行的史料与饮食文献支撑的表述',
  文献存疑: '有文献线索但存在争议，这里按「常见说法」记录',
  地方传说: '地方上流传的说法，缺少确证，不等于史实',
  民间故事: '民间口耳相传的趣闻，读作故事而不是史料',
  现代流行说法: '近现代才流行的说法或做法，非古代传统',
}

/**
 * 菜品详情页（/dishes/:id）
 * ------------------------------------------------------------
 * - 数据全部按 id 从唯一菜品库加载：非法 id 明确报错，绝不回退到别的菜；
 * - 聊天入口区分「菜品角色聊天」与「菜系聊天」，并把 dishId 带进聊天页作为上下文；
 * - 视频教程入口调用站内真实检索（/api/videos/search），没有结果时给平台原生搜索入口；
 * - 图片信息如实展示（AI 原创 / 待补充），缺图用统一占位图。
 */
export default function DishDetailPage() {
  const { id } = useParams()
  const dish = getDish(id)

  const [bundle, setBundle] = useState<VideoSearchBundle | null>(null)
  const [searching, setSearching] = useState(false)

  const related = useMemo(() => (dish ? relatedDishesOf(dish) : []), [dish])

  if (!dish) {
    return (
      <main className="page">
        <div className="container page-empty">
          <h1>图鉴里没有这道菜</h1>
          <p>可能链接过期了，也可能这个菜名还没被收录。这里不会拿别的菜来顶替。</p>
          <Link to="/dishes" className="btn btn--primary">
            回到美食图鉴 <span className="arrow">→</span>
          </Link>
        </div>
      </main>
    )
  }

  const cuisine = dish.cuisineId ? cuisineMap[dish.cuisineId] : undefined
  const foodType = dish.foodTypeId ? foodTypeTags.find((tag) => tag.id === dish.foodTypeId) : undefined
  const owner = cuisine ? cuisine.name : foodType ? `${foodType.name}（独立美食类型）` : '家常美食'
  const gallery = dishGallerySrcs(dish)

  /** 聊天入口：优先菜品角色聊天，其次菜系聊天；两者都带 dishId 作为话题上下文 */
  const chatHref = dish.chatTarget
    ? dish.chatTarget.kind === 'character'
      ? `/chat/${dish.chatTarget.characterId}?dish=${dish.id}`
      : `/cuisines/${dish.chatTarget.cuisineId}?dish=${dish.id}`
    : null
  const chatLabel = dish.chatTarget
    ? dish.chatTarget.kind === 'character'
      ? `和「${dish.chatTarget.label}」聊${dish.name}`
      : `去「${dish.chatTarget.label}」聊，话题带着${dish.name}`
    : ''

  const runVideoSearch = async () => {
    if (searching) return
    setSearching(true)
    const subject = cuisine?.name ?? dish.name
    try {
      const result = await searchCookingVideos(
        {
          text: dish.videoSearchQuery,
          contextCharacterId: dish.characterId,
          contextCuisineId: dish.cuisineId,
          limit: 6,
        },
      )
      setBundle(result)
    } catch (error) {
      const message = `视频搜索暂时不可用（${error instanceof Error ? error.message : '网络异常'}）。`
      setBundle(buildFailedBundle(dish.videoSearchQuery, message, subject))
    } finally {
      setSearching(false)
    }
  }

  return (
    <main className="page">
      <div className="container">
        <Reveal>
          <Link to="/dishes" className="back-link">
            ← 返回美食图鉴
          </Link>
        </Reveal>

        <Reveal>
          <div className="dish-hero">
            <div className="dish-hero__visual">
              <FoodPhoto
                name={dish.name}
                src={dishImageSrc(dish)}
                emoji={dish.emoji}
                palette={cuisine?.palette}
                alt={dish.imageAlt}
                eager
              />
              {dish.imageStatus === 'pending' && <p className="dish-hero__pending">图片待补充 · {dish.imageLicense}</p>}
            </div>

            <div className="dish-hero__copy">
              <span className="eyebrow">
                {owner} · {dish.region}
              </span>
              <h1 className="page-title">{dish.name}</h1>
              {dish.aliases.length > 0 && (
                <p className="dish-hero__alias">别名：{dish.aliases.join(' · ')}</p>
              )}
              <p className="page-sub">{dish.summary}</p>

              <div className="dish-meta">
                {cuisine && (
                  <Link to={`/cuisines/${cuisine.id}`} className="chip chip--link">
                    {cuisine.name} <span aria-hidden="true">→</span>
                  </Link>
                )}
                <span className="chip">{dish.region}</span>
                <span className="chip">{dish.dishType}</span>
                <span className="chip">难度 · {dish.difficulty}</span>
                <span className="chip">{dish.spicy > 0 ? `辣度 ${'🌶'.repeat(dish.spicy)}` : '不辣'}</span>
                <span className="chip">约 {dish.minutes} 分钟</span>
                <span className="chip">人均 ¥{dish.price}</span>
                {dish.scenes.slice(0, 3).map((scene) => (
                  <span className="chip" key={scene}>
                    {scene}
                  </span>
                ))}
              </div>

              <div className="dish-hero__actions">
                {chatHref ? (
                  <Link to={chatHref} className="btn btn--primary">
                    {chatLabel} <span className="arrow">→</span>
                  </Link>
                ) : (
                  <Link to="/personalities" className="btn btn--ghost">
                    这道菜还没有专属聊天入口 · 去看美食人格
                  </Link>
                )}
                <button type="button" className="btn btn--ghost" onClick={() => void runVideoSearch()} disabled={searching}>
                  {searching ? '正在检索视频…' : '查看制作教程（真实检索）'}
                </button>
                <Link to={`/recipe?dish=${encodeURIComponent(dish.name)}`} className="btn btn--ghost">
                  生成菜谱
                </Link>
              </div>

              {dish.chatTarget && (
                <p className="dish-hero__context">
                  聊天时会带上「当前讨论：{dish.name}」的上下文 ——{' '}
                  {dish.chatTarget.kind === 'cuisine'
                    ? `这道菜没有独立角色，进所属菜系聊天（${dish.chatTarget.label}），AI 知道你在聊这一道菜`
                    : dish.chatTarget.source === 'foodType'
                      ? `这道菜属于独立美食类型，由「${dish.chatTarget.label}」带着聊这道菜`
                      : `由菜品角色「${dish.chatTarget.label}」直接回应`}
                </p>
              )}
            </div>
          </div>
        </Reveal>

        {bundle && (
          <section className="section section--tight" id="dish-videos">
            <div className="section-head">
              <div className="section-head__copy">
                <span className="eyebrow">VIDEO TUTORIALS</span>
                <h2 className="h2">{dish.name}的制作教程</h2>
              </div>
              <p className="section-head__aside">
                搜索关键词：{dish.videoSearchQuery} · 结果来自平台真实检索，没有结果时只提供平台搜索入口，不伪造视频。
              </p>
            </div>
            <div className="dish-videos">
              <VideoResults bundle={bundle} loading={searching} onRetry={() => void runVideoSearch()} />
            </div>
          </section>
        )}

        <div className="dish-sections">
          <Reveal>
            <section className="dish-section">
              <h2 className="dish-section__title">
                图片
                <span className="dish-section__badge">
                  {gallery.length > 1 ? `共 ${gallery.length} 张` : '主图'}
                </span>
              </h2>
              <div className="dish-gallery">
                {gallery.map((src, index) => (
                  <figure key={src} className="dish-gallery__item">
                    <img src={src} alt={index === 0 ? dish.imageAlt : `${dish.name} 图片 ${index + 1}`} loading="lazy" />
                    <figcaption>{index === 0 ? '主图' : `附图 ${index}`}</figcaption>
                  </figure>
                ))}
              </div>
              <p className="dish-section__hint">
                {gallery.length > 1
                  ? `${dish.imageCredit}；附图与主图均为同一道菜。`
                  : '本图鉴目前每道菜只有一张与菜名对应的主图；后续补充的图片会出现在这里。'}
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section className="dish-section">
              <h2 className="dish-section__title">详细介绍</h2>
              <p className="dish-section__text">{dish.description}</p>
            </section>
          </Reveal>

          <Reveal>
            <section className="dish-section">
              <h2 className="dish-section__title">历史渊源</h2>
              <p className="dish-section__text">{dish.history}</p>
            </section>
          </Reveal>

          {dish.people.length > 0 && (
            <Reveal>
              <section className="dish-section">
                <h2 className="dish-section__title">相关人物</h2>
                <ul className="dish-section__list">
                  {dish.people.map((person) => (
                    <li key={person}>{person}</li>
                  ))}
                </ul>
                <p className="dish-section__hint">
                  人物关联以流传较广的说法为准；不能确认的部分已经写明，不当作史实。
                </p>
              </section>
            </Reveal>
          )}

          <Reveal>
            <section className="dish-section">
              <h2 className="dish-section__title">
                趣味典故
                <span className="dish-section__badge">{dish.storyType}</span>
              </h2>
              <p className="dish-section__text">{dish.story}</p>
              <p className="dish-section__hint">{STORY_TYPE_HINT[dish.storyType] ?? '按流传程度如实标注'}</p>
            </section>
          </Reveal>

          <Reveal>
            <section className="dish-section dish-section--split">
              <div>
                <h2 className="dish-section__title">主要食材</h2>
                <ul className="dish-ingredients">
                  {dish.ingredients.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {dish.allergens.length > 0 && (
                  <p className="dish-section__hint">常见过敏原：{dish.allergens.join('、')}</p>
                )}
              </div>
              <div>
                <h2 className="dish-section__title">口味与技法</h2>
                <p className="dish-section__text">{dish.flavorProfile}</p>
                <div className="dish-section__chips">
                  {dish.flavors.map((flavor) => (
                    <span className="chip" key={flavor}>
                      {flavor}
                    </span>
                  ))}
                  {dish.cookingMethods.map((method) => (
                    <span className="chip chip--accent" key={method}>
                      {method}
                    </span>
                  ))}
                </div>
                <p className="dish-section__hint">
                  适合场景：{dish.scenes.join(' / ')} · 家庭制作约 {dish.minutes} 分钟 · 难度 {dish.difficulty}
                </p>
              </div>
            </section>
          </Reveal>
        </div>

        {related.length > 0 && (
          <section className="section section--tight">
            <div className="section-head">
              <div className="section-head__copy">
                <span className="eyebrow">RELATED</span>
                <h2 className="h2">相关菜品</h2>
              </div>
              <p className="section-head__aside">从口味、技法或地域上找的伴儿，点进去看它自己的故事。</p>
            </div>
            <div className="dish-grid dish-grid--compact">
              {related.map((item) => (
                <DishCard key={item.id} dish={item} />
              ))}
            </div>
          </section>
        )}

        <section className="section section--tight">
          <div className="section-head">
            <div className="section-head__copy">
              <span className="eyebrow">IMAGE & SEARCH</span>
              <h2 className="h2">图片与关键词信息</h2>
            </div>
          </div>
          <div className="dish-facts">
            <p>
              <span>图片状态</span>
              {dish.imageStatus === 'ready' ? '站内有图（与菜品对应的原创生成图）' : '待补充（使用统一占位图）'}
            </p>
            <p>
              <span>图片说明</span>
              {dish.imageAlt}
            </p>
            <p>
              <span>来源</span>
              {dish.imageCredit}
            </p>
            <p>
              <span>许可</span>
              {dish.imageLicense}
            </p>
            <p>
              <span>视频关键词</span>
              {dish.videoSearchQuery}
            </p>
            <p>
              <span>搜索标签</span>
              {dish.tags.join(' / ')}
            </p>
            {gallery.length > 1 && (
              <p>
                <span>画廊</span>共 {gallery.length} 张图（当前图鉴以主图为主）
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
