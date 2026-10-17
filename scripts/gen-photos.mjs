/**
 * 用智谱 CogView 生成菜品/菜系照片，落盘到 public/images/photos/<菜名>.jpg
 * 用法：node scripts/gen-photos.mjs [--force]
 * 已存在的文件会跳过（除非 --force）。
 */
import fs from 'node:fs'
import path from 'node:path'
import { loadEnv } from 'vite'

const env = loadEnv('development', process.cwd(), '')
const API_KEY = env.ZHIPU_API_KEY
if (!API_KEY) {
  console.error('缺少 ZHIPU_API_KEY')
  process.exit(1)
}

const OUT_DIR = path.join(process.cwd(), 'public', 'images', 'photos')
fs.mkdirSync(OUT_DIR, { recursive: true })
const force = process.argv.includes('--force')

const STYLE =
  '高级中餐美食摄影，真实质感，自然光影，浅景深，深色桌面或木质桌面，暖色调，画面干净，无文字无水印'

const items = [
  { name: '川菜', prompt: '一桌丰盛的川菜：水煮鱼、回锅肉、夫妻肺片、麻婆豆腐，红油亮泽，辣椒花椒点缀，俯拍' },
  { name: '粤菜', prompt: '粤式清蒸鱼、白切鸡与虾饺点心摆盘，白瓷盘，清淡鲜亮，柔和自然光' },
  { name: '重庆火锅', prompt: '沸腾的重庆牛油火锅，九宫格铜锅，红油翻滚冒泡，毛肚鸭肠摆盘，热气升腾，暖光' },
  { name: '烧烤', prompt: '炭火烧烤，羊肉串、烤茄子、烤玉米在炭火上，孜然辣椒面，夜间烟火气，暖色灯光' },
  { name: '面食', prompt: '手工拉面，一碗热汤面，面条筋道，葱花与牛肉片，热气，木质桌面' },
  { name: '甜品', prompt: '中式甜品拼盘：双皮奶、红豆沙、汤圆，白瓷碗，柔和光，细腻奶皮质感' },
  { name: '江南菜', prompt: '江南菜：清蒸鲈鱼、龙井虾仁、腌笃鲜，青瓷盘，清淡雅致，窗边自然光' },
  { name: '街头小吃', prompt: '中国街头小吃摊，铁板煎饼、烤串、臭豆腐、糖葫芦，夜市灯光，热气腾腾，纪实感' },
  { name: '麻婆豆腐', prompt: '一碗地道的麻婆豆腐，红色辣油，白色豆腐块，牛肉臊子，撒花椒面，黑色陶碗，俯拍' },
  { name: '兰州牛肉面', prompt: '兰州牛肉面，一清二白三红四绿，清汤、白萝卜片、红辣油、绿蒜苗、牛肉片，粗陶碗，热气' },
  { name: '东坡肉', prompt: '东坡肉，红亮油润的方形五花肉，砂锅，浓稠酱汁，撒葱花，微距特写' },
  { name: '小笼包', prompt: '小笼包，薄皮汤包，竹蒸笼，热气升腾，姜丝香醋碟，白瓷盘' },
  { name: '汤圆', prompt: '黑芝麻汤圆，白瓷碗中漂浮，清甜糖水，干桂花点缀，柔和暖光' },
  { name: '水煮鱼', prompt: '水煮鱼，红油覆盖，嫩白鱼片，干辣椒与花椒，泼油瞬间，大盆，热气' },
  { name: '红烧肉', prompt: '红烧肉，油亮酱红，砂锅，冰糖收汁，旁边一碗白米饭，家常餐桌' },
  { name: '酸菜鱼', prompt: '酸菜鱼，奶白汤底，嫩滑鱼片，酸菜与青红椒，白胡椒，大碗，热气' },
  { name: '臭豆腐', prompt: '长沙臭豆腐，黑色方块，油炸酥脆外壳，剁椒蒜水，竹签，夜市纸碗' },
  { name: '辣子鸡', prompt: '辣子鸡，干辣椒堆里金红鸡块，花椒，铁锅，焦香，暖光' },
  { name: '家庭版烤鸭腿', prompt: '烤鸭腿，脆皮油亮，切片摆盘，荷叶饼、黄瓜条、甜面酱，木质托盘' },
  { name: '番茄鸡蛋面', prompt: '番茄鸡蛋面，红亮番茄汤汁，金黄蛋花，面条，小葱，白瓷碗，热气' },
  { name: '葱油拌面', prompt: '葱油拌面，油亮面条，焦香葱段，酱色，白瓷盘，极简构图' },
  { name: '清蒸鲈鱼', prompt: '清蒸鲈鱼，葱丝姜丝，蒸鱼豉油，白瓷长盘，鱼肉雪白，清淡' },
  { name: '白切鸡', prompt: '白切鸡，皮黄肉白，切块摆盘，姜葱蘸料，白瓷盘，清淡' },
  { name: '龙井虾仁', prompt: '龙井虾仁，虾仁晶莹，绿茶茶叶点缀，白瓷盘，清雅，柔和光' },
  { name: '腌笃鲜', prompt: '腌笃鲜，砂锅汤，咸肉、鲜五花与春笋，奶白汤色，热气，江南家常' },
  { name: '鱼香茄子', prompt: '鱼香茄子，紫皮茄子段，红亮鱼香汁，蒜末泡椒，白瓷盘' },
  { name: '酸辣粉', prompt: '酸辣粉，红薯粉，红油汤，花生碎、香菜、榨菜末，纸碗，夜市' },
  { name: '过桥米线', prompt: '过桥米线，滚烫鸡汤，米线与肉片、鹌鹑蛋、蔬菜分碟摆放，云南' },
  { name: '腊味煲仔饭', prompt: '腊味煲仔饭，砂锅，腊肠切片，青菜，锅巴，淋豉油，热气' },
  { name: '孜然羊肉串', prompt: '孜然羊肉串，炭火烤制，油亮焦香，孜然辣椒面，铁签，夜市' },
  { name: '蒜蓉烤茄子', prompt: '蒜蓉烤茄子，剖开长茄，铺满蒜蓉小米辣，炭火烤，油亮' },
  { name: '黑芝麻汤圆', prompt: '黑芝麻汤圆，咬开流心，黑芝麻馅，白瓷碗，糖水，特写' },
  { name: '双皮奶', prompt: '双皮奶，奶皮细腻，白瓷碗，表面光滑，勺子，柔和光' },
  { name: '红豆沙', prompt: '红豆沙，浓稠细腻，白瓷碗，陈皮丝，暖光，广式糖水' },
  { name: '番茄炒蛋', prompt: '番茄炒蛋，红黄相间，汤汁浓郁，白瓷盘，家常餐桌' },
  { name: '蒜蓉豆苗', prompt: '蒜蓉豆苗，翠绿鲜嫩，蒜末，白瓷盘，清爽' },
  { name: '柠檬鸡胸沙拉', prompt: '柠檬鸡胸沙拉，煎鸡胸切片，生菜、番茄、柠檬，木碗，清爽' },
  { name: '羊肉泡馍', prompt: '羊肉泡馍，掰碎的馍泡在羊肉汤里，羊肉片、粉丝、香菜，大碗，西安' },
  { name: '松鼠鳜鱼', prompt: '松鼠鳜鱼，整条鳜鱼炸至金黄酥脆、形如松鼠，浇红亮糖醋汁，苏帮菜经典摆盘，白瓷长盘' },
  { name: '葱烧海参', prompt: '葱烧海参，油亮海参段配焦香大葱段，浓稠酱汁挂身，鲁菜经典，白瓷盘，光泽感' },
  { name: '糖醋鲤鱼', prompt: '糖醋鲤鱼，整条鲤鱼炸透头尾翘起，酸甜红亮糖醋汁浇淋，山东名菜，白瓷长盘' },
  { name: '剁椒鱼头', prompt: '剁椒鱼头，胖头鱼头剖开铺满红剁椒与蒜蓉，蒸制，撒葱花，大圆盘，湘菜经典，热气' },
  { name: '佛跳墙', prompt: '佛跳墙，坛中金亮浓汤，鲍鱼、海参、花胶、鹌鹑蛋等山珍海味，闽菜经典，坛子盛装，暖光' },
  { name: '徽州臭鳜鱼', prompt: '徽州臭鳜鱼，腌鲜鳜鱼烧制，蒜瓣状鱼肉，红亮酱汁，笋丁与肉片，徽菜经典，砂锅盛装' },
  { name: '回锅肉', prompt: '回锅肉，灯盏窝状五花肉片与青蒜苗，郫县豆瓣红油亮泽，川菜经典，白瓷盘' },
  { name: '宫保鸡丁', prompt: '宫保鸡丁，鸡丁与花生米、干辣椒段同炒，荔枝口糖醋亮芡，川菜经典，白瓷盘' },
  { name: '广式烧鹅', prompt: '广式烧鹅，枣红色脆皮烧鹅斩件摆盘，皮脆油亮，配酸梅酱，粤菜经典' },
  { name: '老火靓汤', prompt: '广式老火靓汤，瓦煲中清亮浓汤，玉米胡萝卜与排骨，汤面微油光，粤式家常' },
  { name: '清炖狮子头', prompt: '清炖狮子头，大颗肉圆卧在清汤中，菜心点缀，汤清味浓，淮扬菜经典，白瓷盅' },
  { name: '大煮干丝', prompt: '大煮干丝，细如发丝的豆腐干丝在奶白高汤中，虾仁与火腿丝点缀，淮扬菜经典' },
  { name: '盐水鸭', prompt: '南京盐水鸭，皮白肉嫩鸭肉斩件摆盘，清淡咸鲜，金陵菜经典，白瓷盘' },
  { name: '九转大肠', prompt: '九转大肠，红亮大肠段排列盘中，浓稠酱汁挂身，撒香菜末，鲁菜经典' },
  { name: '油焖大虾', prompt: '油焖大虾，红亮对虾整齐排列，虾油酱汁浓厚，姜丝点缀，鲁菜经典' },
  { name: '农家小炒肉', prompt: '农家小炒肉，青椒与带皮五花肉片猛火爆炒，油亮微辣，湘菜家常，铁锅盛装' },
  { name: '辣椒炒肉', prompt: '辣椒炒肉，螺丝椒段与瘦肉片同炒，锅气十足，油亮鲜辣，湘菜经典' },
  { name: '腊味合蒸', prompt: '腊味合蒸，腊肉腊肠腊鱼切片合蒸，油光透亮，干辣椒点缀，湘菜经典，白瓷盘' },
  { name: '荔枝肉', prompt: '荔枝肉，肉块与荸荠炸至形似荔枝，酸甜红亮糖醋汁，闽菜经典，白瓷盘' },
  { name: '醉排骨', prompt: '醉排骨，金黄酥脆排骨裹酸甜汁，外酥里嫩，蒜香，闽菜经典，白瓷盘' },
  { name: '红糟鱼', prompt: '红糟鱼，整条鱼烧制裹红糟酱汁，色泽红润酒香，撒葱花，闽菜经典' },
  { name: '西湖醋鱼', prompt: '西湖醋鱼，整条草鱼对剖卧在糖醋琉璃芡中，姜末点缀，浙菜经典，白瓷长盘' },
  { name: '叫花鸡', prompt: '叫花鸡，荷叶包裹敲开泥壳，露出手撕鸡肉，热气升腾，浙菜经典，木质桌面' },
  { name: '毛豆腐', prompt: '煎毛豆腐，金黄煎毛豆腐块，表皮微皱，配红辣椒酱碟，徽菜经典，铁板盛装' },
  { name: '徽州红烧肉', prompt: '徽州红烧肉，大块五花肉红烧至酱色油亮，搭笋干，砂锅盛装，徽菜经典' },
  { name: '黄山炖鸽', prompt: '黄山炖鸽，清炖乳鸽汤，汤清见底，枸杞与山药点缀，徽菜经典，白瓷炖盅' },
]

