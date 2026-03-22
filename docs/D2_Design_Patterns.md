# Design Patterns Used

## 1. Singleton
- ใช้กับ Database Connection (pool.js) เพื่อให้มี instance เดียว

## 2. Factory
- ใช้สร้าง service หรือ controller ตามประเภท เช่น authService, roomService

## 3. Repository/DAO
- แยก logic การเข้าถึงข้อมูลออกจาก business logic

## 4. Middleware (Chain of Responsibility)
- ใช้กับ Express middleware เช่น authenticateToken, errorHandler

## 5. Dependency Injection (บางส่วน)
- ส่ง dependencies ผ่าน constructor หรือ parameter

## เหตุผลที่เลือกใช้
- เพื่อความยืดหยุ่น, ทดสอบง่าย, แยก concern ชัดเจน, ขยายระบบง่าย
