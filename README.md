# TodoApp - Ứng dụng Quản lý Công việc & Thói quen

## 📋 Giới thiệu

TodoApp là một ứng dụng web quản lý công việc và thói quen cá nhân toàn diện, được xây dựng với React và Ant Design. Ứng dụng hỗ trợ nhiều tính năng quản lý task, habit tracking, và hệ thống quản trị người dùng.

## ✨ Tính năng chính

### 🔐 Xác thực & Phân quyền
- **Đăng ký/Đăng nhập**: Hệ thống authentication an toàn
- **Phân quyền người dùng**: Admin và User với các quyền khác nhau
- **Bảo vệ route**: Private routes cho các trang yêu cầu đăng nhập

### 📊 Dashboard & Thống kê
- **Dashboard tổng quan**: Hiển thị thống kê công việc và tiến độ
- **Biểu đồ trạng thái**: Visualize tiến độ hoàn thành task
- **Theo dõi habit**: Monitoring thói quen hàng ngày

### ✅ Quản lý Công việc (Tasks)
- **CRUD Tasks**: Tạo, đọc, cập nhật, xóa công việc
- **Phân loại**: Quản lý theo categories và priorities
- **Trạng thái**: Theo dõi status (To Do, In Progress, Completed)
- **Ghi chú**: Thêm notes chi tiết cho mỗi task
- **Lọc & Tìm kiếm**: Filter tasks theo nhiều tiêu chí

### 🔄 Quản lý Thói quen (Habits)
- **Habit Tracking**: Theo dõi thói quen hàng ngày
- **Streak Counter**: Đếm chuỗi ngày thực hiện liên tiếp
- **Progress Visualization**: Biểu đồ tiến độ thói quen

### 📂 Quản lý Danh mục
- **Categories Management**: Tạo và quản lý danh mục công việc
- **Priorities**: Thiết lập mức độ ưu tiên
- **Status Types**: Quản lý các trạng thái công việc

### 👥 Quản lý Người dùng (Admin)
- **User Management**: Quản lý danh sách người dùng
- **Role Assignment**: Phân quyền cho người dùng
- **Invite System**: Mời người dùng mới tham gia
- **Admin Dashboard**: Tổng quan quản trị hệ thống

### 🎨 Giao diện & UX
- **Responsive Design**: Tương thích đa thiết bị
- **Ant Design UI**: Giao diện đẹp và thân thiện
- **Dark/Light Theme**: Hỗ trợ chế độ sáng/tối
- **Interactive Components**: Component tương tác mượt mà

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 18**: Library JavaScript cho UI
- **Ant Design**: UI Component Library
- **React Router**: Routing cho SPA
- **Axios**: HTTP client cho API calls
- **React Context**: State management
- **CSS3**: Styling và responsive design

### Backend API Integration
- **RESTful API**: Giao tiếp với backend qua REST API
- **JWT Authentication**: Token-based authentication
- **Role-based Access Control**: Phân quyền dựa trên vai trò

## 📁 Cấu trúc dự án

```
ToDoApp/
│
├─ src/
│  ├─ main/
│  │  ├─ java/com/example/todo/
│  │  │   ├─ config/               # SecurityConfig, JwtAuthenticationFilter
│  │  │   ├─ controller/           # RestController cho Auth và ToDo
│  │  │   ├─ entity/               # Entity: User, ToDo
│  │  │   ├─ repository/           # UserRepository, ToDoRepository
│  │  │   ├─ service/              # UserServiceImpl, JwtService, CustomUserDetailsService
│  │  │   └─ TodoApplication.java  # File khởi động Spring Boot
│  │  └─ resources/
│  │      ├─ application.properties
│  │      └─ schema.sql / data.sql (nếu có)
│  └─ test/                        # Unit & Integration Tests
│
├─ pom.xml
└─ README.md
```

## 🚀 Cài đặt và Chạy dự án

### Yêu cầu hệ thống
- Node.js >= 14.0.0
- npm >= 6.0.0 hoặc yarn >= 1.22.0

### Các bước cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd FE_Todo
```

2. **Cài đặt dependencies**
```bash
npm install
# hoặc
yarn install
```

3. **Cấu hình environment**
```bash
# Tạo file .env.local
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_APP_NAME=TodoApp
```

4. **Chạy ứng dụng**
```bash
npm start
# hoặc
yarn start
```

5. **Build cho production**
```bash
npm run build
# hoặc
yarn build
```

## 🔧 Cấu hình API

Ứng dụng sử dụng Axios để giao tiếp với backend API. Cấu hình trong `src/api/axiosInstance.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
```

### API Endpoints chính:
- **Auth**: `/auth/login`, `/auth/register`
- **Tasks**: `/tasks`, `/tasks/:id`
- **Habits**: `/habits`, `/habits/:id`
- **Users**: `/users`, `/admin/users`
- **Categories**: `/categories`
- **Priorities**: `/priorities`

## 👤 Hướng dẫn sử dụng

### Cho Người dùng thường:
1. **Đăng ký/Đăng nhập** vào hệ thống
2. **Xem Dashboard** để theo dõi tổng quan
3. **Quản lý Tasks** trong Personal Tasks
4. **Theo dõi Habits** trong Habits Page
5. **Phân loại công việc** bằng Categories

### Cho Admin:
1. **Quản lý người dùng** trong Users page
2. **Theo dõi tất cả tasks** trong Admin Task Management
3. **Phân quyền** và quản lý roles
4. **Cấu hình hệ thống** categories, priorities, status

## 🔒 Bảo mật

- **JWT Token**: Authentication token được lưu an toàn
- **Protected Routes**: Các route nhạy cảm được bảo vệ
- **Role-based Access**: Phân quyền dựa trên vai trò người dùng
- **Input Validation**: Validate dữ liệu đầu vào

## 🐛 Debugging & Testing

### Chạy tests
```bash
npm test
# hoặc
yarn test
```

### Kiểm tra linting
```bash
npm run lint
# hoặc
yarn lint
```

## 📱 Responsive Design

Ứng dụng được thiết kế responsive, hỗ trợ:
- **Desktop**: >= 1200px
- **Tablet**: 768px - 1199px  
- **Mobile**: < 768px
