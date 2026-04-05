# D3 Test Run Results

เอกสารนี้สรุปผลการรัน automated tests ล่าสุดจาก terminal เพื่อใช้เป็นหลักฐานประกอบ D3/D5 และงานนำเสนอ

## คำสั่งที่ใช้

```powershell
cd c:\Users\First\Desktop\student-dormitory-payment-system-Repository-Structure\tests\docs
npm run test:coverage
```

## ผลการรันล่าสุด

- วันที่รัน: 2026-04-06
- สถานะรวม: Passed
- Test suites: 12 passed, 12 total
- Tests: 59 passed, 59 total
- Snapshots: 0 total
- Time: 11.123 s

## รายชื่อ test suites ที่ผ่าน

- integration/room.integration.test.js
- integration/api.integration.test.js
- integration/meterReading.integration.test.js
- integration/payment.integration.test.js
- integration/auth.integration.test.js
- integration/invoice.integration.test.js
- unit/invoiceService.test.js
- unit/studentService.test.js
- unit/paymentService.test.js
- unit/roomTypeService.test.js
- unit/roomService.test.js
- unit/authService.test.js

## Coverage Summary จาก terminal

```text
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |   87.95 |    80.53 |    91.3 |   87.95 |
----------|---------|----------|---------|---------|-------------------
```

## หมายเหตุ

- ผล test ล่าสุดผ่านทั้งหมด 100% ในแง่จำนวน test cases และ test suites
- Coverage collection ถูกปรับแล้วและแสดงเปอร์เซ็นต์ได้ตามจริงใน terminal
- สามารถใช้ค่าชุดนี้ใส่สไลด์ Testing&QA ได้ทันที