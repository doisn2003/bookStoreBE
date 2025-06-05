# Tổng quan hệ thống thanh toán BookStore

Hệ thống thanh toán của BookStore hỗ trợ 3 phương thức thanh toán khác nhau, đáp ứng nhu cầu đa dạng của khách hàng.

## Các phương thức thanh toán

### 1. Thanh toán chuyển khoản ngân hàng

- **Mô tả**: Hiển thị mã QR thanh toán và thông tin đơn hàng
- **Xác nhận**: Người dùng nhấn nút "Xác nhận" sau khi đã chuyển khoản 
- **Endpoint API**:
  - Tạo giao dịch: `POST /api/payments` (method: 'bank_transfer')
  - Xác nhận: `POST /api/payments/bank-transfer/:paymentId`
- **Luồng xử lý**:
  1. Người dùng chọn phương thức thanh toán chuyển khoản
  2. Hệ thống hiển thị thông tin đơn hàng, QR code và thông tin tài khoản
  3. Người dùng thực hiện chuyển khoản qua ngân hàng và nhấn "Xác nhận"
  4. Hệ thống luôn xác nhận thành công và cập nhật trạng thái đơn hàng

### 2. Thanh toán khi nhận hàng (COD)

- **Mô tả**: Hiển thị thông tin đơn hàng
- **Xác nhận**: Người dùng nhấn nút "Xác nhận" để hoàn tất đơn hàng
- **Endpoint API**:
  - Tạo giao dịch: `POST /api/payments` (method: 'cash_on_delivery')
  - Xác nhận: `POST /api/payments/cod/:paymentId`
- **Luồng xử lý**:
  1. Người dùng chọn phương thức thanh toán khi nhận hàng
  2. Hệ thống hiển thị thông tin đơn hàng
  3. Người dùng nhấn "Xác nhận"
  4. Hệ thống luôn xác nhận thành công và cập nhật trạng thái đơn hàng

### 3. Thanh toán bằng Ethereum (ETH)

- **Mô tả**: Kết nối với ví MetaMask và thanh toán bằng cryptocurrency
- **Xác nhận**: Xác nhận trên blockchain sau khi giao dịch được thực hiện thành công
- **Endpoint API**:
  - Tạo giao dịch: `POST /api/payments/ethereum`
  - Xác nhận: `POST /api/payments/ethereum/:paymentId`
- **Luồng xử lý**:
  1. Người dùng chọn phương thức thanh toán Ethereum
  2. Hệ thống yêu cầu kết nối với ví MetaMask
  3. Hệ thống tạo dữ liệu giao dịch và gửi cho frontend
  4. Frontend yêu cầu người dùng xác nhận và thực hiện giao dịch qua MetaMask
  5. Sau khi giao dịch được xác nhận trên blockchain, frontend gửi hash giao dịch về backend
  6. Backend xác thực giao dịch trên blockchain và cập nhật trạng thái đơn hàng

## Cấu trúc hệ thống

### Back-end

1. **Models**: 
   - `Payment`: Lưu trữ thông tin thanh toán với các phương thức khác nhau
   - `Order`: Lưu trữ thông tin đơn hàng liên kết với thanh toán

2. **Controllers**:
   - `payment.controller.ts`: Xử lý các yêu cầu API liên quan đến thanh toán
   - Các phương thức: tạo thanh toán, xác nhận thanh toán, hủy thanh toán, xem lịch sử

3. **Services**:
   - `payment.service.ts`: Dịch vụ xử lý logic thanh toán thông thường
   - `ethereum.service.ts`: Dịch vụ xử lý tương tác với blockchain

4. **Smart Contract**:
   - `BookPayment.sol`: Smart contract thanh toán cho sách
   - Triển khai trên mạng Ethereum (testnet hoặc local)

### Front-end (Gợi ý triển khai)

1. **Payment Selector**: Giao diện cho phép người dùng chọn phương thức thanh toán
2. **Bank Transfer UI**: Hiển thị mã QR, thông tin chuyển khoản
3. **COD UI**: Hiển thị thông tin đơn hàng khi chọn COD
4. **Ethereum UI**: 
   - Nút kết nối MetaMask
   - Hiển thị thông tin đơn hàng
   - Nút xác nhận gửi giao dịch

## Tính năng bổ sung

1. **Quản lý giao dịch**: Người dùng có thể xem lịch sử thanh toán
2. **Hoàn tiền**: Hỗ trợ hoàn tiền cho các đơn hàng đã thanh toán
3. **Thanh toán định kỳ**: Có thể mở rộng để hỗ trợ thanh toán cho các đơn hàng định kỳ (subscription)

## Hướng dẫn triển khai

Vui lòng tham khảo các tài liệu sau để triển khai và sử dụng hệ thống thanh toán:

1. `ETHEREUM_PAYMENT_GUIDE.md`: Hướng dẫn triển khai và sử dụng thanh toán Ethereum
2. `PAYMENT_README.md`: Thông tin chung về hệ thống thanh toán 