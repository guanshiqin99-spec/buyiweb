const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function uploadFiles() {
  const loginRes = await axios.post('https://buyidict-backend-255536-7-1374507614.sh.run.tcloudbase.com/api/admin/auth/login', {
    username: 'admin', password: 'gsq060606.@'
  });
  const token = loginRes.data.accessToken;
  const files = fs.readdirSync('D:/BuyiDictionaryApp-main/buyi_audio').filter(f => f.endsWith('.mp3'));
  
  for(let file of files) {
     const form = new FormData();
     form.append('file', fs.createReadStream(`D:/BuyiDictionaryApp-main/buyi_audio/${file}`));
     form.append('kind', 'audio');
     try {
       const res = await axios.post('https://buyidict-backend-255536-7-1374507614.sh.run.tcloudbase.com/api/admin/media/upload', form, {
          headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` }
       });
       console.log('Upload success:', file, res.data.fileUrl);
     } catch(e) {
       console.log('Upload failed:', file, e.response?.data || e.message);
     }
  }
}

uploadFiles().catch(console.error);
