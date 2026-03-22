CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  role VARCHAR(20) NOT NULL,
  room_id VARCHAR(20) NULL
);

INSERT INTO users (id, username, password_hash, full_name, role, room_id) VALUES
('stu-65160381', '65160381', 'pass1234', 'Parinya Trinyakul', 'student', 'A-214'),
('staff-001', 'staff01', 'pass1234', 'Dorm Staff', 'staff', NULL),
('fin-001', 'finance01', 'pass1234', 'Finance Officer', 'finance', NULL),
('mgr-001', 'manager01', 'pass1234', 'Dorm Manager', 'manager', NULL),
('admin-001', 'admin01', 'pass1234', 'System Admin', 'admin', NULL)
ON DUPLICATE KEY UPDATE
  username = VALUES(username),
  password_hash = VALUES(password_hash),
  full_name = VALUES(full_name),
  role = VALUES(role),
  room_id = VALUES(room_id);
