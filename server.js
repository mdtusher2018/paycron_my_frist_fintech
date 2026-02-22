const app = require('./app');
const connectDB = require('./db');

connectDB();

app.listen(3000, '0.0.0.0', () => {
  console.log('Server is running on port 3000 and accessible on the network');
});
