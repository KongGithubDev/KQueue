# Queue ESP32-J

ระบบจัดคิวโครงงาน ESP32 / Arduino

## วิธีใช้งาน

### ติดตั้ง
```bash
npm install
```

### รันในเครื่อง
```bash
node server.js
# หรือ
npm run dev   # ถ้ามี nodemon
```

เปิดที่ http://localhost:3000

### หน้าต่างๆ
| URL | คำอธิบาย |
|-----|-----------|
| `/` | หน้าสาธารณะ — ลูกค้ากรอกคำขอ |
| `/login` | หน้าล็อกอิน Admin |
| `/admin` | Dashboard Admin |

### รหัสผ่าน Admin
ค่าเริ่มต้น: `admin123` — เปลี่ยนได้ใน `.env` (`ADMIN_PASSWORD=...`)

## Deploy บน Render.com
1. Push โค้ดขึ้น GitHub
2. ไปที่ [render.com](https://render.com) → New → Web Service
3. เลือก repo → Render จะอ่าน `render.yaml` อัตโนมัติ
4. คลิก Deploy

## Environment Variables
| Variable | ค่าเริ่มต้น | คำอธิบาย |
|----------|-------------|-----------|
| `MONGODB_URI` | (กำหนดแล้ว) | MongoDB Atlas connection string |
| `JWT_SECRET` | auto-generate | Secret สำหรับ JWT token |
| `ADMIN_PASSWORD` | `admin123` | รหัสผ่าน Admin |
| `PORT` | `3000` | Port ของ server |
