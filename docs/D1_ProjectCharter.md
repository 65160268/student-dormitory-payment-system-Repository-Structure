# Student Dormitory Payment and Billing Management System (DormPayment)

## (ระบบบริหารจัดการยอดค้างชำระและเก็บค่าหอพักนักศึกษาดิจิทัล)

แพลตฟอร์มสำหรับบริหารจัดการการจัดเก็บค่าธรรมเนียมหอพักแบบครบวงจร ช่วยให้นิสิตตรวจสอบยอด แจ้งชำระเงิน และติดตามสถานะได้แบบเรียลไทม์ พร้อมระบบสนับสนุนเจ้าหน้าที่ในการออกใบแจ้งหนี้และสรุปรายงาน

---

## 👥 คณะผู้จัดทำ (Team JR)

| รายชื่อ-นามสกุล | บทบาท (Role) | ช่องทางการติดต่อ |
| --- | --- | --- |
| **นายปริญญา ตรีญากูล** | Product Owner | 65160381@go.buu.ac.th / 095-823-8333 |
| **นายสรวิชญ์ ศรีสุข** | Scrum Master | 65160268@go.buu.ac.th / 095-5270-813 |
| **นายนิรัตติศัย คล้ายสุวรรณ์** | Developer | 65160255@go.buu.ac.th / 064-546-6094 |
| **นายอำนาจ ชากำนัน** | Developer | 65160132@go.buu.ac.th / 095-814-9108 |
| **นายวีรพัฒน์ ตะเภาทอง** | QA / Tester | 65160267@go.buu.ac.th / 095-209-6568 |
| **นายภูวดล ทีขาว** | QA / Tester | 65160022@go.buu.ac.th / 097-072-0674 |

---

## 🚀 วัตถุประสงค์และเกณฑ์ความสำเร็จ (Objectives & Success Criteria)

### วัตถุประสงค์

* เปลี่ยนระบบการแจ้งหนี้และรับชำระเงินให้เป็นออนไลน์ 100%
* ลดความผิดพลาดในการคำนวณค่าน้ำ-ค่าไฟรายห้อง
* เพิ่มความสะดวกในการเข้าถึงข้อมูลการเงินของนิสิต
* สร้างระบบจัดเก็บหลักฐานการโอนเงินที่ค้นหาได้ง่าย

### เกณฑ์ความสำเร็จ (KPIs)

* **Performance:** เจ้าหน้าที่ยืนยันยอดได้ภายใน 24 ชม.
* **Accuracy:** อัตราข้อผิดพลาดของข้อมูลยอดเงินต้องเป็น 0%
* **Usage:** มีนิสิตใช้งานมากกว่า 80% ของกลุ่มเป้าหมายในช่วงทดสอบ
* **Satisfaction:** คะแนนความพึงพอใจเฉลี่ยไม่ต่ำกว่า 4.00 / 5.00
* **Resolution:** 80% ของปัญหาการชำระเงินต้องได้รับการแก้ไขตามเวลาที่กำหนด

---

## 🛠️ บทบาทและความรับผิดชอบ (Roles & Responsibilities)

### 👑 Product Owner: ปริญญา ตรีญากูล

* จัดทำเอกสาร Project Charter, SRS และ User Stories
* วิเคราะห์ระบบผ่าน Use Case และ Activity Diagram
* จัดลำดับความสำคัญของงาน (Prioritization) และตรวจสอบความถูกต้อง (Acceptance)

### 🛡️ Scrum Master: สรวิชญ์ ศรีสุข

* บริหารจัดการกระบวนการ Agile/Scrum และนำประชุม Sprint ต่างๆ
* แบ่งงานรายสัปดาห์ ติดตาม Milestone และขจัดอุปสรรคในการทำงาน (Remove Impediments)

### 💻 Developers: นิรัตติศัย & อำนาจ

* **นิรัตติศัย:** ออกแบบ System Architecture, ER Diagram, ติดตั้ง CI/CD Pipeline และดูแล Application/API Layer รวมถึงการ deploy ด้วย Docker บน Proxmox LXC
* **อำนาจ:** พัฒนา UI/UX (Responsive Design), พัฒนาระบบ role-based portal, maintenance workflow และดูแล Coding Standards กับ Performance Testing

### 🔍 QA / Testers: วีรพัฒน์ & ภูวดล

* **วีรพัฒน์:** วางแผน Test Plan/Cases, ตรวจสอบ Code Quality (Static Analysis) และวิเคราะห์ความเสี่ยง
* **ภูวดล:** ดำเนินการ Manual/Unit/Regression Test และประเมินความปลอดภัยตามมาตรฐาน OWASP Top 10

---

## 📅 ตารางเวลาและหลักไมล์ (Timeline & Milestones)

**ระยะเวลาดำเนินงาน:** 12 ธ.ค. 2568 - 27 ก.พ. 2569 (11-16 สัปดาห์)

* **Week 1-2:** Project Setup & Charter (Draft)
* **Week 3-5 (D1 Due):** Requirements Analysis (SRS, Use Case, Activity, ER Diagram)
* **Week 6-7 (D2 Due):** Design Phase (Architecture, Code Skeleton, Sprint Plan)
* **Week 9-10 (D3 Due):** Testing & CI/CD (Test Plan, CI/CD Config, Unit Tests)
* **Week 11-13 (D4 Due):** Quality & Security (OWASP Top 10, Performance Plan)
* **Week 14-15 (D5 Final):** Release Notes, Final Presentation & Live Demo

---

## ⚠️ การบริหารความเสี่ยง (Risk Management)

| ความเสี่ยง | ระดับความรุนแรง | การบรรเทาความเสี่ยง (Mitigation) |
| --- | --- | --- |
| 1. ข้อมูลการเงินรั่วไหล | สูงมาก | เข้ารหัสข้อมูลสลิป และจำกัดสิทธิ์การเข้าถึง (PDPA Compliance) |
| 2. คำนวณยอดเงินผิด | สูง | ใช้ Automated Unit Test สำหรับสูตรคำนวณ (Unit x Rate) |
| 3. การปลอมแปลงสลิป | ปานกลาง | ใช้การตรวจสอบรายการชำระโดยฝ่ายการเงิน พร้อมเก็บหลักฐานสลิปและสถานะการอนุมัติย้อนหลัง |
| 4. ระบบล่มวัน Deadline | สูง | ใช้ Dockerized deployment, backup configuration และเตรียม demo mode สำหรับการสาธิต |
| 5. สถานะการจ่ายเงินไม่ชัดเจน | สูงมาก | มี dashboard แยกตามบทบาท, pending/overdue views และ audit trail สำหรับงานสำคัญ |

---

## 💻 Skills & Tech Stack

* **Technical:** Next.js Full-stack Development, Data Security, Docker Deployment
* **Design:** UI/UX Responsive Design
* **Management:** Agile/Scrum Methodology, CI/CD

---

*จัดทำโดย Team JR @ 2026*

---

*โครงการนี้เป็นส่วนหนึ่งของรายวิชา 88744065 Software Development*
	   *สาขาเทคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจิทัล*
	   *คณะวิทยาการสารสนเทศ มหาวิทยาลัยบูรพา*

---
