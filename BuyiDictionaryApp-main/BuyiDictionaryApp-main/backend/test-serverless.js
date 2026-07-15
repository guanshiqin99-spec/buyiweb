const handler = require('./api/index.js');

const req = {
  url: '/api/ready',
  method: 'GET',
  headers: {}
};

const res = {
  statusCode: 200,
  headers: {},
  setHeader(key, value) {
    this.headers[key] = value;
  },
  end(data) {
    console.log('Response:', this.statusCode, data);
  }
};

handler(req, res).catch(err => {
  console.error('Handler error:', err);
});