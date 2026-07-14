const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection({
    host: 'sh-cynosdbmysql-grp-ke3wzvqy.sql.tencentcdb.com',
    port: 27448,
    user: 'root',
    password: 'BuyiDict@2026!Root',
    database: 'cloud1-1gl3y5g7fbe3c208'
  });
  
  const hash = await require('bcryptjs').hash('gsq060606.@', 10);
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
