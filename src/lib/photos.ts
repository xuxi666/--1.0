/** 菜品照片路径（服务端脚本预生成到 public/images/photos） */
export function photoUrl(name: string) {
  return `/images/photos/${encodeURIComponent(name)}.jpg`
}
