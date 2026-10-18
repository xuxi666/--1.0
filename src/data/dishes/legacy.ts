import type { DishSeed } from './types'

/**
 * 第一阶段已有的 30 道菜（推荐功能的候选池来源之一）
 * ------------------------------------------------------------
 * 迁移原则：id、categoryId、cuisineId、characterId、spicy、minutes、price、scenes、
 * flavors、allergens、ingredients、desc、emoji 全部保持原值不变（推荐/相关菜品依赖它们），
 * 只补齐图鉴需要的介绍、历史、故事、图片与入口字段。
 * foodTypeId 用于标记独立美食类型（火锅/烧烤/面食/甜品/街头小吃），它们永远不是八大菜系。
 */
export const legacyDishes: DishSeed[] = [
  {
    id: 'mapo-tofu', name: '麻婆豆腐', aliases: ['陈麻婆豆腐', '麻辣豆腐'], categoryId: 'mala', dishType: '荤菜',
    cuisineId: 'chuan', characterId: 'mapo', region: '四川成都', spicy: 3, minutes: 25, price: 18,
    summary: '麻辣烫香酥嫩鲜活，一勺盖饭能吃两碗。',
    desc: '麻辣烫香酥嫩鲜活，一勺盖饭能吃两碗。',
    description:
      '嫩豆腐焯淡盐水定型，牛肉臊子煸酥，郫县豆瓣与豆豉炒出红油，再下高汤小火烧入味。关键在于分次勾芡：芡汁裹住豆腐却不糊口，起锅撒花椒面，麻香在最后一口才炸开。麻、辣、烫、香、酥、嫩、鲜、活，是老一辈总结的八字诀。',
    history:
      '常见说法认为麻婆豆腐源于清代成都万福桥头一家小饭铺，店主陈兴盛之妻陈刘氏脸上有麻痕，人称「陈麻婆」。她用小锅单烧豆腐配牛肉臊子，便宜下饭，被往来的挑油脚夫吃出了名声。它此前是否已有更早的家常烧豆腐原型，说法不一，细节已难确考。',
    people: ['陈刘氏（民间称「陈麻婆」，传说中这道菜的创制者）'],
    story:
      '万福桥边多挑油与运货的脚夫，他们把自带的菜油、豆瓣交给饭铺老板娘，请她加工豆腐。陈麻婆用小锅一份份烧，豆瓣要剁细、花椒要现舂，火候急了豆腐会老，慢了又不成形。据说脚夫们公认「麻婆烧的豆腐」最下饭，一传十十传百，菜名就跟着人叫开了。',
    scenes: ['一人食', '家庭', '下饭'],
    storyType: '文献存疑', flavors: ['麻辣', '烫'], flavorProfile: '麻辣鲜香，豆腐滚烫滑嫩，麻味收口',
    cookingMethods: ['炒豆瓣制红油', '小火烧制', '分次勾芡'], difficulty: '进阶',
    photo: '麻婆豆腐',
    allergens: ['大豆'], ingredients: ['嫩豆腐', '牛肉末', '郫县豆瓣', '花椒'], imageAlt: '麻婆豆腐 成品图', relatedDishIds: ['shuizhuyu', 'laziji', 'suancaiyu'],
    videoSearchQuery: '麻婆豆腐 家常做法', tags: ['川菜', '成都', '麻辣', '豆腐', '下饭菜'], emoji: '🥘',
  },
  {
    id: 'shuizhuyu', name: '水煮鱼', aliases: ['水煮鱼片'], categoryId: 'mala', dishType: '荤菜',
    cuisineId: 'chuan', characterId: 'shuizhuyu', region: '川渝', spicy: 3, minutes: 45, price: 48,
    summary: '红油滚烫、鱼片滑嫩，人多时最能压桌的一道硬菜。',
    desc: '红油滚烫，鱼片滑嫩，适合人多时压桌。',
    description:
      '草鱼或黑鱼片成厚薄一致的片，蛋清与红薯淀粉上浆，汆到刚断生就捞；豆芽垫底，刀口辣椒与花椒铺面，滚油一泼，香味被油温逼出来，鱼片却仍然嫩滑。家庭做可用龙利鱼或巴沙鱼替代，少刺、好上手，但要现泼油现吃。',
    history:
      '常见说法认为水煮鱼成型于上世纪八九十年代的重庆、四川一带餐馆，由水煮肉片的麻辣水煮技法移植到鱼片上。它不是古菜，而是川菜「水煮」味型成熟之后出现的新名菜，靠着一锅红油和扑鼻的椒香迅速传遍全国。',
    people: [],
    story:
      '关于水煮鱼，流传较广的一种说法是：江边餐馆为了让干体力活的船工吃得热辣又不怕鱼腥，改用厚油封温、上桌前现泼热油，油面还在翻滚就把盆端上桌。吃的时候得用筷子拨开辣椒，才能找到藏在底下的鱼片。这类追述多来自食客与餐馆的口耳相传，细节难核，但「拨辣椒找鱼」确实是水煮鱼的招牌体验。',
    scenes: ['朋友聚会', '待客'],
    storyType: '现代流行说法', flavors: ['麻辣', '油香'], flavorProfile: '麻辣滚烫，油香厚重，鱼片滑嫩',
    cookingMethods: ['片鱼上浆', '汆煮', '泼油激香'], difficulty: '进阶',
    photo: '水煮鱼',
    allergens: ['鱼类'], ingredients: ['草鱼', '豆芽', '刀口辣椒', '花椒'], imageAlt: '水煮鱼 成品图', relatedDishIds: ['suancaiyu', 'mapo-tofu', 'huoguo'],
    videoSearchQuery: '水煮鱼 家常做法', tags: ['川菜', '川渝', '麻辣', '鱼', '待客硬菜'], emoji: '🐠',
  },
  {
    id: 'huoguo', name: '重庆火锅', aliases: ['牛油火锅', '毛肚火锅'], categoryId: 'mala', dishType: '主食',
    cuisineId: 'chuan', foodTypeId: 'hotpot', characterId: 'huoguo', region: '川渝', spicy: 3, minutes: 60, price: 88,
    summary: '一锅红汤，把一桌人的话都煮开了。',
    desc: '一锅红汤，把一桌人的话都煮开了。',
    description:
      '牛油、辣椒与花椒在锅里反复熬出红汤，毛肚、鸭肠、黄喉讲究「七上八下」的秒数：毛肚十来秒起泡就卷，鸭肠更短，黄喉脆而不韧。火锅是重庆的社交方式，蘸碟只用香油蒜泥，为的是降温与提香，不抢锅底的味。',
    history:
      '常见说法认为重庆火锅发端于码头文化：江边船工与搬运工把屠户不要的毛肚、鸭肠、牛内脏下脚料丢进麻辣汤里煮，既果腹又驱寒。此后它从码头小吃发展为店铺经营，再走向全国。关于具体兴起年代与最早店家，不同资料说法不一，宜作为地方饮食记忆看待。',
    people: [],
    story:
      '重庆人吃火锅有一套默认规矩：先烫毛肚开锅，再涮鸭肠，最后下素菜与粉条；「微辣」对外地人是重辣，对本地人只是礼貌。九宫格里每一格火候不同，老吃客各占一格互不打扰，谁把筷子伸进别人的格子，是会挨瞪的。这些年俗并不出自哪本典籍，而是火锅店与家庭里代代教会的新食客。',
    scenes: ['朋友聚会', '家庭'],
    storyType: '现代流行说法', flavors: ['麻辣', '牛油'], flavorProfile: '麻辣厚重，牛油香浓，越煮越醇',
    cookingMethods: ['熬制牛油锅底', '现烫现吃'], difficulty: '家常',
    photo: '重庆火锅',
    allergens: ['大豆', '芝麻'], ingredients: ['牛油', '毛肚', '鸭肠', '黄喉'], imageAlt: '重庆火锅 成品图', relatedDishIds: ['mapo-tofu', 'shuizhuyu', 'suancai-fen'],
    videoSearchQuery: '重庆火锅 锅底做法', tags: ['火锅', '川渝', '麻辣', '牛油', '聚餐'], emoji: '🍲',
  },
  {
    id: 'laziji', name: '辣子鸡', aliases: ['歌乐山辣子鸡'], categoryId: 'mala', dishType: '荤菜',
    cuisineId: 'chuan', region: '川渝', spicy: 3, minutes: 40, price: 32,
    summary: '在辣椒堆里找鸡块的快乐，值得。',
    desc: '在辣椒堆里找鸡块的快乐，值得。',
    description:
      '鸡腿肉切小块，先用姜葱料酒码味，再下油锅炸到外表紧实、里面还带汁；干辣椒与花椒要小火慢炕出香，不能抢在鸡块之前糊掉，最后两者合炒，撒熟芝麻。成菜干香不勾芡，越翻越香，鸡块要能一口一个。',
    history:
      '辣子鸡多被归到重庆歌乐山一带的餐馆做法：把炸过的鸡块与大量干辣椒同炒，形成「辣子堆里找鸡」的吃法。它属于近现代川渝江湖菜体系，与传统的熘、爆类菜不同，出处与最早店家说法不一，宜作为现代流行吃法记录。',
    people: [],
    story:
      '吃辣子鸡的乐趣是「找」：一大盘辣椒里翻出鸡块，每夹到一块都像中彩。重庆有的馆子索性给顾客配镊子或长筷，还比谁吃到最后盘底不留鸡块。这种吃法来自餐馆的待客之道，被食客越传越当真，成了这道菜的乐趣标签。',
    scenes: ['朋友聚会', '下酒'],
    storyType: '现代流行说法', flavors: ['干辣', '焦香'], flavorProfile: '干辣酥香，外紧内嫩，麻味跟着辣椒走',
    cookingMethods: ['炸制', '煸炒干辣椒'], difficulty: '家常',
    photo: '辣子鸡',
    allergens: [], ingredients: ['鸡腿肉', '干辣椒', '花椒'], imageAlt: '辣子鸡 成品图', relatedDishIds: ['mapo-tofu', 'shuizhuyu', 'lajiao-chaorou'],
    videoSearchQuery: '辣子鸡 家常做法', tags: ['川菜', '重庆', '干辣', '鸡', '下酒菜'], emoji: '🍗',
  },
  {
    id: 'suancaiyu', name: '酸菜鱼', aliases: ['酸汤鱼片'], categoryId: 'suanxiang', dishType: '荤菜',
    cuisineId: 'chuan', characterId: 'suancaiyu', region: '川渝', spicy: 2, minutes: 40, price: 42,
    summary: '酸得刚好，汤白得刚好，胃口也回来了。',
    desc: '酸得刚好，汤白得刚好，胃口也回来了。',
    description:
      '黑鱼片成薄片，鱼骨先煎再熬出奶白汤底；泡酸菜要提前冲洗挤干，用猪油与姜蒜炒出酸香，再下汤煮鱼片。酸辣靠泡椒与白胡椒托底，不靠醋精，汤可以喝。鱼片下锅后别搅动，晃锅让汤裹住它，定型再捞更完整。',
    history:
      '酸菜鱼常见说法是上世纪末在重庆、四川一带的江湖菜馆中定型，把泡酸菜与鱼片结合，既去腥又开胃。泡菜入鱼汤是川渝家庭的日常做法，酸菜鱼则是这种家常智慧在餐馆里的放大版本。具体发源店家说法不一。',
    people: [],
    story:
      '川渝人家的泡菜坛子几乎什么都腌，入汤的酸菜要先「洗咸」，再挤干水汽炒香，汤才不齁不涩。老厨子说酸菜鱼最怕两件事：一是酸菜没炒透，汤发闷；二是鱼片下锅乱翻，肉全碎在汤里。这些经验大多来自灶台边的口传，并不见诸典籍，却决定了汤好不好喝。',
    scenes: ['家庭', '两人'],
    storyType: '现代流行说法', flavors: ['酸辣', '鲜'], flavorProfile: '酸香开胃，辣得不冲，汤色奶白',
    cookingMethods: ['煎鱼骨熬汤', '炒酸菜', '汆鱼片'], difficulty: '进阶',
    photo: '酸菜鱼',
    allergens: ['鱼类'], ingredients: ['黑鱼片', '酸菜', '白胡椒'], imageAlt: '酸菜鱼 成品图', relatedDishIds: ['shuizhuyu', 'mapo-tofu', 'guoqiao-mixian'],
    videoSearchQuery: '酸菜鱼 家常做法', tags: ['川菜', '酸辣', '鱼', '开胃', '家常'], emoji: '🥬',
  },
  {
    id: 'dongpo-pork', name: '东坡肉', aliases: ['东坡焖肉'], categoryId: 'nongxiang', dishType: '荤菜',
    cuisineId: 'zhe', characterId: 'dongpo', region: '浙江杭州', spicy: 0, minutes: 150, price: 38,
    summary: '慢火少水，火候足时他自美。',
    desc: '慢火少水，火候足时他自美。',
    description:
      '五花肉切方正块，皮朝下垫葱姜先煨，黄酒代替大部分水，加冰糖与生抽，小火慢炖到筷子一插即透。成菜红亮颤而不散，肥肉入口即化，瘦肉不柴。诀窍是「少著水、多放酒」，中途别频繁翻动。',
    history:
      '东坡肉与苏轼的联系主要来自民间与地方饮食记忆：相传他在杭州疏浚西湖时以酒肉慰劳民夫，也有把「慢火少水」的炖肉经验归于他的说法。苏轼诗中确有关于猪肉与火候的文字，但后世版本互相叠加，哪一条最接近原貌已难确证，宜与杭州、黄州等地的饮食传说一起看。',
    people: ['苏轼（号东坡居士，宋代文学家，民间把这道菜与他相连）'],
    story:
      '民间流传最广的版本是：苏轼在杭州主持治水，百姓送来猪肉与酒，他把酒肉一锅同炖，分给修湖的人，肉香传出去，人们就把这种做法叫「东坡肉」。另一说认为「东坡肉」是后人借他的名号抬举这道家常炖肉。版本不同，但共同点很一致：肉要慢慢炖，急了不成。',
    scenes: ['待客', '家庭'],
    storyType: '地方传说', flavors: ['咸甜', '酱香'], flavorProfile: '红亮油润，咸甜平衡，肉香里带黄酒气',
    cookingMethods: ['焯水', '小火慢煨', '收汁'], difficulty: '进阶',
    photo: '东坡肉',
    allergens: ['大豆'], ingredients: ['五花肉', '黄酒', '冰糖', '生抽'], imageAlt: '东坡肉 成品图', relatedDishIds: ['hongshaorou', 'mizhi-chashao', 'xihu-cuyu'],
    videoSearchQuery: '东坡肉 家常做法', tags: ['浙菜', '杭州', '慢炖', '五花肉', '宴客菜'], emoji: '🍖',
  },
  {
    id: 'hongshaorou', name: '红烧肉', aliases: ['家常红烧肉'], categoryId: 'nongxiang', dishType: '荤菜',
    characterId: 'hongshaorou', region: '全国', spicy: 0, minutes: 80, price: 28,
    summary: '不会惊艳你，但会让你再添一碗饭。',
    desc: '不会惊艳你，但会让你再添一碗饭。',
    description:
      '五花肉冷水下锅焯去血沫，热锅把皮面烫到微焦去腥，再用冰糖炒糖色，肉块裹上枣红色后加水与香料慢炖。全国做法各异：北方偏咸鲜，江浙偏甜，川渝会加干辣椒。判断标准很朴素——筷子能插透，肥肉透亮不腻。',
    history:
      '红烧肉没有单一的发明者，它是「红烧」这一中式烹饪法在各地家庭里的长期沉淀。宋代已有关于猪肉烹法与会吃猪肉的记载，但把冰糖炒色、慢火收汁的做法真正定型，与明清以后糖的普及和各地酱油工艺相关。不同地域版本各成体系，不宜只归给某一地。',
    people: [],
    story:
      '红烧肉的江湖地位来自家庭厨房：每一家都认为自己家的做法最对，糖色炒到什么颜色、要不要放桂皮、收汁收到多稠，都是可以争论半小时的话题。地方版本也互相「看不起」：江浙嫌别处甜味不足，北方嫌别处太甜。这种争论本身，就是这道菜最真实的民间史。',
    scenes: ['家庭', '下饭'],
    storyType: '民间故事', flavors: ['咸甜', '酱香'], flavorProfile: '酱红油亮，肥而不腻，咸甜适口',
    cookingMethods: ['焯水', '炒糖色', '慢炖收汁'], difficulty: '家常',
    photo: '红烧肉',
    allergens: ['大豆'], ingredients: ['五花肉', '冰糖', '八角', '生抽'], imageAlt: '红烧肉 成品图', relatedDishIds: ['dongpo-pork', 'huizhou-hongshaorou', 'doumiao-jian'],
    videoSearchQuery: '红烧肉 家常做法', tags: ['家常菜', '慢炖', '五花肉', '下饭菜', '全国'], emoji: '🥩',
  },
  {
    id: 'kaoya', name: '家庭版烤鸭腿', aliases: ['烤鸭腿'], categoryId: 'nongxiang', dishType: '荤菜',
    region: '北方', spicy: 0, minutes: 70, price: 26,
    summary: '烤箱也能做出脆皮的体面感。',
    desc: '烤箱也能做出脆皮的体面感。',
    description:
      '鸭腿皮面用开水烫一遍再风干，是家庭做出脆皮的关键；抹少量盐与麦芽糖水，烤箱先用中温烤熟，再提高温度逼油上色。配荷叶饼、黄瓜条与甜面酱，把烤鸭的仪式感缩进一只鸭腿里，人均成本比点烤鸭低得多。',
    history:
      '烤鸭本身源自北方烤炙传统，北京烤鸭的做法在明清时期走向成熟并形成专门的片鸭吃法。家庭版把整只鸭换成鸭腿，是近些年随家用烤箱普及出现的简化做法，属于现代厨房实践，不是传统菜谱的固定版本。',
    people: [],
    story:
      '在家做烤鸭腿最大的敌人是水汽：皮不干，烤出来就是蒸鸭。于是有人用吹风机、有人把鸭腿挂在阳台风干一夜，厨房像小型作坊。这种「为了脆皮折腾一晚」的经验，多半来自家庭主厨之间的互相传授，也是这道家常菜最有趣的现代注脚。',
    scenes: ['家庭', '两人'],
    storyType: '现代流行说法', flavors: ['焦香', '咸鲜'], flavorProfile: '皮脆油香，肉汁保留，甜面酱压场',
    cookingMethods: ['烫皮风干', '烤箱烤制'], difficulty: '家常',
    photo: '家庭版烤鸭腿',
    allergens: ['大豆', '小麦'], ingredients: ['鸭腿', '甜面酱', '黄瓜', '荷叶饼'], imageAlt: '家庭版烤鸭腿 成品图', relatedDishIds: ['guangshi-shaoe', 'hongshaorou', 'cong-oil-noodle'],
    videoSearchQuery: '烤鸭腿 家常做法', tags: ['家常菜', '烤箱菜', '鸭肉', '北方', '待客'], emoji: '🦆',
  },
  {
    id: 'lanzhou-noodle', name: '兰州牛肉面', aliases: ['兰州拉面', '牛肉面'], categoryId: 'jiachang', dishType: '主食',
    foodTypeId: 'noodles', characterId: 'lanzhou', region: '西北', spicy: 1, minutes: 180, price: 22,
    summary: '一清二白三红四绿五黄，汤是熬出来的。',
    desc: '一清二白三红四绿五黄，汤是熬出来的。',
    description:
      '汤清、萝卜白、辣油红、蒜苗香菜绿、面条黄亮，是牛肉面的配色口诀，也是品相标准。牛骨与牛腱加姜葱慢炖数小时，撇净浮沫汤才清；面要和得筋道，拉成毛细、二细、韭叶、大宽等不同粗细，客人点单时现拉。家庭做可简化拉面，重点在汤。',
    history:
      '兰州牛肉面一般认为定型于清代以后的兰州，关于具体创制者与年代流传多个版本，不同资料互相出入，因此更稳妥的说法是：它在兰州长期演变，融合了西北面食与清真炖肉汤的传统，并在近现代成为兰州的城市名片。',
    people: [],
    story:
      '在兰州，点面要报粗细：毛细、二细、三细、韭叶、大宽各有吃客，报错了会被旁边的老兰州人多看一眼。老店讲究「汤要清、辣要香、面要现拉」，有经验的师傅一碗面从下锅到出锅不足一分钟。这套点单暗语与规矩，是兰州人日常教会外地人的，比任何广告都有效。',
    scenes: ['一人食', '早餐'],
    storyType: '现代流行说法', flavors: ['清鲜', '牛骨'], flavorProfile: '汤清味厚，辣油香而不燥，面条筋道',
    cookingMethods: ['吊牛骨汤', '和面拉面'], difficulty: '考功夫',
    photo: '兰州牛肉面',
    allergens: ['小麦'], ingredients: ['高筋面粉', '牛腱', '萝卜', '辣油'], imageAlt: '兰州牛肉面 成品图', relatedDishIds: ['yangrou-paomo', 'guoqiao-mixian', 'cong-oil-noodle'],
    videoSearchQuery: '兰州牛肉面 汤底做法', tags: ['面食', '西北', '兰州', '牛肉', '早餐'], emoji: '🍜',
  },
  {
    id: 'fanqie-noodle', name: '番茄鸡蛋面', aliases: ['西红柿鸡蛋面'], categoryId: 'jiachang', dishType: '主食',
    foodTypeId: 'noodles', region: '全国', spicy: 0, minutes: 20, price: 10,
    summary: '二十分钟的稳，比外卖可靠。',
    desc: '二十分钟的稳，比外卖可靠。',
    description:
      '番茄要炒到出沙、出汁，番茄红素和糖分一起把汤染红；鸡蛋先炒散盛出，最后回锅，蛋才嫩不老。面条另锅煮到八分熟再入汤，汤不糊、面不粘。赶时间就用这一碗收尾，是很多中国家庭的默认答案。',
    history:
      '番茄进入中国栽培是近几百年的事，番茄与鸡蛋的组合则是二十世纪以后随城市家庭灶具与食材普及而流行起来的家常搭配。它没有明确的创制者，属于现代中国家常菜的集体经验，也因此南北做法差异不大。',
    people: [],
    story:
      '这碗面是许多人的「第一道菜」：学会开火之后，长辈多半先教它。争论也一直没停——番茄要不要去皮、鸡蛋先炒还是直接卧汤、要不要加一勺糖。没有标准答案，谁在家做谁说了算，这正是它的可爱之处。',
    scenes: ['一人食', '加班快手', '早餐'],
    storyType: '现代流行说法', flavors: ['酸甜', '家常'], flavorProfile: '酸甜开胃，汤汁浓稠挂在面上',
    cookingMethods: ['炒番茄出沙', '煮面'], difficulty: '入门',
    photo: '番茄鸡蛋面',
    allergens: ['鸡蛋', '小麦'], ingredients: ['番茄', '鸡蛋', '面条', '小葱'], imageAlt: '番茄鸡蛋面 成品图', relatedDishIds: ['xihongshi-chaodan', 'cong-oil-noodle', 'lanzhou-noodle'],
    videoSearchQuery: '番茄鸡蛋面 家常做法', tags: ['面食', '快手', '家常', '番茄', '一人食'], emoji: '🍅',
  },
  {
    id: 'cong-oil-noodle', name: '葱油拌面', aliases: ['葱油面'], categoryId: 'jiachang', dishType: '主食',
    cuisineId: 'su', foodTypeId: 'noodles', region: '江浙', spicy: 0, minutes: 25, price: 9,
    summary: '一把葱，一勺油，把简单的日子拌香。',
    desc: '一把葱，一勺油，把简单的日子拌香。',
    description:
      '小葱分葱白与葱绿下锅：葱白先炸出底香，葱绿后下炸到焦黄但不苦，捞出葱段留着；葱油里加生抽、老抽与糖调成拌汁，浇在刚出锅的热面上。葱要炸透才有那股「葱香」，油温低了发苦，高了发糊，全靠听声看泡。',
    history:
      '葱油拌面是上海、江浙一带的家常面点，随着本帮面馆的普及成为城市日常。它把「葱油」这一江南厨房的基本功直接变成主食浇头，属于近现代城市饮食的产物，具体起源店家说法不一。',
    people: [],
    story:
      '老上海面馆的师傅判断葱油好坏，看的是葱段是否「起皱不焦黑」：油面细泡不断，葱香才出得来。有人还会加一小勺猪油提香，被邻居看见了要争论几句胆固醇。这样的厨房讲究，一代代在灶披间里传下来，比菜谱记得更牢。',
    scenes: ['一人食', '加班快手'],
    storyType: '现代流行说法', flavors: ['葱香', '咸鲜'], flavorProfile: '葱香冲鼻，酱汁咸鲜微甜，面滑不腻',
    cookingMethods: ['熬葱油', '拌面'], difficulty: '入门',
    photo: '葱油拌面',
    allergens: ['小麦', '大豆'], ingredients: ['小葱', '面条', '生抽', '猪油'], imageAlt: '葱油拌面 成品图', relatedDishIds: ['xiaolongbao', 'yanduxian', 'fanqie-noodle'],
    videoSearchQuery: '葱油拌面 家常做法', tags: ['面食', '江浙', '上海', '快手', '葱油'], emoji: '🍝',
  },
  {
    id: 'xiaolongbao', name: '小笼包', aliases: ['小笼馒头', '汤包'], categoryId: 'xianxiang', dishType: '点心',
    cuisineId: 'su', characterId: 'xiaolongbao', region: '江浙', spicy: 0, minutes: 90, price: 24,
    summary: '先开窗，后喝汤，最后一口吃掉。',
    desc: '先开窗，后喝汤，最后一口吃掉。',
    description:
      '皮要薄到透光却夹得起来，馅里掺猪皮冻，蒸化后变成一包汤。猪肉馅加姜水顺一个方向搅上劲，包时收口要小而匀，蒸六到八分钟即可。吃法有讲究：先咬开小口吸汤，再蘸姜丝香醋，一口入嘴，急不得。',
    history:
      '小笼包在江南发展出多个流派：常州、无锡、南京与上海南翔各有自己的做法与口味偏好，甜咸比例、皮薄程度都不一样。它属于近现代城市点心体系，相互之间的先后与影响存在不同说法，难以只归一家。',
    people: [],
    story:
      '「轻轻提、慢慢移、先开窗、后喝汤」是江南人吃小笼的口诀，也是对外地人的保护——第一口直接咬下去，多半会被滚烫的汤汁烫到。老店里的师傅会提醒客人别急着蘸醋，先尝原味，因为馅的鲜与汤的清才是评判标准。这些规矩由吃客代代相传，成了点心的一部分。',
    scenes: ['早餐', '两人'],
    storyType: '民间故事', flavors: ['鲜', '汤汁'], flavorProfile: '皮薄汁多，肉馅鲜甜，姜醋提香',
    cookingMethods: ['和面擀皮', '猪肉皮冻制馅', '蒸制'], difficulty: '考功夫',
    photo: '小笼包',
    allergens: ['小麦', '大豆'], ingredients: ['中筋面粉', '猪肉馅', '皮冻', '姜'], imageAlt: '小笼包 成品图', relatedDishIds: ['cong-oil-noodle', 'songshu-guiyu', 'yanshuiya'],
    videoSearchQuery: '小笼包 家常做法', tags: ['点心', '江浙', '汤包', '早餐', '面点'], emoji: '🥟',
  },
  {
    id: 'qingzheng-luyu', name: '清蒸鲈鱼', aliases: ['清蒸鱼', '蒸鲈鱼'], categoryId: 'xianxiang', dishType: '荤菜',
    cuisineId: 'yue', region: '粤港', spicy: 0, minutes: 30, price: 45,
    summary: '鱼眼一凸就起锅，多一分钟都算失礼。',
    desc: '鱼眼一凸就起锅，多一分钟都算失礼。',
    description:
      '鲈鱼处理干净后抹薄盐、铺姜葱，水开后大火蒸。判断熟度看鱼眼是否凸起、鱼鳍是否立起、筷子能否轻松插入脊背；倒掉腥水，淋蒸鱼豉油，泼一勺热油激香葱丝。全程不重调味，吃的就是这一口本味。',
    history:
      '清蒸是粤菜的核心技法之一，与沿海渔业「吃鲜」的传统直接相关：鱼够新鲜，就不需要用重味去压。豉油与热油的搭配在广府家庭与酒楼长期沿用，属于地方烹饪经验的积累，而非某一位厨师的发明。',
    people: [],
    story:
      '广东人判断一桌酒席是否讲究，常看蒸鱼的火候：上桌时鱼鳍是否挺立、鱼肉是否一夹成瓣。有人专门嘱咐服务员「鱼蒸熟了立刻上」，因为在后厨多放两分钟，鱼肉就老了。这套对「两分钟」的较真，是广府饮食文化里最被外地人记住的部分。',
    scenes: ['家庭', '待客'],
    storyType: '民间故事', flavors: ['清鲜', '本味'], flavorProfile: '清鲜嫩滑，豉油咸香，油香只在尾调',
    cookingMethods: ['大火蒸', '泼热油'], difficulty: '家常',
    photo: '清蒸鲈鱼',
    allergens: ['鱼类'], ingredients: ['鲈鱼', '姜', '葱', '蒸鱼豉油'], imageAlt: '清蒸鲈鱼 成品图', relatedDishIds: ['baiqieji', 'guangshi-shaoe', 'yanduxian'],
    videoSearchQuery: '清蒸鲈鱼 家常做法', tags: ['粤菜', '粤港', '清蒸', '鱼', '待客菜'], emoji: '🐟',
  },
  {
    id: 'baiqieji', name: '白切鸡', aliases: ['白斩鸡'], categoryId: 'xianxiang', dishType: '凉菜',
    cuisineId: 'yue', region: '粤港', spicy: 0, minutes: 45, price: 36,
    summary: '鸡要有鸡味，这是最低也最高的要求。',
    desc: '鸡要有鸡味，这是最低也最高的要求。',
    description:
      '整鸡浸到水将沸未沸的状态，「三提三放」让鸡腔内外受热均匀，再关火浸熟，出锅立刻过冰水收紧鸡皮。斩件后皮爽肉滑、骨里还带一点红，蘸姜葱蓉或沙姜豉油。火候过头肉就柴，是这道菜唯一不能犯的错。',
    history:
      '白切鸡是广府宴席与家常共用的菜式，与粤地「尝本味」的饮食观一脉相承。它的具体定型年代说法不一，但「浸鸡」的技法与配姜葱蓉的吃法在珠三角长期流传，属于地方饮食传统而非单一发明。',
    people: [],
    story:
      '广府人称这道菜是「无鸡不成宴」的主角，也是检验厨艺的标尺：鸡皮要爽脆、肉要有汁、骨髓带红才是「刚刚熟」。有人专门挑鸡腿部位；有人认定「鸡胸柴了就是失败」。这些争论在饭桌上从不缺席，也让白切鸡成了最见功力的家常菜。',
    scenes: ['家庭', '待客'],
    storyType: '民间故事', flavors: ['清鲜', '姜葱'], flavorProfile: '皮爽肉滑，本味清鲜，姜葱蓉提香',
    cookingMethods: ['浸熟', '过冰水', '斩件'], difficulty: '家常',
    photo: '白切鸡',
    allergens: [], ingredients: ['三黄鸡', '姜', '葱', '花生油'], imageAlt: '白切鸡 成品图', relatedDishIds: ['qingzheng-luyu', 'guangshi-shaoe', 'laohuo-liangtang'],
    videoSearchQuery: '白切鸡 家常做法', tags: ['粤菜', '粤港', '凉菜', '鸡', '宴客菜'], emoji: '🍗',
  },
  {
    id: 'longjing-shrimp', name: '龙井虾仁', aliases: ['龙井炒虾仁'], categoryId: 'qingshuang', dishType: '荤菜',
    cuisineId: 'zhe', characterId: 'jiangnan', region: '浙江杭州', spicy: 0, minutes: 30, price: 58,
    summary: '茶香托着虾的清甜，江南的体面。',
    desc: '茶香托着虾的清甜，江南的体面。',
    description:
      '河虾仁挤干水分，用蛋清淀粉上浆，温油滑散到刚变色即捞出；龙井茶先用温水泡开，茶叶与少量茶汤入锅，与虾仁快速合炒，勾薄芡出锅。整道菜不靠酱油上色，清亮见底，最忌把茶叶炒出苦味。',
    history:
      '龙井虾仁常被与杭州的茶文化联系在一起，属于二十世纪以来杭帮名菜体系中的代表。它把本地名茶与河鲜结合，体现「不时不食、清鲜为本」的浙菜取向；具体首创店家与年代有不同说法，宜作为杭帮菜的现代经典看待。',
    people: [],
    story:
      '关于这道菜，流传着「好茶泡开只用第二泡」的说法：第一泡洗茶去尘，第二泡香气最正，第三泡就淡了。茶叶入锅更要快，慢一秒就发苦，把整盘虾的清爽毁掉。这类说法多见于杭州餐馆师傅的口授，没有典籍出处，却是这道菜的关键经验。',
    scenes: ['待客', '两人'],
    storyType: '现代流行说法', flavors: ['清鲜', '茶香'], flavorProfile: '清鲜弹嫩，茶香隐约，芡薄不腻',
    cookingMethods: ['上浆滑油', '快炒', '薄芡'], difficulty: '进阶',
    photo: '龙井虾仁',
    allergens: ['虾', '鸡蛋'], ingredients: ['河虾仁', '龙井茶', '蛋清'], imageAlt: '龙井虾仁 成品图', relatedDishIds: ['xihu-cuyu', 'dongpo-pork', 'jiaohuaji'],
    videoSearchQuery: '龙井虾仁 家常做法', tags: ['浙菜', '杭州', '清鲜', '虾', '茶入菜'], emoji: '🍤',
  },
  {
    id: 'yanduxian', name: '腌笃鲜', aliases: ['腌笃鲜汤'], categoryId: 'qingshuang', dishType: '汤羹',
    cuisineId: 'su', region: '江浙', spicy: 0, minutes: 100, price: 40,
    summary: '春天煮在锅里，「腌」与「鲜」都在汤里。',
    desc: '春天煮在锅里，就是这个词的意思。',
    description:
      '「腌」指咸肉，「鲜」指鲜五花，「笃」是吴语里小火慢煮的拟声。咸肉与鲜肉同煮，春笋吸油提鲜，汤色由清转乳白；讲究的人家添一小块火腿或几只百叶结。盐要最后尝了再放，因为咸肉已经在汤里调味。',
    history:
      '常见说法认为腌笃鲜来自江南人家对冬腌肉的利用：开春把腌了一冬的咸肉取出，与鲜肉、刚上市的春笋同煮。它长期流行于上海、苏州、无锡一带，没有确切的最早记载，属于「按时令吃饭」的家常传统。',
    people: [],
    story:
      '吴语里的「笃」既是声音也是耐心——汤在锅里小火笃笃地滚，屋里的人就开始等吃饭。有人家只放咸肉、鲜肉与笋三样，认为多一样就杂；也有人非加百叶结不可，说那才是吸汤的主角。版本不同，规矩却一样：火不能大，汤不能浑。',
    scenes: ['家庭', '两人'],
    storyType: '民间故事', flavors: ['咸鲜', '汤'], flavorProfile: '汤色奶白，咸鲜清润，笋香回甘',
    cookingMethods: ['焯水去咸', '小火慢笃'], difficulty: '家常',
    photo: '腌笃鲜',
    allergens: [], ingredients: ['咸肉', '鲜五花', '春笋'], imageAlt: '腌笃鲜 成品图', relatedDishIds: ['yanshuiya', 'wensi-doufu', 'cong-oil-noodle'],
    videoSearchQuery: '腌笃鲜 家常做法', tags: ['苏菜', '江浙', '汤', '春笋', '时令'], emoji: '🍲',
  },
  {
    id: 'mapo-qiezi', name: '鱼香茄子', aliases: ['鱼香茄条'], categoryId: 'mala', dishType: '素菜',
    cuisineId: 'chuan', region: '川渝', spicy: 2, minutes: 30, price: 16,
    summary: '没有鱼，但有一整套鱼香的逻辑。',
    desc: '没有鱼，但有一整套鱼香的逻辑。',
    description:
      '鱼香是川菜的复合味型：泡椒的辣、姜蒜的辛、糖醋的酸甜与咸鲜同时到位，茄子把汁吸住。茄子先干煸或过油去掉水汽，才不至于下锅吸走全部调料；家庭想少油，可以先蒸软再烧。成菜红亮油润，配饭最稳。',
    history:
      '鱼香味型来自川菜「用烧鱼的调料做别的菜」的思路，名字里的「鱼」指调味逻辑而非食材。它和鱼香肉丝同属近现代川菜体系，具体定型年代有不同说法，普遍认为是在川渝餐馆中逐步固定的家常味型。',
    people: [],
    story:
      '外地客人最爱问：鱼香茄子里的鱼在哪？川菜师傅的回答是——鱼香来自泡椒、姜蒜与糖醋调出的那套组合，是从烧鱼的做法里借来的名字。于是「没有鱼」反而成了招牌梗，也成了讲清川菜复合味型最好的例子。',
    scenes: ['一人食', '下饭'],
    storyType: '现代流行说法', flavors: ['鱼香', '酸甜微辣'], flavorProfile: '鱼香复合，酸甜微辣，茄子软糯吸汁',
    cookingMethods: ['干煸或过油', '烧制'], difficulty: '家常',
    photo: '鱼香茄子',
    allergens: ['大豆'], ingredients: ['长茄', '泡椒', '蒜', '糖醋'], imageAlt: '鱼香茄子 成品图', relatedDishIds: ['yuxiangrousi', 'mapo-tofu', 'hongshaorou'],
    videoSearchQuery: '鱼香茄子 家常做法', tags: ['川菜', '鱼香', '茄子', '下饭菜', '素菜'], emoji: '🍆',
  },
  {
    id: 'choudoufu', name: '臭豆腐', aliases: ['长沙臭豆腐', '油炸臭豆腐'], categoryId: 'fajiao', dishType: '小吃',
    cuisineId: 'xiang', foodTypeId: 'street-food', characterId: 'choudoufu', region: '湘赣', spicy: 2,
    minutes: 30, price: 12,
    summary: '闻三秒，你会改主意。',
    desc: '闻三秒，你会改主意。',
    description:
      '豆腐经过发酵卤水浸泡，蛋白质被分解出鲜味物质，气味冲、入口鲜，油炸后外壳起泡酥脆、里面依旧嫩；配剁椒、蒜水与香菜。卤水是各家秘方，也决定了味道的走向。第一次吃建议挑炸透的摊位，脆壳减压。',
    history:
      '发酵豆制品在中国分布很广，长沙、绍兴、徽州等地各有自己的臭豆腐传统与卤水配方。它们多为民间作坊世代相传，缺少统一的发明时间与人物，更接近地方饮食文化的自然产物，具体起源说法不一。',
    people: [],
    story:
      '长沙街头讲究「现炸现吃」：豆腐下锅时气味最盛，出锅后趁热扎开淋汁，脆壳一响，臭味反倒变成香。摊主会问你「要几勺辣」，老吃客则盯着油温和卤水颜色。关于它是不是「脚气臭」，是外地人最常开的玩笑，也是长沙人最爱反驳的话题。',
    scenes: ['深夜', '一人食'],
    storyType: '民间故事', flavors: ['发酵', '香辣'], flavorProfile: '闻臭吃香，外壳酥脆，内里软嫩',
    cookingMethods: ['发酵腌制', '油炸', '浇汁'], difficulty: '家常',
    photo: '臭豆腐',
    allergens: ['大豆'], ingredients: ['臭豆腐', '剁椒', '蒜水'], imageAlt: '长沙臭豆腐 成品图', relatedDishIds: ['maoshi-hongshaorou', 'suancai-fen', 'kao-qiezi'],
    videoSearchQuery: '臭豆腐 家常做法', tags: ['湘菜', '街头小吃', '长沙', '发酵', '夜宵'], emoji: '🟫',
  },
  {
    id: 'suancai-fen', name: '酸辣粉', aliases: ['重庆酸辣粉'], categoryId: 'suanxiang', dishType: '小吃',
    cuisineId: 'chuan', foodTypeId: 'street-food', region: '川渝', spicy: 2, minutes: 25, price: 12,
    summary: '一口酸辣，把困意赶走。',
    desc: '一口酸辣，把困意赶走。',
    description:
      '红薯粉要先用温水泡软再煮，粉才滑而不烂；碗底放醋、辣椒油、花椒粉与酥黄豆或花生碎，冲入热汤，粉一入碗就吸味。酸辣粉的酸来自陈醋、辣来自油辣子，两者比例是各家招牌，配一把香菜与榨菜末才完整。',
    history:
      '酸辣粉是川渝一带的街头小吃，常见说法与码头、挑担摊贩的营生有关：红薯粉便宜、耐煮，酸辣调味开胃，适合摆摊现煮。它属于近现代市井饮食，具体起源说法不一，宜作为川渝小吃传统看待。',
    people: [],
    story:
      '老摊主判断酸辣粉好坏，看的是粉在碗里「挂不挂汁」：红薯粉表面不滑透，才带得住油辣子与醋。有顾客专点「多加酥黄豆」，说那是这碗粉的脆点。热气里一碗下肚，酸味先醒神、辣味后上头，这是很多人对重庆最早的味道记忆之一。',
    scenes: ['一人食', '深夜', '加班快手'],
    storyType: '现代流行说法', flavors: ['酸辣', '麻'], flavorProfile: '酸辣冲鼻，粉条滑韧，麻味收尾',
    cookingMethods: ['泡粉', '煮粉', '汤底调味'], difficulty: '入门',
    photo: '酸辣粉',
    allergens: ['花生', '大豆'], ingredients: ['红薯粉', '醋', '辣椒油', '花生碎'], imageAlt: '酸辣粉 成品图', relatedDishIds: ['guoqiao-mixian', 'choudoufu', 'huoguo'],
    videoSearchQuery: '酸辣粉 家常做法', tags: ['川菜', '街头小吃', '川渝', '酸辣', '夜宵'], emoji: '🍲',
  },
  {
    id: 'guoqiao-mixian', name: '过桥米线', aliases: ['云南过桥米线'], categoryId: 'xianxiang', dishType: '主食',
    foodTypeId: 'noodles', region: '云贵', spicy: 1, minutes: 50, price: 28,
    summary: '汤面上那层油，是给食材留的时间。',
    desc: '汤面上那层油，是给食材留的时间。',
    description:
      '滚烫的鸡汤上覆一层鸡油保温，端上桌时看不见热气但温度极高；生肉片、鹌鹑蛋、蔬菜按「先肉后菜再米线」的顺序下入，用汤的余温烫熟。米线要另锅煮好沥干，入汤后立刻吃，久了会软。',
    history:
      '过桥米线流传最广的说法源自云南蒙自一带：书生在岛上读书，妻子送饭过桥，汤被油封住不容易凉，肉片到地方再烫就熟。此说属于地方传说，故事细节版本众多，缺少确切史料；但「油封保温、现烫现吃」的吃法确实是这套吃法的真本事。',
    people: [],
    story:
      '传说里那位妻子发现汤面上浮油能保温，于是把生肉切薄、米线分装，走到地方再下锅，从此送饭不用赶时间。当地人把这个故事讲给每一个第一次吃过桥米线的人听，也多会叮嘱：先放肉片，别急着搅，不然汤就不够烫了。',
    scenes: ['一人食', '两人'],
    storyType: '地方传说', flavors: ['鲜', '汤'], flavorProfile: '汤鲜油润，米线滑爽，食材本味分明',
    cookingMethods: ['吊鸡汤', '油封保温', '现烫'], difficulty: '家常',
    photo: '过桥米线',
    allergens: ['鸡蛋'], ingredients: ['米线', '鸡汤', '里脊片', '鹌鹑蛋'], imageAlt: '过桥米线 成品图', relatedDishIds: ['lanzhou-noodle', 'yanduxian', 'fujian-yuwan'],
    videoSearchQuery: '过桥米线 家常做法', tags: ['主食', '云南', '汤粉', '米线', '云贵'], emoji: '🍲',
  },
  {
    id: 'lazhi-chaofan', name: '腊味煲仔饭', aliases: ['煲仔饭'], categoryId: 'nongxiang', dishType: '主食',
    cuisineId: 'yue', region: '粤港', spicy: 0, minutes: 45, price: 26,
    summary: '为了那层锅巴，值得等四十分钟。',
    desc: '为了那层锅巴，值得等四十分钟。',
    description:
      '丝苗米淘净后加少量油，砂锅烧到水收干，铺上腊肠、腊肉与姜丝，再沿锅边淋一圈油，让底部结出金黄锅巴；出锅前淋豉油、撒葱花。腊味的油渗进饭里，锅巴一铲就是整锅的高潮，青菜要另焯保持翠绿。',
    history:
      '煲仔饭是广府一带的砂锅饭传统，腊味版本在秋冬尤其常见，与广东腊味制作的季节性密切相关。它在茶楼与街边煲仔饭店长期并存，具体起源说法不一，属于地方饮食的日常体系。',
    people: [],
    story:
      '老广吃煲仔饭有两派：一派先吃腊味，把锅巴留到最后；另一派一上桌先铲锅巴，说凉了就韧。点单时会特意交代「锅巴要厚一点」，师傅便多沿锅边淋一圈油。关于谁家锅巴最香，街坊能争一整条街。',
    scenes: ['一人食', '家庭'],
    storyType: '民间故事', flavors: ['腊香', '锅巴'], flavorProfile: '腊香入饭，豉油咸鲜，锅巴焦脆',
    cookingMethods: ['砂锅焖饭', '结锅巴', '淋豉油'], difficulty: '家常',
    photo: '腊味煲仔饭',
    allergens: ['大豆'], ingredients: ['丝苗米', '腊肠', '青菜', '豉油'], imageAlt: '腊味煲仔饭 成品图', relatedDishIds: ['baiqieji', 'laohuo-liangtang', 'guangshi-shaoe'],
    videoSearchQuery: '腊味煲仔饭 家常做法', tags: ['粤菜', '粤港', '砂锅', '腊味', '主食'], emoji: '🍚',
  },
  {
    id: 'yangrou-chuan', name: '孜然羊肉串', aliases: ['羊肉串', '烤羊肉串'], categoryId: 'nongxiang', dishType: '小吃',
    foodTypeId: 'bbq', characterId: 'shaokao', region: '西北', spicy: 2, minutes: 35, price: 30,
    summary: '炭火一红，夜里就有了去处。',
    desc: '炭火一红，夜里就有了去处。',
    description:
      '羊肉选带一点肥的腿肉或肩肉，肥瘦相间穿串，烤到表面微焦再撒孜然与辣椒面，盐要后放以免出水。炭火与铁签最出香，家用烤箱或平底锅也能做，只是少了那点烟火气。洋葱腌制可以去膻提甜。',
    history:
      '烤肉串在西北与中亚饮食交流中长期存在，新疆羊肉串随夜市与烧烤摊在全国普及，成为最常见的街头烧烤形态之一。它的传播与近几十年城市夜市文化直接相关，具体年代说法不一。',
    people: [],
    story:
      '烧烤摊上最有仪式感的一步是撒孜然：火候到了，师傅抓一把从高处撒下，香味跟着烟扑过来，排队的人也正好咽口水。有人坚持「两肥三瘦」，有人只吃瘦肉；争论从摊前一直延续到第二天。',
    scenes: ['朋友聚会', '深夜', '下酒'],
    storyType: '现代流行说法', flavors: ['孜然', '焦香'], flavorProfile: '孜然冲香，外焦里嫩，咸辣适口',
    cookingMethods: ['腌制', '炭火烤制'], difficulty: '入门',
    photo: '孜然羊肉串',
    allergens: [], ingredients: ['羊腿肉', '孜然', '辣椒面', '洋葱'], imageAlt: '孜然羊肉串 成品图', relatedDishIds: ['kao-qiezi', 'huoguo', 'yangrou-paomo'],
    videoSearchQuery: '孜然羊肉串 家常做法', tags: ['烧烤', '西北', '羊肉', '孜然', '夜宵'], emoji: '🍢',
  },
  {
    id: 'kao-qiezi', name: '蒜蓉烤茄子', aliases: ['烤茄子'], categoryId: 'nongxiang', dishType: '素菜',
    foodTypeId: 'bbq', region: '东北', spicy: 1, minutes: 30, price: 14,
    summary: '烧烤摊上的素食担当，从不将就。',
    desc: '烧烤摊上的素食担当，从不将就。',
    description:
      '长茄整只烤到外皮起皱、内里绵软，剖开摊平，铺上炒过的蒜蓉与小米辣，再回炉烤到蒜香渗进茄肉，撒葱花与孜然。茄子本身几乎全是水，先烤干再加料，味道才挂得住。',
    history:
      '烤茄子是烧烤摊上的常客，与东北及全国烧烤的普及同步。它属于近几十年街头烧烤的常见品种，缺少明确起源，更多是摊主与食客共同「点」出来的招牌。',
    people: [],
    story:
      '烧烤摊的老吃客点茄子会加一句「蒜多、烤干点」。茄子太水就像泡在汁里，师傅于是学会先烤软再摊平，最后把蒜蓉压进茄肉。这道素食在肉串之间出现，反而常常最先被抢光。蒜蓉要现剁现铺，放久了会发苦；茄子在炭火上先烤软、再剖开压平，蒜汁才不会流掉。',
    scenes: ['朋友聚会', '深夜'],
    storyType: '现代流行说法', flavors: ['蒜香', '咸鲜'], flavorProfile: '蒜香浓郁，茄肉绵软，孜然提味',
    cookingMethods: ['整只烤制', '铺料回烤'], difficulty: '入门',
    photo: '蒜蓉烤茄子',
    allergens: ['大豆'], ingredients: ['长茄', '蒜蓉', '小米辣'], imageAlt: '蒜蓉烤茄子 成品图', relatedDishIds: ['yangrou-chuan', 'doumiao-jian', 'huoguo'],
    videoSearchQuery: '蒜蓉烤茄子 家常做法', tags: ['烧烤', '东北', '蒜香', '茄子', '素菜'], emoji: '🍆',
  },
  {
    id: 'tangyuan', name: '黑芝麻汤圆', aliases: ['宁波汤圆', '汤圆'], categoryId: 'tianrun', dishType: '点心',
    cuisineId: 'zhe', foodTypeId: 'dessert', characterId: 'tangyuan', region: '浙江宁波', spicy: 0,
    minutes: 30, price: 12,
    summary: '煮到浮起来，情绪也浮起来了。',
    desc: '煮到浮起来，情绪也浮起来了。',
    description:
      '糯米粉用温水烫面，包入黑芝麻、猪油与糖调成的馅，搓圆后下锅煮到浮起再点两次凉水。判断熟度看外皮是否透亮、轻按是否回弹。馅里的猪油是流心的关键，换成黄油或植物油口感会略硬。',
    history:
      '汤圆是元宵节前后的传统糯米点心，宁波一带以黑芝麻猪油馅出名。宋代文献中已有类似「浮圆子」的记载，此后在江南发展出多种做法与口味。把汤圆与元宵节绑定是长期民俗，具体成型过程各地记载不一。',
    people: [],
    story:
      '宁波人评判汤圆看三点：皮薄不破、馅流不烫嘴、汤水清甜不浑。老手包馅时会留一点空气，让它在锅里翻身；吃客则练就「先咬小口」的本事。正月里家家都煮，年年都要比一比谁家的黑芝麻磨得更细。',
    scenes: ['一人食', '深夜', '家庭'],
    storyType: '历史记载', flavors: ['甜', '糯'], flavorProfile: '皮糯馅香，芝麻流心，甜而不腻',
    cookingMethods: ['烫面制皮', '包馅', '水煮'], difficulty: '家常',
    photo: '汤圆',
    allergens: ['芝麻'], ingredients: ['糯米粉', '黑芝麻', '猪油', '糖'], imageAlt: '黑芝麻汤圆 成品图', relatedDishIds: ['shuangpinai', 'hongdou-shayong', 'taiji-yuni'],
    videoSearchQuery: '黑芝麻汤圆 家常做法', tags: ['浙菜', '宁波', '点心', '甜品', '元宵节'], emoji: '🍡',
  },
  {
    id: 'shuangpinai', name: '双皮奶', aliases: ['顺德双皮奶'], categoryId: 'tianrun', dishType: '点心',
    cuisineId: 'yue', foodTypeId: 'dessert', characterId: 'tianpin', region: '粤港', spicy: 0,
    minutes: 40, price: 15,
    summary: '两层奶皮，是耐心结出来的。',
    desc: '两层奶皮，是耐心结出来的。',
    description:
      '水牛奶煮沸后静置结出第一层奶皮，倒出奶液与蛋清、糖混合再倒回，让第一层皮浮回表面，蒸后结出第二层。全程靠静置与小火，蒸汽太猛就起蜂窝。成品细滑如镜，奶香干净，凉吃更清。',
    history:
      '双皮奶常被认为是广东顺德一带的地方甜品，靠水牛奶脂肪含量高、容易结皮的特点形成；也有说法把它与当地牧业和糖水铺的发展联系起来。具体首创时间与店家说法不一，宜作为广府甜品的代表看待。',
    people: [],
    story:
      '顺德师傅说这道甜品的门槛在「等」：等奶皮结、等蛋清与奶融合、等蒸锅的气匀。有人用筷子挑皮，有人用勺子沿边划开，动作轻一点皮才不破。糖水铺里它常与红豆沙搭配，一冷一热，成了岭南人的下午。',
    scenes: ['一人食', '两人', '深夜'],
    storyType: '民间故事', flavors: ['奶香', '甜'], flavorProfile: '奶香清甜，口感细滑，两层皮分明',
    cookingMethods: ['煮奶结皮', '蛋清蒸制'], difficulty: '进阶',
    photo: '双皮奶',
    allergens: ['牛奶', '鸡蛋'], ingredients: ['水牛奶', '蛋清', '糖'], imageAlt: '双皮奶 成品图', relatedDishIds: ['hongdou-shayong', 'tangyuan', 'baiqieji'],
    videoSearchQuery: '双皮奶 家常做法', tags: ['粤菜', '甜品', '顺德', '奶香', '下午茶'], emoji: '🍮',
  },
  {
    id: 'hongdou-shayong', name: '红豆沙', aliases: ['广式红豆沙'], categoryId: 'tianrun', dishType: '点心',
    cuisineId: 'yue', foodTypeId: 'dessert', region: '粤港', spicy: 0, minutes: 60, price: 10,
    summary: '甜得克制，才哄得住人。',
    desc: '甜得克制，才哄得住人。',
    description:
      '红豆先泡后煮，煮到开花再压沙，加陈皮丝与冰糖小火收稠，讲究的店家会放一小块莲子或百合。广式红豆沙追求「起沙」——豆肉细密、汤不浑不稀，甜味收在豆香之后，不靠糖量堆。',
    history:
      '糖水是广府饮食的独立品类，红豆沙是其中最普遍的一款，常与陈皮配伍。它随糖水铺的兴盛成为城市日常，具体起源与配方流派各地不同，缺少单一发明者。',
    people: [],
    story:
      '广东人煮红豆沙要看季节：夏天稀一点解暑，冬天稠一点暖胃；陈皮放多少，则看家里长辈的口味。有人把「起沙」当手艺考核，煮不沙就再压一遍。糖水铺里一碗热红豆沙配双皮奶，是最经典的搭配。',
    scenes: ['一人食', '深夜'],
    storyType: '民间故事', flavors: ['甜', '豆香'], flavorProfile: '豆香绵沙，甜度克制，陈皮回香',
    cookingMethods: ['浸泡', '煮制压沙', '收稠'], difficulty: '家常',
    photo: '红豆沙',
    allergens: [], ingredients: ['红豆', '陈皮', '冰糖'], imageAlt: '广式红豆沙 成品图', relatedDishIds: ['shuangpinai', 'tangyuan', 'baiqieji'],
    videoSearchQuery: '红豆沙 家常做法', tags: ['粤菜', '甜品', '糖水', '红豆', '陈皮'], emoji: '🥣',
  },
  {
    id: 'xihongshi-chaodan', name: '番茄炒蛋', aliases: ['西红柿炒鸡蛋'], categoryId: 'jiachang', dishType: '荤菜',
    region: '全国', spicy: 0, minutes: 15, price: 8,
    summary: '十五分钟，把一天收个尾。',
    desc: '十五分钟，把一天收个尾。',
    description:
      '鸡蛋加一点水或料酒打散，下锅炒到刚凝固就盛出；番茄炒到出沙再回锅，糖与盐各半勺找平衡，收汁留一点汤汁拌饭。要点只有两个：蛋别炒老，番茄必须炒透。',
    history:
      '番茄在现代中国普及之后，番茄与鸡蛋成为最普遍的家常组合之一。它没有典籍意义上的起源，是二十世纪以来城市与乡村厨房共同形成的国民菜，不同地区只在甜咸比例上有分歧。',
    people: [],
    story:
      '这道菜的江湖纷争比多数名菜都激烈：放糖还是不放糖、番茄要不要去皮、蛋先炒还是直接卧进去。南北家庭各有立场，谁都能说出一套理由。它的可贵之处也在这里——怎么做都能吃，且人人都觉得自己家的版本最对。',
    scenes: ['一人食', '加班快手', '家庭'],
    storyType: '现代流行说法', flavors: ['酸甜', '家常'], flavorProfile: '酸甜适口，蛋香嫩，汤汁拌饭最好',
    cookingMethods: ['炒蛋', '炒番茄出沙'], difficulty: '入门',
    photo: '番茄炒蛋',
    allergens: ['鸡蛋'], ingredients: ['番茄', '鸡蛋', '糖', '葱'], imageAlt: '番茄炒蛋 成品图', relatedDishIds: ['fanqie-noodle', 'doumiao-jian', 'hongshaorou'],
    videoSearchQuery: '番茄炒蛋 家常做法', tags: ['家常菜', '快手', '鸡蛋', '番茄', '下饭'], emoji: '🍳',
  },
  {
    id: 'doumiao-jian', name: '蒜蓉豆苗', aliases: ['清炒豆苗'], categoryId: 'qingshuang', dishType: '素菜',
    cuisineId: 'yue', region: '粤港', spicy: 0, minutes: 12, price: 10,
    summary: '三分钟出锅，脆才是礼貌。',
    desc: '三分钟出锅，脆才是礼貌。',
    description:
      '豆苗洗净沥干，锅要够热、油要够滑，蒜蓉先爆香再下豆苗，全程大火快速翻炒，断生即出锅，只加盐与一点点糖。炒久了发黄出水，就没有那股清香。广府餐桌上它是最常见的青菜，也是检验「镬气」的功课。',
    history:
      '时令青菜在粤菜里地位极高，讲究「一餐一青」。蒜蓉炒豆苗是广府家庭与酒楼的常规做法，属于日常饮食体系，没有单一起源，靠的是一代代厨人对火候的共识。',
    people: [],
    story:
      '粤菜师傅说炒青菜要「听得见声音」：豆苗下锅那一声脆响，说明锅够热；声音小了，菜就开始出水。上桌要绿、要脆、要带蒜香，这三点做不到，家里人是要出声的——「今晚个菜炒过笼啦」。',
    scenes: ['一人食', '加班快手', '减脂'],
    storyType: '民间故事', flavors: ['清鲜', '蒜香'], flavorProfile: '青翠爽脆，蒜香清鲜，不油不腻',
    cookingMethods: ['大火快炒'], difficulty: '入门',
    photo: '蒜蓉豆苗',
    allergens: [], ingredients: ['豆苗', '蒜', '盐'], imageAlt: '蒜蓉豆苗 成品图', relatedDishIds: ['baiqieji', 'qingzheng-luyu', 'kao-qiezi'],
    videoSearchQuery: '蒜蓉豆苗 家常做法', tags: ['粤菜', '青菜', '快手', '蒜香', '清淡'], emoji: '🥬',
  },
  {
    id: 'jixiongrou-shala', name: '柠檬鸡胸沙拉', aliases: ['鸡胸沙拉'], categoryId: 'qingshuang', dishType: '凉菜',
    region: '全国', spicy: 0, minutes: 20, price: 20,
    summary: '不挨饿的轻食，才算合格。',
    desc: '不挨饿的轻食，才算合格。',
    description:
      '鸡胸用盐、黑胡椒与少量橄榄油腌制，煎到两面微焦再静置切片，肉汁才留得住；生菜、番茄、柠檬与橄榄油调成清爽油醋汁，盐和酸度平衡后拌开。想更顶饿可以加煮蛋、玉米或全麦面包。',
    history:
      '沙拉不是中餐传统，是近几十年随城市健身与轻食文化进入日常的现代做法。柠檬鸡胸沙拉属于这类新式家常，配方因人与健身房食谱而异，没有传统意义上的起源。',
    people: [],
    story:
      '轻食最大的敌人是难吃：水煮鸡胸嚼起来像纸，于是有人研究出先腌后煎、静置切片，再靠柠檬与黑胡椒提味。健身群里互相分享的「不柴配方」，是这道菜真正的流传方式。真正好用的经验是：肉厚的地方片薄一点、腌够时间，煎完静置两分钟再切，汁水就不会流走。',
    scenes: ['一人食', '减脂', '加班快手'],
    storyType: '现代流行说法', flavors: ['清爽', '酸'], flavorProfile: '清爽微酸，鸡胸嫩而不柴',
    cookingMethods: ['腌制', '煎制', '凉拌'], difficulty: '入门',
    photo: '柠檬鸡胸沙拉',
    allergens: [], ingredients: ['鸡胸', '生菜', '柠檬', '橄榄油'], imageAlt: '柠檬鸡胸沙拉 成品图', relatedDishIds: ['doumiao-jian', 'fanqie-noodle', 'xihongshi-chaodan'],
    videoSearchQuery: '柠檬鸡胸沙拉 做法', tags: ['轻食', '减脂', '沙拉', '鸡胸', '低油'], emoji: '🥗',
  },
  {
    id: 'yangrou-paomo', name: '羊肉泡馍', aliases: ['牛羊肉泡馍', '泡馍'], categoryId: 'jiachang', dishType: '主食',
    foodTypeId: 'street-food', region: '西北', spicy: 1, minutes: 120, price: 32,
    summary: '掰馍的手速，决定汤的耐心。',
    desc: '掰馍的手速，决定汤的耐心。',
    description:
      '饦饦馍要手工掰成黄豆大小，掰得匀，煮出来才不会有的糊有的硬；羊肉汤用羊骨与羊肉长时间熬，撇净浮沫后清亮不膻。煮馍时加粉丝、羊肉片，出锅撒香菜，配糖蒜与辣酱。',
    history:
      '羊肉泡馍是西安一带的标志性吃食，与西北牛羊肉汤食传统、穆斯林饮食文化以及古都城市生活密切相关。关于它的源流有从古代羊羹到近代小店的多种说法，具体脉络存在争议，宜作为地方传统看待。',
    people: [],
    story:
      '西安人把「掰馍」当正事：机器切的馍不算数，要自己动手掰成小粒，边掰边聊天，一碗馍掰二十分钟很正常。老店的师傅看你掰的大小，就知道该煮多久。有人开玩笑说，泡馍的味道一半在汤里，一半在你手上。',
    scenes: ['一人食', '家庭'],
    storyType: '地方传说', flavors: ['羊肉', '汤'], flavorProfile: '汤浓馍筋，肉香厚实，辣酱提味',
    cookingMethods: ['熬羊骨汤', '手掰馍', '煮馍'], difficulty: '进阶',
    photo: '羊肉泡馍',
    allergens: ['小麦'], ingredients: ['羊肉', '馍', '粉丝', '香菜'], imageAlt: '羊肉泡馍 成品图', relatedDishIds: ['lanzhou-noodle', 'yangrou-chuan', 'bazi-rou'],
    videoSearchQuery: '羊肉泡馍 家常做法', tags: ['西北', '西安', '主食', '羊肉', '小吃'], emoji: '🥣',
  },
]
