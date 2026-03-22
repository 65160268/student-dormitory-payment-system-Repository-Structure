# System Architecture Document

## 1. Overview

ระบบนี้ใช้สถาปัตยกรรม 5 ชั้น (5-Layer Architecture):
- Presentation Layer
- Business Layer
- Persistence Layer
- Data Layer
- Cross-cutting Layer

## 2. Layer Details

### 2.1 Presentation Layer
- รับและแสดงผลข้อมูลให้กับผู้ใช้ (API, Web, Mobile)
- ตัวอย่าง: Express route, Controller

### 2.2 Business Layer
- ประมวลผล logic ธุรกิจ, validation, rule
- ตัวอย่าง: Service, Business Logic

### 2.3 Persistence Layer
- จัดการการเข้าถึงข้อมูล (Repository, DAO)
- ตัวอย่าง: Database Access, Query Builder

### 2.4 Data Layer
- โครงสร้างข้อมูล, Entity, Model
- ตัวอย่าง: Table schema, Entity class

### 2.5 Cross-cutting Layer
- ฟังก์ชันที่ใช้ร่วมกัน เช่น Logging, Error Handling, Security

## 3. Layer Interaction Diagram

(ดู diagrams/component_diagrams.md)

## 4. Technology Stack
- Node.js, Express
- MySQL
- JWT, dotenv, etc.

## 5. Mapping to Source Code
- src/presentation: route, controller
- src/business: service, logic
- src/persistence: db access
- src/data: entity/model
- src/crosscutting: middleware, utils
