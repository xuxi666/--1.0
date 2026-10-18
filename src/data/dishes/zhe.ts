import type { DishSeed } from './types'

/**
 * 浙菜新增菜品（图鉴第二阶段）
 * 已有东坡肉、龙井虾仁、黑芝麻汤圆保存在 legacy.ts，本文件补齐至 10 道。
 *
 * 归属说明：叫花鸡在江浙多地（杭州、常熟等）都流传，常见的两种归类是苏菜与浙菜。
 * 本站沿用现有菜系数据结构把它归入浙菜，并在 history 里写明归属存在不同说法，
 * 不为凑数强行隐藏争议。
 */
export const zheDishes: DishSeed[] = [
  {
    id: 'xihu-cuyu', name: '西湖醋鱼', aliases: ['醋鱼'], categoryId: 'suanxiang', dishType: '荤菜',
    cuisineId: 'zhe', region: '浙江杭州', spicy: 0, minutes: 40, price: 58,
    summary: '鱼肉要离骨不带血，糖醋要薄到能看见鱼纹。',
    desc: '酸甜清亮、鱼肉嫩滑，芡薄不腻。',
    description:
      '草鱼（或鳜鱼）在清水中养净，改刀后入水汆熟，浇上由镇江香醋、糖与酱油调成的琉璃芡。成菜鱼肉嫩滑、酸甜清香，芡汁清亮不厚。火候是第一关：鱼肉刚离骨就要立刻出锅。',
    history:
      '西湖醋鱼是杭州名菜，与西湖饮食文化及杭帮菜「清鲜酸甜」的取向相关。它普遍被追溯到近现代杭州餐馆的做法，也有更早的传说版本，具体起源说法不一，宜作为杭帮菜的代表看待。',
    people: [],
    story:
      '杭州人评价这道菜很苛刻：鱼肉要「离骨不带血」，糖醋要「入口先甜后酸」，汁要薄到能看见鱼肉纹理。因为草鱼有泥腥味，讲究的店家会先清水养几天。外地人第一次吃常觉得清淡，本地人却说这才是功夫。',
    storyType: '民间故事', flavors: ['酸甜', '清鲜'],
    scenes: ['家庭', '两人', '待客'],
    flavorProfile: '酸甜清亮，鱼肉嫩滑，芡薄不腻', cookingMethods: ['清水养鱼', '汆熟', '调琉璃芡'],
    difficulty: '进阶', allergens: ['鱼类', '大豆'], ingredients: ['草鱼', '镇江香醋', '糖', '姜末'], imageAlt: '西湖醋鱼 成品图',
    photo: '西湖醋鱼',
    relatedDishIds: ['songshu-guiyu', 'longjing-shrimp', 'songshao-yugeng'], videoSearchQuery: '西湖醋鱼 家常做法',
    tags: ['浙菜', '杭州', '糖醋', '鱼', '杭帮菜'], emoji: '🐟',
  },
  {
    id: 'jiaohuaji', name: '叫花鸡', aliases: ['叫化鸡', '富贵鸡'], categoryId: 'nongxiang', dishType: '荤菜',
    cuisineId: 'zhe', region: '浙江杭州（江苏常熟等地亦有名）', spicy: 0, minutes: 180, price: 68,
    summary: '荷叶裹鸡、黄泥封壳，敲开那一下就是高潮。',
    desc: '荷香扑鼻、鸡肉酥烂，咸鲜入骨。',
    description:
      '整鸡用酱油、黄酒与香料腌透，肚里塞香菇与葱姜；外裹荷叶，再糊上黄泥（或面粉团），入烤箱或火堆烤两小时。敲开泥壳，荷叶香扑鼻、鸡肉酥烂，是江浙一带最有仪式感的做法之一。',
    history:
      '叫花鸡的归属有不同说法：一说源自江苏常熟一带的民间做法，传说与乞丐用泥裹鸡烤食有关；后来在江浙多地流传。本站按现有菜系数据归入浙菜，同时注明它常被列入苏菜、江浙名菜的不同意见。',
    people: [],
    story:
      '传说版本很多：有说乞丐偷了鸡没有锅，就用泥巴裹起来丢进火堆；也有说某位皇帝流落民间吃到后大加赞赏，从此出名。这些说法都无法考证，但「泥壳敲开、荷叶飘香」的吃法确实是这道菜的灵魂，饭桌上敲壳那一下就是高潮。',
    storyType: '地方传说', flavors: ['荷香', '酥烂'],
    scenes: ['家庭', '朋友聚会', '待客'],
    flavorProfile: '荷香扑鼻，鸡肉酥烂，咸鲜入骨', cookingMethods: ['腌制', '荷叶包裹', '裹泥烤制'],
    difficulty: '考功夫', allergens: ['大豆'], ingredients: ['整鸡', '荷叶', '黄酒', '香菇'], imageAlt: '叫花鸡 成品图',
    photo: '叫花鸡',
    relatedDishIds: ['dongpo-pork', 'xihu-cuyu', 'hangzhou-jiangya'], videoSearchQuery: '叫花鸡 家常做法',
    tags: ['浙菜', '杭州', '荷叶', '烤制', '宴客菜'], emoji: '🍗',
  },
  {
    id: 'xuecai-datanghuangyu', name: '雪菜大汤黄鱼', aliases: ['雪菜黄鱼汤'], categoryId: 'xianxiang', dishType: '汤羹',
    cuisineId: 'zhe', region: '浙江宁波', spicy: 0, minutes: 60, price: 78,
    summary: '汤要白得能挂勺，雪菜把黄鱼的甜推出来。',
    desc: '汤白鲜浓、鱼肉细嫩，雪菜提鲜。',
    description:
      '大黄鱼两面略煎，加高汤与腌制雪里蕻同煮，汤色由清转乳白，起锅前加一点料酒与猪油。雪菜的咸鲜把黄鱼的甜味推出来，汤要浓、鱼要嫩，是宁波人餐桌上最认的一道鲜。',
    history:
      '雪菜大汤黄鱼与宁波沿海渔业和「雪里蕻腌菜」的搭配传统相关，长期作为宁波名菜存在。大黄鱼资源几经变化，如今多用养殖或替代鱼种，「汤白味鲜」的标准仍然保留。',
    people: [],
    story:
      '宁波人说这道菜的汤要「白得能挂勺」：先把鱼煎透，再冲入高汤大火滚，油与水乳化了汤才白。雪菜要提前洗去多余盐分，否则汤会发齁。老宁波人还习惯加一勺猪油提香，说没有它就不算正宗。',
    storyType: '民间故事', flavors: ['鲜浓', '咸鲜'],
    scenes: ['家庭', '两人', '待客', '下饭'],
    flavorProfile: '汤白鲜浓，鱼肉细嫩，雪菜提鲜', cookingMethods: ['煎鱼', '大火滚汤奶白'],
    difficulty: '家常', allergens: ['鱼类'], ingredients: ['大黄鱼', '雪里蕻', '高汤', '猪油'],
    imageAlt: '雪菜大汤黄鱼 成品图',
    photo: '雪菜大汤黄鱼',
    relatedDishIds: ['naitang-pucai', 'xihu-cuyu', 'yanduxian'], videoSearchQuery: '雪菜大汤黄鱼 家常做法',
    tags: ['浙菜', '宁波', '海鲜', '汤菜', '雪菜'], emoji: '🐟',
  },
  {
    id: 'hangzhou-jiangya', name: '杭州酱鸭', aliases: ['酱鸭'], categoryId: 'nongxiang', dishType: '凉菜',
    cuisineId: 'zhe', region: '浙江杭州', spicy: 0, minutes: 240, price: 42,
    summary: '冬至前后做酱鸭，晒透了才蒸得香。',
    desc: '酱香咸甜、肉质紧实，越嚼越香。',
    description:
      '秋季的鸭子用酱油、黄酒、糖与香料腌透，挂起风干后再蒸熟，切片冷吃。皮色酱红、肉质紧实、咸中带甜，越嚼越香，是杭州人秋冬的下饭与下酒菜。',
    history:
      '酱鸭是杭州秋冬腌制的传统，依靠秋冬干冷天气自然风干，属于「腌腊」类地方食品。它与杭帮菜偏甜咸的调味取向一致，长期在家庭与酱园作坊中传承，具体起源无确切记载。',
    people: [],
    story:
      '老杭州讲究「冬至前后做酱鸭」：早了天不够冷，晚了晒不透。鸭子要挂到表面干爽、按下去有弹性才算好。蒸的时候满屋酱香，切片时先切腿、后切脯，配一碗白粥就是一餐。谁家的酱鸭更香，是街坊常年的比较项目。',
    storyType: '民间故事', flavors: ['酱香', '咸甜'],
    scenes: ['一人食', '家庭', '下酒', '下饭'],
    flavorProfile: '酱香咸甜，肉质紧实，越嚼越香', cookingMethods: ['腌制', '风干', '蒸制切片'],
    difficulty: '进阶', allergens: ['大豆'], ingredients: ['鸭子', '酱油', '黄酒', '糖'],
    imageAlt: '杭州酱鸭 成品图',
    photo: '杭州酱鸭',
    relatedDishIds: ['yanshuiya', 'kaoya', 'daoban-xiang'], videoSearchQuery: '杭州酱鸭 家常做法',
    tags: ['浙菜', '杭州', '腌腊', '凉菜', '秋冬'], emoji: '🦆',
  },
  {
    id: 'ganzha-xiangling', name: '干炸响铃', aliases: ['炸响铃'], categoryId: 'nongxiang', dishType: '素菜',
    cuisineId: 'zhe', region: '浙江杭州', spicy: 0, minutes: 25, price: 22,
    summary: '咬下去要听得见「响」，凉了就不算数。',
    desc: '酥脆干香、豆香清淡，上桌必须立刻吃。',
    description:
      '豆腐皮卷紧后切成小段，下油锅炸到金黄酥脆，形似马铃；蘸花椒盐或甜酱吃。外脆内空、咔嚓有声，是杭州人从小吃到大的一道「响菜」。',
    history:
      '干炸响铃是杭州传统素菜，名字来自炸制时的脆响与马铃的联想。它与杭州豆制品（豆腐皮）加工传统相关，长期出现在本地餐馆菜单上，具体成型年代无确切记载。',
    people: [],
    story:
      '这道菜的名字就是吃法说明：咬下去要听得见「响」。所以上桌必须立刻吃，凉了就疲软。杭州人常说它是「考验油温和上菜速度的菜」，也因此很少打包带走。卷要卷得紧、切得齐，六成油温下锅、浮起就捞；蘸花椒盐是最传统的吃法，也有人喜欢甜面酱。',
    storyType: '民间故事', flavors: ['酥脆', '豆香'],
    scenes: ['两人', '朋友聚会', '下酒'],
    flavorProfile: '酥脆干香，豆香清淡，椒盐提味', cookingMethods: ['卷豆腐皮', '切段', '油炸'],
    difficulty: '家常', allergens: ['大豆'], ingredients: ['豆腐皮', '花椒盐', '甜酱'],
    imageAlt: '干炸响铃 成品图',
    photo: '干炸响铃',
    relatedDishIds: ['wensi-doufu', 'guota-doufu', 'xihu-cuyu'], videoSearchQuery: '干炸响铃 家常做法',
    tags: ['浙菜', '杭州', '豆腐皮', '素菜', '下酒菜'], emoji: '🥢',
  },
  {
    id: 'songshao-yugeng', name: '宋嫂鱼羹', aliases: ['赛蟹羹'], categoryId: 'suanxiang', dishType: '汤羹',
    cuisineId: 'zhe', region: '浙江杭州', spicy: 0, minutes: 50, price: 46,
    summary: '酸香细滑似蟹肉，名字来自西湖边的传说。',
    desc: '酸香开胃、口感细滑，杭州人叫它赛蟹羹。',
    description:
      '鳜鱼或鲈鱼蒸熟拆肉去刺，与火腿丝、香菇丝、笋丝同入清汤，用香醋、姜末和胡椒调味，勾薄芡成羹，再打上蛋液。酸香开胃、口感细滑，因为味道似蟹肉，杭州人也叫它「赛蟹羹」。',
    history:
      '宋嫂鱼羹的名字来自杭州西湖边的民间传说：相传南宋时一位被称为宋五嫂的妇人在湖边卖鱼羹，因味道鲜美而闻名。这个故事在南宋文献与后世笔记中都有流传痕迹，但细节已被反复添加，宜与传说成分一起看。',
    people: ['宋五嫂（民间传说中在杭州卖鱼羹的妇人，常见与这道菜相连的称呼）'],
    story:
      '传说里，皇帝游湖时听见有人叫卖鱼羹，尝后大加赞赏，宋五嫂与她的鱼羹因此出名，还被赐了钱物。故事真假难辨，但它解释了这道羹为什么带着「西湖」的身份。如今吃它的人，更多是被那口酸香吸引。',
    storyType: '地方传说', flavors: ['酸香', '滑润'],
    scenes: ['家庭', '两人', '待客'],
    flavorProfile: '酸香滑润，鱼肉细嫩，似蟹味', cookingMethods: ['蒸鱼拆肉', '煮羹', '勾芡打蛋'],
    difficulty: '进阶', allergens: ['鱼类', '鸡蛋'], ingredients: ['鳜鱼', '火腿丝', '香菇丝', '香醋'],
    imageAlt: '宋嫂鱼羹 成品图',
    photo: '宋嫂鱼羹',
    relatedDishIds: ['xihu-cuyu', 'wensi-doufu', 'xuecai-datanghuangyu'], videoSearchQuery: '宋嫂鱼羹 做法',
    tags: ['浙菜', '杭州', '汤羹', '鱼', '西湖'], emoji: '🥣',
  },
  {
    id: 'pianer-chuan', name: '片儿川', aliases: ['片儿川面'], categoryId: 'xianxiang', dishType: '主食',
    cuisineId: 'zhe', region: '浙江杭州', spicy: 0, minutes: 30, price: 20,
    summary: '雪菜、笋片加肉片，杭州人早晨的一碗面。',
    desc: '汤鲜面滑、雪菜酸香，笋片爽脆。',
    description:
      '雪菜、笋片与瘦肉片下锅稍炒，加高汤烧开，下机制碱水面或潮面，煮到面条透亮即可。汤鲜面滑、雪菜带酸香，是杭州人最常见的早餐面之一，也叫「片儿川」。',
    history:
      '片儿川是杭州的传统面点名称，与本地雪菜、笋的时令搭配相关，长期由面馆经营传承。具体命名由来有不同解释（有说与「川」的写法、说书人的口头叫法有关），缺少确证。',
    people: [],
    story:
      '杭州面馆点片儿川，师傅会问「要宽汤还是紧汤」——汤多汤少全凭习惯。雪菜与笋片是标配，肉片可有可无；讲究的面馆用猪油打底。早上来一碗，是很多杭州人几十年的开始。面下锅前再抖散，煮到断生就捞；雪菜可以先煸一下激出香味，加一勺猪油，汤会立刻厚起来。',
    storyType: '民间故事', flavors: ['清鲜', '酸香'],
    scenes: ['一人食', '早餐', '加班快手'],
    flavorProfile: '汤鲜面滑，雪菜酸香，笋片爽脆', cookingMethods: ['炒配料', '下面煮制'],
    difficulty: '入门', allergens: ['小麦'], ingredients: ['面条', '雪菜', '笋片', '瘦肉片'],
    imageAlt: '片儿川 成品图',
    photo: '片儿川',
    relatedDishIds: ['cong-oil-noodle', 'lanzhou-noodle', 'fuzhou-xianmian'], videoSearchQuery: '片儿川 家常做法',
    tags: ['浙菜', '杭州', '面食', '主食', '早餐'], emoji: '🍜',
  },
]
