# Design Patterns Used

## 1. Layered Architecture
- แยก Presentation, API, Business, Persistence และ Cross-cutting concerns ออกจากกัน
- ช่วยให้ทีมพัฒนาแยกงานได้ชัด และลดการกระทบกันของโค้ดข้ามส่วน

## 2. Repository Pattern
- ใช้รวม query logic และ data transformation ไว้ในชั้นเดียว
- ตัวอย่าง: `web/src/lib/db/dorm-repository.js`
- ข้อดี: ทดสอบง่าย, เปลี่ยน data source ได้ง่าย, route handlers ไม่ต้องรู้รายละเอียด query

## 3. Middleware / Chain of Responsibility
- ใช้ middleware ตรวจสอบ session ก่อนเข้า protected routes
- ช่วยคัดกรอง request ทีละชั้นก่อนถึง business logic
- ตัวอย่าง: `web/middleware.js`

## 4. Strategy / Fallback Data Source
- ระบบเลือกแหล่งข้อมูลตาม environment
- ถ้ามี database configuration จะใช้ฐานข้อมูลจริง, ถ้าไม่มีจะใช้ in-memory data เพื่อเดโมระบบ
- ตัวอย่าง: `web/src/lib/user-auth.js`, `web/src/lib/data-access.js`

## 5. Configuration-driven Design
- ใช้ environment variables และ Docker configuration เพื่อแยก local/deployment behavior
- ช่วยให้การ deploy บนเครื่องจริงและการทดสอบในเครื่องใช้ codebase เดียวกันได้
- ตัวอย่าง: `web/.env.local`, `web/docker-compose.yml`, `web/Dockerfile`

## 6. Role-based Access Control Pattern
- แยกสิทธิ์ตามบทบาทผู้ใช้ เช่น student, staff, finance, manager และ admin
- ใช้ทั้งใน UI routing และ API authorization
- ตัวอย่าง: `web/src/lib/role-config.js`, `web/src/app/portal/[role]/page.js`

## เหตุผลที่เลือกใช้
- ทำให้ระบบขยายฟีเจอร์เพิ่มได้ง่ายโดยไม่ต้องแก้ทุกส่วนพร้อมกัน
- ลด coupling ระหว่าง UI, API และ database
- เพิ่มความสามารถในการทดสอบและควบคุมคุณภาพโค้ด
- เหมาะกับระบบธุรกรรมที่มีหลายบทบาทผู้ใช้และหลาย workflow
