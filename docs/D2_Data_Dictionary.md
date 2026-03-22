# Data Dictionary

## ตาราง room_types
- type_id: int, PK, รหัสประเภทห้อง
- type_name: varchar(50), ชื่อประเภท
- base_rent: decimal, ค่าเช่าหลัก
- water_unit_rate: decimal, ค่าน้ำ/หน่วย
- electric_unit_rate: decimal, ค่าไฟ/หน่วย

## ตาราง users
- user_id: int, PK, รหัสผู้ใช้
- username: varchar(50), ชื่อผู้ใช้
- password: varchar(255), รหัสผ่าน (hash)
- role: enum, บทบาท

## ตาราง rooms
- room_id: int, PK, รหัสห้อง
- room_number: varchar(10), หมายเลขห้อง
- type_id: int, FK, ประเภทห้อง
- status: enum, สถานะห้อง

## ตาราง students
- student_id: int, PK, รหัสผู้เช่า
- user_id: int, FK, ผู้ใช้
- room_id: int, FK, ห้อง
- full_name: varchar(100), ชื่อ
- phone: varchar(15), เบอร์

## ตาราง meter_readings
- reading_id: int, PK
- room_id: int, FK
- staff_id: int, FK
- prev_water: decimal
- curr_water: decimal
- prev_electric: decimal
- curr_electric: decimal
- reading_date: date

## ตาราง invoices
- invoice_id: int, PK
- room_id: int, FK
- invoice_no: varchar(20)
- total_rent: decimal
- total_water: decimal
- total_electric: decimal
- grand_total: decimal
- status: enum
- due_date: date

## ตาราง payments
- payment_id: int, PK
- invoice_id: int, FK
- finance_id: int, FK
- payment_date: datetime
- slip_image: varchar(265)
- verify_status: enum
