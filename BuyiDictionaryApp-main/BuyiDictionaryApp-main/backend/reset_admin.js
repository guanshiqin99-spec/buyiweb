// 安全实践：凭据从环境变量读取，不硬编码于源码
const mysql = require('mysql2/promise');

const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'ADMIN_PASSWORD'];
const missing = required.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error(`[reset_admin] 缺少必需的环境变量: ${missing.join(', ')}`);
  console.error('请通过环境变量提供数据库连接与管理员口令，切勿硬编码于源码。');
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

  const hash = await require('bcryptjs').hash(process.env.ADMIN_PASSWORD, 10);
  const [admins] = await connection.execute('SELECT * FROM admins');
  if(admins.length > 0) {
      await connection.execute('UPDATE admins SET passwordHash = ? WHERE id = ?', [hash, admins[0].id]);
      console.log('Updated admin id:', admins[0].id);
  } else {
      console.log('No admin found, creating one...');
      await connection.execute('INSERT INTO admins (username, passwordHash, role, isActive) VALUES (?, ?, ?, ?)',
      ['admin', hash, 'superadmin', 1]);
      console.log('Created admin user.');
  }
  await connection.end();
}
run().catch(console.error);
