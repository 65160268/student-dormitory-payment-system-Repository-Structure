# System Architecture Document

## 1. Overview

DormPayment ใช้สถาปัตยกรรมแบบแยกชั้นงาน (Layered Architecture) บน Web Application เดียว โดยมีโค้ดหลักอยู่ในโฟลเดอร์ `web/` และแยก concerns ชัดเจนระหว่าง UI, API, business rules, data access และ cross-cutting concerns เพื่อให้ง่ายต่อการพัฒนา ทดสอบ และ deploy ด้วย Docker

ชั้นสถาปัตยกรรมหลักประกอบด้วย:
- Presentation Layer
- Application/API Layer
- Domain & Business Layer
- Persistence Layer
- Data Layer
- Cross-cutting Layer

## 2. Layer Details

### 2.1 Presentation Layer
- รับผิดชอบหน้า UI, dashboard, role portal และ interaction ของผู้ใช้
- ใช้งานผ่าน Next.js App Router และ React components
- ตัวอย่าง: `web/src/app/page.js`, `web/src/app/login/page.js`, `web/src/components/app/portal-client.jsx`

### 2.2 Application/API Layer
- รับคำขอจาก client, ตรวจ request, เรียก business logic และคืน response
- ใช้ Route Handlers ของ Next.js แทน backend server แยกอีกตัว
- ตัวอย่าง: `web/src/app/api/auth/*`, `web/src/app/api/payments/*`, `web/src/app/api/invoices/*`

### 2.3 Domain & Business Layer
- รวมกฎธุรกิจ เช่น role-based dashboard, workflow การชำระเงิน, การคำนวณยอด และ validation เชิงโดเมน
- แยกเป็นโมดูลที่เรียกใช้ซ้ำได้ระหว่าง UI และ API
- ตัวอย่าง: `web/src/lib/data-access.js`, `web/src/lib/dashboard-data.js`, `web/src/lib/role-config.js`

### 2.4 Persistence Layer
- จัดการการเข้าถึงฐานข้อมูลผ่าน repository functions และ ORM abstraction
- ลดการผูกกับ query logic ใน UI หรือ route handler โดยตรง
- ตัวอย่าง: `web/src/lib/db/dorm-repository.js`, `web/src/lib/db/client.js`

### 2.5 Data Layer
- กำหนด schema, ตารางหลัก และแหล่งข้อมูลสำหรับ demo/fallback
- รองรับทั้งฐานข้อมูลจริงและ in-memory data สำหรับเดโมหรือกรณีไม่มี DB
- ตัวอย่าง: `web/src/lib/db/schema.js`, `web/src/lib/data-store.js`, `docs/database_schema.sql`

### 2.6 Cross-cutting Layer
- ดูแล authentication, middleware, env configuration, error boundary เชิงระบบ และ deployment concerns
- ตัวอย่าง: `web/middleware.js`, `web/src/lib/auth.js`, `web/.env.local`, `web/Dockerfile`

## 3. Architecture Overview

โครงสร้างการทำงานหลักเป็นดังนี้:
- ผู้ใช้เข้าสู่ระบบผ่านหน้า `login`
- Route Handler ตรวจสอบ credential จากฐานข้อมูลหรือ fallback store
- ระบบสร้าง session cookie แบบ `httpOnly` สำหรับการใช้งานใน dashboard/portal
- Middleware ตรวจสอบการเข้าถึงหน้า protected routes
- Repository layer ดึงข้อมูล invoices, payments, meter readings และ user records จาก MySQL/MariaDB
- UI แสดง dashboard แยกตาม role ได้แก่ student, staff, finance, manager และ admin

## 4. Key Design Decisions

### 4.1 Full-stack Web App ในแอปเดียว
- ลดความซับซ้อนของ deployment เพราะ frontend และ API ถูกรันใน container เดียว
- เหมาะกับทีมขนาดเล็กและ demo deployment ผ่าน Docker บน Proxmox LXC

### 4.2 Role-based Portal
- จำกัดการเข้าถึงข้อมูลตามบทบาทผู้ใช้โดยตรง
- ลดความเสี่ยงที่ผู้ใช้จะเห็นข้อมูลข้ามสิทธิ์

### 4.3 Database-first with Fallback Demo Mode
- หากตั้งค่า `DATABASE_URL` ระบบจะใช้ฐานข้อมูลจริงผ่าน Drizzle ORM
- หากยังไม่ตั้งค่า ระบบสามารถใช้ข้อมูลตัวอย่างเพื่อรองรับการ demo ได้

### 4.4 Containerized Deployment
- ใช้ `Dockerfile` แบบ multi-stage เพื่อลดขนาด image และรัน production ได้สม่ำเสมอ
- ใช้ `docker-compose.yml` เพื่อกำหนด environment และ port mapping สำหรับการ deploy บน LXC

## 5. Technology Stack

- Frontend: Next.js 16, React 19, Tailwind CSS v4, shadcn/ui
- Application/API: Next.js Route Handlers (Node.js runtime)
- Data Access: Drizzle ORM
- Database: MySQL / MariaDB
- Authentication: cookie-based session + bcrypt password verification
- Quality: ESLint, Jest, Supertest
- DevOps: GitHub Actions, Docker, Docker Compose, Proxmox LXC

## 6. Mapping to Source Code

- Presentation: `web/src/app`, `web/src/components`
- Application/API: `web/src/app/api`
- Domain & Business: `web/src/lib/data-access.js`, `web/src/lib/dashboard-data.js`, `web/src/lib/role-config.js`
- Persistence: `web/src/lib/db`
- Demo Data / Supporting Models: `web/src/lib/data-store.js`
- Cross-cutting: `web/middleware.js`, `web/src/lib/auth.js`

## 7. Deployment Architecture

Deployment strategy ปัจจุบันรองรับการนำเสนอ DevOps ได้ดังนี้:
- Developer push โค้ดขึ้น GitHub
- GitHub Actions ทำ CI สำหรับ lint, test และ coverage
- แอปถูก build เป็น production image ผ่าน Docker
- Container ถูกรันบน Proxmox LXC ผ่าน Docker Compose

แนวทางที่แนะนำสำหรับ production-ready pipeline ในระยะถัดไป:
- ให้ GitHub Actions build image และ push ไป container registry
- ให้เครื่องปลายทาง pull image และ restart service อัตโนมัติหลัง CI ผ่าน
- เพิ่ม manual approval gate ก่อน production deploy

## 8. Quality Attributes

- Maintainability: แยก layer และ module ตามหน้าที่ ช่วยให้แก้ไขเฉพาะจุดได้ง่าย
- Testability: logic สำคัญถูกแยกเป็น service/repository ที่สามารถทดสอบแยกได้
- Security: มี role-based access control, protected routes, password hash support และ session cookie flags
- Deployability: ใช้ Docker multi-stage build เพื่อให้ deploy ซ้ำได้อย่างคงที่ในทุก environment
