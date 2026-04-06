# D3 Test Run Results

เอกสารนี้สรุปผลการรัน automated tests ล่าสุดจาก terminal เพื่อใช้เป็นหลักฐานประกอบ D3 และงานนำเสนอ Final

## คำสั่งที่ใช้

```powershell
cd c:\Users\First\Desktop\student-dormitory-payment-system-Repository-Structure
npm run test:coverage
```

## ผลการรันล่าสุด

- วันที่รัน: 2026-04-06
- สถานะรวม: Passed
- Test suites: 14 passed, 14 total
- Tests: 82 passed, 82 total
- Snapshots: 0 total
- Time: 3.027 s

## รายชื่อ test suites ที่ผ่าน

- unit/middlewareErrorBranches.test.js
- integration/room.integration.test.js
- integration/api.integration.test.js
- integration/meterReading.integration.test.js
- integration/payment.integration.test.js
- integration/auth.integration.test.js
- integration/invoice.integration.test.js
- unit/poolConfig.test.js
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
All files |   97.16 |    93.49 |     100 |   97.16 |
----------|---------|----------|---------|---------|-------------------
```

## หมายเหตุ

- ผล test ล่าสุดผ่านทั้งหมด 100% ในแง่จำนวน test cases และ test suites
- Coverage collection ถูกปรับแล้วและแสดงเปอร์เซ็นต์ได้ตามจริงใน terminal
- สามารถใช้ค่าชุดนี้ใส่สไลด์ Testing&QA ได้ทันที