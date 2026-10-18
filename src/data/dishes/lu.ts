import type { DishSeed } from './types'

/**
 * 鲁菜菜品（图鉴第二阶段）
 * 第一阶段鲁菜没有入库菜品，本文件一次性补齐 10 道，使鲁菜满足「八大菜系各 ≥10 道」。
 */
export const luDishes: DishSeed[] = [
  {
    id: 'congshao-haishen', name: '葱烧海参', aliases: ['葱烧参'], categoryId: 'nongxiang', dishType: '荤菜',
    cuisineId: 'lu', region: '山东烟台、威海（济南做法）', spicy: 0, minutes: 120, price: 128,
    summary: '发参四天、炸葱两次，鲁菜火功的压场菜。',
    desc: '海参软糯带弹，葱香浓而不冲。',
    description:
      '发好的海参先焯水去腥，再用高汤煨入味；大葱切段用油慢慢炸出葱香，与海参同烧并勾浓芡。成菜海参软糯带弹、葱香浓而不冲，酱汁挂在参身不流淌，是鲁菜「葱烧」技法的代表。',
    history:
      '葱烧海参是鲁菜的招牌，与山东沿海的海参产地（烟台、威海一带）和济南的官宴传统都有关系。它把「葱油」这一北方调味基本功与贵重海味结合，被视为鲁菜火功与勾芡功底的代表，具体成名年代说法不一。',
    people: [],
    story:
      '鲁菜师傅说这道菜难在「发参」：干海参要反复泡、煮、焖，急不得；发不好，烧得再好也白搭。葱也要分两次用——炸香的葱段垫底，新葱段最后提味。宴席上它是压场子的菜，端上来就说明主家下了本钱。',
    storyType: '民间故事', flavors: ['咸鲜', '葱香'],
    scenes: ['家庭', '待客', '下饭'],
    flavorProfile: '咸鲜醇厚，葱香浓，海参软糯', cookingMethods: ['发制', '煨制', '葱烧勾芡'],
    difficulty: '考功夫', allergens: ['大豆'], ingredients: ['海参', '大葱', '高汤', '生抽'], imageAlt: '葱烧海参 成品图',
    photo: '葱烧海参',
    relatedDishIds: ['youmen-daxia', 'jiuzhuan-dachang', 'fotiaoqiang'], videoSearchQuery: '葱烧海参 家常做法',
    tags: ['鲁菜', '山东', '海参', '葱烧', '宴客菜'], emoji: '🥘',
  },
  {
    id: 'tangcu-liyu', name: '糖醋鲤鱼', aliases: ['糖醋鱼'], categoryId: 'suanxiang', dishType: '荤菜',
    cuisineId: 'lu', region: '山东济南', spicy: 0, minutes: 60, price: 58,
    summary: '头尾翘起的「跃龙门」，上桌那声吱啦是给全桌听的。',
    desc: '外酥里嫩、酸甜挂汁，鱼形完整。',
    description:
      '黄河鲤鱼两面剞花刀，挂糊炸到外酥里嫩、头尾翘起呈「跃龙门」之形，再浇上熬好的糖醋汁。汁要酸甜平衡挂得住，炸好的鱼不能回软。家庭做可以用平底锅分两段炸，造型简化但味道不变。',
    history:
      '糖醋鲤鱼与济南的黄河鲤鱼文化相关，常见说法把它与「鲤鱼跃龙门」的吉祥寓意联系起来，常出现在宴席与节庆上。具体成形年代与首创店家说法不一，属于鲁菜宴席大菜体系。',
    people: [],
    story:
      '老济南的宴席讲究「上鱼有礼」：鱼头朝客，主家举杯，客人先动筷。鲤鱼要选活的，炸完趁热浇汁，桌上那声「吱啦」是给全桌人听的。谁把鱼翻身不当心，还会被长辈念一句「吃鱼不翻身」。',
    storyType: '地方传说', flavors: ['酸甜', '酥脆'],
    scenes: ['家庭', '待客', '朋友聚会'],
    flavorProfile: '外酥里嫩，酸甜挂汁，造型完整', cookingMethods: ['剞花刀', '挂糊油炸', '熬糖醋汁'],
    difficulty: '考功夫', allergens: ['鱼类', '小麦'], ingredients: ['黄河鲤鱼', '糖', '醋', '面粉'], imageAlt: '糖醋鲤鱼 成品图',
    photo: '糖醋鲤鱼',
    relatedDishIds: ['songshu-guiyu', 'xihu-cuyu', 'youmen-daxia'], videoSearchQuery: '糖醋鲤鱼 传统做法',
    tags: ['鲁菜', '济南', '鲤鱼', '糖醋', '宴客菜'], emoji: '🐟',
  },
  {
    id: 'jiuzhuan-dachang', name: '九转大肠', aliases: ['九转肥肠'], categoryId: 'nongxiang', dishType: '荤菜',
    cuisineId: 'lu', region: '山东济南', spicy: 1, minutes: 150, price: 48,
    summary: '五味俱全的一盘肥肠，是鲁菜里最难的一课。',
    desc: '酸甜咸辣香齐备，软韧红亮不带异味。',
    description:
      '猪大肠先以盐醋反复揉洗干净，煮到八成熟切段，再经炸、烧、㸆几道工序，调入糖、醋、酱油、胡椒粉与香料，收汁裹匀。成菜酸甜咸辣香五味齐备，肠段红亮软韧、不带异味，是鲁菜里最难的一课。',
    history:
      '九转大肠常见说法是清代济南的酒楼所创，店方为抬高这道做法的讲究，借道家「九转仙丹」取名。这个来龙去脉在山东流传很广，但具体店家与年代有不同说法，宜作为民间解释看待。',
    people: [],
    story:
      '名字里的「九转」解释不一：一说取自九转仙丹，形容工序繁复；一说来自烧制时要多次转锅、反复收汁。济南厨师更相信第二种——大肠要洗到发白、烧到入味，中间得不停翻，急火一次就糊。',
    storyType: '文献存疑', flavors: ['酸甜', '咸鲜微辣'],
    scenes: ['家庭', '待客', '下酒'],
    flavorProfile: '酸甜咸辣香五味俱全，软韧红亮，不腻不臭', cookingMethods: ['清洗去腥', '煮制', '炸烧㸆收汁'],
    difficulty: '考功夫', allergens: ['大豆'], ingredients: ['猪大肠', '糖', '醋', '胡椒粉'], imageAlt: '九转大肠 成品图',
    photo: '九转大肠',
    relatedDishIds: ['chouguiyu', 'bazi-rou', 'boshan-suguo'], videoSearchQuery: '九转大肠 做法',
    tags: ['鲁菜', '济南', '肥肠', '复合味', '功夫菜'], emoji: '🍢',
  },
  {
    id: 'youmen-daxia', name: '油焖大虾', aliases: ['油焖虾'], categoryId: 'nongxiang', dishType: '荤菜',
    cuisineId: 'lu', region: '山东（胶东沿海）', spicy: 0, minutes: 40, price: 58,
    summary: '不加水，虾自己焖出红亮的虾油。',
    desc: '甜咸适口，红亮浓鲜，配白饭最稳。',
    description:
      '大虾剪须开背去虾线，热油把虾头虾壳煎出红亮的虾油，再加葱姜、糖与少量生抽焖到汤汁浓稠挂身。不加水或只加一点，虾脑的香全留在锅里。甜咸口，最适合配白米饭。',
    history:
      '油焖大虾是胶东沿海对虾产区的做法，与山东「咸鲜为主、重用葱姜」的调味传统一致。它属于家常与宴席通用的海鲜菜，具体成因与起源无确切记载。',
    people: [],
    story:
      '做油焖大虾的窍门是别急着放水：先煎出虾油，红亮颜色是虾自己的，不靠番茄酱。老山东人家会连壳带虾脑一起焖，吃完连手指都香。孩子们最爱的是最后那点汤汁拌饭。虾要挑壳亮、头身紧的，焖的时候盖好锅盖，让虾脑的香回到虾肉里；最后大火一收，汁能挂在壳上。',
    storyType: '民间故事', flavors: ['甜咸', '虾油香'],
    scenes: ['家庭', '两人', '待客', '下饭'],
    flavorProfile: '甜咸适口，虾油红亮，鲜甜厚实', cookingMethods: ['剪虾开背', '煎出虾油', '焖制收汁'],
    difficulty: '家常', allergens: ['虾'], ingredients: ['对虾', '葱姜', '糖', '生抽'], imageAlt: '油焖大虾 成品图',
    photo: '油焖大虾',
    relatedDishIds: ['jitang-cuhaibang', 'congshao-haishen', 'tangcu-liyu'], videoSearchQuery: '油焖大虾 家常做法',
    tags: ['鲁菜', '山东', '海鲜', '虾', '家常'], emoji: '🦐',
  },
  {
    id: 'dezhou-paji', name: '德州扒鸡', aliases: ['德州五香脱骨扒鸡', '扒鸡'], categoryId: 'nongxiang',
    dishType: '荤菜', cuisineId: 'lu', region: '山东德州', spicy: 0, minutes: 180, price: 36,
    summary: '提腿一抖就脱骨，站台上叫卖的旅行记忆。',
    desc: '五香浓郁、骨酥肉烂，凉热皆宜。',
    description:
      '整鸡盘好造型，入老汤卤锅配十几味香料，先大火后小火㸆到骨酥肉烂，出锅提着鸡腿一抖就能脱骨。皮色金黄、肉香透骨，凉吃热吃皆可，是鲁菜「扒」技法的代表。',
    history:
      '德州扒鸡是山东德州的传统名吃，与当地铁路交通兴起后成为「旅行伴手礼」的经历有关。它由地方卤鸡技艺长期积累形成，具体创制店家与年代有多种说法，常被追溯到清代或更早的卤锅手艺。',
    people: [],
    story:
      '德州扒鸡出名，一半功劳在铁路：早年坐火车经过德州，站台上叫卖扒鸡的场面是许多人的旅行记忆。它讲究「热吃软烂、凉吃紧实」，老德州人买鸡会先看造型是否完整，再看骨头是不是一抖就掉。',
    storyType: '现代流行说法', flavors: ['五香', '咸鲜'],
    scenes: ['一人食', '家庭', '下酒'],
    flavorProfile: '五香浓郁，骨酥肉烂，咸鲜回甘', cookingMethods: ['盘鸡造型', '老汤卤制', '小火扒㸆'],
    difficulty: '进阶', allergens: ['大豆'], ingredients: ['整鸡', '老汤', '香料', '葱姜'],
    imageAlt: '德州扒鸡 成品图',
    photo: '德州扒鸡',
    relatedDishIds: ['kaoya', 'guangshi-shaoe', 'bazi-rou'], videoSearchQuery: '德州扒鸡 做法',
    tags: ['鲁菜', '德州', '扒鸡', '卤味', '五香'], emoji: '🍗',
  },
  {
    id: 'naitang-pucai', name: '奶汤蒲菜', aliases: ['蒲菜烩'], categoryId: 'qingshuang', dishType: '汤羹',
    cuisineId: 'lu', region: '山东济南', spicy: 0, minutes: 60, price: 32,
    summary: '大明湖的蒲菜配上乳白高汤，宴席上总得有一口清。',
    desc: '汤浓味清，蒲菜脆嫩，鲜而不腻。',
    description:
      '蒲菜取嫩茎焯水去涩，用猪骨、鸡架与鲫鱼熬出的奶汤同煮，汤色乳白、味清不腻。蒲菜脆嫩带清香，是济南大明湖一带的时令风物，配几片火腿提鲜，讲究汤浓味淡、菜不能老。',
    history:
      '奶汤蒲菜与济南「大明湖蒲菜」的物产文化直接相关，奶汤则是鲁菜吊汤技法之一（清汤与奶汤各有分工）。它属于地方时令菜，具体起源无确切记载，多年来是济南宴席上的清淡担当。',
    people: [],
    story:
      '济南人把蒲菜叫「水中人参」，只有春末夏初那段嫩茎可吃，过了季节就嚼不动。老厨师吊奶汤会放鲫鱼或猪骨，把汤熬到乳白，却要滤得干净。这道菜的意义在于：再丰盛的宴席，也得留一口清的位置。',
    storyType: '民间故事', flavors: ['清鲜', '汤'],
    scenes: ['家庭', '待客', '两人'],
    flavorProfile: '汤浓味清，蒲菜脆嫩，鲜而不腻', cookingMethods: ['吊奶汤', '焯水', '煮制'],
    difficulty: '进阶', allergens: [], ingredients: ['蒲菜', '猪骨', '鸡架', '火腿片'],
    imageAlt: '奶汤蒲菜 成品图',
    photo: '奶汤蒲菜',
    relatedDishIds: ['yanduxian', 'xuecai-datanghuangyu', 'wensi-doufu'], videoSearchQuery: '奶汤蒲菜 做法',
    tags: ['鲁菜', '济南', '汤菜', '时令', '清淡'], emoji: '🥣',
  },
  {
    id: 'sixi-wanzi', name: '四喜丸子', aliases: ['四喜圆子'], categoryId: 'nongxiang', dishType: '荤菜',
    cuisineId: 'lu', region: '山东', spicy: 0, minutes: 90, price: 36,
    summary: '四个大丸子，取「福禄寿喜」的好意头。',
    desc: '外润内嫩、咸鲜带甜，喜宴上必有的位置。',
    description:
      '猪肉馅加葱姜水、鸡蛋与馒头碎搅上劲，团成四个大丸子先炸定型，再入汤加酱油、糖与香料烧透。成菜外润内嫩、咸鲜带甜，四个丸子取「福禄寿喜」的好意头，是北方喜庆宴席的常客。',
    history:
      '四喜丸子是北方宴席菜，菜名取「四喜」的吉祥寓意，常与喜宴、节庆联系在一起。它与狮子头同属大肉丸体系但风格不同：一个清炖，一个红烧，具体起源说法不一，属于近百年宴会菜的常见配置。',
    people: [],
    story:
      '婚宴上四喜丸子几乎必上，讲究一桌四个、一人一个，谁多夹了会被笑。老厨师说丸子的松紧要靠「打」——肉馅要顺一个方向搅到发黏，炸时油温不能高，否则外焦里生。上桌时浇一勺烧汁，用青菜心垫底更清爽；也有人把丸子压成略扁的圆，受热更均匀。',
    storyType: '民间故事', flavors: ['咸鲜微甜', '酱香'],
    scenes: ['家庭', '待客', '朋友聚会'],
    flavorProfile: '咸鲜微甜，外润内嫩，酱香浓郁', cookingMethods: ['搅打上劲', '炸定型', '红烧'],
    difficulty: '家常', allergens: ['鸡蛋', '小麦', '大豆'], ingredients: ['猪肉馅', '马蹄', '鸡蛋', '馒头碎'],
    imageAlt: '四喜丸子 成品图',
    photo: '四喜丸子',
    relatedDishIds: ['qingdun-shizitou', 'huizhou-yuanzi', 'bazi-rou'], videoSearchQuery: '四喜丸子 家常做法',
    tags: ['鲁菜', '山东', '宴席', '肉丸', '喜宴菜'], emoji: '🍡',
  },
  {
    id: 'guota-doufu', name: '锅塌豆腐', aliases: ['锅塌豆腐盒'], categoryId: 'xianxiang', dishType: '素菜',
    cuisineId: 'lu', region: '山东', spicy: 0, minutes: 35, price: 18,
    summary: '先煎后煨，蛋皮把汤汁全包在豆腐上。',
    desc: '外香内嫩，咸鲜软滑，家常菜里的基本功。',
    description:
      '北豆腐切厚片拍面粉、裹蛋液，用中小火两面煎到金黄定型，再加高汤、酱油与葱姜小火「塌」到入味收汁。豆腐外香内嫩，蛋皮把汁都包住，是鲁菜里最见基本功的家常菜。',
    history:
      '「锅塌」是鲁菜的技法之一：先煎后煨，让食材在汤汁里吸味。锅塌豆腐属于家常技法菜，长期在山东与北方家庭流行，缺少明确的最早记载，靠的是厨房里的口耳相传。',
    people: [],
    story:
      '这道菜的翻车点很集中：蛋液裹不好就散，火大了就糊，火小了豆腐出水。老厨师的判断标准是「塌到汁不见、豆腐还成形」。家常菜的意义也在此——听着简单，做起来不一定。想让蛋皮不破，锅要热、油要薄，下锅后先别动，等它自己定型再翻；塌完的汤汁拿来拌饭正好。',
    storyType: '民间故事', flavors: ['咸鲜', '蛋香'],
    scenes: ['一人食', '家庭', '下饭'],
    flavorProfile: '咸鲜软嫩，蛋香包汁，外层微焦', cookingMethods: ['拍粉裹蛋', '煎制', '小火塌煨'],
    difficulty: '家常', allergens: ['鸡蛋', '小麦', '大豆'], ingredients: ['北豆腐', '鸡蛋', '面粉', '高汤'],
    imageAlt: '锅塌豆腐 成品图',
    photo: '锅塌豆腐',
    relatedDishIds: ['wensi-doufu', 'dazhu-gansi', 'jitang-cuhaibang'], videoSearchQuery: '锅塌豆腐 家常做法',
    tags: ['鲁菜', '山东', '豆腐', '家常', '技法菜'], emoji: '🍳',
  },
  {
    id: 'boshan-suguo', name: '博山酥锅', aliases: ['酥锅'], categoryId: 'nongxiang', dishType: '荤菜',
    cuisineId: 'lu', region: '山东淄博博山', spicy: 0, minutes: 150, price: 42,
    summary: '一层层码进锅里焖一夜，酸甜咸香自己融合。',
    desc: '骨酥肉烂，凉吃更香，冬天的一锅硬菜。',
    description:
      '白菜垫底，一层层码入五花肉、排骨、鱼、藕、海带与豆腐，加醋、糖、酱油与香料，小火焖到骨酥肉烂、酸甜咸香交融。锅要密封、火要极小，一夜焖透才够味，冬天做一锅能吃好几天。',
    history:
      '博山酥锅是淄博博山一带的年节菜，与当地陶瓷琉璃业与家庭年货习俗相关。它靠家庭主妇的经验长期流传，各家的配比差别很大，属于地方饮食传统，没有单一发明者。',
    people: [],
    story:
      '博山人过年做酥锅是全家的事：谁家放的醋多、谁家的鱼更香，是饭桌上的保留话题。以前用煤炉小火焖一夜，第二天揭锅，整条街都闻得到。酥锅凉了更好吃，切成块当凉菜也行。',
    storyType: '地方传说', flavors: ['酸甜', '咸香'],
    scenes: ['家庭', '朋友聚会', '待客', '下酒'],
    flavorProfile: '酸甜咸香交融，骨酥肉烂，凉吃更香', cookingMethods: ['分层码锅', '重物压实', '长时间焖制'],
    difficulty: '进阶', allergens: ['鱼类', '大豆'], ingredients: ['白菜', '五花肉', '带鱼', '藕', '海带'],
    imageAlt: '博山酥锅 成品图',
    photo: '博山酥锅',
    relatedDishIds: ['jiuzhuan-dachang', 'bazi-rou', 'daoban-xiang'], videoSearchQuery: '博山酥锅 做法',
    tags: ['鲁菜', '淄博', '年节', '卤味', '地方菜'], emoji: '🍲',
  },
  {
    id: 'bazi-rou', name: '把子肉', aliases: ['把子肉米饭'], categoryId: 'nongxiang', dishType: '荤菜',
    cuisineId: 'lu', region: '山东济南', spicy: 0, minutes: 120, price: 26,
    summary: '捆成把的五花肉浇在米饭上，济南最实在的一餐。',
    desc: '酱香浓厚、软糯带颤，配卤蛋最下饭。',
    description:
      '带皮五花肉切成条状，用蒲草或棉线捆成「把」，入酱汤加香料慢炖到颤而不散。吃时浇在米饭上，配一颗卤蛋与虎皮豆腐。肉香厚、汁浓稠，是济南街头最实在的一餐。',
    history:
      '把子肉是济南的市井吃食，名字与「捆成把」的造型有关，也有说法把它与旧时结拜、祭祀分肉的风俗相连。它在济南街头小吃与食堂里长期存在，具体来源说法不一，属于地方市井饮食传统。',
    people: [],
    story:
      '济南人中午一句「来斤把子肉」就等于定了饭。肉要捆好才不成形散掉，酱汤越老越香，老店的一锅汤往往从开张沿用至今。吃法也讲究：米饭上浇一勺汁，配豆腐和卤蛋，才算完整的一餐。',
    storyType: '民间故事', flavors: ['酱香', '咸鲜'],
    scenes: ['一人食', '加班快手', '下饭'],
    flavorProfile: '酱香浓厚，软糯带颤，咸鲜下饭', cookingMethods: ['捆扎', '酱汤慢炖'],
    difficulty: '家常', allergens: ['大豆'], ingredients: ['带皮五花肉', '蒲草', '酱油', '香料'],
    imageAlt: '把子肉 成品图',
    photo: '把子肉',
    relatedDishIds: ['dezhou-paji', 'sixi-wanzi', 'hongshaorou'], videoSearchQuery: '把子肉 家常做法',
    tags: ['鲁菜', '济南', '五花肉', '街头小吃', '下饭菜'], emoji: '🍖',
  },
]
