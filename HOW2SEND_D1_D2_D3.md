# การส่ง: D1, D2, D3

รายละเอียดสิ่งที่นักศึกษาต้องส่งให้อาจารย์ผู้สอน สำหรับแต่ละ Deliverable

---

## D1 — Project Charter & Requirements

### ส่งอะไรบ้าง

| รายการ                          | รายละเอียด                                                  |
| ------------------------------- | ----------------------------------------------------------- |
| **Project Charter**             | เอกสารประกาศโครงการ: ชื่อ วัตถุประสงค์ ขอบเขต ทีม           |
| **User Stories**                | 8-10 user stories ในรูปแบบ "As a... I want... So that..."   |
| **Requirements Document (SRS)** | ความต้องการทั้งหมด: functional, non-functional, constraints |
| **Activity Diagrams**           | ผังลำดับขั้นตอนของ use cases หลัก (2-3 ภาพ)                 |
| **ER Diagram**                  | โครงสร้างฐานข้อมูล (entities และความสัมพันธ์)               |

### โครงสร้างโปรเจ็ก

```
GitHub Repository:
├── docs/
│   ├── D1_Project_Charter.md
│   ├── D1_User_Stories.md
│   ├── D1_SRS.md
│   └── diagrams/
│       ├── activity_diagrams.md
│       └── er_diagram.md
```

### เกณฑ์การประเมิน

- Project Charter ชัดเจน และครบองค์ประกอบ (1.5 pts)
- User Stories เป็นไปตาม INVEST criteria (1.5 pts)
- SRS ครอบคลุมความต้องการทั้งหมด (1 pt)
- Diagrams ถูกต้องและสื่อสารได้ (1 pt)

### รวม: 5 คะแนน

---

## D2 — System Design Document

### ส่งอะไรบ้าง

| รายการ                        | รายละเอียด                                                                 |
| ----------------------------- | -------------------------------------------------------------------------- |
| **Architecture Document**     | อธิบาย 5 layers (Presentation, Business, Persistence, Data, Cross-cutting) |
| **Design Patterns**           | ระบุ 3-5 patterns ที่ใช้ พร้อมเหตุผล (Singleton, Factory, Observer, etc.)  |
| **Component Diagrams**        | ภาพแสดง components และความสัมพันธ์                                         |
| **Data Dictionary**           | อธิบายตัวแปร fields ของ database tables ทั้งหมด                            |
| **Code Skeleton**             | โครงโค้ดพื้นฐาน: folder structure, class definitions, interfaces           |
| **Coding Standards Document** | ข้อปฏิบัติการเขียนโค้ด: naming, formatting, comments                       |

### ส่งอะไรบ้าง

```
GitHub Repository:
├── docs/
│   ├── D2_Architecture.md
│   ├── D2_Design_Patterns.md
│   ├── D2_Data_Dictionary.md
│   ├── D2_Coding_Standards.md
│   └── diagrams/
│       └── component_diagrams.md
├── src/
│   ├── presentation/
│   ├── business/
│   ├── persistence/
│   ├── data/
│   └── README.md (structure explanation)
```

### เกณฑ์การประเมิน

- Architecture เหมาะสมกับ D1 requirements (1.5 pts)
- Design Patterns ใช้ได้ถูกต้อง (1.5 pts)
- Code Skeleton โครงสร้างชัดเจน folder convention ถูกต้อง (1 pt)
- Coding Standards กำหนดได้ชัด (1 pt)

### รวม: 5 คะแนน

---

## D3 — Testing

### ส่งอะไรบ้าง

| รายการ                     | รายละเอียด                                                       |
| -------------------------- | ---------------------------------------------------------------- |
| **Test Plan Document**     | แผนการทดสอบ: unit tests, integration tests, test scenarios       |
| **Unit Tests**             | Jest test cases ≥ 15 test cases, coverage ≥ 80%                  |
| **Integration Tests**      | การทดสอบความสัมพันธ์ระหว่าง modules (≥ 5 test suites)            |
| **Test Cases Spreadsheet** | ตาราง: Test Case ID, Description, Input, Expected Output, Status |
| **Test Coverage Report**   | Screenshot หรือ HTML report จาก Jest coverage                    |
| **UAT Scenarios**          | User Acceptance Testing scenarios (3-5 scenarios)                |

