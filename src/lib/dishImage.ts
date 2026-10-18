/**
 * 菜品图片解析（图鉴页 / 详情页共用）
 * ------------------------------------------------------------
 * - imageStatus === 'ready' 且有真实图片路径时用菜品图；
 * - 否则统一使用站内设计的占位图（明确标注「图片待补充」），
 *   绝不拿来源不明的网络图凑数，也不会出现破图。
 */
import type { Dish } from '../data/dishes'

/** 统一占位图（public/images/dishes/placeholder.svg） */
export const DISH_PLACEHOLDER_IMAGE = '/images/dishes/placeholder.svg'

export function dishImageSrc(dish: Dish): string {
  return dish.imageStatus === 'ready' && dish.image ? dish.image : DISH_PLACEHOLDER_IMAGE
}

/** 详情页画廊：主图 + 可选多图（重复文件自动去掉） */
export function dishGallerySrcs(dish: Dish): string[] {
  const list = [dishImageSrc(dish), ...dish.galleryImages]
  return [...new Set(list.filter(Boolean))]
}
