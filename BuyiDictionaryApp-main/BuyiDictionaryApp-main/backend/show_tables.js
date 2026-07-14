const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection({
    host: 'sh-cynosdbmysql-grp-ke3wzvqy.sql.tencentcdb.com',
    port: 27448,
    user: 'root',
    password: 'BuyiDict@2026!Root',
    database: 'cloud1-1gl3y5g7fbe3c208'
  });
  const [tables] = await connection.execute('SHOW TABLES');
  console.log(tables);
  await connection.end();
}
run().catch(console.error);
