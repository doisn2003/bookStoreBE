const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Cho phép CORS
app.use(cors());

// Phục vụ file tĩnh từ thư mục src
app.use(express.static(path.join(__dirname, 'src')));
app.use('/public', express.static(path.join(__dirname, 'src', 'public')));

// Route mặc định
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Route cho demo thanh toán ETH
app.get('/eth-payment-demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'public', 'eth-payment-demo.html'));
});

// Khởi động server
app.listen(port, () => {
  console.log(`Frontend đang chạy tại http://localhost:${port}`);
  console.log(`Demo thanh toán ETH: http://localhost:${port}/eth-payment-demo`);
}); 