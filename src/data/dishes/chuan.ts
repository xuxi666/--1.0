import type { DishSeed } from './types'

/**
 * 川菜新增菜品（图鉴第二阶段）
 * ------------------------------------------------------------
 * 只写新增菜品：已有的麻婆豆腐、水煮鱼、重庆火锅、辣子鸡、酸菜鱼、鱼香茄子、酸辣粉
 * 保存在 legacy.ts（id 不变），两者在 index.ts 汇总，不重复建库。
 * 归属有争议的菜品在 history 里写明不同说法，不为凑数强行归类。
 */
export const chuanDishes: DishSeed[] = [
  {
    id: 'huiguorou', name: '回锅肉', aliases: ['熬锅肉'], categoryId: 'nongxiang', dishType: '荤菜',
    cuisineId: 'chuan', region: '四川成都', spicy: 2, minutes: 40, price: 32,
    summary: '灯盏窝卷起豆瓣香，川菜里的「家常之王」。',
    desc: '五花肉片炒成灯盏窝，豆瓣香压住油腻。',
    description:
      '二刀肉或五花肉先煮到七成熟，晾凉切薄片，下锅中火煸到肉片打卷成「灯盏窝」，逼出多余油脂；再下郫县豆瓣与豆豉炒香，最后放青蒜苗，断生即起锅。讲究肉片起窝、蒜苗不塌、油不能汪在盘底。',
    history:
      '回锅肉的前身一般认为与四川乡村的「祭肉」有关：年节敬神敬祖之后的熟肉，舍不得丢，切片回锅再炒。常见说法认为它由这种「二次下锅」的吃法逐步定型，并在郫县豆瓣普及后成为川菜家常代表。具体形成的年代与地点有不同说法。',
    people: [],
    story:
      '川菜里叫它「家常之王」，意思是家家会做、人人有主张。老成都的讲究是：肉要起灯盏窝，蒜苗要断生，豆瓣必须剁细再下锅，否则咸味不匀。判断标准也直白——成菜盘中不能汪着一层油，肉片要干香带焦边。',
    storyType: '历史记载', flavors: ['咸鲜微辣', '豆瓣香'],
    scenes: ['家庭', '朋友聚会', '下饭'],
    flavorProfile: '咸鲜微辣，豆瓣香浓，肉片干香不腻', cookingMethods: ['煮肉', '切片煸炒', '炒豆瓣'],
    photo: '回锅肉',
    difficulty: '家常', allergens: ['大豆'], ingredients: ['二刀肉', '青蒜苗', '郫县豆瓣', '豆豉'], imageAlt: '回锅肉 成品图', relatedDishIds: ['mapo-tofu', 'laziji', 'gongbaojiding'],
    videoSearchQuery: '回锅肉 家常做法', tags: ['川菜', '成都', '豆瓣', '下饭菜', '家常'], emoji: '🥓',
  },
  {
    id: 'gongbaojiding', name: '宫保鸡丁', aliases: ['宫爆鸡丁', '宫保鸡丁'], categoryId: 'nongxiang',
    dishType: '荤菜', cuisineId: 'chuan', region: '四川', spicy: 2, minutes: 30, price: 28,
    summary: '糊辣荔枝味，鸡丁滑嫩、花生酥脆。',
    desc: '糊辣里带一点酸甜，鸡丁滑嫩花生脆。',
    description:
      '鸡腿肉切丁上浆，花生米炸脆备用；干辣椒与花椒小火焙出糊辣香，下鸡丁滑炒，烹入糖醋与酱油调成的荔枝味碗汁，最后回入花生。成菜鸡丁嫩、花生脆、芡汁亮，辣是香的辣，甜是藏在后面的甜。',
    history:
      '宫保鸡丁的流行起源说法与清代官员丁宝桢有关：他曾任四川总督，官衔中有「太子少保」，俗称「宫保」，后人便把这道糊辣荔枝味的炒鸡丁与他的名号连在一起。另有说法认为它源自贵州、山东等地的炒鸡做法，随官员入川而演变，具体脉络存在争议。',
    people: ['丁宝桢（清代官员，官衔俗称「宫保」，常见说法把他与这道菜联系在一起）'],
    story:
      '关于菜名，常见说法有两个方向：一是丁宝桢喜食炒鸡丁，家厨的做法流传开来；二是菜名直接取自他的官衔。后世把「宫保」写成「宫爆」的很多，川菜师傅则会纠正——这是糊辣荔枝味，靠花椒与干辣椒出香，不是单纯大火爆炒。',
    storyType: '文献存疑', flavors: ['糊辣', '酸甜'],
    scenes: ['家庭', '两人', '待客', '下饭'],
    flavorProfile: '糊辣荔枝味，微辣带甜酸，鸡丁滑嫩花生脆', cookingMethods: ['切丁上浆', '焙糊辣', '急火快炒'],
    difficulty: '家常', allergens: ['花生', '大豆', '鸡蛋'],
    ingredients: ['鸡腿肉', '花生米', '干辣椒', '花椒'], imageAlt: '宫保鸡丁 成品图',
    photo: '宫保鸡丁',
    relatedDishIds: ['huiguorou', 'mapo-tofu', 'fupifeipian'], videoSearchQuery: '宫保鸡丁 家常做法',
    tags: ['川菜', '糊辣', '鸡丁', '下饭菜', '宴客'], emoji: '🍗',
  },
  {
    id: 'yuxiangrousi', name: '鱼香肉丝', aliases: ['鱼香肉丝'], categoryId: 'suanxiang', dishType: '荤菜',
    cuisineId: 'chuan', region: '四川', spicy: 2, minutes: 30, price: 26,
    summary: '泡椒姜蒜糖醋齐上阵，肉丝里没有鱼。',
    desc: '咸甜酸辣兼备，姜蒜香压场，最下饭。',
    description:
      '里脊或后腿肉切细丝上浆，木耳、笋丝或青笋丝作配；泡椒、姜蒜与糖醋、酱油调成鱼香汁，肉丝滑油后下锅，烹汁快速翻匀。成菜咸甜酸辣兼备、姜葱蒜味突出，汁要挂在肉丝上而不汪盘。',
    history:
      '鱼香味型是川菜二十四种味型之一，来自「用烧鱼的调料炒其他菜」的民间习惯。鱼香肉丝在近现代川渝餐馆中定型并广泛流传，具体首创店家与年代有不同说法，宜作为川菜调味体系的代表菜看待。',
    people: [],
    story:
      '这道菜最容易被外地人误会成「有鱼」。川菜师傅的解释很直接：泡椒、姜蒜、糖醋这套组合本来就是烧鱼用的，用它炒肉丝，香味对得上，名字就留了下来。考核标准也统一——姜蒜要出味，酸甜要平衡，肉丝不能炒老。',
    storyType: '民间故事', flavors: ['鱼香', '酸甜微辣'],
    scenes: ['一人食', '家庭', '加班快手', '下饭'],
    flavorProfile: '咸甜酸辣兼备，姜蒜香突出，色泽红亮', cookingMethods: ['切丝上浆', '滑炒', '烹汁'],
    difficulty: '进阶', allergens: ['大豆'], ingredients: ['猪里脊', '泡椒', '木耳', '糖醋'],
    photo: '鱼香肉丝',
    imageAlt: '鱼香肉丝 成品图', relatedDishIds: ['mapo-qiezi', 'gongbaojiding', 'mapo-tofu'],
    videoSearchQuery: '鱼香肉丝 家常做法', tags: ['川菜', '鱼香', '肉丝', '下饭菜', '家常'], emoji: '🥢',
  },
  {
    id: 'fupifeipian', name: '夫妻肺片', aliases: ['肺片'], categoryId: 'mala', dishType: '凉菜',
    cuisineId: 'chuan', region: '四川成都', spicy: 3, minutes: 90, price: 38,
    summary: '牛肉牛杂切片，红油麻辣一拌就是一盘。',
    desc: '片薄料香麻得暖，成都的凉菜招牌。',
    description:
      '牛腱、牛肚、牛舌等卤熟后切薄片，晾到不烫手再拌，红油、花椒面、芝麻与花生碎调成麻辣汁，最后撒芹菜末与香菜。口感要「片薄、料香、麻得暖」，麻辣在舌尖铺开，不能只剩下辣。',
    history:
      '常见说法认为夫妻肺片起于成都街头的一对摊主夫妇：他们以牛肉、牛杂边角料卤熟切片，淋上红油麻辣调料叫卖，因为价廉味足而受欢迎，被食客称作「夫妻肺片」。这道菜里通常不放肺，名字里的「肺」更多是旧时对牛杂的泛称，具体细节说法不一。',
    people: ['郭朝华、张田政（常见说法中经营凉拌牛杂的摊主夫妇）'],
    story:
      '有说法称它最初叫「夫妻废片」，用的是牛杂下脚料，后来人们嫌「废」字不好听，写成「肺片」；也有说法认为摊主夫妇做得太受欢迎，顾客直接以「夫妻」相称。两个版本都在成都流传，谁也说服不了谁。',
    storyType: '地方传说', flavors: ['麻辣', '鲜香'],
    scenes: ['两人', '朋友聚会', '下酒'],
    flavorProfile: '麻辣鲜香，牛杂软韧，红油挂料', cookingMethods: ['卤制', '切片', '凉拌'],
    difficulty: '考功夫', allergens: ['花生', '芝麻', '大豆'],
    ingredients: ['牛腱肉', '牛肚', '红油', '花生碎'], imageAlt: '夫妻肺片 成品图',
    photo: '夫妻肺片',
    relatedDishIds: ['mapo-tofu', 'gongbaojiding', 'choudoufu'], videoSearchQuery: '夫妻肺片 家常做法',
    tags: ['川菜', '成都', '麻辣', '凉菜', '下酒菜'], emoji: '🥗',
  },
]
