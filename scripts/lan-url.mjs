/**
 * 打印当前可用的局域网访问地址。
 * 校园网 / 路由器 DHCP 会重新分配 IP，之前的地址可能失效 —— 每次换网络后跑一次：
 *   npm run ip
 */
import os from 'node:os'

const port = process.env.PORT || '5173'
const virtualPattern = /vmware|virtualbox|vethernet|loopback|cfw|clash|tap|tun|zerotier|tailscale|wsl|docker/i

const candidates = []
for (const [name, addrs] of Object.entries(os.networkInterfaces())) {
  for (const addr of addrs ?? []) {
    if (addr.family !== 'IPv4' || addr.internal) continue
    candidates.push({ name, address: addr.address, virtual: virtualPattern.test(name) })
  }
}

const real = candidates.filter((item) => !item.virtual)
const virtual = candidates.filter((item) => item.virtual)
const ordered = [...real, ...virtual]

if (!ordered.length) {
  console.log('没有找到局域网地址，请确认已连接 Wi-Fi 或网线。')
  process.exit(0)
}

console.log('\n局域网访问地址（手机 / 舍友电脑用这些）：\n')
for (const item of ordered) {
  const tag = item.virtual ? '虚拟网卡，通常不可用' : item.address.startsWith('192.168.137.') ? '手机热点' : '推荐'
  console.log(`  http://${item.address}:${port}/   [${item.name}] ${tag}`)
}

console.log('\n提示：')
console.log('  · 设备需连同一个 Wi-Fi；校园网可能开启 AP 隔离，打不开就换手机热点')
console.log('  · 地址随 DHCP 变化，换网络后重新执行 npm run ip')
console.log('  · 服务需在运行：npm run dev\n')
