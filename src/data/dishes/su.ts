import type { DishSeed } from './types'

/**
 * 苏菜新增菜品（图鉴第二阶段）
 * 已有小笼包、葱油面、腌笃鲜保存在 legacy.ts（id 不变）。
 */
export const suDishes: DishSeed[] = [
  {
    id: 'songshu-guiyu', name: '松鼠鳜鱼', aliases: ['松鼠桂鱼'], categoryId: 'suanxiang', dishType: '荤菜',
    cuisineId: 'su', region: '江苏苏州', spicy: 0, minutes: 60, price: 68,
    summary: '花刀炸开像松鼠，浇汁那一声是全桌的期待。',
    desc: '外脆里嫩，糖醋挂汁，形似松鼠。',
    description:
      '鳜鱼从背部开刀去骨，鱼肉剞十字花刀，用盐与料酒略腌后拍干淀粉，下油锅炸到花刀张开、形如松鼠；另起锅调糖醋汁，趁热浇在鱼身。成菜外脆里嫩、酸甜挂汁，是苏帮宴席的门面菜。',
    history:
      '松鼠鳜鱼是苏帮菜的传统造型菜：鳜鱼去骨剞花刀，炸后形似松鼠，浇上糖醋汁时会发出声响。关于它是否与清代皇帝南巡的宴席有关，属民间传说，缺少确证；但作为苏州宴席大菜的地位长期确立，具体成名年代有不同说法。',
    people: [],
    story:
      '民间最流行的版本是：皇帝南巡到苏州，厨师端上炸好的鳜鱼，浇汁时的响声像松鼠叫，皇帝大喜。这个说法在苏州餐馆里被反复讲述，却查不到确切文献，只能算地方传说。真正确定的是花刀与油温——刀口深浅一致，炸完才能根根立起。',
    storyType: '地方传说', flavors: ['酸甜', '酥脆'],
    scenes: ['家庭', '待客', '朋友聚会'],
    flavorProfile: '外脆里嫩，糖醋酸甜，汁亮不腻', cookingMethods: ['去骨剞花刀', '拍粉油炸', '熬糖醋汁'],
    difficulty: '考功夫', allergens: ['鱼类'], ingredients: ['鳜鱼', '干淀粉', '镇江香醋', '糖'], imageAlt: '松鼠鳜鱼 成品图',
    photo: '松鼠鳜鱼',
    relatedDishIds: ['xihu-cuyu', 'tangcu-liyu', 'dazhu-gansi'], videoSearchQuery: '松鼠鳜鱼 传统做法',
    tags: ['苏菜', '苏州', '花刀', '糖醋', '宴客菜'], emoji: '🐟',
  },
  {
    id: 'qingdun-shizitou', name: '清炖狮子头', aliases: ['狮子头', '蟹粉狮子头（时令版）'], categoryId: 'qingshuang',
    dishType: '荤菜', cuisineId: 'su', region: '江苏扬州', spicy: 0, minutes: 120, price: 42,
    summary: '细切粗斩的肉丸，在清汤里慢慢炖到化开。',
    desc: '丸子完整不散，入口松软，汤清不寡。',
    description:
      '五花肉「细切粗斩」，肥瘦比例约三比七，加葱姜水顺一个方向搅上劲，团成大丸子先煎定型，再放入清汤小火炖两小时，垫上青菜心。成菜丸子完整不散、入口即化，汤清而不寡，是淮扬炖菜的代表。',
    history:
      '狮子头是淮扬菜的代表之一，名字多被认为来自成菜形似狮子头。它在扬州、镇江一带长期流传，常见说法把它与隋唐以后的扬州宴席文化联系起来，但具体起源说法不一，宜作为地方宴席传统看待。',
    people: [],
    story:
      '老扬州讲究「细切粗斩」：肉不能绞，要用刀背砸出黏性，丸子才松而不柴。炖的时候水面微微冒泡就够，火大丸子会散。名字到底是像狮子头，还是取「硕大」之意，行内也有不同说法，但没人否认它得慢慢炖。',
    storyType: '文献存疑', flavors: ['清鲜', '软嫩'],
    scenes: ['家庭', '待客', '两人'],
    flavorProfile: '清鲜软嫩，汤清味厚，入口即化', cookingMethods: ['细切粗斩', '煎定型', '小火清炖'],
    difficulty: '进阶', allergens: ['鸡蛋'], ingredients: ['五花肉', '马蹄', '青菜心', '葱姜水'], imageAlt: '清炖狮子头 成品图',
    photo: '清炖狮子头',
    relatedDishIds: ['xiefen-shizitou', 'yanduxian', 'dazhu-gansi'], videoSearchQuery: '清炖狮子头 家常做法',
    tags: ['苏菜', '扬州', '炖菜', '肉丸', '宴客菜'], emoji: '🍡',
  },
  {
    id: 'dazhu-gansi', name: '大煮干丝', aliases: ['煮干丝', '鸡汁煮干丝'], categoryId: 'xianxiang', dishType: '素菜',
    cuisineId: 'su', region: '江苏扬州', spicy: 0, minutes: 60, price: 36,
    summary: '一块豆腐干切出上千根丝，再用鸡汤把味道送进去。',
    desc: '干丝细而不断，汤鲜而不浊，刀工见真章。',
    description:
      '白豆腐干批成薄片再切成细丝，用沸水反复烫去豆腥，再用鸡清汤慢煮，配虾仁、火腿丝与豌豆苗。干丝要细而不断、汤要鲜而不浊，是刀工与吊汤一起考核的淮扬名菜。',
    history:
      '大煮干丝由扬州茶社的烫干丝发展而来，讲究的版本改用高汤煮制，因此得名。它与扬州早茶文化、淮扬刀工传统直接相关，成形年代说法不一，通常视为淮扬菜精细化的产物。',
    people: [],
    story:
      '扬州人说这道菜看刀工：一块豆腐干要片成十几片，再切成细丝，细到能穿针眼，却还得有韧劲。早茶店里配一壶茶、一碟干丝，是本地人的日常。外地客人常惊叹「这真的是豆腐做的」。',
    storyType: '民间故事', flavors: ['清鲜', '醇和'],
    scenes: ['早餐', '一人食', '两人', '待客'],
    flavorProfile: '清鲜醇和，干丝绵软，汤味入丝', cookingMethods: ['批片切丝', '反复烫制', '高汤烩煮'],
    difficulty: '考功夫', allergens: ['大豆', '虾'], ingredients: ['白豆腐干', '鸡清汤', '虾仁', '火腿丝'], imageAlt: '大煮干丝 成品图',
    photo: '大煮干丝',
    relatedDishIds: ['wensi-doufu', 'qingdun-shizitou', 'yanduxian'], videoSearchQuery: '大煮干丝 做法',
    tags: ['苏菜', '扬州', '刀工', '豆腐干', '早茶'], emoji: '🍜',
  },
  {
    id: 'yanshuiya', name: '盐水鸭', aliases: ['金陵盐水鸭', '桂花鸭'], categoryId: 'xianxiang', dishType: '凉菜',
    cuisineId: 'su', region: '江苏南京', spicy: 0, minutes: 180, price: 38,
    summary: '皮白肉嫩、咸香入骨，南京的「鸭都」名片。',
    desc: '皮白肉红骨头香，越嚼越有味。',
    description:
      '鸭用炒过的花椒盐揉搓腌透，再下锅以小火浸煮，出锅后晾凉斩件。皮白肉嫩、咸香入骨，肥而不腻。关键是盐要炒过、腌要到位、煮不能滚——滚了肉就柴，皮色也会发黄。',
    history:
      '盐水鸭是南京的代表菜，当地有「鸭都」之称，腌卤食鸭的传统与江南水乡养鸭、节令饮食相关。它长期作为金陵菜的代表之一，具体定型年代说法不一，通常与中秋前后的桂花鸭风俗一起被提及。',
    people: [],
    story:
      '南京人说「没有一个鸭子能游过长江」，虽是玩笑，却说明鸭在当地的日常地位。讲究的盐水鸭要「皮白、肉红、骨头香」，老店往往凌晨开卤，好时段就被熟客买走。买不回整只，也要切「半只前脯」。',
    storyType: '民间故事', flavors: ['咸鲜', '清香'],
    scenes: ['家庭', '两人', '下酒', '下饭'],
    flavorProfile: '咸鲜清香，皮白肉嫩，越嚼越香', cookingMethods: ['花椒盐腌制', '小火浸煮', '晾凉斩件'],
    difficulty: '进阶', allergens: [], ingredients: ['鸭子', '花椒盐', '姜', '葱'], imageAlt: '盐水鸭 成品图',
    photo: '盐水鸭',
    relatedDishIds: ['baiqieji', 'kaoya', 'yanduxian'], videoSearchQuery: '盐水鸭 家常做法',
    tags: ['苏菜', '南京', '凉菜', '鸭肉', '金陵'], emoji: '🦆',
  },
  {
    id: 'yangzhou-chaofan', name: '扬州炒饭', aliases: ['扬州蛋炒饭'], categoryId: 'xianxiang', dishType: '主食',
    cuisineId: 'su', region: '江苏扬州', spicy: 0, minutes: 40, price: 26,
    summary: '粒粒分明的一碗饭，把淮扬配料装了进去。',
    desc: '粒粒分明、配料均匀、不靠重油盖味。',
    description:
      '隔夜籼米饭打散，鸡蛋炒成蛋松，配虾仁、火腿、青豆、香菇丁与笋丁，分次下锅翻炒，最后调味。讲究「粒粒分明、配料均匀、色香俱全」，不靠重油盖味，是淮扬炒饭的标准。',
    history:
      '扬州炒饭的名称与扬州饮食文化相关，其配料版本在各地不断演化：从家常蛋炒饭到包含海参、虾仁、火腿的宴席版本，做法差异很大。它经当代餐馆与海外中餐传播而知名，具体起源说法不一，不宜只归一家。',
    people: [],
    story:
      '关于「是不是扬州发明的」，扬州人与外地人争论了很多年。可以确定的是：这道饭在海外中餐馆里几乎无人不识，成了中餐的招牌之一。至于配料要到几种、要不要放火腿，各家版本差别很大，也就没有唯一标准。',
    storyType: '现代流行说法', flavors: ['咸鲜', '清香'],
    scenes: ['一人食', '家庭', '加班快手'],
    flavorProfile: '咸鲜清香，粒粒分明，配料丰富', cookingMethods: ['炒蛋', '分次翻炒'],
    difficulty: '家常', allergens: ['鸡蛋', '虾'], ingredients: ['籼米饭', '鸡蛋', '虾仁', '火腿'],
    imageAlt: '扬州炒饭 成品图',
    photo: '扬州炒饭',
    relatedDishIds: ['dazhu-gansi', 'xiajiao', 'cong-oil-noodle'], videoSearchQuery: '扬州炒饭 家常做法',
    tags: ['苏菜', '扬州', '主食', '炒饭', '家常'], emoji: '🍚',
  },
  {
    id: 'wensi-doufu', name: '文思豆腐', aliases: ['文思豆腐羹'], categoryId: 'qingshuang', dishType: '汤羹',
    cuisineId: 'su', region: '江苏扬州', spicy: 0, minutes: 50, price: 32,
    summary: '一块嫩豆腐切成发丝，汤一滚就知道刀工够不够。',
    desc: '汤清不浊，豆腐丝根根分明，入口滑而不散。',
    description:
      '嫩豆腐先片成薄片，再切成细丝，放入清水中轻轻拨散；鸡清汤与冬笋丝、香菇丝、火腿丝同煮，最后下豆腐丝，勾薄芡即成。汤色清亮、豆腐丝根根分明，入口滑而不散，是淮扬刀工的展示菜。',
    history:
      '文思豆腐常见说法与清代扬州僧人相关，相传他善于以精细刀工做豆腐菜，后世便以他的名字称呼这道汤羹。它体现淮扬菜对刀工与清汤的追求，具体人事细节说法不一，宜作为扬州刀工菜的代表看待。',
    people: ['文思和尚（相传为清代扬州僧人，常见说法与这道菜相连）'],
    story:
      '这道菜最惊人的是豆腐：一块嫩豆腐切成发丝粗细，入清汤后根根散开却不碎，汤一滚就能看出刀工。老师傅说练刀要看「手不抖、刀不黏」，练废的豆腐能装满几大盆。传说里的那位僧人，大概也是这么练出来的。',
    storyType: '文献存疑', flavors: ['清鲜', '滑嫩'],
    scenes: ['家庭', '待客', '两人'],
    flavorProfile: '清鲜滑嫩，汤清不浊，刀工见长', cookingMethods: ['批片切丝', '吊清汤', '勾薄芡'],
    difficulty: '考功夫', allergens: ['大豆'], ingredients: ['嫩豆腐', '鸡清汤', '火腿丝', '冬笋丝'],
    imageAlt: '文思豆腐 成品图',
    photo: '文思豆腐',
    relatedDishIds: ['dazhu-gansi', 'yanduxian', 'songshao-yugeng'], videoSearchQuery: '文思豆腐 做法',
    tags: ['苏菜', '扬州', '刀工', '豆腐', '汤羹'], emoji: '🥣',
  },
  {
    id: 'xiefen-shizitou', name: '蟹粉狮子头', aliases: ['蟹粉丸子'], categoryId: 'xianxiang', dishType: '荤菜',
    cuisineId: 'su', region: '江苏扬州', spicy: 0, minutes: 130, price: 78,
    summary: '秋蟹拆粉入肉，让家常狮子头升上宴席。',
    desc: '猪肉软嫩里添一层河鲜，汤汁带蟹油金黄。',
    description:
      '在狮子头的肉馅里拌入新鲜拆出的蟹粉与蟹黄，同样细切粗斩、团成丸子，用清汤慢炖。成菜既有猪肉的软嫩，又添一层河鲜的鲜甜，汤汁带蟹油金黄，是秋天蟹汛时节的宴席菜。',
    history:
      '蟹粉狮子头是淮扬宴席中的时令做法，把狮子头的做法与江南吃蟹传统结合，多见于秋风起、蟹膏肥的季节。它属于同一道菜的节令版本，具体出现时间说法不一，宜作为淮扬时令菜的体现。',
    people: [],
    story:
      '拆蟹是这道菜的隐形成本：一只蟹能出的蟹粉有限，老师傅拆得干净利落，蟹壳里不留一点肉。扬州人讲究秋天吃蟹粉菜，配姜醋解寒。有人说，蟹粉让狮子头从家常变成了宴席。蟹粉要现拆现用，隔夜就少了一截香气；炖的时候汤面只冒小泡，丸子才稳，火一大就散了。',
    storyType: '民间故事', flavors: ['清鲜', '蟹香'],
    scenes: ['家庭', '待客', '朋友聚会'],
    flavorProfile: '清鲜软糯，蟹香扑鼻，汤汁带金黄', cookingMethods: ['拆蟹取粉', '细切粗斩', '小火清炖'],
    difficulty: '考功夫', allergens: ['螃蟹', '鸡蛋'], ingredients: ['五花肉', '蟹粉', '蟹黄', '青菜心'],
    imageAlt: '蟹粉狮子头 成品图',
    photo: '蟹粉狮子头',
    relatedDishIds: ['qingdun-shizitou', 'yanshuiya', 'songshu-guiyu'], videoSearchQuery: '蟹粉狮子头 做法',
    tags: ['苏菜', '扬州', '螃蟹', '时令', '宴客菜'], emoji: '🦀',
  },
]
