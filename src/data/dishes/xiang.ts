import type { DishSeed } from './types'

/**
 * 湘菜新增菜品（图鉴第二阶段）
 * 已有臭豆腐（街头小吃）保存在 legacy.ts，本文件补齐至 10 道。
 */
export const xiangDishes: DishSeed[] = [
  {
    id: 'duojiao-yutou', name: '剁椒鱼头', aliases: ['剁椒蒸鱼头'], categoryId: 'mala', dishType: '荤菜',
    cuisineId: 'xiang', region: '湖南湘潭', spicy: 3, minutes: 45, price: 48,
    summary: '一坛剁椒铺满鱼头，鲜辣直接渗进肉里。',
    desc: '鱼肉嫩滑、剁椒冲鼻，最后一勺热油提香。',
    description:
      '鳙鱼头对半剖开，抹料酒与姜片去腥，铺满自家腌的红剁椒与蒜蓉，上汽后大火蒸十来分钟，出锅淋热油撒葱花。剁椒的咸鲜辣直接渗进鱼头肉里，肉要白嫩、汤汁要能拌饭，是湘菜的门面菜之一。',
    history:
      '剁椒鱼头与湘人腌辣椒（剁椒）的传统直接相关，常见说法把它与湘潭一带的饮食文化联系在一起，近几十年随湘菜馆走向全国。具体首创店家与年代说法不一，宜作为湘菜现代名菜看待。',
    people: [],
    story:
      '湖南人家家有一坛剁椒，辣椒晒干剁碎加盐发酵，越腌越香。蒸鱼头时师傅会提醒：剁椒本身有盐，别再撒盐；鱼头要选大的，肉厚才经得起蒸。最后那勺热油是必须的，香味一激就全出来了。',
    storyType: '民间故事', flavors: ['鲜辣', '咸香'],
    scenes: ['家庭', '朋友聚会', '待客', '下饭'],
    flavorProfile: '鲜辣咸香，鱼肉嫩滑，剁椒冲鼻', cookingMethods: ['铺料', '旺火蒸制', '淋热油'],
    difficulty: '家常', allergens: ['鱼类'], ingredients: ['鳙鱼头', '剁椒', '蒜蓉', '姜'], imageAlt: '剁椒鱼头 成品图',
    photo: '剁椒鱼头',
    relatedDishIds: ['lajiao-chaorou', 'qingzheng-luyu', 'lawei-hezheng'], videoSearchQuery: '剁椒鱼头 家常做法',
    tags: ['湘菜', '湘潭', '蒸菜', '辣椒', '下饭菜'], emoji: '🐟',
  },
  {
    id: 'nongjia-xiaochaorou', name: '农家小炒肉', aliases: ['小炒肉'], categoryId: 'mala', dishType: '荤菜',
    cuisineId: 'xiang', region: '湖南', spicy: 2, minutes: 25, price: 28,
    summary: '五花肉煸出焦边，青椒猛火一炒就是湖南味。',
    desc: '鲜辣油润、椒香突出，饭要多添一碗。',
    description:
      '带皮五花肉切薄片，先下锅煸出油与焦边，再下青椒（或螺丝椒）猛火同炒，只放盐与生抽提味。成菜油亮起锅气，肉香与椒香互相成全，是湖南人下饭的第一名。',
    history:
      '小炒肉来自湖南乡村的日常做法：家里有肉有辣椒，猛火一炒就是一盘。它与湘菜「鲜辣、锅气」的取向完全一致，属于家常菜体系，没有确切起源，靠一代代灶台经验流传。',
    people: [],
    story:
      '湖南人说这道菜要看「锅气」：肉下锅的声音、青椒起虎皮的那一瞬间、出锅前那点油光，都是判断标准。有人家只用盐、有人非要放一点豆豉，争论归争论，饭总是要多添一碗。肉要选肥瘦相间的带皮五花，先煸到卷边再下青椒；辣椒别炒到发黑，虎皮一起就可以出锅。',
    storyType: '民间故事', flavors: ['鲜辣', '油润'],
    scenes: ['一人食', '家庭', '加班快手', '下饭'],
    flavorProfile: '鲜辣油润，椒香突出，肉片带焦边', cookingMethods: ['煸五花', '大火爆炒'],
    difficulty: '入门', allergens: [], ingredients: ['带皮五花肉', '螺丝椒', '蒜', '生抽'], imageAlt: '农家小炒肉 成品图',
    photo: '农家小炒肉',
    relatedDishIds: ['lajiao-chaorou', 'maoshi-hongshaorou', 'xiangxi-waipocai'], videoSearchQuery: '农家小炒肉 家常做法',
    tags: ['湘菜', '湖南', '辣椒', '下饭菜', '家常'], emoji: '🥘',
  },
  {
    id: 'lajiao-chaorou', name: '辣椒炒肉', aliases: ['湖南辣椒炒肉'], categoryId: 'mala', dishType: '荤菜',
    cuisineId: 'xiang', region: '湖南长沙', spicy: 2, minutes: 20, price: 26,
    summary: '菜单上只写四个字的底气，长沙点单率第一名。',
    desc: '青椒起虎皮、肉片滑嫩，干香不塌。',
    description:
      '螺丝椒切段先干煸到起虎皮，盛出；瘦肉片用生抽与淀粉抓匀滑炒，再回入青椒同炒，加少量豆豉与水汽炒匀。肉质嫩、青椒香而不塌，是长沙餐馆点单率最高的家常菜。',
    history:
      '辣椒炒肉与小炒肉同源，都是以辣椒与猪肉为核心的湖南家常炒法，区别在使用瘦肉与辣椒的品种。它随湘菜馆的扩张成为全国知名的「下饭菜」，具体起源说法不一。',
    people: [],
    story:
      '长沙餐馆的菜单上，它常常不带任何形容词，就叫「辣椒炒肉」四个字——这是底气。老吃客会提醒外地朋友：怕辣就点微辣，湖南人的微辣也是辣的。青椒要起虎皮但不烂，是这道菜的底线。',
    storyType: '现代流行说法', flavors: ['鲜辣', '干香'],
    scenes: ['一人食', '家庭', '加班快手', '下饭'],
    flavorProfile: '鲜辣干香，青椒起皮，肉片滑嫩', cookingMethods: ['干煸青椒', '滑炒肉片'],
    difficulty: '入门', allergens: ['大豆'], ingredients: ['螺丝椒', '猪瘦肉', '豆豉', '蒜'], imageAlt: '辣椒炒肉 成品图',
    photo: '辣椒炒肉',
    relatedDishIds: ['nongjia-xiaochaorou', 'duojiao-yutou', 'kouwei-xia'], videoSearchQuery: '辣椒炒肉 家常做法',
    tags: ['湘菜', '长沙', '辣椒', '下饭菜', '家常'], emoji: '🌶️',
  },
  {
    id: 'lawei-hezheng', name: '腊味合蒸', aliases: ['合蒸腊味'], categoryId: 'nongxiang', dishType: '荤菜',
    cuisineId: 'xiang', region: '湖南', spicy: 2, minutes: 90, price: 38,
    summary: '几样腊味一起上笼，越蒸越香的一碗年味。',
    desc: '腊香浓烈、咸鲜回甘，油润不燥。',
    description:
      '腊肉、腊肠与腊鱼分别洗净切片，按厚薄码在大碗里，加豆豉、干辣椒与少量鸡汤，上笼蒸透。腊味的油互相渗透，越蒸越香，咸香浓厚，是湖南人冬天最期待的一碗菜。',
    history:
      '腊味合蒸与湖南腊制传统直接相关：入冬腌肉、熏制、风干，是农家保存肉类的方式。把几样腊味合蒸是常见的处理法，具体成形年代无确切记载，属于地方饮食日常。',
    people: [],
    story:
      '蒸腊味时，厨房的味道会先一步进屋。湖南人会把腊肉切薄、腊鱼切厚，让咸淡互相调和；豆豉和干辣椒是标配。过年时一笼腊味端上桌，配一碗白米饭，就是「年」的味道。腊味本身有盐，蒸的时候不必再调味；碗底垫一层土豆或干豆角，吸走油与咸，往往比肉更受欢迎。',
    storyType: '民间故事', flavors: ['腊香', '咸鲜'],
    scenes: ['家庭', '待客', '下酒', '下饭'],
    flavorProfile: '腊香浓烈，咸鲜回甘，油润不燥', cookingMethods: ['清洗切片', '码碗', '长时蒸制'],
    difficulty: '入门', allergens: ['鱼类'], ingredients: ['腊肉', '腊肠', '腊鱼', '豆豉'], imageAlt: '腊味合蒸 成品图',
    photo: '腊味合蒸',
    relatedDishIds: ['duojiao-yutou', 'dongan-ziji', 'yongzhou-xueya'], videoSearchQuery: '腊味合蒸 家常做法',
    tags: ['湘菜', '湖南', '腊味', '蒸菜', '年节'], emoji: '🥓',
  },
  {
    id: 'dongan-ziji', name: '东安子鸡', aliases: ['东安鸡'], categoryId: 'suanxiang', dishType: '荤菜',
    cuisineId: 'xiang', region: '湖南永州东安', spicy: 2, minutes: 50, price: 36,
    summary: '酸辣鲜香的嫩鸡，酸要香、辣要正。',
    desc: '陈醋与姜一起把鲜味顶出来，与川辣完全两路。',
    description:
      '嫩母鸡煮至断生后切块，用醋、辣椒、姜丝与花椒同炒，再下鸡汤焖到入味。成菜酸辣鲜香、肉质嫩滑，「酸」是东安子鸡的灵魂——陈醋与姜一起把鲜味顶出来，与川菜的辣完全两路。',
    history:
      '东安子鸡常被追溯到湖南永州东安一带，与当地宴客用鸡的做法相关。近现代随湘菜传播而知名，关于它是否与更早的官府菜、酒席有关存在不同说法，宜作为地方传统名菜看待。',
    people: [],
    story:
      '东安人做这道菜讲究「酸要香、辣要正」：醋要选陈醋，姜要切细丝，辣椒用本地的。老辈人说以前逢年过节才吃得上，因为要用嫩母鸡。如今它成了湘菜馆里最能代表「酸辣」的一道。',
    storyType: '文献存疑', flavors: ['酸辣', '姜香'],
    scenes: ['家庭', '两人', '待客', '下饭'],
    flavorProfile: '酸辣鲜香，鸡肉嫩滑，姜味清亮', cookingMethods: ['煮鸡', '切块炒制', '焖入味'],
    difficulty: '进阶', allergens: [], ingredients: ['嫩母鸡', '陈醋', '姜丝', '辣椒'],
    imageAlt: '东安子鸡 成品图',
    photo: '东安子鸡',
    relatedDishIds: ['yongzhou-xueya', 'lajiao-chaorou', 'lawei-hezheng'], videoSearchQuery: '东安子鸡 做法',
    tags: ['湘菜', '永州', '酸辣', '鸡肉', '地方名菜'], emoji: '🍗',
  },
  {
    id: 'yongzhou-xueya', name: '永州血鸭', aliases: ['血鸭'], categoryId: 'mala', dishType: '荤菜',
    cuisineId: 'xiang', region: '湖南永州', spicy: 3, minutes: 60, price: 38,
    summary: '鸭血裹身，暗红油亮，永州人待客的硬菜。',
    desc: '咸鲜辛辣、香气浓烈，关键在最后几秒。',
    description:
      '麻鸭剁成小块先煸干水汽，加姜、蒜与辣椒炒香，最后把鸭血兑料酒倒入锅中快速翻匀，让每块鸭肉都裹上暗红的血衣。成菜色深味浓、辣得过瘾，是永州人待客的硬菜。',
    history:
      '永州血鸭是湖南永州的地方做法，把宰鸭时的血保留入菜，与当地农家的杀鸭待客习俗相关。关于它的起源流传若干版本（包括与战争、迁徙有关的说法），均缺少确证，宜作为地方传统看待。',
    people: [],
    story:
      '这道菜的关键在最后几秒：鸭血下锅要快速翻炒，血凝了就成块、散了就成糊。永州人还讲究鸭要选本地麻鸭，肉紧而不柴。外地客人第一次见暗红色的鸭块会犹豫，尝过之后就明白为什么要留这碗血。',
    storyType: '地方传说', flavors: ['咸鲜', '辛辣'],
    scenes: ['家庭', '朋友聚会', '待客', '下饭'],
    flavorProfile: '咸鲜辛辣，鸭血裹身，香气浓烈', cookingMethods: ['煸鸭块', '炒香配料', '淋鸭血翻匀'],
    difficulty: '进阶', allergens: [], ingredients: ['麻鸭', '鸭血', '姜', '本地辣椒'],
    imageAlt: '永州血鸭 成品图',
    photo: '永州血鸭',
    relatedDishIds: ['dongan-ziji', 'maoshi-hongshaorou', 'lawei-hezheng'], videoSearchQuery: '永州血鸭 做法',
    tags: ['湘菜', '永州', '鸭肉', '辣椒', '地方菜'], emoji: '🦆',
  },
  {
    id: 'maoshi-hongshaorou', name: '毛氏红烧肉', aliases: ['毛家红烧肉'], categoryId: 'nongxiang', dishType: '荤菜',
    cuisineId: 'xiang', region: '湖南韶山', spicy: 1, minutes: 90, price: 32,
    summary: '湖南版红烧肉会放干辣椒，甜更轻、辣更明显。',
    desc: '肉块方正、皮亮、不腻，辣味只是陪衬。',
    description:
      '五花肉切大方块，先焯水再炒糖色，加入干辣椒、八角与少量生抽，用慢火煨到酥软。与江浙版本比，它的甜更轻、辣更明显，颜色红亮、油润不腻，是湖南红烧肉的做法。',
    history:
      '「毛氏红烧肉」这一名称来自近现代湖南饮食记忆与地方餐馆的命名习惯，常与韶山一带的饮食讲述联系在一起；它是否对应某一份确定的历史菜谱，缺少直接材料，宜作为地方流传的说法记录。',
    people: ['毛泽东（近现代政治人物，籍贯湖南韶山；相关说法来自地方饮食记忆与餐馆叙述，未见确切的菜品文献）'],
    story:
      '湖南版本的红烧肉会放干辣椒，这是它与江浙做法最大的不同。韶山的餐馆大多会讲一段来历作为介绍；对食客来说，更实际的判断标准是——肉块要方正、皮要亮、咬下去不腻，辣味只是陪衬。',
    storyType: '现代流行说法', flavors: ['咸鲜微辣', '肉香'],
    scenes: ['家庭', '待客', '下饭'],
    flavorProfile: '咸鲜微辣，肉香浓厚，油亮不腻', cookingMethods: ['焯水', '炒糖色', '慢火煨制'],
    difficulty: '家常', allergens: ['大豆'], ingredients: ['五花肉', '干辣椒', '八角', '生抽'],
    imageAlt: '毛氏红烧肉 成品图',
    photo: '毛氏红烧肉',
    relatedDishIds: ['hongshaorou', 'nongjia-xiaochaorou', 'yongzhou-xueya'], videoSearchQuery: '毛氏红烧肉 家常做法',
    tags: ['湘菜', '韶山', '红烧肉', '五花肉', '地方菜'], emoji: '🍖',
  },
  {
    id: 'kouwei-xia', name: '口味虾', aliases: ['长沙口味虾', '麻辣小龙虾'], categoryId: 'mala', dishType: '荤菜',
    cuisineId: 'xiang', region: '湖南长沙', spicy: 3, minutes: 60, price: 68,
    summary: '一锅红亮麻辣，撑起长沙的整个夏夜。',
    desc: '虾肉弹嫩、越吃越上头，汤汁拌粉条收尾。',
    description:
      '小龙虾刷洗干净去虾线，用姜蒜、干辣椒与豆瓣炒出红油，加啤酒与香料焖煮收汁。成菜麻辣鲜香、虾肉弹嫩，配一杯冰饮就是长沙的夏夜。洗净与焖透是两条底线。',
    history:
      '口味虾与长沙夜宵文化的兴起同步，近几十年成为城市名片之一。它不是传统古菜，而是随夜市经济与小龙虾养殖业发展形成的现代流行吃法，具体起源说法不一。',
    people: [],
    story:
      '长沙人吃虾的场面很壮观：一桌人戴上手套，剥壳声连绵不绝，汤汁拌粉条收尾。谁剥得慢就没得吃，是这桌的默认规则。夜宵摊从傍晚热闹到凌晨，靠的就是这一锅红亮麻辣。洗虾要用小刷子一只只刷，虾线要挑干净；焖够时间再收汁，虾肉才弹而不散。',
    storyType: '现代流行说法', flavors: ['麻辣', '鲜香'],
    scenes: ['两人', '朋友聚会', '深夜', '下酒'],
    flavorProfile: '麻辣鲜香，虾肉弹嫩，越吃越上头', cookingMethods: ['刷洗去线', '炒香料', '焖煮收汁'],
    difficulty: '家常', allergens: ['虾', '大豆'], ingredients: ['小龙虾', '豆瓣酱', '啤酒', '香料'],
    imageAlt: '口味虾 成品图',
    photo: '口味虾',
    relatedDishIds: ['choudoufu', 'lajiao-chaorou', 'huoguo'], videoSearchQuery: '口味虾 家常做法',
    tags: ['湘菜', '长沙', '夜宵', '小龙虾', '麻辣'], emoji: '🦞',
  },
  {
    id: 'xiangxi-waipocai', name: '湘西外婆菜', aliases: ['外婆菜'], categoryId: 'suanxiang', dishType: '素菜',
    cuisineId: 'xiang', region: '湖南湘西', spicy: 2, minutes: 30, price: 20,
    summary: '一坛腌菜炒一把，酸香开胃，外婆做的就是标准。',
    desc: '酸香咸鲜、微辣有嚼头，下饭神器。',
    description:
      '湘西腌制的干菜（梅干菜、萝卜干或芥菜）切碎，与肉末、干辣椒、豆豉一同下锅炒香，酸香开胃、咸鲜微辣，是下饭神器。家庭做法可少放肉末，靠腌菜本身的酸香立味。',
    history:
      '外婆菜并非单一菜名，而是一类湘西家常腌菜炒制的统称，反映山区人家「腌菜过冬」的生活方式。具体配方各家不一样，属于地方饮食日常，没有确切起源。',
    people: [],
    story:
      '「外婆菜」这个名字带着情绪：山里人家把腌好的干菜留下来给孩子，回家就有一碗酸香下饭菜。各家坛子不同，味道就不同，因此这道菜没有标准版本——外婆做的，就是标准。腌菜要先泡去多余的盐，再下锅炒干水汽；吃辣的多放两个干辣椒，喜欢酸口的留一点坛水。',
    storyType: '民间故事', flavors: ['酸香', '咸鲜'],
    scenes: ['一人食', '家庭', '加班快手', '下饭'],
    flavorProfile: '酸香咸鲜，微辣开胃，口感有嚼头', cookingMethods: ['泡发切碎', '炒香'],
    difficulty: '入门', allergens: ['大豆'], ingredients: ['梅干菜', '肉末', '豆豉', '干辣椒'],
    imageAlt: '湘西外婆菜 成品图',
    photo: '湘西外婆菜',
    relatedDishIds: ['nongjia-xiaochaorou', 'choudoufu', 'lawei-hezheng'], videoSearchQuery: '外婆菜 家常做法',
    tags: ['湘菜', '湘西', '腌菜', '下饭菜', '家常'], emoji: '🥬',
  },
]