### โครงสร้างโปรเจ็ก(ตัวอย่างสำหรับ automate testing)

```
GitHub Repository:
├── tests/
│   ├── unit/
│   │   ├── module1.test.js
│   │   ├── module2.test.js
│   │   └── ...
│   └── integration/
│       ├── api.integration.test.js
│       └── ...
├── .github/
│   └── workflows/
│       ├── test.yml
│       ├── lint.yml
│       └── build.yml
├── docs/
│   ├── D3_Test_Plan.md
│   ├── D3_Test_Cases.xlsx
│   ├── D3_UAT_Scenarios.md
│   └── coverage-reports/
│       └── coverage.html
├── package.json (update scripts section)
└── jest.config.js (coverage configuration)
```

### เกณฑ์การประเมิน

- **Unit Tests:** Coverage >= 80%, tests pass (2 pts)
- **Integration Tests:** Cover major workflows, >= 5 test suites (2 pt)
- **Test Documentation:** ครบครัน Test Plan + Test Cases + UAT (1 pt)

**รวม: 5 คะแนน**

---

## คำแนะนำการส่งงาน

### 1. GitHub Repository

**ไฟล์ที่ต้องอัปเดต:**

- ส่ง Pull Request หรือ commit ไปยัง develop/main branch
- Use commit message: "D1: Initial project charter and requirements" (ตัวอย่าง)
- ติดแท็ก: `git tag D1-Release` เมื่อเสร็จสิ้น

### 2. Email Submission

**ส่งไปที่:** wittawas@buu.ac.th

**รูปแบบหัวข้อ:**

```
[88744065] D1, D2, D3 Submission - [Team No]
```

**เนื้อหา Email:**

```
ชื่อทีม: ...
สมาชิกทีม:
  - ชื่อ นามสกุล รหัสนักศึกษา
  - ชื่อ นามสกุล รหัสนักศึกษา

GitHub Link: https://github.com/...

สิ่งที่ส่ง:
  - Project Charter
  - User Stories
  - ... (ระบุทั้งหมด)

หมายเหตุ: ...
```

### 3. เอกสารสรุป (Optional แต่แนะนำ)

สร้างไฟล์ PDF สรุป 1-2 หน้า:

- ชื่อโปรเจกต์
- สมาชิกทีม
- วัตถุประสงค์
- หลักเด่น
- Link GitHub

---

## ตรวจสอบรายการก่อนส่ง

### D1 Submission Checklist

```
[ ] Project Charter มี: ชื่อ, วัตถุประสงค์, ขอบเขต, ทีม, timeline
[ ] User Stories: 8-10 stories, ตาม INVEST, มี acceptance criteria
[ ] SRS Document: ความต้องการ functional และ non-functional
[ ] Activity Diagrams: 2-3 ภาพ, ชัดเจน
[ ] ER Diagram: ถูกต้อง, ครบถ้วน
[ ] GitHub: commit สำเร็จ, pull request เปิด
[ ] Email: ส่งถูกต้อง, subject ชัดเจน
```

### D2 Submission Checklist

```
[ ] Architecture Document: อธิบาย 5 layers ครบถ้วน
[ ] Design Patterns: 3-5 patterns, มีเหตุผล
[ ] Component Diagrams: ถูกต้อง, สื่อสารได้
[ ] Data Dictionary: ทุก field อธิบายแล้ว
[ ] Code Skeleton: folder structure ถูก, class definitions มี
[ ] Coding Standards: ข้อปฏิบัติชัดเจน
[ ] GitHub: code skeleton push สำเร็จ
```

### D3 Submission Checklist

```
[ ] Unit Tests: ≥ 15 test cases, ≥ 80% coverage
[ ] Integration Tests: ≥ 5 test suites
[ ] Test Cases Document: มี Test Case ID, Expected Output ทั้งหมด
[ ] Test Coverage Report: ≥ 80% ครบครัน
[ ] UAT Scenarios: 3-5 scenarios ชัดเจน
```

---
