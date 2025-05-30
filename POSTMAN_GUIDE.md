# Hướng dẫn test API Thanh toán bằng Postman

## 1. Cài đặt và chuẩn bị

### Bước 1: Cài đặt và chạy server
```bash
# Cài đặt dependencies
npm install

# Chạy server ở chế độ dev
npm run dev
```

Server sẽ chạy ở địa chỉ: http://localhost:5000

### Bước 2: Import Postman Collection
1. Mở Postman
2. Nhấp vào nút "Import" (góc trên bên trái)
3. Chọn tệp "bookstore-payment-api.postman_collection.json" từ thư mục gốc của project
4. Nhấp "Import" để hoàn tất

## 2. Thiết lập biến môi trường

1. Tạo môi trường mới trong Postman:
   - Nhấp vào "Environment" (góc trên bên phải)
   - Nhấp "+" để tạo môi trường mới
   - Đặt tên là "BookStore Local"

2. Thêm các biến sau:
   - `base_url`: http://localhost:5000
   - `token`: (để trống, sẽ điền sau)
   - `userId`: (để trống, sẽ điền sau)
   - `orderId`: (để trống, sẽ điền sau)
   - `paymentId`: (để trống, sẽ điền sau)

3. Nhấp "Save" để lưu môi trường
4. Chọn môi trường "BookStore Local" từ dropdown ở góc trên bên phải

## 3. Quy trình test API thanh toán

### Bước 1: Đăng nhập để lấy token

1. Mở folder "Authentication" trong collection
2. Chọn request "Đăng nhập"
3. Nếu chưa có tài khoản, hãy thay đổi thông tin đăng nhập thành tài khoản có sẵn
4. Nhấp "Send" để gửi request
5. Từ kết quả trả về, sao chép token authentication (thường ở `response.data.token`)
6. Cập nhật biến môi trường `token` bằng giá trị vừa sao chép:
   - Nhấp vào "Environment" (góc trên bên phải)
   - Dán giá trị token vào ô "Current Value" của biến `token`
   - Nhấp "Save"

### Bước 2: Lấy ID của người dùng

Nếu bạn không có sẵn ID người dùng:
1. Sao chép ID người dùng từ payload token (nếu có) hoặc từ response đăng nhập
2. Cập nhật biến môi trường `userId` với giá trị này

### Bước 3: Tạo đơn hàng (nếu chưa có)

Đối với việc test, bạn cần có một đơn hàng đã tồn tại. Nếu chưa có, hãy tạo đơn hàng bằng API của Order, sau đó:
1. Sao chép ID đơn hàng từ response
2. Cập nhật biến môi trường `orderId` với giá trị này

### Bước 4: Test thanh toán COD

1. Mở folder "Payments" trong collection
2. Chọn request "Tạo thanh toán COD"
3. Kiểm tra body request để đảm bảo `orderId` và `userId` đã được điền đúng (sử dụng biến môi trường)
4. Nhấp "Send" để gửi request

Kết quả:
- Bạn sẽ nhận được response với thông tin thanh toán đã tạo
- Sao chép `_id` của thanh toán từ response
- Cập nhật biến môi trường `paymentId` với giá trị này

5. Chọn request "Xác nhận thanh toán COD"
6. Nhấp "Send" để xác nhận thanh toán

### Bước 5: Test thanh toán chuyển khoản ngân hàng

1. (Nếu muốn test với đơn hàng khác) Cập nhật `orderId` với một đơn hàng khác
2. Chọn request "Tạo thanh toán Bank Transfer"
3. Nhấp "Send" để tạo thanh toán chuyển khoản

Kết quả:
- Sao chép `_id` của thanh toán từ response
- Cập nhật biến môi trường `paymentId` với giá trị này

4. Chọn request "Xác nhận thanh toán Bank Transfer"
5. Kiểm tra body request (có thể chỉnh sửa thông tin ngân hàng nếu muốn)
6. Nhấp "Send" để xác nhận thanh toán chuyển khoản

### Bước 6: Test lấy thông tin thanh toán

1. Chọn request "Lấy thanh toán theo ID"
2. Nhấp "Send" để lấy thông tin chi tiết của thanh toán hiện tại

### Bước 7: Test lấy danh sách thanh toán của người dùng

1. Chọn request "Lấy thanh toán của người dùng"
2. Nhấp "Send" để lấy danh sách tất cả các thanh toán của người dùng hiện tại

### Bước 8: Test hủy thanh toán

Để test hủy thanh toán, bạn cần tạo một thanh toán mới và chưa xác nhận:

1. Tạo một thanh toán mới (COD hoặc Bank Transfer)
2. Sao chép `_id` của thanh toán từ response
3. Cập nhật biến môi trường `paymentId` với giá trị này
4. Chọn request "Hủy thanh toán"
5. Nhấp "Send" để hủy thanh toán

## 4. Xử lý lỗi thường gặp

### Token hết hạn
Nếu nhận được lỗi 401 Unauthorized, token của bạn có thể đã hết hạn:
1. Thực hiện lại Bước 1 để lấy token mới
2. Cập nhật biến môi trường `token`

### Đơn hàng không tồn tại
Nếu nhận được lỗi "Đơn hàng không tồn tại":
1. Tạo đơn hàng mới hoặc sử dụng ID của một đơn hàng hiện có
2. Cập nhật biến môi trường `orderId`

### Thanh toán đã được xác nhận
Nếu bạn không thể hủy thanh toán với lỗi "Chỉ có thể hủy giao dịch đang ở trạng thái chờ":
1. Điều này là đúng vì bạn chỉ có thể hủy các thanh toán đang ở trạng thái "pending"
2. Tạo một thanh toán mới để test chức năng hủy

## 5. Mẹo và lưu ý

1. **Lưu trữ ID**: Luôn cập nhật các biến môi trường khi nhận được ID mới từ các response
2. **Kiểm tra trạng thái**: Sau mỗi thao tác, kiểm tra trạng thái của thanh toán và đơn hàng để đảm bảo chúng đã được cập nhật đúng
3. **Theo dõi console**: Nếu bạn gặp lỗi, hãy kiểm tra console của server để xem chi tiết lỗi
4. **Xác minh dữ liệu**: Sử dụng MongoDB Compass hoặc công cụ tương tự để xác minh dữ liệu đã được lưu đúng trong database 