const slug = (name) => encodeURIComponent(name)

async function generate(item, attempt = 0) {
  const file = path.join(OUT_DIR, `${item.name}.jpg`)
  if (!force && fs.existsSync(file) && fs.statSync(file).size > 10000) {
    return { name: item.name, skipped: true }
  }

  const prompt = `${item.prompt}。${STYLE}`
  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: env.ZHIPU_IMAGE_MODEL || 'cogview-3-flash', prompt, size: '1024x1024' }),
  })

  if (response.status === 429 && attempt < 6) {
    const wait = 6000 + attempt * 6000
    await new Promise((r) => setTimeout(r, wait))
    return generate(item, attempt + 1)
  }
  if (!response.ok) throw new Error(`${item.name}: ${response.status} ${(await response.text()).slice(0, 120)}`)

  const data = await response.json()
  const url = data?.data?.[0]?.url
  if (!url) throw new Error(`${item.name}: no url`)

  const img = await fetch(url)
  if (!img.ok) throw new Error(`${item.name}: download ${img.status}`)
  const buffer = Buffer.from(await img.arrayBuffer())
  fs.writeFileSync(file, buffer)
  return { name: item.name, bytes: buffer.length }
}

let ok = 0
let skipped = 0
const failed = []

console.log(`开始生成 ${items.length} 张照片 → ${OUT_DIR}（串行 + 限流重试）`)
for (const item of items) {
  try {
    const result = await generate(item)
    if (result.skipped) {
      skipped += 1
    } else {
      ok += 1
      console.log(`✓ ${item.name} ${(result.bytes / 1024).toFixed(0)}KB`)
    }
  } catch (error) {
    failed.push(item.name)
    console.log(`✗ ${item.name}: ${String(error.message).slice(0, 120)}`)
  }
  await new Promise((r) => setTimeout(r, 1200))
}
console.log(`完成：新增 ${ok}，跳过 ${skipped}，失败 ${failed.length}${failed.length ? '：' + failed.join('、') : ''}`)
