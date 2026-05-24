# Tài khoản Admin 
# localhost: 5173/admin/login
- username: admin
- password: [1211]

# Tài khoản Customer
# localhost: 5173
- username: dinhgiang1
- password: 1211


# Tóm tắt Chức năng Hệ thống `tongkho-project`

Dựa vào cấu trúc thư mục (các module ở Backend) và giao diện Frontend của dự án, đây là một **Hệ thống Quản lý Bán hàng & Tồn kho toàn diện** (dành cho mô hình B2B hoặc B2C ngành Kim khí/Vật tư).

Dưới đây là tóm tắt các nhóm chức năng chính đang có trong hệ thống:

## 1. 👥 Quản lý Người dùng & Phân quyền (Auth/User)
* **Khách hàng (Customer):** Đăng ký, đăng nhập, quản lý thông tin cá nhân, địa chỉ giao hàng (`customer-info`).
* **Quản trị viên & Nhân viên (Admin/Manager):** Đăng nhập vào trang quản trị (`/admin`), phân quyền Admin hoặc Staff.
* Đổi mật khẩu, upload ảnh đại diện (avatar). 
* *(Toàn bộ luồng đăng nhập đã được chuyển đổi từ Số điện thoại sang Username).*

## 2. 📦 Quản lý Sản phẩm (Catalog)
* **Danh mục (Category):** Thêm/sửa/xóa và phân loại các nhóm sản phẩm (VD: Dụng cụ điện, Vật tư...).
* **Sản phẩm (Product):** Quản lý chi tiết mã SP, tên, giá, mô tả. Hỗ trợ phân loại trạng thái (Hàng mới, Bán chạy, Tồn kho).
* **Hình ảnh (Product Photo):** Quản lý thư viện ảnh nhiều góc độ cho từng sản phẩm.
* **Đánh giá (Product Review):** Khách hàng có thể để lại bình luận và đánh giá sản phẩm.

## 3. 🏭 Quản lý Kho hàng (Warehouse & Inventory)
* **Danh sách Kho (Warehouse):** Quản lý nhiều kho hàng ở nhiều địa điểm khác nhau (VD: Kho Hà Nội, Kho SG).
* **Tồn kho thực tế (Product Warehouse):** Theo dõi số lượng tồn chính xác của từng sản phẩm nằm ở kho nào.
* **Lịch sử nhập/xuất (Import History):** Ghi nhận lịch sử mỗi lần nhập hàng (ai nhập, nhập số lượng bao nhiêu, từ nhà cung cấp nào, ngày nào...).

## 4. 🤝 Quản lý Nhà cung cấp (Supplier)
* Lưu trữ và quản lý danh sách các đối tác cung cấp nguồn hàng.
* Theo dõi được sản phẩm A được nhập về từ nhà cung cấp B.

## 5. 🛒 Mua sắm & Đơn hàng (Order & Cart)
* **Giỏ hàng (Cart):** Lưu trữ các sản phẩm khách hàng chọn mua.
* **Đơn hàng (Order & Order Detail):** Theo dõi từ lúc đặt hàng, xử lý, đến khi giao thành công.
* **Giao dịch (Transaction):** Lưu lại lịch sử và trạng thái thanh toán của các đơn hàng.

## 6. 📢 Marketing & Chăm sóc khách hàng
* **Tin tức & Blog (New/Blog):** Hệ thống viết bài CMS để đăng tin khuyến mãi, mẹo vặt, chia sẻ kinh nghiệm sử dụng máy móc.
* **Thông báo (Notification & WebSocket):** Hệ thống đẩy thông báo theo thời gian thực (real-time) cho người dùng (ví dụ: Khi đơn hàng được duyệt).

## 7. 📊 Báo cáo Thống kê (Overview/Dashboard)
* Màn hình tổng quan dành cho Admin để theo dõi doanh thu, số lượng đơn hàng mới, top sản phẩm bán chạy hoặc các cảnh báo sắp hết tồn kho.
