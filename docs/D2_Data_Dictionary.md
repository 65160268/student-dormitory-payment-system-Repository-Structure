# Data Dictionary

เอกสารนี้อ้างอิงจาก schema ปัจจุบันใน `docs/database_schema.sql` และโครงสร้างที่ใช้ใน application layer ล่าสุด

## 1. ตาราง users
- `id`: varchar(30), PK, รหัสผู้ใช้ เช่น `stu-65160381`, `admin-001`
- `username`: varchar(50), ชื่อสำหรับเข้าสู่ระบบ
- `password_hash`: varchar(255), รหัสผ่านแบบ hash หรือ bcrypt
- `name`: varchar(100), ชื่อผู้ใช้
- `role`: enum/varchar, บทบาท `student`, `staff`, `finance`, `manager`, `admin`
- `is_active`: tinyint(1), สถานะการใช้งานบัญชี
- `deleted_at`: datetime, วันที่ลบเชิงตรรกะ
- `created_at`: datetime, วันที่สร้าง
- `updated_at`: datetime, วันที่แก้ไขล่าสุด

## 2. ตาราง rooms
- `id`: varchar(10), PK, รหัสห้อง เช่น `A-214`
- `floor`: tinyint, ชั้นของห้อง
- `monthly_price`: decimal(10,2), ค่าเช่ารายเดือน
- `is_active`: tinyint(1), สถานะเปิดใช้งานห้อง
- `created_at`: datetime, วันที่สร้างข้อมูลห้อง

## 3. ตาราง room_amenities
- `room_id`: varchar(10), PK/FK ไปยัง `rooms.id`
- `air_conditioner`: tinyint(1), มีแอร์หรือไม่
- `fan`: tinyint(1), มีพัดลมหรือไม่
- `bed`: tinyint(1), มีเตียงหรือไม่
- `tv`: tinyint(1), มีโทรทัศน์หรือไม่
- `fridge`: tinyint(1), มีตู้เย็นหรือไม่
- `water_heater`: tinyint(1), มีเครื่องทำน้ำอุ่นหรือไม่

## 4. ตาราง housing_records
- `id`: bigint unsigned, PK, เลขประวัติการเข้าพัก
- `student_id`: varchar(30), FK ไปยัง `users.id`
- `room_id`: varchar(10), FK ไปยัง `rooms.id`
- `check_in_date`: date, วันที่ย้ายเข้า
- `check_out_date`: date/null, วันที่ย้ายออก ถ้าเป็น null หมายถึงยังพักอยู่
- `created_at`: datetime, วันที่สร้างรายการ

## 5. ตาราง room_rates
- `id`: tinyint unsigned, PK, ใช้เป็น single-row config
- `water_per_unit`: decimal(8,2), อัตราค่าน้ำต่อหน่วย
- `electric_per_unit`: decimal(8,2), อัตราค่าไฟต่อหน่วย
- `effective_from`: date, วันที่เริ่มใช้อัตราใหม่
- `updated_by`: varchar(30), FK ไปยัง `users.id` ของผู้แก้ไข
- `updated_at`: datetime, วันที่ปรับอัตราล่าสุด

## 6. ตาราง meter_readings
- `id`: varchar(20), PK, รหัสมิเตอร์ เช่น `MTR-0001`
- `room_id`: varchar(10), FK ไปยัง `rooms.id`
- `month`: char(7), เดือนในรูป `YYYY-MM`
- `water_previous`: decimal(10,2), ค่าน้ำครั้งก่อน
- `water_current`: decimal(10,2), ค่าน้ำครั้งปัจจุบัน
- `electric_previous`: decimal(10,2), ค่าไฟครั้งก่อน
- `electric_current`: decimal(10,2), ค่าไฟครั้งปัจจุบัน
- `recorded_by`: varchar(30), FK ไปยัง `users.id` ของเจ้าหน้าที่ที่บันทึก
- `recorded_at`: datetime, วันที่บันทึก

