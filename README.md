# 🏢 DormPayment

## ระบบบริหารจัดการยอดค้างชำระและเก็บค่าหอพักนักศึกษาดิจิทัล

---

## 📖 ภาพรวมโครงการ (Project Overview)

**DormPayment** คือแพลตฟอร์มดิจิทัลที่พัฒนาขึ้นเพื่อเพิ่มประสิทธิภาพในการบริหารจัดการค่าใช้จ่ายภายในหอพักนักศึกษา โดยทำหน้าที่เป็นศูนย์กลางในการแจ้งหนี้และรับชำระค่าธรรมเนียมต่าง ๆ เช่น ค่าเช่าห้อง ค่าน้ำ และค่าไฟ

ระบบมีเป้าหมายเพื่อเปลี่ยนกระบวนการแจ้งหนี้แบบกระดาษให้เป็นระบบดิจิทัล 100% เพื่อความรวดเร็ว แม่นยำ และตรวจสอบได้ ช่วยให้นิสิตไม่ต้องเดินทางมาที่สำนักงานหอพัก และช่วยให้เจ้าหน้าที่บริหารจัดการรายรับได้อย่างเป็นระบบ

---

## ✨ ฟีเจอร์หลัก (Key Features)

### 📊 1. แดชบอร์ดสรุปยอดค้างชำระ (Billing Dashboard)

* แสดงยอดค้างชำระรวมและแยกประเภท (ค่าเช่า/น้ำ/ไฟ)
* แสดงประวัติการชำระเงินย้อนหลัง
* อัปเดตสถานะแบบ Real-time เมื่อเจ้าหน้าที่ยืนยันยอดเงิน

### 💳 2. ระบบแจ้งชำระเงินและอัปโหลดสลิป (Payment Submission)

* อัปโหลดหลักฐานการโอนเงิน (Slip Verification)
* ระบุวันและเวลาที่โอนเงินตามจริง
* ระบบป้องกันการส่งข้อมูลซ้ำซ้อน

### 🛠️ 3. ระบบจัดการข้อมูลและบัญชีผู้ใช้ (System Management)

* จัดการข้อมูลห้องพักและราคาค่าเช่า
* จัดการสิทธิ์และบัญชีผู้ใช้งานภายในระบบ
* ตรวจสอบความเสถียรของระบบแจ้งหนี้ให้เป็นไปตาม KPI

---

## 👥 กลุ่มผู้ใช้งาน (User Roles)

| บทบาท (Role) | ประเภท (Type) | หน้าที่หลัก |
| --- | --- | --- |
| **นิสิต (Student)** | Primary | ตรวจสอบยอดค้างชำระ แจ้งชำระเงิน และอัปโหลดสลิป |
| **เจ้าหน้าที่หอพัก (Staff)** | Operational | ตรวจสอบสลิป ออกใบแจ้งหนี้ และจัดการสถานะห้องพัก |
| **ผู้ดูแลระบบ (Admin)** | Secondary | จัดการข้อมูลห้องพัก ราคาค่าเช่า และจัดการสิทธิ์/บัญชีผู้ใช้งาน |
| **ผู้บริหาร/ฝ่ายการเงิน (Manager)** | Secondary | ดูรายงานสรุปรายรับ และตรวจสอบภาพรวมการเงิน |

---

## 📂 โครงสร้างพื้นที่เก็บข้อมูล (Repository Structure)

```
📂 student-dormitory-payment-system-Repository-Structure
 ├── 📄 README.md
 ├── 📂 docs
 │    ├── 📄 D1_ProjectCharter.md
 │    ├── 📄 D1_SRS.md
 │    ├── 📄 D1_UserStories.md
 │    ├── 📄 D2_Architecture.md
 │    ├── 📄 D2_Coding_Standards.md
 │    ├── 📄 D2_Data_Dictionary.md
 │    ├── 📄 D2_Design_Patterns.md
 │    ├── 📄 D4_Security_Assessment_Summary.md
 │    ├── 📄 Final_Presentation_Brief.md
 │    ├── 📄 database_schema.sql
 │    ├── 📄 fix_passwords.sql
 │    ├── 📄 grant_dorm_app.sql
 │    └── 📂 diagrams
 │         ├── 📂 Activity_Diagram
 │         ├── 📂 Components_Diagrams
 │         ├── 📂 Er_Diagram
 │         └── 📂 Use_Case_Diagram
 ├── 📂 tests
 │    ├── 📂 docs
 │    ├── 📂 integration
 │    └── 📂 unit
 └── 📂 web
      ├── 📄 README.md
      ├── 📄 package.json
      ├── 📂 public
      ├── 📂 sql
      └── 📂 src
           ├── 📂 app
           ├── 📂 components
           └── 📂 lib

```

---

## 🧑‍🤝‍🧑 คณะผู้จัดทำ (Team Members)

**ชื่อทีม:** JR

| รหัสนิสิต | ชื่อ-นามสกุล | บทบาท (Role) |
| --- | --- | --- |
| 65160381 | **นายปริญญา ตรีญากูล** | Product Owner |
| 65160268 | **นายสรวิชญ์ ศรีสุข** | Scrum Artifacts / Scrum Master |
| 65160255 | **นายนิรัตติศัย คล้ายสุวรรณ์** | Developers |
| 65160132 | **นายอำนาจ ชากำนัน** | Developers |
| 65160267 | **นายวีรพัฒน์ ตะเภาทอง** | Quality Assurance / Tester |
| 65160022 | **นายภูวดล ทีขาว** | Quality Assurance / Tester |

---

## 🚀 สถานะโครงการ

อยู่ในขั้นตอนการพัฒนาและทดสอบตามแผนงาน (Development → QA → Final Presentation)

(Timeline: 12 ธันวาคม 2568 – 27 กุมภาพันธ์ 2569)

---

## 📌 ขอบเขตและข้อจำกัด

* ระบบเป็น Web Application ที่เน้นการใช้งานบนเบราว์เซอร์
* ระบบทำหน้าที่จัดการยอดเงินและหลักฐานการโอนเท่านั้น (ไม่ตัดยอดผ่านธนาคารโดยตรง)
* ข้อมูลมิเตอร์น้ำ-ไฟต้องได้รับการกรอกเข้าระบบโดยเจ้าหน้าที่เพื่อคำนวณยอด
* ความปลอดภัยของข้อมูลเป็นไปตามมาตรฐาน PDPA

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack) 

* **Application:** Next.js 16 (App Router + Route Handlers) / React 19 / Tailwind CSS
* **Data Access:** Drizzle ORM
* **Database:** MySQL / MariaDB
* **Testing & Quality:** Jest / Supertest / ESLint / UAT
* **DevOps:** GitHub Actions (CI), Docker, Docker Compose, Proxmox LXC

---

> 📘 เอกสารประกอบ:
> * Project Charter
> * Software Requirements Specification (SRS)
> * User Stories & Acceptance Criteria
> 
> 

---

*จัดทำโดย Team JR @ 2026*

---

*โครงการนี้เป็นส่วนหนึ่งของรายวิชา 88744065 Software Development*
	   *สาขาเทคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจิทัล*
	   *คณะวิทยาการสารสนเทศ มหาวิทยาลัยบูรพา*

---
