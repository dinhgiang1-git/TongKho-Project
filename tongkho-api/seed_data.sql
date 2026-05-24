USE tongkho_db;

-- 1. Category
INSERT INTO category (name, status, created_at, updated_at) VALUES 
('Dụng cụ cầm tay', 1, NOW(), NOW()),
('Vật tư tiêu hao', 1, NOW(), NOW()),
('Máy móc thiết bị', 1, NOW(), NOW()),
('Bảo hộ lao động', 1, NOW(), NOW()),
('Phụ kiện ngành mộc', 1, NOW(), NOW());

-- 2. Supplier
INSERT INTO suppliers (supplier_code, supplier_name, phone, email, created_at, updated_at) VALUES 
('SUP001', 'Công ty Bosch VN', '0901234567', 'contact@bosch.vn', NOW(), NOW()),
('SUP002', 'Công ty Makita', '0987654321', 'sales@makita.com.vn', NOW(), NOW()),
('SUP003', 'Thép Hòa Phát', '0243123456', 'info@hoaphat.com.vn', NOW(), NOW());

-- 3. Warehouse
INSERT INTO warehouse (warehouse_code, warehouse_name, total_warehouse_area, status, created_at, updated_at) VALUES 
('WH-HN01', 'Kho Tổng Hà Nội', 5000, 1, NOW(), NOW()),
('WH-SG01', 'Kho Trung Chuyển Miền Nam', 3000, 1, NOW(), NOW());

-- 4. Product
INSERT INTO product 
(product_code, name, category_id, price, product_type, availability, status, quantity, sold, introduce, description, warehouse_id, supplier_id, image, created_at, updated_at) 
VALUES 
('SP001', 'Máy khoan pin Bosch 12V', 3, 1500000, '1', 1, 1, 100, 20, 'Máy khoan nhỏ gọn', 'Máy khoan pin Bosch 12V mạnh mẽ, thích hợp dùng trong gia đình.', 1, 1, '/images/sample-drill.png', NOW(), NOW()),
('SP002', 'Búa đinh cán gỗ 500g', 1, 85000, '1', 1, 1, 500, 150, 'Búa đinh cán gỗ chắc chắn', 'Đầu búa thép carbon, cán gỗ sồi tự nhiên chống trượt.', 1, 2, '/images/sample-hammer.png', NOW(), NOW()),
('SP003', 'Máy mài góc Makita 9553NB', 3, 1150000, '2', 1, 1, 50, 5, 'Máy mài góc 710W', 'Sản phẩm mới nhất từ Makita với công suất 710W mạnh mẽ.', 2, 2, '/images/sample-grinder.png', NOW(), NOW()),
('SP004', 'Đinh thép bê tông 5cm (1kg)', 2, 35000, '1', 1, 1, 1000, 450, 'Đinh đóng tường bê tông', 'Hộp 1kg đinh thép chất lượng cao, không gãy.', 1, 3, '/images/sample-nail.png', NOW(), NOW()),
('SP005', 'Găng tay len bảo hộ', 4, 5000, '3', 1, 1, 2000, 800, 'Găng tay dệt kim', 'Găng tay dệt kim dày dặn, bảo vệ tay khi lao động.', 2, 1, '/images/sample-glove.png', NOW(), NOW()),
('SP006', 'Kìm điện đa năng Asaki', 1, 120000, '2', 1, 1, 200, 40, 'Kìm cắt - tuốt dây điện', 'Kìm 8 inch chuyên dụng cho thợ điện.', 1, 2, '/images/sample-pliers.png', NOW(), NOW()),
('SP007', 'Mũi khoan sắt HSS 8mm', 2, 25000, '1', 1, 1, 1500, 300, 'Mũi khoan xoắn HSS', 'Mũi khoan thép gió tốc độ cao.', 1, 1, '/images/sample-bit.png', NOW(), NOW()),
('SP008', 'Thước cuộn thép 5m', 1, 45000, '1', 1, 1, 400, 120, 'Thước cuộn tự động', 'Thước đo bọc cao su chống va đập.', 2, 2, '/images/sample-ruler.png', NOW(), NOW()),
('SP009', 'Giày bảo hộ Jogger', 4, 450000, '2', 1, 1, 100, 15, 'Giày mũi thép chống đinh', 'Giày Jogger chuẩn an toàn châu Âu S3.', 1, 3, '/images/sample-shoes.png', NOW(), NOW()),
('SP010', 'Bản lề lá inox 304', 5, 22000, '3', 1, 1, 800, 100, 'Bản lề cửa gỗ', 'Bản lề lá inox không gỉ sét, dày 3mm.', 2, 3, '/images/sample-hinge.png', NOW(), NOW());

-- 5. Product Warehouse (Tồn kho thực tế trong từng kho)
INSERT INTO product_warehouse (product_id, warehouse_id, quantity, created_at, updated_at) VALUES 
(1, 1, 100, NOW(), NOW()),
(2, 1, 300, NOW(), NOW()),
(2, 2, 200, NOW(), NOW()),
(3, 2, 50, NOW(), NOW()),
(4, 1, 1000, NOW(), NOW()),
(5, 2, 2000, NOW(), NOW()),
(6, 1, 200, NOW(), NOW()),
(7, 1, 1000, NOW(), NOW()),
(7, 2, 500, NOW(), NOW()),
(8, 2, 400, NOW(), NOW()),
(9, 1, 100, NOW(), NOW()),
(10, 2, 800, NOW(), NOW());

-- 6. Warehouse Import History (Lịch sử nhập kho)
-- Lưu ý: staff_id = 3 và staff_name = 'Admin' là user Admin mặc định đã tạo trước đó
INSERT INTO warehouse_import_history 
(product_id, warehouse_id, supplier_id, quantity, staff_name, staff_id, import_date, note, created_at, updated_at) 
VALUES 
(1, 1, 1, 100, 'Admin', 3, NOW(), 'Nhập lô hàng khoan pin đầu tháng', NOW(), NOW()),
(2, 1, 2, 300, 'Admin', 3, NOW(), 'Nhập bổ sung búa đinh', NOW(), NOW()),
(2, 2, 2, 200, 'Admin', 3, NOW(), 'Chuyển hàng búa đinh vào kho SG', NOW(), NOW()),
(3, 2, 2, 50, 'Admin', 3, NOW(), 'Nhập máy mài góc SG', NOW(), NOW()),
(4, 1, 3, 1000, 'Admin', 3, NOW(), 'Nhập lô đinh thép Hòa Phát', NOW(), NOW()),
(5, 2, 1, 2000, 'Admin', 3, NOW(), 'Nhập găng tay bảo hộ', NOW(), NOW());
