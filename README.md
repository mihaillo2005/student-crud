# Student CRUD Management System

A full-stack Student Management System consisting of a **Spring Boot REST API** backend and a **Vite + Tailwind CSS** frontend.

## Project Structure

```
Ladrillo-System/
├── student/             # Spring Boot REST API Backend (Port 8080)
│   ├── src/main/java    # Student entity, controller, and repository
│   └── pom.xml
└── student-frontend/    # Vite + Vanilla JavaScript + Tailwind CSS Frontend (Port 5173)
    ├── src/             # Dashboard UI, API client, and toast notifications
    └── vite.config.js   # Local proxy configuration to port 8080
```

## Prerequisites

- Java 17+ & Maven
- Node.js & npm
- PostgreSQL database (`db_student`)

## Quick Start

### 1. Backend (Spring Boot)
```powershell
cd student
.\mvnw.cmd spring-boot:run
```
API endpoints will be available at `http://localhost:8080/ladrillo/students`.

### 2. Frontend (Vite + Tailwind CSS)
```powershell
cd student-frontend
npm.cmd install
npm.cmd run dev
```
Open your browser at `http://localhost:5173`.
