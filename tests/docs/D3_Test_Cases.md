# D3 Test Cases Summary

เอกสารนี้สรุป test cases สำคัญจาก automated tests และใช้เป็นหลักฐานประกอบ D3/D5

## 1. Unit Test Coverage Areas

| Suite | Focus Area | ตัวอย่างกรณีทดสอบ |
| --- | --- | --- |
| `authService.test.js` | Authentication | invalid credentials, bcrypt compare, token payload |
| `invoiceService.test.js` | Invoice Calculation | room not found, meter missing, duplicate invoice number, total calculation |
| `paymentService.test.js` | Payment Workflow | invalid invoice, payment verification, rollback on failure |
| `roomService.test.js` | Room Management | create/update room, duplicate room number, invalid room type |
| `roomTypeService.test.js` | Room Type Management | create room type, duplicate type |
| `studentService.test.js` | Student Assignment | invalid user, invalid room, duplicate assignment, room status update |

## 2. Integration Test Coverage Areas

| Suite | Focus Area | ตัวอย่างกรณีทดสอบ |
| --- | --- | --- |
| `api.integration.test.js` | Core API Flow | health endpoint, unauthorized access, login then access protected API |
| `auth.integration.test.js` | Login API | missing credentials, invalid credentials, valid login |
| `room.integration.test.js` | Room API | role rejection, payload validation, room update |
| `invoice.integration.test.js` | Invoice API | validation, finance access, role restriction |
| `payment.integration.test.js` | Payment API | list payments, create payment, verify payment |
| `meterReading.integration.test.js` | Meter API | role validation, payload validation, create reading |

## 3. Quantitative Summary

- Unit test suites: 6
- Integration test suites: 6
- Automated test suites รวม: 12
- Automated test cases รวม: 59
- UAT scenarios: 5

## 4. Quality Metrics

- Statements: 88.10%
- Branches: 76.92%
- Functions: 90.00%
- Lines: 87.99%

## 5. Key Behaviors Verified

- Authentication และ authorization ตาม role
- Validation ของ payload ที่จำเป็น
- Business rules ด้าน invoice และ payment
- Error handling และ negative paths
- Protected access สำหรับ finance/admin functions
- Workflow หลักตั้งแต่ meter reading ไปจนถึง invoice และ payment