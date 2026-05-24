# Đánh giá và Khắc phục Lỗi Logic (Business Logic Bugs)

Sau khi rà soát kỹ các luồng nghiệp vụ cốt lõi (Đặt hàng, Giỏ hàng, Quản lý kho, Sản phẩm), tôi đã phát hiện ra **3 lỗi logic nghiêm trọng** liên quan trực tiếp đến sự chính xác của luồng bán hàng và tồn kho. Dưới đây là báo cáo và kế hoạch sửa chữa.

## User Review Required

> [!WARNING]
> Những lỗi dưới đây ảnh hưởng trực tiếp đến số liệu kinh doanh thực tế (số lượng tồn kho bị sai lệch, giỏ hàng hoạt động sai). Bạn vui lòng xem kỹ và duyệt để tôi tiến hành sửa chữa.

## Open Questions

> [!IMPORTANT]
> **Câu hỏi về Hủy Đơn Hàng (Bug 3):**
> Hiện tại khi trừ tồn kho, hệ thống tự động trừ từ các kho có nhiều hàng nhất (ví dụ: lấy 5 cái kho A, 5 cái kho B). Do DB chưa lưu lại chính xác *kho nào đã bị trừ bao nhiêu cái* cho mỗi đơn hàng. 
> 
> Vậy khi hủy đơn, bạn muốn tôi hoàn trả số lượng bằng cách **cộng dồn lại vào kho đầu tiên (kho mặc định) mà sản phẩm đó thuộc về**, hay là phải tạo thêm cột mới trong DB để **hoàn lại chính xác 100% từng kho đã bị trừ**? (Tôi đề xuất hoàn vào kho mặc định cho nhanh và đỡ phải sửa Database).

## Các Lỗi Phát Hiện & Đề xuất sửa đổi

### Bug 1: Giỏ hàng không được dọn dẹp sau khi thanh toán
* **Vấn đề:** Khi Customer ấn "Hoàn tất đặt hàng", đơn hàng được tạo thành công nhưng hệ thống lại không xóa các sản phẩm đó khỏi Giỏ hàng. Khách quay lại giỏ hàng vẫn thấy hàng nằm đó.
* **Giải pháp:** Sửa trong `order.service.ts` -> Hàm `create()`. Sau khi tạo đơn hàng thành công, gọi lệnh `destroy` trên bảng `Cart` để xóa các sản phẩm tương ứng với `product_id` vừa đặt của `customer_id` này.

### Bug 2: Số lượng "Đã bán" (Sold) không tăng lên
* **Vấn đề:** Bảng `product` có cột `sold` để đếm số lượng hàng đã bán ra. Tuy nhiên hiện tại trong code (lúc tạo hay lúc hoàn thành đơn) đều không có lệnh nào cộng dồn biến `sold` này.
* **Giải pháp:** Sửa trong `warehouse.service.ts` (hàm `deductInventory`). Cùng lúc thực hiện trừ `quantity` của sản phẩm, thực hiện lệnh `sold = sold + quantity` để cập nhật lượt mua.

### Bug 3: Thất thoát tồn kho khi Hủy Đơn Hàng (Critical Bug)
* **Vấn đề:** Khi tạo đơn, tồn kho bị trừ. Tuy nhiên khi Admin hoặc Khách hàng hủy đơn (`order_status = CANCELED`) trong `order.service.ts` và `order-admin.service.ts`, hệ thống không có lệnh cộng trả lại hàng vào kho.
* **Giải pháp:** Viết thêm hàm `refundInventory(orderItems)` trong `warehouse.service.ts`. Khi đơn hàng bị Update trạng thái sang `CANCELED`, hệ thống sẽ duyệt qua các `order_details` và cộng trả số lượng `quantity` lại cho bảng `product` và bảng `product_warehouse`.

---

## Phân nhóm Thay đổi

### Backend API (tongkho-api)

#### [MODIFY] `src/modules/order/order.service.ts`
- Bổ sung xóa Giỏ hàng sau khi tạo đơn thành công.
- Bổ sung gọi `refundInventory` khi gọi hàm `cancelOrder`.

#### [MODIFY] `src/modules/order/admin/order-admin.service.ts`
- Bổ sung gọi `refundInventory` khi Admin hủy đơn hoặc từ chối đơn.

#### [MODIFY] `src/modules/warehouse/warehouse.service.ts`
- Viết mới hàm `refundInventory(order_id, transaction)`.
- Cập nhật thêm logic cộng `sold` vào hàm `deductInventory`.

## Verification Plan

### Automated/Manual Verification
- Thực hiện Đặt một đơn hàng -> Kiểm tra giỏ hàng phải trống.
- Kiểm tra số lượng `sold` của sản phẩm vừa đặt -> Phải tăng lên tương ứng.
- Thực hiện Hủy đơn hàng vừa đặt -> Kiểm tra số lượng `quantity` của sản phẩm và trong kho -> Phải khôi phục về y như lúc trước khi đặt.
