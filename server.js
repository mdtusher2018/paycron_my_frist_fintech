const dns = require('dns');
const app = require('./app');
const connectDB = require('./db');

dns.setServers(["1.1.1.1","8.8.8.8"])


connectDB();

app.listen(3000, '0.0.0.0', () => {
  console.log('Server is running on port 3000 and accessible on the network');
});
