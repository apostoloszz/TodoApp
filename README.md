📝 ToDoApp

Ứng dụng quản lý công việc ToDoApp gồm 2 phần:

BE_Todo: Back-end Spring Boot

FE_Todo: Front-end ReactJS + Ant Design

Ứng dụng hỗ trợ đăng ký/đăng nhập bằng JWT, phân quyền ADMIN/USER, quản lý công việc (CRUD), lọc theo trạng thái và mức ưu tiên.

🚀 Tính năng

Xác thực & Phân quyền

Đăng ký, đăng nhập, nhận JWT.

ADMIN có toàn quyền, USER chỉ quản lý task của mình.

Quản lý công việc

CRUD tác vụ.

Lọc theo Status (PENDING, IN_PROGRESS, COMPLETED) và Priority (LOW, MEDIUM, HIGH).

Front-End

Giao diện hiện đại, responsive, dùng Ant Design.

Bảo vệ route và phân quyền bằng ProtectedRoute & AdminRoute.

🏗️ Cấu trúc dự án
ToDoApp/
├── BE_Todo/          # Spring Boot Back-End
│   ├── src/main/java/com/example/be_todo/
│   │   ├── config/       # Security, JWT
│   │   ├── controller/   # REST Controllers
│   │   ├── dto/          # DTOs
│   │   ├── entity/       # JPA Entities
│   │   ├── repository/   # Spring Data JPA
│   │   ├── security/     # JWT, UserDetails
│   │   └── service/      # Business Logic
│   └── resources/
│       └── application.properties
│   └── pom.xml
│
└── FE_Todo/          # React + Ant Design Front-End
    ├── src/
    │   ├── api/          # Axios services
    │   ├── components/   # UI components
    │   ├── context/      # AuthContext
    │   ├── pages/        # Login, Register, Dashboard, Admin…
    │   ├── routes/       # Protected & Admin routes
    │   └── styles/       # CSS
    └── package.json

⚙️ Công nghệ

Back-End

Java 17

Spring Boot 3.x (Web, Data JPA, Security)

JWT Authentication

MySQL 8

Maven

Front-End

React 18

Ant Design 5

Axios, React Router v6

Context API

🔧 Cài đặt
1️⃣ Chuẩn bị

JDK 17, Node.js 18+, MySQL.

Tạo database rỗng: todo_app.

2️⃣ Back-End
cd BE_Todo
# Chỉnh application.properties nếu cần
mvn clean install
mvn spring-boot:run


API mặc định: http://localhost:8080

3️⃣ Front-End
cd FE_Todo
npm install
npm start


Giao diện: http://localhost:3000

🔑 Endpoints chính
Method	Endpoint	Mô tả
POST	/auth/register	Đăng ký
POST	/auth/login	Đăng nhập, lấy JWT
GET	/tasks	Lấy danh sách task (theo user)
POST	/tasks	Tạo task
PUT	/tasks/{id}	Cập nhật task
DELETE	/tasks/{id}	Xóa task
GET	/tasks/status/{status}	Lọc theo trạng thái
GET	/tasks/priority/{priority}	Lọc theo độ ưu tiên
GET	/users	(ADMIN) Danh sách user
🧩 Phân quyền

USER: Quản lý task của mình.

ADMIN: CRUD tất cả task & user.

JWT gửi qua header:

Authorization: Bearer <token>
