# Mô tả hình ảnh hướng dẫn Postman

Dưới đây là mô tả chi tiết các hình ảnh nên chụp để minh họa cho hướng dẫn test Postman:

## 1. Màn hình Postman - Import Collection

- **Tên file**: 01_import_collection.png
- **Mô tả**: Màn hình Postman với nút Import được đánh dấu và hiển thị cửa sổ import với file collection đã chọn.

## 2. Cấu trúc Collection đã import

- **Tên file**: 02_collection_structure.png
- **Mô tả**: Màn hình hiển thị cấu trúc của BookStore Payment API Collection sau khi import, với các folder Authentication và Payments được mở rộng.

## 3. Tạo môi trường

- **Tên file**: 03_create_environment.png
- **Mô tả**: Màn hình tạo môi trường mới với các biến được thiết lập (base_url, token, userId, orderId, paymentId)

## 4. Chọn môi trường

- **Tên file**: 04_select_environment.png
- **Mô tả**: Góc trên bên phải của Postman với dropdown chọn môi trường "BookStore Local"

## 5. Đăng nhập

- **Tên file**: 05_login_request.png
- **Mô tả**: Màn hình request đăng nhập với body chứa email và password
- **Tên file**: 06_login_response.png
- **Mô tả**: Màn hình response của request đăng nhập, hiển thị token đã nhận

## 6. Cập nhật biến token

- **Tên file**: 07_update_token.png
- **Mô tả**: Màn hình cập nhật biến môi trường với token mới từ response đăng nhập

## 7. Tạo thanh toán COD

- **Tên file**: 08_create_cod_payment.png
- **Mô tả**: Màn hình request tạo thanh toán COD với body đã được điền đầy đủ
- **Tên file**: 09_create_cod_response.png
- **Mô tả**: Màn hình response của request tạo thanh toán, hiển thị thông tin thanh toán đã tạo và ID

## 8. Xác nhận thanh toán COD

- **Tên file**: 10_confirm_cod.png
- **Mô tả**: Màn hình request xác nhận thanh toán COD
- **Tên file**: 11_confirm_cod_response.png
- **Mô tả**: Màn hình response của request xác nhận, hiển thị trạng thái thanh toán đã được cập nhật thành "completed"

## 9. Tạo thanh toán chuyển khoản

- **Tên file**: 12_create_bank_transfer.png
- **Mô tả**: Màn hình request tạo thanh toán chuyển khoản
- **Tên file**: 13_create_bank_response.png
- **Mô tả**: Màn hình response của request tạo thanh toán chuyển khoản

## 10. Xác nhận thanh toán chuyển khoản

- **Tên file**: 14_confirm_bank_transfer.png
- **Mô tả**: Màn hình request xác nhận thanh toán chuyển khoản với thông tin ngân hàng
- **Tên file**: 15_confirm_bank_response.png
- **Mô tả**: Màn hình response của request xác nhận, hiển thị trạng thái thanh toán và thông tin ngân hàng

## 11. Lấy thông tin thanh toán

- **Tên file**: 16_get_payment.png
- **Mô tả**: Màn hình request lấy thông tin thanh toán theo ID
- **Tên file**: 17_get_payment_response.png
- **Mô tả**: Màn hình response hiển thị chi tiết của thanh toán

## 12. Lấy danh sách thanh toán của người dùng

- **Tên file**: 18_get_user_payments.png
- **Mô tả**: Màn hình request lấy danh sách thanh toán của người dùng
- **Tên file**: 19_user_payments_response.png
- **Mô tả**: Màn hình response hiển thị danh sách các thanh toán

## 13. Hủy thanh toán

- **Tên file**: 20_cancel_payment.png
- **Mô tả**: Màn hình request hủy thanh toán
- **Tên file**: 21_cancel_payment_response.png
- **Mô tả**: Màn hình response hiển thị thanh toán đã bị hủy (trạng thái "failed")

## 14. Xử lý lỗi

- **Tên file**: 22_error_unauthorized.png
- **Mô tả**: Màn hình hiển thị lỗi 401 Unauthorized khi token hết hạn
- **Tên file**: 23_error_order_not_found.png
- **Mô tả**: Màn hình hiển thị lỗi khi đơn hàng không tồn tại
- **Tên file**: 24_error_payment_confirmed.png
- **Mô tả**: Màn hình hiển thị lỗi khi cố gắng hủy một thanh toán đã được xác nhận

## 15. MongoDB Compass

- **Tên file**: 25_mongodb_compass.png
- **Mô tả**: Màn hình MongoDB Compass hiển thị dữ liệu thanh toán đã được lưu trong database 