import type { DishSeed } from './types'

/**
 * 徽菜菜品（图鉴第二阶段）
 * 第一阶段徽菜没有入库菜品，本文件一次性补齐 10 道，
 * 使徽菜满足「八大菜系各 ≥10 道」。
 *
 * 内容取向：臭鳜鱼、毛豆腐等发酵菜的起源说法不一，
 * 一律写成「常见说法/地方传统」，不编造确切年份与人物。
 */
export const huiDishes: DishSeed[] = [
  {
    id: 'chouguiyu', name: '徽州臭鳜鱼', aliases: ['腌鲜鳜鱼', '臭桂鱼'], categoryId: 'fajiao', dishType: '荤菜',
    cuisineId: 'hui', region: '安徽黄山（徽州）', spicy: 1, minutes: 90, price: 78,
    summary: '闻着退后一步，吃着夹第二筷。',
    desc: '闻臭吃香，蒜瓣紧实，咸鲜微辣。',
    description:
      '新鲜鳜鱼用淡盐水腌渍数日，微微发酵出特殊气味后洗净煎香，加笋丁、肉片与辣椒红烧。鱼肉呈蒜瓣状、紧实弹嫩，闻着有「臭」香、吃着鲜香，是徽菜最有辨识度的一道。',
    history:
      '臭鳜鱼源于徽州山区的腌鲜保存方式：过去交通不便，鲜鱼靠挑运，途中用盐腌以防变质，抵达时已有轻微发酵，反而形成独特风味。它长期在徽州人家流传，具体起源说法不一，宜作为地方饮食传统看待。',
    people: [],
    story:
      '徽州人讲这段历史时会强调「不是坏了」：盐腌发酵是有分寸的，鱼肉要发得紧、发得香，不能发臭到不成菜。判断方法也传统——鱼鳃要红，鱼肉要蒜瓣状。外地人第一次闻会退后一步，本地人已经开始夹第二筷。',
    storyType: '地方传说', flavors: ['发酵', '咸鲜微辣'],
    scenes: ['家庭', '朋友聚会', '待客', '下饭'],
    flavorProfile: '闻臭吃香，蒜瓣紧实，咸鲜微辣', cookingMethods: ['盐腌发酵', '煎制', '红烧'],
    difficulty: '进阶', allergens: ['鱼类', '大豆'], ingredients: ['臭鳜鱼', '笋丁', '猪肉片', '辣椒'], imageAlt: '徽州臭鳜鱼 成品图',
    photo: '徽州臭鳜鱼',
    relatedDishIds: ['choudoufu', 'hongzaoyu', 'maodoufu'], videoSearchQuery: '徽州臭鳜鱼 家常做法',
    tags: ['徽菜', '黄山', '发酵', '鱼', '地方名菜'], emoji: '🐟',
  },
  {
    id: 'maodoufu', name: '毛豆腐', aliases: ['霉豆腐'], categoryId: 'fajiao', dishType: '素菜',
    cuisineId: 'hui', region: '安徽黄山（徽州）', spicy: 1, minutes: 40, price: 26,
    summary: '长了一层白绒毛，煎到两面金黄才敢下嘴。',
    desc: '外酥内嫩，豆香里带一点发酵鲜。',
    description:
      '豆腐切块接种毛霉，在适宜温度下长出一层白色绒毛，再下平底锅煎到两面金黄，蘸辣酱或红烧。外酥内嫩、豆香里带一点发酵鲜，是徽州街头最敢吃的一道小吃。',
    history:
      '毛豆腐是徽州特有的发酵豆制品，与当地气候、豆腐作坊的长期实践相关。它的成型依赖菌种与温湿度，属于地方传统工艺，具体起源无确切记载，多为民间作坊世代相传。',
    people: [],
    story:
      '徽州人做毛豆腐看天：温度低了不长毛，高了会变味。绒毛要白、要匀，长了杂色就废了。街边煎毛豆腐的摊子常常边煎边卖，配一碟辣酱；外地客人多半先拍照，再犹豫着咬下第一口。',
    storyType: '民间故事', flavors: ['发酵', '豆香'],
    scenes: ['一人食', '朋友聚会', '深夜', '下酒'],
    flavorProfile: '外酥内嫩，豆香带发酵鲜，辣酱提味', cookingMethods: ['发酵长毛', '平底锅煎制'],
    difficulty: '进阶', allergens: ['大豆'], ingredients: ['毛豆腐', '辣酱', '菜籽油', '葱花'], imageAlt: '毛豆腐 成品图',
    photo: '毛豆腐',
    relatedDishIds: ['choudoufu', 'chouguiyu', 'mapo-tofu'], videoSearchQuery: '毛豆腐 家常做法',
    tags: ['徽菜', '黄山', '发酵', '豆腐', '小吃'], emoji: '🟫',
  },
  {
    id: 'huizhou-hongshaorou', name: '徽州红烧肉', aliases: ['徽式红烧肉', '笋干烧肉'], categoryId: 'nongxiang',
    dishType: '荤菜', cuisineId: 'hui', region: '安徽徽州', spicy: 0, minutes: 100, price: 36,
    summary: '笋干吸足肉汁，比肉更抢手。',
    desc: '咸甜酱香、肉烂笋香，油润不腻。',
    description:
      '五花肉切块焯水，与泡发的笋干（或干豇豆）同烧，用酱油、糖与黄酒慢煨到肉烂笋香。徽州版本多用山货配肉，笋干吸足肉汁，比肉更抢手，咸香里带一点甜。',
    history:
      '徽式红烧肉与徽州「山里人待客」的饮食传统相关：肉配山货笋干，是山区家庭的常见搭配。它属于地方家常菜的长期积累，没有单一发明者，具体做法各家不同。',
    people: [],
    story:
      '徽州人家烧肉喜欢放笋干，理由很实在：山里笋多，笋干经放，还能吃油。一锅肉要烧到笋干变软、肉块颤而不散才出锅。孩子总抢肉，长辈却说笋干才是精华，因为「吸的都是肉的味道」。',
    storyType: '民间故事', flavors: ['咸甜', '酱香'],
    scenes: ['家庭', '待客', '下饭'],
    flavorProfile: '咸甜酱香，肉烂笋香，油润不腻', cookingMethods: ['焯水', '炒糖色', '慢火烧制'],
    difficulty: '家常', allergens: ['大豆'], ingredients: ['五花肉', '笋干', '酱油', '黄酒'], imageAlt: '徽州红烧肉 成品图',
    photo: '徽州红烧肉',
    relatedDishIds: ['hongshaorou', 'maoshi-hongshaorou', 'daoban-xiang'], videoSearchQuery: '徽州红烧肉 家常做法',
    tags: ['徽菜', '徽州', '红烧肉', '笋干', '家常'], emoji: '🍖',
  },
  {
    id: 'huangshan-dunge', name: '黄山炖鸽', aliases: ['炖乳鸽', '清炖鸽'], categoryId: 'qingshuang', dishType: '汤羹',
    cuisineId: 'hui', region: '安徽黄山', spicy: 0, minutes: 150, price: 88,
    summary: '隔水慢炖两小时，只放一点盐喝汤的本味。',
    desc: '汤清味鲜、鸽肉细嫩，清补不燥。',
    description:
      '乳鸽处理干净焯水，与山药、枸杞、姜片同入炖盅，加清汤隔水炖两小时。汤清味鲜、鸽肉细嫩，讲究原味不重调料，是黄山一带传统的滋补汤菜。',
    history:
      '黄山炖鸽与徽州山区以山珍、药材入馔的传统相关，常见于家庭滋补与宴客。它属于地方炖菜体系，具体起源无确切记载，长期作为「清补」类汤品流传。',
    people: [],
    story:
      '徽州人炖鸽子讲究隔水慢炖，说直火滚汤会让汤变浑；山药和枸杞是常规配料。端上桌只放一点盐，喝的是汤本身的鲜。山里人常把这道菜留给体弱的家人，是「补一补」的实在办法。',
    storyType: '民间故事', flavors: ['清鲜', '清补'],
    scenes: ['家庭', '两人', '待客'],
    flavorProfile: '汤清味鲜，鸽肉细嫩，清补不燥', cookingMethods: ['焯水', '隔水炖制'],
    difficulty: '家常', allergens: [], ingredients: ['乳鸽', '山药', '枸杞', '姜'], imageAlt: '黄山炖鸽 成品图',
    photo: '黄山炖鸽',
    relatedDishIds: ['huotui-dunjiayu', 'naitang-pucai', 'jitang-cuhaibang'], videoSearchQuery: '黄山炖鸽 做法',
    tags: ['徽菜', '黄山', '汤菜', '炖菜', '滋补'], emoji: '🥣',
  },
  {
    id: 'wenzheng-shansun', name: '问政山笋', aliases: ['问政笋'], categoryId: 'qingshuang', dishType: '素菜',
    cuisineId: 'hui', region: '安徽歙县', spicy: 0, minutes: 40, price: 32,
    summary: '山里的那口清甜，重味反而会挡住它。',
    desc: '清脆鲜甜、笋香突出，清淡不腻。',
    description:
      '歙县问政山产的春笋脆嫩少渣，切片后与火腿（或咸肉）同烧，或清炒后浇上高汤。笋要保持脆爽，调味只放盐与少量猪油，吃的就是那一口「山里的清甜」。',
    history:
      '问政山笋是徽州物产名品，历史上有「问政山笋甲天下」之类的赞誉，常与徽州宴席和贡笋的说法相联系。它既是食材也是地方骄傲，具体历史评价的来源有多种记载，宜作为地方名产看待。',
    people: [],
    story:
      '徽州人挖笋讲究时令：出了土的笋老得快，挖笋人天不亮就上山。问政山的笋因土质与气候被认为格外脆嫩，旧时甚至被当作礼品送往外地。当地人做笋很少放重味，怕掩盖了那股清甜。',
    storyType: '历史记载', flavors: ['清鲜', '脆嫩'],
    scenes: ['家庭', '两人', '减脂'],
    flavorProfile: '清脆鲜甜，笋香突出，清淡不腻', cookingMethods: ['切片', '快烧或清炒'],
    difficulty: '入门', allergens: [], ingredients: ['问政山笋', '火腿', '猪油', '盐'],
    imageAlt: '问政山笋 成品图',
    photo: '问政山笋',
    relatedDishIds: ['daoban-xiang', 'huizhou-hongshaorou', 'chouguiyu'], videoSearchQuery: '问政山笋 做法',
    tags: ['徽菜', '歙县', '春笋', '时令', '山珍'], emoji: '🎋',
  },
  {
    id: 'daoban-xiang', name: '刀板香', aliases: ['刀板香肉'], categoryId: 'nongxiang', dishType: '荤菜',
    cuisineId: 'hui', region: '安徽徽州', spicy: 1, minutes: 120, price: 42,
    summary: '腌肉在刀板上蒸，肉香留在木纹里。',
    desc: '咸鲜腊香、肥而不腻，肉片透亮。',
    description:
      '腌好的五花肉先泡洗再蒸，切薄片后与豆腐或笋同蒸，肉香与配料互相渗透。肉片咸鲜不腻，配饭极香。传统说法是把腌肉放在刀板上蒸，让肉香留在木板上，因而得名。',
    history:
      '刀板香是徽州腌腊肉的一种做法与名称，与山区秋冬腌肉、待客用腊味的传统相关。名字的由来有不同解释（多与刀板蒸肉、切肉有关），长期以来属于地方家常与宴席共用的菜。',
    people: [],
    story:
      '徽州人说刀板香的好，看切开时的断面：瘦肉要红、肥肉要透亮。蒸之前要先泡去多余盐分，否则咸得发苦。切片的厚薄也讲究——太薄蒸完就散，太厚则不入味。配一碗白饭，是他们最踏实的吃法。',
    storyType: '地方传说', flavors: ['腊香', '咸鲜'],
    scenes: ['一人食', '家庭', '下饭'],
    flavorProfile: '咸鲜腊香，肥而不腻，肉片透亮', cookingMethods: ['腌腊', '泡洗', '蒸制切片'],
    difficulty: '家常', allergens: [], ingredients: ['腌五花肉', '豆腐', '笋', '姜'],
    imageAlt: '刀板香 成品图',
    photo: '刀板香',
    relatedDishIds: ['lawei-hezheng', 'hangzhou-jiangya', 'huizhou-hongshaorou'], videoSearchQuery: '刀板香 做法',
    tags: ['徽菜', '徽州', '腌腊', '蒸菜', '家常'], emoji: '🥓',
  },
  {
    id: 'hushi-yipinguo', name: '胡适一品锅', aliases: ['一品锅', '绩溪一品锅'], categoryId: 'nongxiang', dishType: '荤菜',
    cuisineId: 'hui', region: '安徽绩溪', spicy: 0, minutes: 180, price: 58,
    summary: '一层萝卜一层肉，山里人过节的一锅到底。',
    desc: '层次丰富、咸鲜醇厚，越炖越香。',
    description:
      '一层萝卜、一层豆腐、一层肉、一层笋与一层蛋饺（或粉丝），层层码入大锅，加高汤小火慢炖到各味融合。分量大、层次多，是徽州人家过节或待客的「一锅到底」。',
    history:
      '一品锅是徽州绩溪的传统大菜，与当地节庆家宴、山乡食材丰俭并举的习俗相关。它常与近现代文化名人胡适的家乡饮食记忆联系在一起，被称为「胡适一品锅」；这层联系属常见说法，细节宜保守表述。',
    people: ['胡适（近现代学者，籍贯徽州绩溪；常见说法把他与家乡一品锅联系在一起）'],
    story:
      '层层码锅的做法很像山区的性格：实在、丰盛、不讲究摆盘。绩溪人过年时常常一锅煮上大半天，来了客人就添一层料。关于胡适在家宴客吃一品锅的叙述流传较广，但具体场景多为后人转述，宜当作地方记忆。',
    storyType: '现代流行说法', flavors: ['咸鲜', '醇厚'],
    scenes: ['家庭', '朋友聚会', '待客'],
    flavorProfile: '层次丰富，咸鲜醇厚，越炖越香', cookingMethods: ['分层码锅', '小火慢炖'],
    difficulty: '进阶', allergens: ['鸡蛋', '大豆'], ingredients: ['萝卜', '豆腐', '五花肉', '蛋饺', '笋'],
    imageAlt: '胡适一品锅 成品图',
    photo: '胡适一品锅',
    relatedDishIds: ['huizhou-yuanzi', 'boshan-suguo', 'li-hongzhang-zahui'], videoSearchQuery: '一品锅 做法',
    tags: ['徽菜', '绩溪', '宴席', '炖菜', '年节'], emoji: '🍲',
  },
  {
    id: 'huizhou-yuanzi', name: '徽州圆子', aliases: ['徽州丸子', '糯米圆子'], categoryId: 'xianxiang', dishType: '荤菜',
    cuisineId: 'hui', region: '安徽徽州', spicy: 0, minutes: 90, price: 38,
    summary: '糯米吸肉汁，团团圆圆才动筷。',
    desc: '软糯咸鲜、糯米香浓，肉汁入味。',
    description:
      '猪肉馅加荸荠与葱姜水打上劲，团成丸子滚一层糯米（或先炸后蒸），上笼蒸熟。糯米吸肉汁，丸子软糯咸鲜带一点甜，是徽州逢年过节与喜宴上的常见菜。',
    history:
      '徽州圆子是当地的节庆菜，圆形寓意团圆丰收，与徽州乡村的宴席习俗相关。各家配方不同（有的加糯米，有的炸后再烧），属于地方家常传统，没有确切起源。',
    people: [],
    story:
      '徽州人做圆子常全家动手：谁团丸子、谁滚糯米，分工清楚。糯米要提前泡透，否则蒸出来夹生；丸子要团得紧，蒸时才不散。过年时一盘圆子端上来，先说「团团圆圆」，然后才开始动筷。',
    storyType: '民间故事', flavors: ['咸鲜', '软糯'],
    scenes: ['家庭', '待客', '朋友聚会'],
    flavorProfile: '软糯咸鲜，糯米香浓，肉汁入味', cookingMethods: ['打馅', '团丸滚米', '蒸制'],
    difficulty: '家常', allergens: [], ingredients: ['猪肉馅', '糯米', '荸荠', '葱姜水'],
    imageAlt: '徽州圆子 成品图',
    photo: '徽州圆子',
    relatedDishIds: ['hushi-yipinguo', 'sixi-wanzi', 'qingdun-shizitou'], videoSearchQuery: '徽州圆子 做法',
    tags: ['徽菜', '徽州', '糯米', '丸子', '年节'], emoji: '🍡',
  },
  {
    id: 'huotui-dunjiayu', name: '火腿炖甲鱼', aliases: ['火腿甲鱼汤'], categoryId: 'xianxiang', dishType: '汤羹',
    cuisineId: 'hui', region: '安徽徽州', spicy: 0, minutes: 180, price: 128,
    summary: '火腿吊底味，甲鱼出胶质，中途不能加水。',
    desc: '汤清醇厚、裙边软糯，火腿提鲜。',
    description:
      '甲鱼处理干净焯水，与金华（或徽州）火腿片、姜块同入砂锅，小火炖两三小时，出锅前调味。汤清味厚、甲鱼裙边软糯，是徽州宴席上讲究的滋补汤菜。',
    history:
      '火腿炖甲鱼与徽州山区「火腿吊汤、山珍滋补」的饮食传统相关。火腿是徽州菜常用的提鲜材料，甲鱼则多用于宴客与进补，具体起源无确切记载，长期作为地方宴席菜存在。',
    people: [],
    story:
      '这道菜讲究「吊」：火腿提供咸鲜底味，甲鱼负责胶质与口感，中间不能加调料乱改。老厨子会强调火要小、水要一次加足，中途加水汤就浑了。也正因为耗时，它多半只在过年或有重要客人才上桌。',
    storyType: '民间故事', flavors: ['清鲜', '醇厚'],
    scenes: ['家庭', '待客', '两人'],
    flavorProfile: '汤清醇厚，裙边软糯，火腿提鲜', cookingMethods: ['处理甲鱼', '小火慢炖'],
    difficulty: '进阶', allergens: [], ingredients: ['甲鱼', '火腿', '姜', '黄酒'],
    imageAlt: '火腿炖甲鱼 成品图',
    photo: '火腿炖甲鱼',
    relatedDishIds: ['huangshan-dunge', 'fotiaoqiang', 'jitang-cuhaibang'], videoSearchQuery: '火腿炖甲鱼 做法',
    tags: ['徽菜', '徽州', '火腿', '甲鱼', '宴席菜'], emoji: '🐢',
  },
  {
    id: 'li-hongzhang-zahui', name: '李鸿章杂烩', aliases: ['李鸿章杂烩', '杂烩'], categoryId: 'xianxiang', dishType: '荤菜',
    cuisineId: 'hui', region: '安徽合肥', spicy: 0, minutes: 90, price: 58,
    summary: '把家里有的都用上，反而烩出一锅丰盛。',
    desc: '荤鲜层叠、汤浓味厚，咸鲜适口。',
    description:
      '把海参、鱼肚、鸡肉、火腿、笋、香菇等分别处理，最后合入一锅用高汤烧烩，勾薄芡收味。荤鲜层叠、汤浓味厚，既有宴席的丰盛，也带着「把家里有的都用上」的实用思路。',
    history:
      '李鸿章杂烩的常见说法与清代官员李鸿章出使或宴客时的饮食故事有关，也有版本认为它是合肥一带「杂烩」菜式的演化。这些说法流传很广但缺少确证，宜作为民间说法记录。',
    people: ['李鸿章（清代官员，常见说法把他与这道菜联系在一起）'],
    story:
      '流传最广的版本是：宴客时食材不够，厨师把各种剩料汇成一锅，客人却大为称赞，菜名便与主人连在了一起。类似「凑成一锅反而好吃」的故事在中国菜里不止一例，它反映的其实是徽州菜把多样食材调和成一味的本事。',
    storyType: '文献存疑', flavors: ['咸鲜', '醇厚'],
    scenes: ['家庭', '待客', '朋友聚会'],
    flavorProfile: '荤鲜层叠，汤浓味厚，咸鲜适口', cookingMethods: ['分别预处理', '合烧勾芡'],
    difficulty: '进阶', allergens: ['鱼类', '虾', '大豆'], ingredients: ['海参', '鱼肚', '鸡肉', '火腿', '香菇'],
    imageAlt: '李鸿章杂烩 成品图',
    photo: '李鸿章杂烩',
    relatedDishIds: ['hushi-yipinguo', 'fotiaoqiang', 'boshan-suguo'], videoSearchQuery: '李鸿章杂烩 做法',
    tags: ['徽菜', '合肥', '杂烩', '宴席菜', '汤菜'], emoji: '🍲',
  },
]
