const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1211',
    database: 'tongkho_db',
    multipleStatements: true
  });

  try {
    console.log('Bắt đầu thêm dữ liệu Nhập Hàng...');

    // Lấy ID của Admin (để làm staff_id cho lịch sử nhập)
    const [admins] = await connection.execute("SELECT id, name FROM user WHERE role = 'admin' LIMIT 1");
    const staffId = admins.length > 0 ? admins[0].id : 1;
    const staffName = admins.length > 0 ? admins[0].name : 'Admin';

    // 5. Product Warehouse (Tồn kho thực tế trong từng kho)
    await connection.execute(`
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
      (10, 2, 800, NOW(), NOW())
    `);
    console.log('Đã thêm dữ liệu Product Warehouse (Tồn kho theo kho)');

    // 6. Warehouse Import History (Lịch sử nhập kho)
    await connection.execute(`
      INSERT INTO warehouse_import_history 
      (product_id, warehouse_id, supplier_id, quantity, staff_name, staff_id, import_date, note, created_at, updated_at) 
      VALUES 
      (1, 1, 1, 100, ?, ?, NOW(), 'Nhập lô hàng khoan pin đầu tháng', NOW(), NOW()),
      (2, 1, 2, 300, ?, ?, NOW(), 'Nhập bổ sung búa đinh', NOW(), NOW()),
      (2, 2, 2, 200, ?, ?, NOW(), 'Chuyển hàng búa đinh vào kho SG', NOW(), NOW()),
      (3, 2, 2, 50, ?, ?, NOW(), 'Nhập máy mài góc SG', NOW(), NOW()),
      (4, 1, 3, 1000, ?, ?, NOW(), 'Nhập lô đinh thép Hòa Phát', NOW(), NOW()),
      (5, 2, 1, 2000, ?, ?, NOW(), 'Nhập găng tay bảo hộ', NOW(), NOW())
    `, [staffName, staffId, staffName, staffId, staffName, staffId, staffName, staffId, staffName, staffId, staffName, staffId]);
    
    console.log('Đã thêm dữ liệu Warehouse Import History (Lịch sử nhập kho)');

    console.log('HOÀN TẤT NHẬP HÀNG!');
  } catch (err) {
    console.error('LỖI THÊM DỮ LIỆU NHẬP HÀNG:', err.message);
  } finally {
    await connection.end();
  }
}

main();
