// 安全实践：凭据从环境变量读取，不硬编码于源码
const mysql = require('mysql2/promise');

const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missing = required.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error(`[show_tables] 缺少必需的环境变量: ${missing.join(', ')}`);
  console.error('请通过环境变量提供数据库连接信息，切勿硬编码于源码。');
  process.exit(1);
}

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  const [tables] = await connection.execute('SHOW TABLES');
  console.log(tables);
  await connection.end();
}
run().catch(console.error);
