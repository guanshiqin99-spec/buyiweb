// 测试 node 进程对 assets/images 的写权限
const fs = require('fs')
const p = 'D:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/assets/images/_node_test.txt'
try {
  fs.writeFileSync(p, 'ok')
  console.log('NODE_WRITE_OK')
  fs.unlinkSync(p)
} catch (e) {
  console.log('NODE_WRITE_FAIL', e.code || e.message)
}
