export type RecipeIngredient = { name: string; amount: number; unit: string; note?: string }

export type RecipeStep = {
  order: number
  action: string
  heat?: string
  minutes?: number
  tip?: string
}

export type Recipe = {
  title: string
  servings: number
  prepMinutes: number
  cookMinutes: number
  difficulty: '简单' | '中等' | '进阶'
  flavor: string
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  tips: string[]
  substitutions: string[]
  allergens: string[]
}

export type RecipeResponse = {
  demo: boolean
  recipe: Recipe
  model?: string | null
  error?: string
}

export type RecommendInput = {
  mood?: string
  flavors?: string[]
  spicy?: number
  budget?: number
  people?: number
  minutes?: number
  region?: string
  avoid?: string[]
}

export type RecommendItem = { id: string; name: string; reason: string }

export type RecommendResponse = {
  demo: boolean
  model?: string | null
  results: RecommendItem[]
  error?: string
}

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

export type AiStatus = { ai: 'live' | 'demo'; model: string | null }

export type RelatedDish = {
  name: string
  reason: string
  tag: string
  photo: string
  minutes?: number
  price?: number
  emoji?: string
}

export type RelatedDishesResponse = {
  demo: boolean
  model?: string | null
  items: RelatedDish[]
  error?: string
}
