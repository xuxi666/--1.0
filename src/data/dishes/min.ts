import type { DishSeed } from './types'

/**
 * 闽菜菜品（图鉴第二阶段）
 * 第一阶段闽菜没有入库菜品，本文件一次性补齐 10 道（含汤菜、糟香菜、小吃与甜品），
 * 使闽菜满足「八大菜系各 ≥10 道」。
 */
export const minDishes: DishSeed[] = [
  {
    id: 'fotiaoqiang', name: '佛跳墙', aliases: ['满坛香', '坛烧八宝'], categoryId: 'nongxiang', dishType: '汤羹',
    cuisineId: 'min', region: '福建福州', spicy: 0, minutes: 300, price: 188,
    summary: '一坛之内各味不夺，闽菜坛煨的最高规格。',
    desc: '汤金味浓、荤香醇厚，十几样食材轮流上场。',
    description:
      '高汤为底，鲍鱼、海参、花胶、干贝、鸽蛋、猪蹄筋、花菇等分门别类预熟，再一同入坛，用小火长时间煨到味道合一。汤色金亮、荤香不冲，讲究的是「一坛之内，各味不夺」。',
    history:
      '佛跳墙是福州宴席菜的代表，与清代福州官厨与商贾宴客的奢华口味相关。常见说法把它与「坛煨」技法和某位厨师或官员联系起来，版本不止一个，具体人事细节缺少确证；可确定的是它代表了闽菜吊汤与坛煨的最高规格。',
    people: ['（相传与清代福州官宴厨师郑春发有关，属常见说法，未见确证）'],
    story:
      '名字的传说最有名：坛盖一开，香气四溢，连隔壁的和尚都忍不住翻墙而来，于是得名「佛跳墙」。这当然是故事，但确实说明了它的香。现实里的工序并不浪漫——十几样食材要分别处理，再一起煨上大半天。',
    storyType: '地方传说', flavors: ['荤鲜', '醇厚'],
    scenes: ['家庭', '待客', '朋友聚会'],
    flavorProfile: '荤香醇厚，汤金味浓，诸味融合不夺', cookingMethods: ['分别预熟', '坛煨', '小火长炖'],
    difficulty: '考功夫', allergens: ['鱼类', '虾', '大豆'], ingredients: ['鲍鱼', '海参', '花胶', '干贝', '鸽蛋'], imageAlt: '佛跳墙 成品图',
    photo: '佛跳墙',
    relatedDishIds: ['congshao-haishen', 'jitang-cuhaibang', 'li-hongzhang-zahui'], videoSearchQuery: '佛跳墙 制作教程',
    tags: ['闽菜', '福州', '坛煨', '宴客菜', '汤'], emoji: '🍲',
  },
  {
    id: 'lizhirou', name: '荔枝肉', aliases: ['荔枝肉块'], categoryId: 'suanxiang', dishType: '荤菜',
    cuisineId: 'min', region: '福建福州', spicy: 0, minutes: 50, price: 34,
    summary: '花刀一炸卷成「荔枝壳」，名字是形与味的双重相似。',
    desc: '外脆里嫩、酸甜可口，形似荔枝。',
    description:
      '猪里脊剞十字花刀再切块，下油锅一炸，肉块卷成荔枝壳般的网状；另用番茄酱或红糟调出酸甜汁，与荸荠（时令时用荔枝）同炒。外脆里嫩、酸甜可口，名字来自形与味的双重相似。',
    history:
      '荔枝肉是福州传统名菜，常见说法认为它得名于成菜形似荔枝、口味像荔枝一样酸甜。它与福州本地酸甜口与红糟调味的传统相关，具体成型年代说法不一，宜作为地方名菜看待。',
    people: [],
    story:
      '老福州人说这道菜考验刀工：花刀深浅一致，炸完才会卷成一颗颗「荔枝」。真正的季节版会放荔枝肉，日常版本多用荸荠代替。外地人常以为里面有荔枝，其实荔枝只是名字的灵感。',
    storyType: '民间故事', flavors: ['酸甜', '酥脆'],
    scenes: ['家庭', '两人', '待客'],
    flavorProfile: '酸甜适口，外脆里嫩，形似荔枝', cookingMethods: ['剞花刀', '挂糊油炸', '酸甜汁裹匀'],
    difficulty: '进阶', allergens: ['大豆'], ingredients: ['猪里脊', '荸荠', '番茄酱', '糖醋'], imageAlt: '荔枝肉 成品图',
    photo: '荔枝肉',
    relatedDishIds: ['zuipaigu', 'songshu-guiyu', 'hongzaoyu'], videoSearchQuery: '荔枝肉 家常做法',
    tags: ['闽菜', '福州', '酸甜', '花刀', '地方名菜'], emoji: '🍖',
  },
  {
    id: 'zuipaigu', name: '醉排骨', aliases: ['糟醉排骨'], categoryId: 'suanxiang', dishType: '荤菜',
    cuisineId: 'min', region: '福建福州', spicy: 0, minutes: 60, price: 36,
    summary: '炸酥的排骨裹上红糟酸甜汁，冷热两种吃法都香。',
    desc: '糟香酸甜、外酥里嫩，冷了更酥。',
    description:
      '排骨腌过裹粉炸到金黄酥脆，另起锅用红糟、糖、醋与蒜末调成酸甜浓汁，趁热把排骨裹匀。成菜外酥里嫩、糟香带微酸，冷了也好吃，是福州人下酒与宴客的常客。',
    history:
      '福建多红糟（酿酒后的酒糟），把红糟用于烹调是闽菜特色之一。「醉」在福州菜的语境里常指用酒香调味，醉排骨即以此得名，长期流传于福州家宴，具体起源无确切记载。',
    people: [],
    story:
      '福州人用糟很讲究：新糟香气冲、老糟味更醇，做排骨多用老糟配糖醋。炸好的排骨要趁热裹汁，凉了就吸不进味；有人专门留一半放凉再吃，说那样更酥。这道菜的乐趣就在这冷热两种吃法。',
    storyType: '民间故事', flavors: ['糟香', '酸甜'],
    scenes: ['两人', '朋友聚会', '下酒'],
    flavorProfile: '糟香酸甜，外酥里嫩，冷食亦香', cookingMethods: ['腌制', '油炸', '调糟汁裹匀'],
    difficulty: '家常', allergens: ['小麦', '大豆'], ingredients: ['肋排', '红糟', '糖', '醋'], imageAlt: '醉排骨 成品图',
    photo: '醉排骨',
    relatedDishIds: ['lizhirou', 'hongzaoyu', 'danzao-xiangluopian'], videoSearchQuery: '醉排骨 家常做法',
    tags: ['闽菜', '福州', '红糟', '排骨', '下酒菜'], emoji: '🍖',
  },
  {
    id: 'hongzaoyu', name: '红糟鱼', aliases: ['红糟鱼块'], categoryId: 'nongxiang', dishType: '荤菜',
    cuisineId: 'min', region: '福建福州', spicy: 0, minutes: 40, price: 42,
    summary: '糟香藏在甜后面，福州最有辨识度的味道之一。',
    desc: '色泽红润、鱼鲜回甜，糟香浓郁。',
    description:
      '鱼块略煎定型，红糟先用油炒香，再加高汤、姜与糖，把鱼块放入小火焖到入味，起锅前收汁。成菜色泽红润、酒香与鱼鲜互相成全，是福州人餐桌上最有辨识度的味道之一。',
    history:
      '红糟入菜是闽菜独有的调味路径，源自福建传统的酿酒副产物利用。红糟鱼是福州家常与宴席共用的做法，具体成形年代无确切记载，属于地方风味的长期沉淀。',
    people: [],
    story:
      '福州人说糟香是「藏在甜后面」的味道：红糟带酒气与微酸，炒过之后才香，不炒会有生糟味。做鱼时一般选肉质紧实的鱼，久焖不散。这一手糟香，外地人第一次吃多半会愣一下，然后开始找做法。',
    storyType: '民间故事', flavors: ['糟香', '咸甜'],
    scenes: ['家庭', '两人', '下饭'],
    flavorProfile: '糟香浓郁，鱼鲜回甜，色泽红润', cookingMethods: ['炒红糟', '煎鱼', '小火焖制'],
    difficulty: '家常', allergens: ['鱼类'], ingredients: ['鱼块', '红糟', '姜', '糖'], imageAlt: '红糟鱼 成品图',
    photo: '红糟鱼',
    relatedDishIds: ['zuipaigu', 'chouguiyu', 'lizhirou'], videoSearchQuery: '红糟鱼 家常做法',
    tags: ['闽菜', '福州', '红糟', '鱼', '家常'], emoji: '🐟',
  },
  {
    id: 'fujian-yuwan', name: '福建鱼丸', aliases: ['福州鱼丸', '鱼包肉'], categoryId: 'xianxiang', dishType: '汤羹',
    cuisineId: 'min', region: '福建福州', spicy: 0, minutes: 60, price: 28,
    summary: '鱼蓉包肉馅，咬开一口是汤。',
    desc: '外皮弹滑、内馅带汁，汤清味足。',
    description:
      '鳗鱼或马鲛鱼去刺取肉打成鱼蓉，加少量淀粉与盐摔打上劲，包入猪肉馅捏成丸，清水汆熟即可。鱼丸外皮弹滑、内馅带汁，一口咬开是汤，是福州街头与家常共有的小吃。',
    history:
      '福建沿海鱼货丰富，把鱼打成蓉制丸是常见的保存与吃法；福州鱼丸还形成「鱼包肉」的特色。它长期作为地方小吃与汤品存在，具体起源无确切记载，属于沿海饮食传统。',
    people: [],
    story:
      '福州人判断鱼丸好坏，咬下去就知道：皮要弹、馅要有汁，不能一咬散成渣。街上卖鱼丸的摊子往往现煮现卖，一碗配汤加葱花。有人爱吃皮、有人专挑馅，家里煮汤时还会加紫菜与鱼丸同煮。',
    storyType: '民间故事', flavors: ['清鲜', '弹滑'],
    scenes: ['一人食', '早餐', '两人'],
    flavorProfile: '弹滑鲜甜，内馅带汁，汤清味足', cookingMethods: ['打鱼蓉', '包馅制丸', '汆煮'],
    difficulty: '考功夫', allergens: ['鱼类'], ingredients: ['鳗鱼', '猪肉馅', '淀粉', '葱'],
    imageAlt: '福建鱼丸 成品图',
    photo: '福建鱼丸',
    relatedDishIds: ['haili-jian', 'guoqiao-mixian', 'taiji-yuni'], videoSearchQuery: '福建鱼丸 做法',
    tags: ['闽菜', '福州', '鱼丸', '汤', '小吃'], emoji: '🍡',
  },
  {
    id: 'haili-jian', name: '海蛎煎', aliases: ['蚝煎', '蚵仔煎'], categoryId: 'xianxiang', dishType: '小吃',
    cuisineId: 'min', region: '福建厦门、泉州', spicy: 0, minutes: 30, price: 26,
    summary: '闽南夜市的头号主角，边脆心软才合格。',
    desc: '外脆内嫩、海味鲜甜，蘸甜辣酱最对味。',
    description:
      '新鲜海蛎洗净，与地瓜粉浆、鸡蛋、葱花在热油锅里摊开，煎到边缘焦脆、中心软嫩，蘸甜辣酱吃。海蛎要新鲜、粉浆要薄，火候要让蛋香与海味同时出来，是闽南夜市的主角之一。',
    history:
      '海蛎煎是闽南与潮汕沿海常见的做法，与当地海蛎养殖与地瓜粉（番薯粉）普及有关。它长期作为街头小吃存在，具体起源说法不一，宜作为闽南饮食传统记录。',
    people: [],
    story:
      '闽南人说海蛎煎要「边脆心软」：粉浆多一分就糊，少一分就散；海蛎下锅前要沥干水。蘸料也有讲究，甜辣酱之外，有人喜欢加辣酱或蒜泥。夜市摊前排队时，看师傅翻锅本身就是表演。',
    storyType: '民间故事', flavors: ['鲜甜', '焦香'],
    scenes: ['一人食', '深夜', '朋友聚会'],
    flavorProfile: '外脆内嫩，海味鲜甜，酱香提味', cookingMethods: ['调粉浆', '摊煎'],
    difficulty: '家常', allergens: ['鸡蛋'], ingredients: ['海蛎', '地瓜粉', '鸡蛋', '葱花'],
    imageAlt: '海蛎煎 成品图',
    photo: '海蛎煎',
    relatedDishIds: ['xiefen-shizitou', 'fujian-yuwan', 'choudoufu'], videoSearchQuery: '海蛎煎 家常做法',
    tags: ['闽菜', '闽南', '海蛎', '小吃', '夜市'], emoji: '🍳',
  },
  {
    id: 'jitang-cuhaibang', name: '鸡汤汆海蚌', aliases: ['鸡汤海蚌'], categoryId: 'xianxiang', dishType: '汤羹',
    cuisineId: 'min', region: '福建福州', spicy: 0, minutes: 60, price: 88,
    summary: '滚汤数秒汆蚌片，考的不是调料而是心细。',
    desc: '汤清味鲜、蚌片脆嫩，全靠鸡汤本身提鲜。',
    description:
      '海蚌片成薄片，鸡汤烧到滚沸，把蚌片放入一汆即起，汤清味鲜、蚌肉脆嫩。火候只有几秒之差：久了就老，短了不熟，因此是闽菜里最能体现「汤功与火候」的菜之一。',
    history:
      '这是闽菜吊汤与海鲜处理技艺的代表性菜式，与福州沿海的海蚌产地与传统宴席文化相关。它长期出现在正式宴席上，具体起源无确切记载，属于闽菜高规格的汤菜体系。',
    people: [],
    story:
      '老师傅会当桌操作：鸡汤滚着，蚌片下勺数秒就捞。有人说这道菜考的不是厨艺而是心细——它连放盐的余地都很少，全靠鸡汤本身的鲜。宴席上它清清淡淡，却是行家最先看的一道。',
    storyType: '民间故事', flavors: ['清鲜', '脆嫩'],
    scenes: ['家庭', '待客', '两人'],
    flavorProfile: '汤清味鲜，蚌片脆嫩，回甘明显', cookingMethods: ['吊鸡汤', '片蚌', '沸汤汆烫'],
    difficulty: '考功夫', allergens: [], ingredients: ['海蚌', '鸡汤', '姜丝'],
    imageAlt: '鸡汤汆海蚌 成品图',
    photo: '鸡汤汆海蚌',
    relatedDishIds: ['fotiaoqiang', 'naitang-pucai', 'fujian-yuwan'], videoSearchQuery: '鸡汤汆海蚌 做法',
    tags: ['闽菜', '福州', '汤菜', '海鲜', '宴席菜'], emoji: '🥣',
  },
  {
    id: 'danzao-xiangluopian', name: '淡糟香螺片', aliases: ['香螺片'], categoryId: 'xianxiang', dishType: '荤菜',
    cuisineId: 'min', region: '福建福州', spicy: 0, minutes: 50, price: 78,
    summary: '螺片刚卷曲就出锅，刀工、糟、火候一样不能错。',
    desc: '糟香清脆、咸鲜微酸，口感爽利。',
    description:
      '香螺取肉切成薄片，用淡红糟与姜末、料酒快速炒制，螺片刚卷曲就出锅。讲究螺片脆爽带糟香，绝不能炒老。这是闽菜「糟炒」技法的代表，也是一道很吃刀工与火候的名菜。',
    history:
      '香螺是福建沿海的常见海产，红糟则是福建特有的调味；把两者结合形成糟炒螺片，是闽菜糟香体系的经典做法。具体成形年代无确切记载，长期作为宴席菜存在于福州。',
    people: [],
    story:
      '螺片切得薄，入锅才能快；火候差十来秒，螺肉就从脆变韧。福州厨师常说这道菜是「偷不了懒的菜」——刀工、糟的质量、火候，三样都得对。桌上它分量不大，却是懂行的客人必点。',
    storyType: '民间故事', flavors: ['糟香', '脆爽'],
    scenes: ['家庭', '待客', '下酒'],
    flavorProfile: '糟香清脆，咸鲜微酸，口感爽利', cookingMethods: ['片螺肉', '炒红糟', '旺火快炒'],
    difficulty: '考功夫', allergens: [], ingredients: ['香螺', '红糟', '姜末', '料酒'],
    imageAlt: '淡糟香螺片 成品图',
    photo: '淡糟香螺片',
    relatedDishIds: ['zuipaigu', 'hongzaoyu', 'jitang-cuhaibang'], videoSearchQuery: '淡糟香螺片 做法',
    tags: ['闽菜', '福州', '红糟', '海鲜', '宴席菜'], emoji: '🐚',
  },
  {
    id: 'taiji-yuni', name: '太极芋泥', aliases: ['芋泥'], categoryId: 'tianrun', dishType: '点心',
    cuisineId: 'min', region: '福建福州', spicy: 0, minutes: 60, price: 26,
    summary: '看着不冒热气，其实是福州最「烫」的甜点。',
    desc: '绵密甜香、油润细腻，表面画太极两色。',
    description:
      '槟榔芋蒸熟压成泥，加猪油与糖炒到细滑油亮，装盘后用乌豆沙或红枣泥在表面画出太极图案。入口绵密甜香、温热最好吃，是福州宴席上的收尾甜点。',
    history:
      '芋泥是福州传统甜品，与当地盛产槟榔芋相关；用两种颜色的泥摆出太极图形，是宴席上的传统摆法。它长期作为宴客点心存在，具体起源无确切记载。',
    people: [],
    story:
      '福州人提醒外地客：芋泥看着不冒热气，其实很烫，因为它被猪油封住了温度。曾经有人在宴席上大口吃下去被烫到，成为亲友间的笑话。摆太极图也讲究手稳，画歪了就失了体面。',
    storyType: '民间故事', flavors: ['甜', '绵密'],
    scenes: ['家庭', '两人', '待客'],
    flavorProfile: '绵密甜香，油润细腻，温热入口', cookingMethods: ['蒸芋压泥', '猪油炒制', '造型'],
    difficulty: '家常', allergens: [], ingredients: ['槟榔芋', '猪油', '糖', '乌豆沙'],
    imageAlt: '太极芋泥 成品图',
    photo: '太极芋泥',
    relatedDishIds: ['tangyuan', 'shuangpinai', 'hongdou-shayong'], videoSearchQuery: '太极芋泥 做法',
    tags: ['闽菜', '福州', '甜品', '芋头', '宴席菜'], emoji: '🍮',
  },
  {
    id: 'fuzhou-xianmian', name: '福州线面', aliases: ['线面', '太平面'], categoryId: 'xianxiang', dishType: '主食',
    cuisineId: 'min', region: '福建福州', spicy: 0, minutes: 40, price: 24,
    summary: '细如丝的手工面，生日时的那一碗太平面。',
    desc: '细滑爽口、久煮不烂，下锅一烫即成。',
    description:
      '福州线面细如丝，手工拉制，晒干后久煮不烂。常见吃法是鸡汤线面，或加两个鸡蛋（太平面），寿宴、生日、坐月子都少不了它；煮时只需下锅一烫，捞起加汤与配料即可。',
    history:
      '线面是福州传统手工面食，与当地手工拉面技艺和民俗（生日、喜庆吃「太平面」）密切相关。它属于地方饮食传统，具体起源无确切记载，长期以来在福州人的节令与礼俗中占有位置。',
    people: [],
    story:
      '福州人生日要吃太平面：线面加两个蛋，寓意平安圆满。线面很细，遇到滚汤就熟，煮过头就成糊，因此老福州人会先把汤备好，面只是「一烫」。这门手艺做起来费工，晒面时要几个人配合才拉得开。',
    storyType: '民间故事', flavors: ['清鲜', '细滑'],
    scenes: ['一人食', '早餐', '加班快手'],
    flavorProfile: '细滑爽口，汤清味鲜，久煮不烂', cookingMethods: ['手工拉面', '晒制', '汤煮'],
    difficulty: '考功夫', allergens: ['小麦', '鸡蛋'], ingredients: ['线面', '鸡汤', '鸡蛋', '葱'],
    imageAlt: '福州线面 成品图',
    photo: '福州线面',
    relatedDishIds: ['lanzhou-noodle', 'guoqiao-mixian', 'pianer-chuan'], videoSearchQuery: '福州线面 做法',
    tags: ['闽菜', '福州', '面食', '主食', '民俗'], emoji: '🍜',
  },
]
