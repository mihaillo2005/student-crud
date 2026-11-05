# Student Portal Frontend

A responsive Student Management dashboard built with **Vite**, **Vanilla JavaScript**, and **Tailwind CSS**, integrated with the **Spring Boot Student API**.

## Features

- **Full CRUD Integration**:
  - **Create**: Add new students with validation (First Name, Last Name, Course, Section).
  - **Read**: Dynamic student table with auto-generated avatars, course/section badges, and ID counters.
  - **Update**: Edit modal with pre-filled student values and instant UI refresh.
  - **Delete**: Confirmation dialog with safety warning before removal.
- **Real-Time Search & Filtering**:
  - Filter students instantly by full name, ID, course, or section.
  - Dynamic course dropdown filter derived from active records.
- **Modern UI & UX**:
  - Modern typography and responsive card/table layout using Tailwind CSS.
  - Real-time API connection status indicator.
  - Smooth modal enter/exit animations and toast alerts for API actions.
  - Empty state handling and loading skeletons.
- **Built-in Proxy**:
  - Vite dev server proxies `/ladrillo` to `http://localhost:8080` to eliminate CORS hurdles during development.

---

## Getting Started

### 1. Start the Spring Boot Backend
Make sure your PostgreSQL database (`db_student`) is running, then start the backend:

```powershell
cd C:\Users\Student-00\Documents\Ladrillo-System\student
.\mvnw.cmd spring-boot:run
```
*(Backend runs on `http://localhost:8080`)*

### 2. Start the Vite Frontend
Open another terminal and start the Vite dev server:

```powershell
cd C:\Users\Student-00\Documents\Ladrillo-System\student-frontend
npm.cmd run dev
```

The frontend will be accessible at:
```
http://localhost:5173
```
