// 安全实践：凭据从环境变量读取，不硬编码于源码
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const required = ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'UPLOAD_URL'];
const missing = required.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error(`[upload] 缺少必需的环境变量: ${missing.join(', ')}`);
  console.error('请通过环境变量提供管理员账号、口令与上传地址，切勿硬编码于源码。');
  process.exit(1);
}

async function uploadFiles() {
  const loginRes = await axios.post(process.env.UPLOAD_URL + '/api/admin/auth/login', {
    username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD
  });
  const token = loginRes.data.accessToken;
  const files = fs.readdirSync('D:/BuyiDictionaryApp-main/buyi_audio').filter(f => f.endsWith('.mp3'));

  for(let file of files) {
     const form = new FormData();
     form.append('file', fs.createReadStream(`D:/BuyiDictionaryApp-main/buyi_audio/${file}`));
     form.append('kind', 'audio');
     try {
       const res = await axios.post(process.env.UPLOAD_URL + '/api/admin/media/upload', form, {
          headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` }
       });
       console.log('Upload success:', file, res.data.fileUrl);
     } catch(e) {
       console.log('Upload failed:', file, e.response?.data || e.message);
     }
  }
}

uploadFiles().catch(console.error);
