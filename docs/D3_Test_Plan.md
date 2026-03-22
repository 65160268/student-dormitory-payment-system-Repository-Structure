# แผนการทดสอบ D3 - Hotel Management API

## ข้อมูลทีม
- ชื่อทีม: JR
- สมาชิกทีม:
	- 65160381 นายปริญญา ตรีญากูล (Product Owner)
	- 65160268 นายสรวิชญ์ ศรีสุข (Scrum Artifacts / Scrum Master)
	- 65160255 นายนิรัตติศัย คล้ายสุวรรณ์ (Developers)
	- 65160132 นายอำนาจ ชากำนัน (Developers)
	- 65160267 นายวีรพัฒน์ ตะเภาทอง (Quality Assurance / Tester)
	- 65160022 นายภูวดล ทีขาว (Quality Assurance / Tester)

## 1. บทนำ
- โปรเจกต์: Hotel Management API
- เวอร์ชัน: 1.0
- วันที่: 2026-03-22
- ผู้จัดทำ: ทีม JR

## 2. ขอบเขตการทดสอบ

### ฟีเจอร์ที่อยู่ในขอบเขต
1. การยืนยันตัวตนและกำหนดสิทธิ์
2. การจัดการห้องพัก
3. กระบวนการบันทึกมิเตอร์
4. การออกใบแจ้งหนี้
5. การสร้างและตรวจสอบการชำระเงิน

### ฟีเจอร์ที่อยู่นอกขอบเขต
1. การทดสอบ UI ฝั่ง Frontend (โปรเจกต์นี้เน้น Backend)
2. การเชื่อมต่อระบบจัดเก็บไฟล์ภายนอก
3. การเชื่อมต่อ Payment Gateway ภายนอก

## 3. กลยุทธ์การทดสอบ

### Unit Testing
- เครื่องมือ: Jest
- จุดเน้น: business logic ระดับ service, การ map error, และการคำนวณ
- เป้าหมายขั้นต่ำ: 15 test cases
- เป้าหมาย coverage: 80% ขึ้นไป

### Integration Testing
- เครื่องมือ: Jest + Supertest
- จุดเน้น: การทำงานร่วมกันของ route + middleware + controller + service
- เป้าหมายขั้นต่ำ: 5 integration test suites
- ครอบคลุม: auth flow, role-based access control, payload validation, และ workflow หลัก

### System Testing (API Workflow)
- ทดสอบ end-to-end ของ API ด้วย Postman collection
- ตรวจทั้งกรณีปกติ (happy path) และกรณีผิดพลาด (negative path)

### UAT
- ทดสอบตามกระบวนการใช้งานจริงร่วมกับตัวแทนบทบาทผู้ใช้
- จำนวนสถานการณ์: 3-5 สถานการณ์ พร้อมผลลัพธ์ที่คาดหวังและการลงนามรับรอง

## 4. สภาพแวดล้อมการทดสอบ
- Node.js 20+
- Jest 30+
- Supertest 7+
- MySQL 8+ (สำหรับการทดสอบแบบ manual ในเครื่อง)
- ใช้ mock DB ใน automated test suite

## 5. เกณฑ์เริ่มและสิ้นสุดการทดสอบ

### เกณฑ์เริ่มทดสอบ
- มีการพัฒนา API routes แล้ว
- มีบริการหลัก (core services) พร้อมใช้งาน
- เตรียม seed data และ env config แล้ว

### เกณฑ์สิ้นสุดการทดสอบ
- เทสต์ทั้งหมดผ่าน
- Unit tests >= 15 cases
- Integration tests >= 5 suites
- สร้าง coverage report และผ่านเกณฑ์
- เอกสาร D3 ครบถ้วน

## 6. ความเสี่ยงและแนวทางลดความเสี่ยง
- ความเสี่ยง: เทสต์เปราะบางจากการพึ่งพาฐานข้อมูล
- แนวทางลดความเสี่ยง: ใช้ mock ที่ชั้น pool เพื่อให้ผลลัพธ์คงที่

- ความเสี่ยง: การถดถอยของสิทธิ์การเข้าถึงตามบทบาท
- แนวทางลดความเสี่ยง: เพิ่ม integration tests ที่เน้นการตรวจสิทธิ์

## 7. สิ่งที่ส่งมอบ
1. tests/unit/*.test.js
2. tests/integration/*.test.js
3. docs/D3_Test_Cases.md
4. docs/D3_UAT_Scenarios.md
5. รายงาน Coverage จาก Jest

## การอนุมัติ
- จัดทำโดย: ทีม JR
- ตรวจทานโดย: [ชื่อหัวหน้าทีม]
- วันที่อนุมัติ: [ใส่วันที่อนุมัติ]
