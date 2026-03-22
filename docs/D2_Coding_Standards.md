# Coding Standards

## Naming
- Class: PascalCase
- Function/Method: camelCase
- Variable: camelCase
- Constant: UPPER_SNAKE_CASE
- File: lowercase, meaningful
- Table: snake_case (plural)
- Column: snake_case

## Formatting
- Indent: 2 spaces (JS)
- Max line: 100 chars
- Use semicolon

## Comments
- อธิบาย logic ที่ซับซ้อน
- JSDoc สำหรับ public function

## Error Handling
- ใช้ error message ที่เข้าใจง่าย
- ไม่กลืน exception
- API error format สม่ำเสมอ

## Test
- ชื่อ test สื่อความหมาย
- ครอบคลุมกรณีปกติ/ผิดพลาด

## Security
- ห้ามฝังรหัสลับ
- Validate input ทุกครั้ง
- ใช้ parameterized SQL
- Hash password
