import type { DishSeed } from './types'

/**
 * 粤菜新增菜品（图鉴第二阶段）
 * 已有白切鸡、清蒸鲈鱼、腊味煲仔饭、双皮奶、红豆沙、蒜蓉豆苗保存在 legacy.ts。
 */
export const yueDishes: DishSeed[] = [
  {
    id: 'guangshi-shaoe', name: '广式烧鹅', aliases: ['烧鹅'], categoryId: 'nongxiang', dishType: '荤菜',
    cuisineId: 'yue', region: '广东', spicy: 0, minutes: 120, price: 45,
    summary: '脆皮锁住肉汁，蘸酸梅酱才算完整。',
    desc: '皮脆到响、肉带汁，蘸酸梅酱解腻。',
    description:
      '黑鬃鹅或清远鹅腌味后上皮水、风干，挂炉烤到皮色枣红、脆而透光；斩件上桌，配酸梅酱。腌料、皮水与火候是烧腊师傅的看家本事，家庭很难复刻，通常直接买现成，讲究的是斩件后皮还「响」。',
    history:
      '广式烧味是广东饮食的重要一支，烧鹅与烧鸭技法相近，讲究以炭火或挂炉明火烤制，皮脆肉香。常见说法认为它随广府烧腊铺的发展成熟，并因新会古井一带用荔枝木烧制的做法而出名。具体起源时间说法不一。',
    people: [],
    story:
      '广东人挑烧鹅先看皮：要脆到咬下去有声，肉还得带汁，斩件后蘸酸梅酱解腻。老铺多在天亮前开始烧，中午前卖完就收档。街坊评价很直接——「今日只鹅够身」，说的是鹅够肥、火候刚好。',
    scenes: ['家庭', '待客', '朋友聚会'],
    storyType: '民间故事', flavors: ['脆皮', '油香'], flavorProfile: '皮脆肉香，油而不腻，酸梅酱回甜',
    cookingMethods: ['腌味', '上皮水风干', '挂炉烤制'], difficulty: '考功夫', allergens: ['大豆'],
    ingredients: ['黑鬃鹅', '五香盐', '麦芽糖', '酸梅酱'], imageAlt: '广式烧鹅 成品图',
    photo: '广式烧鹅',
    relatedDishIds: ['baiqieji', 'mizhi-chashao', 'lazhi-chaofan'], videoSearchQuery: '广式烧鹅 家常做法',
    tags: ['粤菜', '广东', '烧腊', '鹅肉', '宴客菜'], emoji: '🦆',
  },
  {
    id: 'laohuo-liangtang', name: '老火靓汤', aliases: ['广东老火汤', '煲汤'], categoryId: 'qingshuang',
    dishType: '汤羹', cuisineId: 'yue', region: '广东', spicy: 0, minutes: 150, price: 30,
    summary: '煲足时辰的一锅汤，是广东人家的日常功夫。',
    desc: '火小时间长，汤清味厚，按季节换方子。',
    description:
      '老火靓汤是一类做法而不是单一配方：猪骨、鸡或瘦肉配时令食材与药材，小火煲两三个小时，汤色清或乳白，讲究「汤有味而不过浓」。常见搭配有玉米胡萝卜排骨、霸王花瘦肉、冬瓜薏米等。煲前先焯水去腥，是广府人家的基本功。',
    history:
      '煲汤是广府饮食的日常传统，与岭南气候湿热、讲求清润的饮食观相关。汤方多来自家庭与汤铺的经验积累，没有统一的发明者；把食材配伍当成一门生活知识代代相传，是这套传统最鲜明的特点。',
    people: [],
    story:
      '广东人对煲汤有一套固执：火要小、时间要够、汤要清，明火靓汤不放味精。妈妈们按季节换方子——春天祛湿、夏天清热、秋天润燥、冬天进补。外地人第一次听说「一碗汤煲三小时」，多半会先愣一下。',
    scenes: ['家庭', '两人', '待客'],
    storyType: '民间故事', flavors: ['清润', '鲜甜'], flavorProfile: '清润鲜甜，汤味清而不薄，油花极少',
    cookingMethods: ['焯水', '小火慢煲'], difficulty: '家常', allergens: [],
    ingredients: ['猪骨', '玉米', '胡萝卜', '姜'], imageAlt: '老火靓汤 成品图',
    photo: '老火靓汤',
    relatedDishIds: ['baiqieji', 'qingzheng-luyu', 'lazhi-chaofan'], videoSearchQuery: '老火靓汤 家常做法',
    tags: ['粤菜', '广东', '汤', '慢煲', '家常'], emoji: '🍲',
  },
  {
    id: 'mizhi-chashao', name: '蜜汁叉烧', aliases: ['叉烧'], categoryId: 'nongxiang', dishType: '荤菜',
    cuisineId: 'yue', region: '广东', spicy: 0, minutes: 90, price: 32,
    summary: '蜜汁挂在焦边，甜咸之间就是广式烧味。',
    desc: '外甜内咸、切口带汁，焦边最香。',
    description:
      '梅头肉或五花肉用叉烧酱、生抽、蜂蜜与玫瑰露酒腌透，挂炉或烤箱烤到边缘微焦，中途刷蜜汁上色。好的叉烧外甜内咸、切口带汁，肥瘦相间处最香，切片配饭或做叉烧包馅都合适。',
    history:
      '叉烧是广府烧味之一，名字与「用叉子串着烧」的做法有关。它随烧腊铺与茶楼点心体系发展，具体起源无确切记载；不同店家在腌料甜咸与蜜汁浓度上各成风格。',
    people: [],
    story:
      '广东人衡量叉烧不看颜色，看「边位」：烤到微焦的那一圈边缘最香，老饕买叉烧会专门要「半肥瘦、多边」。茶楼里的叉烧包用的是同一套馅料，甜咸比例略作调整，一肉两吃，是广府点心的常青款。',
    scenes: ['一人食', '家庭', '加班快手', '下饭'],
    storyType: '民间故事', flavors: ['蜜香', '咸鲜'], flavorProfile: '蜜香微甜，咸鲜打底，边缘焦香',
    cookingMethods: ['腌制', '刷蜜烤制'], difficulty: '家常', allergens: ['大豆'],
    ingredients: ['梅头肉', '叉烧酱', '蜂蜜', '生抽'], imageAlt: '蜜汁叉烧 成品图',
    photo: '蜜汁叉烧',
    relatedDishIds: ['guangshi-shaoe', 'xiajiao', 'lazhi-chaofan'], videoSearchQuery: '蜜汁叉烧 家常做法',
    tags: ['粤菜', '广东', '烧味', '叉烧', '家常'], emoji: '🍖',
  },
  {
    id: 'xiajiao', name: '虾饺', aliases: ['水晶虾饺'], categoryId: 'xianxiang', dishType: '点心',
    cuisineId: 'yue', region: '广东广州', spicy: 0, minutes: 80, price: 28,
    summary: '半透明的皮里包着一整只鲜虾，早茶的门面。',
    desc: '皮透亮、褶整齐，虾仁弹牙带汁。',
    description:
      '澄面加生粉用沸水烫熟，擀成半透明的薄皮，包入鲜虾仁、笋粒与少量猪油调的馅，捏出十余道均匀的褶，蒸五六分钟。皮要透亮不破、褶口整齐，虾仁弹牙带汁，是广式早茶「四大天王」之一。',
    history:
      '虾饺是广府早茶点心的代表，与二十世纪茶楼点心的兴盛直接相关，常见说法把它与广州河南（今海珠区）一带的茶楼联系起来。具体首创店家与年代有不同说法，宜作为广式点心体系的代表看待。',
    people: [],
    story:
      '老点心师傅考徒弟，先看虾饺的褶：十来道以上、大小一致、蒸后不塌，才算过关。虾要现剥，笋要细切，馅里放一点猪油才润。茶客点单时也挑剔——皮不够透亮，是要退回去重做的。',
    scenes: ['早餐', '两人', '待客'],
    storyType: '现代流行说法', flavors: ['清鲜', '弹牙'], flavorProfile: '清鲜弹牙，皮薄透亮，汁水微润',
    cookingMethods: ['烫面制皮', '包馅', '旺火蒸制'], difficulty: '考功夫', allergens: ['虾', '小麦'],
    ingredients: ['澄面', '鲜虾仁', '笋粒', '猪油'], imageAlt: '虾饺 成品图',
    photo: '虾饺',
    relatedDishIds: ['mizhi-chashao', 'laohuo-liangtang', 'qingzheng-luyu'], videoSearchQuery: '虾饺 家常做法',
    tags: ['粤菜', '广州', '点心', '早茶', '虾'], emoji: '🥟',
  },
  {
    id: 'ganchao-hefen', name: '干炒牛河', aliases: ['炒牛河'], categoryId: 'nongxiang', dishType: '主食',
    cuisineId: 'yue', region: '广东广州', spicy: 0, minutes: 30, price: 26,
    summary: '一锅镬气，考出厨房的底子。',
    desc: '粉条分明不断，盘底不见油，牛肉嫩。',
    description:
      '河粉要宽而薄，先与生抽、老抽拌匀上色；牛肉片腌过滑油备用。锅要烧到极热，河粉下锅后用铲「推」而不是乱翻，靠镬气把粉炒透，最后回入牛肉与豆芽。好的干炒牛河粉条分明不断、盘底不见油。',
    history:
      '干炒牛河是广府街头与宵夜档的经典，与广州茶楼、大排档的炒粉传统相关。它考验「镬气」与火候，具体成型年代说法不一，通常被视为粤菜基本功的试金石。',
    people: [],
    story:
      '粤菜师傅常说「一锅干炒牛河，考出厨房的底」：粉断不断、油多不多、牛肉嫩不嫩，三眼就能看出。大排档里还讲究上桌要「热到起烟」，凉了再回锅就散。至于它是不是从「湿炒」演变来的，行内也有不同说法。',
    scenes: ['一人食', '深夜', '朋友聚会'],
    storyType: '民间故事', flavors: ['酱香', '镬气'], flavorProfile: '镬气足，酱香咸鲜，粉滑牛肉嫩',
    cookingMethods: ['腌牛肉', '滑油', '热锅干炒'], difficulty: '考功夫', allergens: ['大豆'],
    ingredients: ['河粉', '牛肉', '豆芽', '生抽'], imageAlt: '干炒牛河 成品图',
    photo: '干炒牛河',
    relatedDishIds: ['lazhi-chaofan', 'mizhi-chashao', 'guangshi-shaoe'], videoSearchQuery: '干炒牛河 家常做法',
    tags: ['粤菜', '广州', '主食', '炒粉', '镬气'], emoji: '🍜',
  },
]