## 7. ตาราง invoices
- `id`: varchar(25), PK, รหัส invoice เช่น `INV-2026-030-381`
- `student_id`: varchar(30), FK ไปยัง `users.id`
- `room_id`: varchar(10), FK ไปยัง `rooms.id`
- `month`: char(7), เดือนรอบบิล
- `rent`: decimal(10,2), ค่าเช่าห้อง
- `water`: decimal(10,2), ค่าน้ำ
- `electricity`: decimal(10,2), ค่าไฟ
- `total`: decimal(10,2), ยอดรวมทั้งบิล
- `status`: enum, สถานะ `pending`, `paid`, `overdue`
- `created_at`: datetime, วันที่สร้าง
- `updated_at`: datetime, วันที่แก้ไขล่าสุด

## 8. ตาราง payments
- `id`: varchar(20), PK, รหัสการชำระ เช่น `PAY-1001`
- `invoice_id`: varchar(25), FK ไปยัง `invoices.id`
- `student_id`: varchar(30), FK ไปยัง `users.id`
- `amount`: decimal(10,2), จำนวนเงินที่แนบชำระ
- `note`: text, หมายเหตุจากผู้ชำระ
- `slip_url`: varchar(500), path/url ของหลักฐานการโอน
- `slip_file_name`: varchar(255), ชื่อไฟล์สลิป
- `submitted_at`: datetime, วันที่ส่งหลักฐาน
- `status`: enum, สถานะ `pending`, `approved`, `rejected`
- `reviewer_id`: varchar(30), FK ไปยัง `users.id` ของผู้ตรวจสอบ
- `reject_reason`: text, เหตุผลกรณีปฏิเสธ
- `reviewed_at`: datetime, วันที่ตรวจสอบรายการ

## 9. ตาราง maintenance_requests
- `id`: bigint unsigned, PK, รหัสงานแจ้งซ่อม
- `student_id`: varchar(30), FK ไปยัง `users.id`
- `room_id`: varchar(10), FK ไปยัง `rooms.id`
- `title`: varchar(200), หัวข้อปัญหา
- `description`: text, รายละเอียดเพิ่มเติม
- `status`: enum, สถานะ `open`, `in_progress`, `resolved`, `closed`
- `assigned_to`: varchar(30), FK ไปยัง `users.id` ของเจ้าหน้าที่รับผิดชอบ
- `resolved_at`: datetime/null, วันที่ปิดงาน
- `created_at`: datetime, วันที่แจ้งปัญหา
- `updated_at`: datetime, วันที่แก้ไขล่าสุด

## 10. ตาราง notifications
- `id`: bigint unsigned, PK, รหัสแจ้งเตือน
- `user_id`: varchar(30), FK ไปยัง `users.id`
- `type`: varchar(50), ประเภทการแจ้งเตือน
- `title`: varchar(200), หัวข้อแจ้งเตือน
- `body`: text, เนื้อหาการแจ้งเตือน
- `is_read`: tinyint(1), สถานะการอ่าน
- `created_at`: datetime, วันที่สร้างแจ้งเตือน

## 11. ตาราง audit_logs
- `id`: bigint unsigned, PK, รหัส log
- `actor_id`: varchar(30), FK ไปยัง `users.id` ของผู้กระทำ
- `action`: varchar(100), ชื่อการกระทำ เช่น `approve_payment`, `update_rates`
- `target_type`: varchar(50), ประเภทข้อมูลเป้าหมาย
- `target_id`: varchar(50), รหัสข้อมูลเป้าหมาย
- `detail`: json, รายละเอียดเพิ่มเติม
- `created_at`: datetime, วันที่เกิดเหตุการณ์

## หมายเหตุ
- โค้ดส่วนหนึ่งของระบบรองรับ demo/fallback data store เพื่อใช้ในการสาธิตแม้ไม่ได้เชื่อมต่อฐานข้อมูลจริง
- ตาราง `maintenance_requests`, `notifications` และ `audit_logs` อยู่ในขอบเขตของระบบล่าสุดและรองรับการขยายงานด้าน operation/security ในระยะถัดไป
