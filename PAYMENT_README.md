# Hệ thống Thanh toán - BookStore

## Giới thiệu

Hệ thống thanh toán cho ứng dụng BookStore hỗ trợ ba phương thức thanh toán:
- Thanh toán khi nhận hàng (COD - Cash on Delivery)
- Chuyển khoản ngân hàng (Bank Transfer)
- Thanh toán bằng ETH (Ethereum) - sẽ phát triển trong tương lai

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Chạy server thanh toán
npm run start:payment

# Hoặc chạy ở chế độ dev
npm run dev
```

## API Endpoints

### 1. Tạo giao dịch thanh toán mới

```
POST /api/payments
```

Body:
```json
{
  "orderId": "64f9a2a3b9e4c3d5e6f7a8b9",
  "userId": "64f9a1a2b9e4c3d5e6f7a8b9",
  "method": "cash_on_delivery | bank_transfer | ethereum",
  "amount": 200000
}
```

### 2. Xác nhận thanh toán khi nhận hàng (COD)

```
POST /api/payments/cod/:paymentId
```

### 3. Xác nhận thanh toán chuyển khoản

```
POST /api/payments/bank-transfer/:paymentId
```

Body:
```json
{
  "bankName": "Tên ngân hàng",
  "accountNumber": "Số tài khoản",
  "referenceCode": "Mã tham chiếu"
}
```

### 4. Lấy thông tin thanh toán

```
GET /api/payments/:paymentId
```

### 5. Lấy danh sách thanh toán của người dùng

```
GET /api/payments/user/:userId
```

### 6. Hủy giao dịch thanh toán

```
PUT /api/payments/cancel/:paymentId
```

## Luồng thanh toán

### Thanh toán khi nhận hàng (COD)

1. Tạo giao dịch thanh toán với method="cash_on_delivery"
2. Đơn hàng được chuyển sang trạng thái "processing"
3. Khi giao hàng, xác nhận thanh toán qua endpoint COD

### Chuyển khoản ngân hàng

1. Tạo giao dịch thanh toán với method="bank_transfer" 
2. Người dùng thực hiện chuyển khoản qua ngân hàng
3. Xác nhận thanh toán qua endpoint bank-transfer với thông tin chuyển khoản

## Testing

```bash
# Chạy test cho phần thanh toán
npm run test:payment
```

## Mô hình dữ liệu

### Payment Model

- `order`: Liên kết với đơn hàng
- `user`: Liên kết với người dùng
- `amount`: Số tiền thanh toán
- `currency`: Đơn vị tiền tệ (mặc định: VND)
- `method`: Phương thức thanh toán 
- `status`: Trạng thái thanh toán
- `transactionId`: Mã giao dịch
- `paymentDate`: Ngày thanh toán
- `bankDetails`: Chi tiết chuyển khoản ngân hàng
  - `bankName`: Tên ngân hàng
  - `accountNumber`: Số tài khoản
  - `transferDate`: Ngày chuyển khoản
  - `referenceCode`: Mã tham chiếu
- `ethereumDetails`: Chi tiết thanh toán ETH (sẽ phát triển sau)
  - `address`: Địa chỉ ví
  - `transactionHash`: Mã giao dịch blockchain 